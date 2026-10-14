"use client";

import { Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { CapabilityBadges } from "@/features/mikrotik/components/CapabilityBadges";
import { MetricBar } from "@/features/mikrotik/components/MetricBar";
import { RouterPhoto } from "@/features/mikrotik/components/RouterPhoto";
import { specRows, specSourceLabel } from "@/features/mikrotik/mikrotik.capabilities";
import { formatUptime, memoryUsagePercent } from "@/features/mikrotik/mikrotik.logic";
import type { MikrotikModel, MikrotikRouter, RouterMetrics } from "@/features/mikrotik/mikrotik.types";

interface RouterDetailProps {
  router: MikrotikRouter;
  model: MikrotikModel;
  metrics: RouterMetrics | null;
  leaseCount: number;
  authorizedCount: number;
  onRemove: () => void;
}

export function RouterDetail({ router, model, metrics, leaseCount, authorizedCount, onRemove }: RouterDetailProps) {
  return (
    <Card>
      <CardHeader
        title={router.name}
        description={`${model.displayName} at ${router.managementAddress || "no management address"}`}
        action={<StatusBadge status={router.status} />}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <RouterPhoto model={model} size="lg" showNote />
          <p className="text-xs text-muted">{specSourceLabel(model)}.</p>
        </div>

        <div className="space-y-6">
          <CapabilityBadges model={model} />

          {model.caveat ? (
            <p role="note" className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              {model.caveat}
            </p>
          ) : null}

          {metrics ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricBar label="CPU load" percent={metrics.cpuLoadPercent} valueText={`${metrics.cpuLoadPercent}%`} />
              <MetricBar
                label="Memory"
                percent={memoryUsagePercent(metrics.memoryUsedMb, model.ramMb)}
                valueText={`${metrics.memoryUsedMb} of ${model.ramMb} MB`}
              />
              <dl className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
                <div>
                  <dt className="text-sm text-muted">Uptime</dt>
                  <dd className="text-lg font-semibold text-fg">{formatUptime(metrics.uptimeMinutes)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Throughput</dt>
                  <dd className="text-lg font-semibold text-fg">
                    {metrics.txMbps} / {metrics.rxMbps} Mbps
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Leases</dt>
                  <dd className="text-lg font-semibold text-fg">{leaseCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Logged in</dt>
                  <dd className="text-lg font-semibold text-fg">{authorizedCount}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted sm:col-span-2">
                Throughput shows download / upload as seen by clients. All figures are demo data, not read from a router.
              </p>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-line p-4 text-sm text-muted">
              No metrics. This demo router was added by hand and is not connected to anything, so its status stays
              unknown.
            </p>
          )}

          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {specRows(model).map((row) => (
              <div key={row.label}>
                <dt className="text-xs text-muted">{row.label}</dt>
                <dd className="text-sm text-fg">{row.value}</dd>
              </div>
            ))}
            <div>
              <dt className="text-xs text-muted">RouterOS version</dt>
              <dd className="text-sm text-fg">{router.routerOsVersion ?? "Not reported yet (needs a Phase 2 export)"}</dd>
            </div>
          </dl>

          {model.specNote ? <p className="text-xs text-muted">{model.specNote}</p> : null}

          <div className="flex justify-end border-t border-line pt-4">
            <Button variant="danger" size="sm" onClick={onRemove}>
              <Trash2 aria-hidden="true" className="size-4" />
              Remove from demo inventory
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
