"use client";

import { AlertTriangle, Check, Info, OctagonAlert } from "lucide-react";
import { useState } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { formatMinutesAgo } from "@/lib/utils/format";
import type { AlertSeverity, NetworkAlert } from "@/types/overview";
import { VENDOR_LABELS } from "@/types/vendor";

type SeverityFilter = "all" | "critical" | "warning";

const SEVERITY_OPTIONS: ReadonlyArray<{ value: SeverityFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
];

const SEVERITY_BADGE: Record<AlertSeverity, { tone: BadgeTone; label: string; icon: typeof Info }> = {
  critical: { tone: "danger", label: "Critical", icon: OctagonAlert },
  warning: { tone: "warning", label: "Warning", icon: AlertTriangle },
  info: { tone: "info", label: "Info", icon: Info },
};

interface AlertsCardProps {
  alerts: readonly NetworkAlert[];
  acknowledged: readonly string[];
  onToggle: (alert: NetworkAlert) => void;
}

export function AlertsCard({ alerts, acknowledged, onToggle }: AlertsCardProps) {
  const [severity, setSeverity] = useState<SeverityFilter>("all");
  const shown = alerts.filter((alert) => severity === "all" || alert.severity === severity);

  return (
    <Card>
      <CardHeader
        title="Alerts"
        description="Demo alerts that match the device counts. Acknowledging only changes this browser session."
        action={<SegmentedControl label="Alert severity" value={severity} options={SEVERITY_OPTIONS} onChange={setSeverity} />}
      />
      {shown.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-fg">
            {alerts.length === 0 ? "No alerts for this vendor" : "No alerts match this filter"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {alerts.length === 0 ? "Switch the vendor filter to see other alerts." : "Choose All to see every alert."}
          </p>
          {alerts.length > 0 ? (
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setSeverity("all")}>
              Show all alerts
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {shown.map((alert) => {
            const badge = SEVERITY_BADGE[alert.severity];
            const done = acknowledged.includes(alert.id);
            return (
              <li key={alert.id} className="flex flex-wrap items-start gap-3 px-5 py-3">
                <Badge tone={badge.tone} icon={badge.icon}>
                  {badge.label}
                </Badge>
                <div className={`min-w-0 flex-1 ${done ? "opacity-60" : ""}`}>
                  <p className="text-sm font-medium text-fg">{alert.title}</p>
                  <p className="text-xs text-muted">
                    {VENDOR_LABELS[alert.vendor]} · {alert.detail} · {formatMinutesAgo(alert.minutesAgo)}
                  </p>
                </div>
                {done ? (
                  <Badge icon={Check}>Acknowledged</Badge>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`${done ? "Reopen" : "Acknowledge"} alert: ${alert.title}`}
                  onClick={() => onToggle(alert)}
                >
                  {done ? "Reopen" : "Acknowledge"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
