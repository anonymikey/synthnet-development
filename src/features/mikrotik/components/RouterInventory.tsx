"use client";

import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CapabilityBadges } from "@/features/mikrotik/components/CapabilityBadges";
import { RouterPhoto } from "@/features/mikrotik/components/RouterPhoto";
import { getModel } from "@/features/mikrotik/mikrotik.catalog";
import type { MikrotikRouter } from "@/features/mikrotik/mikrotik.types";
import { cn } from "@/lib/utils/cn";

interface RouterInventoryProps {
  routers: readonly MikrotikRouter[];
  selectedId: string | null;
  leaseCounts: Readonly<Record<string, number>>;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function RouterInventory({ routers, selectedId, leaseCounts, onSelect, onAdd }: RouterInventoryProps) {
  return (
    <Card>
      <CardHeader
        title="Router inventory"
        description="Choose a router to see its details."
        action={
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add demo router
          </Button>
        }
      />
      {routers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-fg">No routers in this demo inventory</p>
          <p className="mt-1 text-sm text-muted">Add a demo router to explore the catalog models.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {routers.map((router) => {
            const model = getModel(router.modelId);
            const selected = router.id === selectedId;
            return (
              <li key={router.id}>
                <button
                  type="button"
                  onClick={() => onSelect(router.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors",
                    selected ? "bg-accent/10" : "hover:bg-raised",
                  )}
                >
                  {model ? <RouterPhoto model={model} size="sm" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-fg">{router.name}</span>
                      <StatusBadge status={router.status} />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {model?.displayName ?? "Unknown model"} · {router.managementAddress || "no address"} ·{" "}
                      {leaseCounts[router.id] ?? 0} leases
                    </span>
                    {model ? (
                      <span className="mt-2 block">
                        <CapabilityBadges model={model} recommendationOnly />
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
