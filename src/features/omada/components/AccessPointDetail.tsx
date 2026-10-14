"use client";

import { Trash2, TriangleAlert } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ApBadges } from "@/features/omada/components/ApBadges";
import { ApGallery, ApPhoto } from "@/features/omada/components/ApPhoto";
import { MetricBar } from "@/features/omada/components/MetricBar";
import { specRows, specSourceLabel } from "@/features/omada/omada.capabilities";
import { formatUptime } from "@/features/omada/omada.logic";
import type { ApMetrics, OmadaAccessPoint, OmadaApModel } from "@/features/omada/omada.types";

interface AccessPointDetailProps {
  ap: OmadaAccessPoint;
  model: OmadaApModel;
  metrics: ApMetrics | null;
  clientCount: number;
  authorizedCount: number;
  onRemove: () => void;
}

export function AccessPointDetail({ ap, model, metrics, clientCount, authorizedCount, onRemove }: AccessPointDetailProps) {
  return (
    <Card>
      <CardHeader
        title={ap.name}
        description={`${model.displayName} at ${ap.ipAddress || "no address"}`}
        action={<StatusBadge status={ap.status} />}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <div className="space-y-3">
          <ApPhoto model={model} size="lg" showNote />
          <p className="text-xs text-muted">{specSourceLabel(model)}.</p>
          {model.gallery.length > 0 ? <ApGallery images={model.gallery} /> : null}
        </div>

        <div className="space-y-6">
          <ApBadges model={model} />

          {ap.statusNote ? (
            <p role="note" className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {ap.statusNote}
            </p>
          ) : null}

          {metrics ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricBar label="2.4 GHz channel use" percent={metrics.channelUtilization24} valueText={`${metrics.channelUtilization24}%`} />
              {metrics.channelUtilization5 !== null ? (
                <MetricBar label="5 GHz channel use" percent={metrics.channelUtilization5} valueText={`${metrics.channelUtilization5}%`} />
              ) : (
                <p className="self-end text-sm text-muted">No 5 GHz radio on this model.</p>
              )}
              <dl className="grid grid-cols-2 gap-4 sm:col-span-2 sm:grid-cols-4">
                <div>
                  <dt className="text-sm text-muted">Uptime</dt>
                  <dd className="text-lg font-semibold text-fg">{formatUptime(metrics.uptimeMinutes)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Uplink</dt>
                  <dd className="text-lg font-semibold text-fg">{metrics.uplinkMbps} Mbps</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Clients</dt>
                  <dd className="text-lg font-semibold text-fg">{clientCount}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Signed in</dt>
                  <dd className="text-lg font-semibold text-fg">{authorizedCount}</dd>
                </div>
              </dl>
              <p className="text-xs text-muted sm:col-span-2">All figures are demo data, not read from a controller.</p>
            </div>
          ) : (
            <p className="rounded-md border border-dashed border-line p-4 text-sm text-muted">
              No metrics. This demo access point was added by hand and is not adopted by any controller, so its status
              stays unknown.
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
              <dt className="text-xs text-muted">MAC address</dt>
              <dd className="font-mono text-sm text-fg">{ap.macAddress || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Firmware</dt>
              <dd className="text-sm text-fg">{ap.firmware ?? "Not reported yet (needs Phase 2)"}</dd>
            </div>
          </dl>

          {model.specNote ? <p className="text-xs text-muted">{model.specNote}</p> : null}

          <div className="flex justify-end border-t border-line pt-4">
            <Button variant="danger" size="sm" onClick={onRemove}>
              <Trash2 aria-hidden="true" className="size-4" />
              Remove from demo site
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
