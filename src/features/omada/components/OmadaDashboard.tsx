"use client";

import { Gauge, Globe, LayoutGrid, ListChecks, Users, Wifi } from "lucide-react";
import useSWR from "swr";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs, panelId, tabId, type TabItem } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { AccessPointDetail } from "@/features/omada/components/AccessPointDetail";
import { AccessPointInventory } from "@/features/omada/components/AccessPointInventory";
import { AddAccessPointDialog, type NewApInput } from "@/features/omada/components/AddAccessPointDialog";
import { ClientGrid } from "@/features/omada/components/ClientGrid";
import { ControllerCard } from "@/features/omada/components/ControllerCard";
import { OmadaCatalog } from "@/features/omada/components/OmadaCatalog";
import { PortalPanel } from "@/features/omada/components/PortalPanel";
import { SetupGuide } from "@/features/omada/components/SetupGuide";
import { getApModel, getControllerModel, OMADA_AP_CATALOG } from "@/features/omada/omada.catalog";
import { apClientCounts, nextApId } from "@/features/omada/omada.logic";
import {
  ACCESS_PLANS,
  OMADA_DEMO_TENANT,
  PORTAL_CONFIG,
  SEED_AP_METRICS,
  SEED_APS,
  SEED_CLIENTS,
  SEED_CONTROLLER,
  SEED_SITE,
  SSIDS,
} from "@/features/omada/omada.mock";
import type { OmadaAccessPoint, OmadaClient } from "@/features/omada/omada.types";

type PanelId = "overview" | "clients" | "portal" | "catalog" | "guide";

const TABS: readonly TabItem<PanelId>[] = [
  { id: "overview", label: "Access points", icon: Wifi },
  { id: "clients", label: "Clients", icon: Users },
  { id: "portal", label: "Portal hook", icon: Globe },
  { id: "catalog", label: "Models", icon: LayoutGrid },
  { id: "guide", label: "Standalone setup", icon: ListChecks },
];

const ID_PREFIX = "omada";

