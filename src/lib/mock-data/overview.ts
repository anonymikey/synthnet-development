import type { VendorId } from "@/types/vendor";
import type {
  ActivityEntry,
  DashboardMetric,
  MikrotikOverview,
  NetworkAlert,
  OmadaOverview,
  RevenueSummary,
  StatusCounts,
  SubscriberSummary,
  TimeRange,
} from "@/types/overview";

/**
 * Illustrative demo data. Nothing here comes from a real MikroTik router,
 * Omada controller, payment provider or customer.
 * Counts are internally consistent: alert counts match device warning/offline counts.
 */

export const subscriberSummary: SubscriberSummary = {
  total: 1486,
  active: 1102,
  expired: 291,
  suspended: 93,
};

export const revenueSummary: RevenueSummary = {
  currency: "KES",
  thisMonth: 482300,
  lastMonth: 441900,
  pendingInvoices: 37,
};

export const mikrotikOverview: MikrotikOverview = {
  routers: { online: 11, warning: 1, offline: 1 },
  hotspotServers: 9,
  activeHotspotSessions: 438,
};

export const omadaOverview: OmadaOverview = {
  controllers: 2,
  sites: 4,
  accessPoints: { online: 23, warning: 2, offline: 1 },
  connectedClients: 214,
};

export const networkAlerts: NetworkAlert[] = [
  {
    id: "alert-1",
    vendor: "mikrotik",
    severity: "critical",
    title: "Router RB-Central-04 is unreachable",
    detail: "No response for 47 minutes.",
    minutesAgo: 47,
  },
  {
    id: "alert-2",
    vendor: "mikrotik",
    severity: "warning",
    title: "High CPU on RB-Market-02",
    detail: "CPU above 85% for 12 minutes.",
    minutesAgo: 14,
  },
  {
    id: "alert-3",
    vendor: "omada",
    severity: "critical",
    title: "Access point AP-Plaza-03 is offline",
    detail: "Disconnected from its controller.",
    minutesAgo: 31,
  },
  {
    id: "alert-4",
    vendor: "omada",
    severity: "warning",
    title: "Weak uplink on AP-Plaza-01",
    detail: "Wireless uplink signal is below the recommended level.",
    minutesAgo: 66,
  },
  {
    id: "alert-5",
    vendor: "omada",
    severity: "warning",
    title: "Channel congestion at Site North",
    detail: "Two access points share a busy 2.4 GHz channel.",
    minutesAgo: 120,
  },
];

export const recentActivity: ActivityEntry[] = [
  { id: "act-1", source: "billing", text: "Invoice batch for October generated", minutesAgo: 8 },
  { id: "act-2", source: "portal", text: "Captive portal theme updated", minutesAgo: 22 },
  { id: "act-3", source: "mikrotik", text: "Hotspot profile “Weekly” reviewed", minutesAgo: 51 },
  { id: "act-4", source: "omada", text: "Site North added to controller OC-01", minutesAgo: 95 },
  { id: "act-5", source: "billing", text: "37 invoices marked as pending", minutesAgo: 180 },
];

export function sumStatusCounts(counts: StatusCounts): number {
  return counts.online + counts.warning + counts.offline;
}

export const HOURS_LABELS: ReadonlyArray<{ index: number; label: string }> = [
  { index: 0, label: "00:00" },
  { index: 6, label: "06:00" },
  { index: 12, label: "12:00" },
  { index: 18, label: "18:00" },
  { index: 23, label: "23:00" },
];

interface RangeSpec {
  points: number;
  labels: ReadonlyArray<{ index: number; label: string }>;
  description: string;
  phase: number;
  ripple: number;
}

export const RANGE_SPECS: Record<TimeRange, RangeSpec> = {
  "24h": { points: 24, labels: HOURS_LABELS, description: "hourly", phase: 1.3, ripple: 6 },
  "7d": {
    points: 7,
    labels: [
      { index: 0, label: "6d ago" },
      { index: 3, label: "3d ago" },
      { index: 6, label: "Today" },
    ],
    description: "daily peak",
    phase: 0.6,
    ripple: 12,
  },
  "30d": {
    points: 30,
    labels: [
      { index: 0, label: "30d ago" },
      { index: 15, label: "15d ago" },
      { index: 29, label: "Today" },
    ],
    description: "daily peak",
    phase: 0.2,
    ripple: 10,
  },
};

export const TIME_RANGE_OPTIONS: ReadonlyArray<{ value: TimeRange; label: string }> = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

const SERIES_PARAMS: Record<DashboardMetric, Record<VendorId, { base: number; amplitude: number }>> = {
  throughput: {
    mikrotik: { base: 310, amplitude: 130 },
    omada: { base: 150, amplitude: 70 },
  },
  users: {
    mikrotik: { base: 300, amplitude: 110 },
    omada: { base: 140, amplitude: 55 },
  },
};

/**
 * Deterministic demo series. For the "users" metric the final point equals the current
 * figure shown elsewhere on the dashboard, so the chart and the cards agree.
 */
export function getSeries(metric: DashboardMetric, vendor: VendorId, range: TimeRange): number[] {
  const { base, amplitude } = SERIES_PARAMS[metric][vendor];
  const spec = RANGE_SPECS[range];
  const values = Array.from({ length: spec.points }, (_, index) => {
    const wave = Math.sin((index / spec.points) * 2 * Math.PI - spec.phase);
    return Math.round(base + amplitude * wave + (index % 5) * spec.ripple);
  });
  if (metric === "users") {
    values[values.length - 1] =
      vendor === "mikrotik" ? mikrotikOverview.activeHotspotSessions : omadaOverview.connectedClients;
  }
  return values;
}
