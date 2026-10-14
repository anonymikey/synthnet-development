"use client";

import { ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SelectField } from "@/components/ui/form";
import { CopyButton } from "@/features/omada/components/CopyButton";
import { PORTAL_PARAMETERS } from "@/features/omada/omada.compat";
import { DEMO_EPOCH_SECONDS, DEMO_LANDING_PAGE } from "@/features/omada/omada.mock";
import { hostOf, redirectParamsForClient, redirectUrlForClient } from "@/features/omada/omada.logic";
import type { OmadaAccessPoint, OmadaClient, OmadaPortalConfig, OmadaSite, OmadaSsid } from "@/features/omada/omada.types";

interface PortalPanelProps {
  config: OmadaPortalConfig;
  ssids: readonly OmadaSsid[];
  aps: readonly OmadaAccessPoint[];
  site: OmadaSite;
  clients: readonly OmadaClient[];
}

const JOURNEY = [
  "A guest joins the open SSID. The client has a Wi-Fi connection but no internet yet.",
  "The access point sends the client to the SYNTHNET portal, adding the parameters listed below.",
  "The guest picks a plan and pays (M-Pesa, in Phase 2).",
  "SYNTHNET asks the controller to authorize that client for the length of the plan (Phase 2).",
  "The client reaches the page it first asked for.",
] as const;

export function PortalPanel({ config, ssids, aps, site, clients }: PortalPanelProps) {
  const waiting = clients.filter((client) => client.portalState === "unauthenticated");
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = waiting.find((client) => client.id === selectedId) ?? waiting[0] ?? null;
  const ap = selected ? aps.find((candidate) => candidate.id === selected.apId) : undefined;
  const ssid = selected ? ssids.find((candidate) => candidate.id === selected.ssidId) : undefined;

  const portalSsids = ssids.filter((candidate) => config.ssidIds.includes(candidate.id));
  const portalHost = hostOf(config.portalUrl);
  const hostAllowed = config.preAuthAllowedHosts.includes(portalHost);

  const params = selected && ap && ssid ? redirectParamsForClient(selected, ap, ssid, site.name, DEMO_EPOCH_SECONDS, DEMO_LANDING_PAGE) : null;
  const url = selected && ap && ssid ? redirectUrlForClient(selected, ap, ssid, site.name, config.portalUrl, DEMO_EPOCH_SECONDS, DEMO_LANDING_PAGE) : "";
  const paramValues: Record<string, string> = params
    ? {
        clientMac: params.clientMac,
        apMac: params.apMac,
        ssidName: params.ssidName,
        t: String(params.t),
        radioId: String(params.radioId),
        site: params.site,
        redirectUrl: params.redirectUrl,
      }
    : {};

  const clientOptions = waiting.map((client) => ({ value: client.id, label: `${client.hostName} (${client.macAddress})` }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="External portal hook"
          description="Unauthenticated clients on the guest SSID are sent to the SYNTHNET portal."
          action={<Badge tone="info">Demo, not connected</Badge>}
        />
        <div className="space-y-4 p-5">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted">Authentication type</dt>
              <dd className="text-sm text-fg">External Portal Server</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">SSIDs sent to the portal</dt>
              <dd className="text-sm text-fg">{portalSsids.length > 0 ? portalSsids.map((s) => s.name).join(", ") : "None"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted">Portal URL</dt>
              <dd className="flex flex-wrap items-center gap-2">
                <code className="overflow-x-auto rounded-md border border-line bg-ink px-3 py-1.5 font-mono text-xs text-fg">{config.portalUrl}</code>
                <CopyButton text={config.portalUrl} label="portal URL" />
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-muted">Allowed before sign-in (Pre-Authentication Access)</dt>
              <dd className="flex flex-wrap items-center gap-2 text-sm text-fg">
                {config.preAuthAllowedHosts.join(", ")}
                {hostAllowed ? <Badge tone="success">Includes the portal host</Badge> : <Badge tone="warning">Portal host is not allowed</Badge>}
              </dd>
            </div>
          </dl>
          <p className="flex items-start gap-2 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              This shows what the controller would be configured to do. In Phase 1 nothing is sent to a controller, so no
              real access point is redirecting anyone yet.
            </span>
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Redirect preview"
          description="The URL an access point would send a waiting client to, built from TP-Link's documented parameters."
        />
        <div className="space-y-5 p-5">
          {!selected || !params ? (
            <div className="rounded-lg border border-dashed border-line p-8 text-center">
              <p className="text-sm font-medium text-fg">No clients are waiting at the portal</p>
              <p className="mt-1 text-sm text-muted">Clients that join the guest SSID without signing in will appear here.</p>
            </div>
          ) : (
            <>
              <SelectField label="Waiting client" value={selected.id} options={clientOptions} onChange={setSelectedId} />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-fg">Redirect URL</p>
                  <CopyButton text={url} label="redirect URL" />
                </div>
                <code className="block overflow-x-auto rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-fg">{url}</code>
              </div>
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <caption className="sr-only">Redirect parameters for the selected client</caption>
                  <thead className="bg-raised text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">Parameter</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Demo value</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {PORTAL_PARAMETERS.map((parameter) => (
                      <tr key={parameter.name}>
                        <td className="px-4 py-2.5 font-mono text-xs text-fg">{parameter.name}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted">{paramValues[parameter.name]}</td>
                        <td className="px-4 py-2.5 text-muted">{parameter.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted">
                Parameter names and order follow TP-Link&apos;s External Portal Server documentation. The MAC separator style and the
                radioId numbering are demo values to confirm against your controller in Phase 2.
              </p>
              <Link href="/portal" target="_blank" rel="noreferrer" className={buttonStyles("secondary", "md")}>
                <ExternalLink aria-hidden="true" className="size-4" />
                Open the portal page on this deployment
                <span className="sr-only">(opens in a new tab)</span>
              </Link>
            </>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="What a guest experiences" />
        <ol className="list-decimal space-y-2 p-5 pl-10 text-sm text-muted">
          {JOURNEY.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