export function OmadaDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState<PanelId>("overview");
  const fetcher = (url: string) => fetch(url).then(async (response) => { const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Unable to load access points."); return payload; });
  const { data: liveData, mutate } = useSWR<{ accessPoints: Array<{ id: string; name: string; ssid: string; model_code: string; ip_address: string | null; mac_address: string; status: "provisioning" | "online" | "offline"; client_count: number; band: string; firmware: string | null }> }>("/api/admin/omada/access-points", fetcher);
  const [aps, setAps] = useState<OmadaAccessPoint[]>(() => [...SEED_APS]);
  const [clients, setClients] = useState<OmadaClient[]>(() => [...SEED_CLIENTS]);
  const [selectedId, setSelectedId] = useState<string | null>(SEED_APS[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<OmadaAccessPoint | null>(null);

  const liveAps = (liveData?.accessPoints ?? []).map((ap): OmadaAccessPoint => ({ id: ap.id, tenantId: OMADA_DEMO_TENANT.id, siteId: SEED_SITE.id, name: ap.name, modelId: OMADA_AP_CATALOG.find((model) => model.productCode === ap.model_code)?.id ?? OMADA_AP_CATALOG[0]?.id ?? "", macAddress: ap.mac_address, ipAddress: ap.ip_address ?? "", status: ap.status === "provisioning" ? "unknown" : ap.status, statusNote: ap.status === "provisioning" ? "Awaiting controller adoption" : null, firmware: ap.firmware, channel24: null, channel5: null, isDemoAdded: false }));
  const displayedAps = liveData ? liveAps : aps;
  const selected = displayedAps.find((ap) => ap.id === selectedId) ?? displayedAps[0] ?? null;
  const model = selected ? getApModel(selected.modelId) : undefined;
  const controllerModel = getControllerModel(SEED_CONTROLLER.modelId);
  const clientCounts = useMemo(() => apClientCounts(clients), [clients]);
  const selectedClients = useMemo(() => (selected ? clients.filter((client) => client.apId === selected.id) : []), [clients, selected]);

  async function handleAdd(input: NewApInput) {
    const response = await fetch("/api/admin/omada/access-points", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Unable to add access point.");
    await mutate();
    const id = payload.accessPoint?.id ?? nextApId(aps.map((ap) => ap.id));
    const ap: OmadaAccessPoint = {
      id,
      tenantId: OMADA_DEMO_TENANT.id,
      siteId: SEED_SITE.id,
      name: input.name,
      modelId: OMADA_AP_CATALOG.find((model) => model.productCode === input.modelCode)?.id ?? OMADA_AP_CATALOG[0]?.id ?? "",
      macAddress: "",
      ipAddress: input.ipAddress,
      status: "unknown",
      statusNote: null,
      firmware: null,
      channel24: null,
      channel5: null,
      isDemoAdded: true,
    };
    setAps((current) => [...current, ap]);
    setSelectedId(id);
    setAdding(false);
    toast.push({
      title: "Demo access point added",
      description: "It only exists in this browser. Nothing was adopted or configured.",
      tone: "info",
    });
  }

  function handleRemove() {
    if (!removing) return;
    const id = removing.id;
    setAps((current) => current.filter((ap) => ap.id !== id));
    setClients((current) => current.filter((client) => client.apId !== id));
    setRemoving(null);
    toast.push({ title: "Removed from the demo site", description: "No real access point was changed.", tone: "info" });
  }

  function handleDisconnect(client: OmadaClient) {
    setClients((current) => current.filter((item) => item.id !== client.id));
    toast.push({
      title: `${client.hostName} disconnected (demo)`,
      description: "Only the demo list changed. No controller was contacted.",
      tone: "info",
    });
  }

  function handleAuthorize(client: OmadaClient) {
    const plan = ACCESS_PLANS.find((candidate) => candidate.id === "plan-daily") ?? ACCESS_PLANS[0];
    if (!plan) return;
    setClients((current) =>
      current.map((item) =>
        item.id === client.id
          ? {
              ...item,
              portalState: "authorized",
              planId: plan.id,
              username: `sub${client.id.slice(-2)}1`,
              authorizedMinutesLeft: plan.durationMinutes,
            }
          : item,
      ),
    );
    toast.push({
      title: `${client.hostName} authorized (demo)`,
      description: "Simulated. In production SYNTHNET would authorize this client on the controller after payment.",
      tone: "info",
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="success" icon={Gauge}>
            Live Omada inventory
          </Badge>
          <Badge>Tenant: {OMADA_DEMO_TENANT.name}</Badge>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          Register TP-Link Omada access points here. VunaFlow stores their network identity and tracks controller adoption without storing device passwords.
        </p>
      </Card>

      <Card>
        <div className="px-5 pt-2">
          <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix={ID_PREFIX} label="Omada sections" />
        </div>
        <div role="tabpanel" id={panelId(ID_PREFIX, tab)} aria-labelledby={tabId(ID_PREFIX, tab)} tabIndex={0} className="p-5">
          {tab === "overview" ? (
            <div className="space-y-6">
              {controllerModel ? (
                <ControllerCard controller={SEED_CONTROLLER} model={controllerModel} site={SEED_SITE} adoptedAps={aps.filter((ap) => !ap.isDemoAdded).length} />
              ) : null}
              <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
                <AccessPointInventory
                  aps={displayedAps}
                  selectedId={selected?.id ?? null}
                  clientCounts={clientCounts}
                  onSelect={setSelectedId}
                  onAdd={() => setAdding(true)}
                />
                {selected && model ? (
                  <AccessPointDetail
                    ap={selected}
                    model={model}
                    metrics={SEED_AP_METRICS[selected.id] ?? null}
                    clientCount={selectedClients.length}
                    authorizedCount={selectedClients.filter((client) => client.portalState === "authorized").length}
                    onRemove={() => setRemoving(selected)}
                  />
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-sm font-medium text-fg">No access point selected</p>
                    <p className="mt-1 text-sm text-muted">Pick one in the list to see its details.</p>
                  </Card>
                )}
              </div>
            </div>
          ) : null}

          {tab === "clients" ? (
            <ClientGrid
              clients={clients}
              aps={aps}
              ssids={SSIDS}
              plans={ACCESS_PLANS}
              onDisconnect={handleDisconnect}
              onAuthorize={handleAuthorize}
            />
          ) : null}

          {tab === "portal" ? <PortalPanel config={PORTAL_CONFIG} ssids={SSIDS} aps={aps} site={SEED_SITE} clients={clients} /> : null}
          {tab === "catalog" ? <OmadaCatalog /> : null}
          {tab === "guide" ? <SetupGuide /> : null}
        </div>
      </Card>

      <AddAccessPointDialog open={adding} existingNames={aps.map((ap) => ap.name)} onSubmit={handleAdd} onCancel={() => setAdding(false)} />
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? "this access point"}?`}
        description="This removes the access point and its demo clients from the site in your browser. No real device is changed."
        confirmLabel="Remove (demo)"
        destructive
        onCancel={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
