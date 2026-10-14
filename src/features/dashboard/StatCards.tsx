import { Card } from "@/components/ui/Card";
import { deviceSummary } from "@/features/dashboard/dashboard-logic";
import { mikrotikOverview, omadaOverview, revenueSummary, subscriberSummary } from "@/lib/mock-data/overview";
import { formatMoney, formatNumber } from "@/lib/utils/format";
import type { NetworkAlert, VendorFilter } from "@/types/overview";

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-fg">{value}</p>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </Card>
  );
}

interface StatCardsProps {
  vendor: VendorFilter;
  openAlerts: readonly NetworkAlert[];
}

export function StatCards({ vendor, openAlerts }: StatCardsProps) {
  const devices = deviceSummary(vendor);
  const revenueChange =
    Math.round(((revenueSummary.thisMonth - revenueSummary.lastMonth) / revenueSummary.lastMonth) * 1000) / 10;
  const critical = openAlerts.filter((alert) => alert.severity === "critical").length;
  const warnings = openAlerts.filter((alert) => alert.severity === "warning").length;

  const usersValue =
    vendor === "mikrotik"
      ? formatNumber(mikrotikOverview.activeHotspotSessions)
      : vendor === "omada"
        ? formatNumber(omadaOverview.connectedClients)
        : null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <StatCard
        label="Subscribers"
        value={formatNumber(subscriberSummary.total)}
        detail={`${formatNumber(subscriberSummary.active)} active, ${formatNumber(subscriberSummary.expired)} expired, ${subscriberSummary.suspended} suspended`}
      />
      <StatCard
        label="Revenue this month"
        value={formatMoney(revenueSummary.thisMonth, revenueSummary.currency)}
        detail={`${revenueChange >= 0 ? "Up" : "Down"} ${Math.abs(revenueChange)}% on last month, ${revenueSummary.pendingInvoices} invoices pending`}
      />
      <StatCard label={devices.label} value={`${devices.online} of ${devices.total}`} detail={devices.detail} />
      <StatCard
        label="Open alerts"
        value={String(openAlerts.length)}
        detail={`${critical} critical, ${warnings} warning${warnings === 1 ? "" : "s"}`}
      />
      <Card className="p-5">
        <p className="text-sm text-muted">Connected now</p>
        {usersValue ? (
          <>
            <p className="mt-2 text-3xl font-bold tracking-tight text-fg">{usersValue}</p>
            <p className="mt-1 text-sm text-muted">
              {vendor === "mikrotik" ? "Active hotspot sessions" : "Wireless clients"}
            </p>
          </>
        ) : (
          <div className="mt-2">
          <dl className="space-y-1">
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-muted">MikroTik hotspot sessions</dt>
              <dd className="text-xl font-bold text-fg">{formatNumber(mikrotikOverview.activeHotspotSessions)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm text-muted">Omada wireless clients</dt>
              <dd className="text-xl font-bold text-fg">{formatNumber(omadaOverview.connectedClients)}</dd>
            </div>
          </dl>
          <p className="pt-1 text-xs text-muted">Counted differently, so not added together.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
