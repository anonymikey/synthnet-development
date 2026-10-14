import type { CurrencyCode } from "@/types/portal";
import type { VendorId } from "@/types/vendor";

export interface StatusCounts {
  online: number;
  warning: number;
  offline: number;
}

export interface SubscriberSummary {
  total: number;
  active: number;
  expired: number;
  suspended: number;
}

export interface RevenueSummary {
  currency: CurrencyCode;
  thisMonth: number;
  lastMonth: number;
  pendingInvoices: number;
}

/** MikroTik-specific overview. Its metrics are not interchangeable with Omada's. */
export interface MikrotikOverview {
  routers: StatusCounts;
  hotspotServers: number;
  activeHotspotSessions: number;
}

/** Omada-specific overview. Clients are wireless clients, not hotspot sessions. */
export interface OmadaOverview {
  controllers: number;
  sites: number;
  accessPoints: StatusCounts;
  connectedClients: number;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface NetworkAlert {
  id: string;
  vendor: VendorId;
  severity: AlertSeverity;
  title: string;
  detail: string;
  minutesAgo: number;
}

export type ActivitySource = VendorId | "billing" | "portal";

export interface ActivityEntry {
  id: string;
  source: ActivitySource;
  text: string;
  minutesAgo: number;
}

/** Dashboard-wide vendor scope. Vendor metrics are never merged across vendors. */
export type VendorFilter = "all" | VendorId;

export type TimeRange = "24h" | "7d" | "30d";
export type DashboardMetric = "throughput" | "users";

export interface PlanBreakdownEntry {
  planId: string;
  name: string;
  /** Active subscribers on this plan. */
  subscribers: number;
}

export interface RevenuePoint {
  label: string;
  amount: number;
}

export interface InvoiceSummary {
  paid: number;
  pending: number;
  overdue: number;
}

export type PaymentStatus = "completed" | "pending" | "failed";
export type PaymentFilter = "all" | PaymentStatus;
export type PaymentMethodKind = "mpesa" | "voucher";

export interface PaymentRecord {
  id: string;
  subscriber: string;
  plan: string;
  amount: number;
  currency: CurrencyCode;
  method: PaymentMethodKind;
  status: PaymentStatus;
  note?: string;
  minutesAgo: number;
}
