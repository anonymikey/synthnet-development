"use client";

import { ChevronLeft, ChevronRight, LogIn, Unplug } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField, TextField } from "@/components/ui/form";
import {
  clientTotals,
  formatMegabytes,
  formatUptime,
  paginate,
  queryClients,
  signalQuality,
  type BandFilter,
  type ClientSortKey,
  type PortalFilter,
} from "@/features/omada/omada.logic";
import type { ClientPortalState, OmadaAccessPlan, OmadaAccessPoint, OmadaClient, OmadaSsid } from "@/features/omada/omada.types";

const PAGE_SIZE = 10;

const PORTAL_OPTIONS: ReadonlyArray<{ value: PortalFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "authorized", label: "Signed in" },
  { value: "unauthenticated", label: "At portal" },
  { value: "not-required", label: "No portal" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: ClientSortKey; label: string }> = [
  { value: "signal", label: "Strongest signal" },
  { value: "uptime", label: "Longest connected" },
  { value: "downloaded", label: "Most downloaded" },
];

const BAND_OPTIONS: ReadonlyArray<{ value: BandFilter; label: string }> = [
  { value: "all", label: "Both bands" },
  { value: "2.4GHz", label: "2.4 GHz" },
  { value: "5GHz", label: "5 GHz" },
];

const STATE_BADGE: Record<ClientPortalState, { tone: BadgeTone; label: string }> = {
  authorized: { tone: "success", label: "Signed in" },
  unauthenticated: { tone: "warning", label: "Waiting at portal" },
  "not-required": { tone: "neutral", label: "No portal" },
};

interface ClientGridProps {
  clients: readonly OmadaClient[];
  aps: readonly OmadaAccessPoint[];
  ssids: readonly OmadaSsid[];
  plans: readonly OmadaAccessPlan[];
  onDisconnect: (client: OmadaClient) => void;
  onAuthorize: (client: OmadaClient) => void;
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-fg">{value}</p>
    </div>
  );
}

