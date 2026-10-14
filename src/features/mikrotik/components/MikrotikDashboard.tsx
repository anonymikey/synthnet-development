"use client";

import { Gauge, LayoutGrid, ListTree, Router as RouterIcon, ScrollText, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tabs, panelId, tabId, type TabItem } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { AddRouterDialog, type NewRouterInput } from "@/features/mikrotik/components/AddRouterDialog";
import { CompatibilityGuide } from "@/features/mikrotik/components/CompatibilityGuide";
import { HardwareCatalog } from "@/features/mikrotik/components/HardwareCatalog";
import { LeaseGrid } from "@/features/mikrotik/components/LeaseGrid";
import { ProfilesPanel } from "@/features/mikrotik/components/ProfilesPanel";
import { RouterDetail } from "@/features/mikrotik/components/RouterDetail";
import { RouterInventory } from "@/features/mikrotik/components/RouterInventory";
import { getModel } from "@/features/mikrotik/mikrotik.catalog";
import { nextRouterId } from "@/features/mikrotik/mikrotik.logic";
import {
  BILLING_PROFILES,
  DEMO_TENANT,
  SEED_HOTSPOT_SERVERS,
  SEED_LEASES,
  SEED_METRICS,
  SEED_ROUTERS,
} from "@/features/mikrotik/mikrotik.mock";
import type { ClientLease, MikrotikRouter } from "@/features/mikrotik/mikrotik.types";

type PanelId = "overview" | "leases" | "profiles" | "catalog" | "guide";

const TABS: readonly TabItem<PanelId>[] = [
  { id: "overview", label: "Routers", icon: RouterIcon },
  { id: "leases", label: "Leases", icon: Users },
  { id: "profiles", label: "Profiles & servers", icon: ListTree },
  { id: "catalog", label: "Hardware catalog", icon: LayoutGrid },
  { id: "guide", label: "Phase 2 guide", icon: ScrollText },
];

const ID_PREFIX = "mikrotik";

function NeedsRouter({ what }: { what: string }) {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-medium text-fg">No router selected</p>
      <p className="mt-1 text-sm text-muted">Pick a router on the Routers tab to see its {what}.</p>
    </Card>
  );
}

export function MikrotikDashboard() {
  const toast = useToast();
  const [tab, setTab] = useState<PanelId>("overview");
  const [routers, setRouters] = useState<MikrotikRouter[]>(() => [...SEED_ROUTERS]);
  const [leases, setLeases] = useState<ClientLease[]>(() => [...SEED_LEASES]);
  const [selectedId, setSelectedId] = useState<string | null>(SEED_ROUTERS[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<MikrotikRouter | null>(null);

  const selected = routers.find((router) => router.id === selectedId) ?? routers[0] ?? null;
  const model = selected ? getModel(selected.modelId) : undefined;
  const routerLeases = useMemo(
    () => (selected ? leases.filter((lease) => lease.routerId === selected.id) : []),
    [leases, selected],
  );
  const leaseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const lease of leases) counts[lease.routerId] = (counts[lease.routerId] ?? 0) + 1;
    return counts;
  }, [leases]);

  function handleAdd(input: NewRouterInput) {
    const id = nextRouterId(routers.map((router) => router.id));
    const router: MikrotikRouter = {
      id,
      tenantId: DEMO_TENANT.id,
      name: input.name,
      modelId: input.modelId,
      managementAddress: input.managementAddress,
      status: "unknown",
      routerOsVersion: null,
      isDemoAdded: true,
    };
    setRouters((current) => [...current, router]);
    setSelectedId(id);
    setAdding(false);
    toast.push({
      title: "Demo router added",
      description: "It only exists in this browser. Nothing was contacted or configured.",
      tone: "info",
    });
  }

  function handleRemove() {
    if (!removing) return;
    const id = removing.id;
    setRouters((current) => current.filter((router) => router.id !== id));
    setLeases((current) => current.filter((lease) => lease.routerId !== id));
    setRemoving(null);
    toast.push({
      title: "Removed from the demo inventory",
      description: "No real router was changed.",
      tone: "info",
    });
  }

  function handleDisconnect(lease: ClientLease) {
    setLeases((current) => current.filter((item) => item.id !== lease.id));
    toast.push({
      title: `${lease.hostName} disconnected (demo)`,
      description: "Only the demo list changed. No router was contacted.",
      tone: "info",
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="info" icon={Gauge}>
            Demo data, not connected
          </Badge>
          <Badge>Tenant: {DEMO_TENANT.name}</Badge>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-muted">
          This module is read-only and simulated. It never writes to a router, and your existing MikroTik configuration is
          treated as protected. It shows one demo tenant, so its numbers differ from the platform-wide totals on the main
          dashboard.
        </p>
      </Card>

      <Card>
        <div className="px-5 pt-2">
          <Tabs tabs={TABS} value={tab} onChange={setTab} idPrefix={ID_PREFIX} label="MikroTik sections" />
        </div>
        <div role="tabpanel" id={panelId(ID_PREFIX, tab)} aria-labelledby={tabId(ID_PREFIX, tab)} tabIndex={0} className="p-5">
          {tab === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
              <RouterInventory
                routers={routers}
                selectedId={selected?.id ?? null}
                leaseCounts={leaseCounts}
                onSelect={setSelectedId}
                onAdd={() => setAdding(true)}
              />
              {selected && model ? (
                <RouterDetail
                  router={selected}
                  model={model}
                  metrics={SEED_METRICS[selected.id] ?? null}
                  leaseCount={routerLeases.length}
                  authorizedCount={routerLeases.filter((lease) => lease.authorized).length}
                  onRemove={() => setRemoving(selected)}
                />
              ) : (
                <NeedsRouter what="details" />
              )}
            </div>
          ) : null}

          {tab === "leases" ? (
            selected ? (
              <LeaseGrid
                routerName={selected.name}
                leases={routerLeases}
                profiles={BILLING_PROFILES}
                onDisconnect={handleDisconnect}
              />
            ) : (
              <NeedsRouter what="leases" />
            )
          ) : null}

          {tab === "profiles" ? (
            selected ? (
              <ProfilesPanel
                routerName={selected.name}
                servers={SEED_HOTSPOT_SERVERS.filter((server) => server.routerId === selected.id)}
                profiles={BILLING_PROFILES}
                leases={routerLeases}
              />
            ) : (
              <NeedsRouter what="hotspot servers and profiles" />
            )
          ) : null}

          {tab === "catalog" ? <HardwareCatalog /> : null}
          {tab === "guide" ? <CompatibilityGuide /> : null}
        </div>
      </Card>

      <AddRouterDialog
        open={adding}
        existingNames={routers.map((router) => router.name)}
        onSubmit={handleAdd}
        onCancel={() => setAdding(false)}
      />
      <ConfirmDialog
        open={removing !== null}
        title={`Remove ${removing?.name ?? "this router"}?`}
        description="This removes the router and its demo leases from the inventory in your browser. No real router is changed."
        confirmLabel="Remove (demo)"
        destructive
        onCancel={() => setRemoving(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
