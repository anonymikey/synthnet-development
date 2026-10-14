"use client";

import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ApBadges } from "@/features/omada/components/ApBadges";
import { ApPhoto } from "@/features/omada/components/ApPhoto";
import { getApModel } from "@/features/omada/omada.catalog";
import type { OmadaAccessPoint } from "@/features/omada/omada.types";
import { cn } from "@/lib/utils/cn";

interface AccessPointInventoryProps {
  aps: readonly OmadaAccessPoint[];
  selectedId: string | null;
  clientCounts: Readonly<Record<string, number>>;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function AccessPointInventory({ aps, selectedId, clientCounts, onSelect, onAdd }: AccessPointInventoryProps) {
  return (
    <Card>
      <CardHeader
        title="Access points"
        description="Choose one to see its details."
        action={
          <Button variant="secondary" size="sm" onClick={onAdd}>
            <Plus aria-hidden="true" className="size-4" />
            Add demo AP
          </Button>
        }
      />
      {aps.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-fg">No access points in this demo site</p>
          <p className="mt-1 text-sm text-muted">Add a demo access point to explore the catalog models.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {aps.map((ap) => {
            const model = getApModel(ap.modelId);
            const selected = ap.id === selectedId;
            return (
              <li key={ap.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ap.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-start gap-3 px-5 py-4 text-left transition-colors",
                    selected ? "bg-accent/10" : "hover:bg-raised",
                  )}
                >
                  {model ? <ApPhoto model={model} size="sm" /> : null}
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-fg">{ap.name}</span>
                      <StatusBadge status={ap.status} />
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {model?.displayName ?? "Unknown model"} · {ap.ipAddress || "no address"} · {clientCounts[ap.id] ?? 0} clients
                    </span>
                    {model ? (
                      <span className="mt-2 block">
                        <ApBadges model={model} limit={3} />
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