export function ClientGrid({ clients, aps, ssids, plans, onDisconnect, onAuthorize }: ClientGridProps) {
  const [search, setSearch] = useState("");
  const [apId, setApId] = useState("all");
  const [band, setBand] = useState<BandFilter>("all");
  const [portal, setPortal] = useState<PortalFilter>("all");
  const [sort, setSort] = useState<ClientSortKey>("signal");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<OmadaClient | null>(null);

  const totals = useMemo(() => clientTotals(clients), [clients]);
  const filtered = useMemo(
    () => queryClients(clients, { search, apId, portal, band, sort }),
    [clients, search, apId, portal, band, sort],
  );
  const view = paginate(filtered, page, PAGE_SIZE);

  const apOptions = [{ value: "all", label: "All access points" }, ...aps.map((ap) => ({ value: ap.id, label: ap.name }))];
  const apName = (id: string) => aps.find((ap) => ap.id === id)?.name ?? "Unknown";
  const ssidName = (id: string) => ssids.find((ssid) => ssid.id === id)?.name ?? "Unknown";
  const planName = (id: string | null) => plans.find((plan) => plan.id === id)?.name ?? "";

  function clearFilters() {
    setSearch("");
    setApId("all");
    setBand("all");
    setPortal("all");
    setPage(1);
  }

  return (
    <Card>
      <CardHeader
        title="Wireless clients"
        description="Demo devices. MAC addresses are in a locally administered range so they cannot match real hardware."
      />
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Clients" value={String(totals.total)} />
          <Tile label="Signed in" value={String(totals.authorized)} />
          <Tile label="Waiting at portal" value={String(totals.unauthenticated)} />
          <Tile label="Data used" value={formatMegabytes(totals.downloadedMb + totals.uploadedMb)} />
        </div>

        {clients.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-8 text-center">
            <p className="text-sm font-medium text-fg">No clients connected</p>
            <p className="mt-1 text-sm text-muted">Only the seeded access points have demo clients.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <TextField
                label="Search clients"
                value={search}
                placeholder="Host, IP, MAC or username"
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
              <SelectField
                label="Access point"
                value={apId}
                options={apOptions}
                onChange={(value) => {
                  setApId(value);
                  setPage(1);
                }}
              />
              <SelectField
                label="Band"
                value={band}
                options={BAND_OPTIONS}
                onChange={(value) => {
                  setBand(value);
                  setPage(1);
                }}
              />
              <SelectField label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} />
            </div>
            <SegmentedControl
              label="Portal state"
              value={portal}
              options={PORTAL_OPTIONS}
              onChange={(value) => {
                setPortal(value);
                setPage(1);
              }}
            />

            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-8 text-center">
                <p className="text-sm font-medium text-fg">No clients match these filters</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <caption className="sr-only">Wireless clients</caption>
                  <thead className="bg-raised text-muted">
                    <tr>
                      {["Device", "Access point", "SSID", "Band", "Signal", "Link rate", "Portal", "Plan", "Connected", "Down / up", ""].map((heading, index) => (
                        <th key={heading || `action-${index}`} scope="col" className="px-3 py-2.5 font-medium">
                          {heading || <span className="sr-only">Actions</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {view.items.map((client) => {
                      const badge = STATE_BADGE[client.portalState];
                      return (
                        <tr key={client.id}>
                          <td className="px-3 py-2.5">
                            <span className="block font-medium text-fg">{client.hostName}</span>
                            <span className="block font-mono text-xs text-muted">{client.macAddress}</span>
                          </td>
                          <td className="px-3 py-2.5 text-fg">{apName(client.apId)}</td>
                          <td className="px-3 py-2.5 text-muted">{ssidName(client.ssidId)}</td>
                          <td className="px-3 py-2.5 text-muted">{client.band === "2.4GHz" ? "2.4 GHz" : "5 GHz"}</td>
                          <td className="px-3 py-2.5 text-fg">
                            {client.signalDbm} dBm <span className="text-muted">({signalQuality(client.signalDbm)})</span>
                          </td>
                          <td className="px-3 py-2.5 text-muted">{client.linkRateMbps} Mbps</td>
                          <td className="px-3 py-2.5">
                            <Badge tone={badge.tone}>{badge.label}</Badge>
                          </td>
                          <td className="px-3 py-2.5 text-fg">
                            {client.planId ? (
                              <>
                                {planName(client.planId)}
                                {client.authorizedMinutesLeft !== null ? (
                                  <span className="block text-xs text-muted">{formatUptime(client.authorizedMinutesLeft)} left</span>
                                ) : null}
                              </>
                            ) : (
                              "–"
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-muted">{formatUptime(client.uptimeMinutes)}</td>
                          <td className="px-3 py-2.5 text-muted">
                            {formatMegabytes(client.downloadedMb)} / {formatMegabytes(client.uploadedMb)}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <div className="flex justify-end gap-1">
                              {client.portalState === "unauthenticated" ? (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  aria-label={`Authorize ${client.hostName} (demo)`}
                                  onClick={() => onAuthorize(client)}
                                >
                                  <LogIn aria-hidden="true" className="size-4" />
                                  Authorize
                                </Button>
                              ) : null}
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label={`Disconnect ${client.hostName} (demo)`}
                                onClick={() => setPending(client)}
                              >
                                <Unplug aria-hidden="true" className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted" aria-live="polite">
                  Page {view.page} of {view.pageCount} · {view.total} {view.total === 1 ? "client" : "clients"}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={view.page <= 1} onClick={() => setPage(view.page - 1)}>
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    Previous
                  </Button>
                  <Button variant="secondary" size="sm" disabled={view.page >= view.pageCount} onClick={() => setPage(view.page + 1)}>
                    Next
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Disconnect ${pending?.hostName ?? "this device"}?`}
        description="This removes the device from the demo list in your browser. No controller or access point is contacted."
        confirmLabel="Disconnect (demo)"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onDisconnect(pending);
          setPending(null);
        }}
      />
    </Card>
  );
}
