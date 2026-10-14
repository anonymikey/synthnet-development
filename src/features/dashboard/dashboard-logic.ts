import { mikrotikOverview, omadaOverview, sumStatusCounts } from "@/lib/mock-data/overview";
import type {
  ActivityEntry,
  NetworkAlert,
  PaymentFilter,
  PaymentRecord,
  VendorFilter,
} from "@/types/overview";

/** Pure helpers for the dashboard so filtering rules can be tested without rendering. */

export function alertsInScope(alerts: readonly NetworkAlert[], vendor: VendorFilter): NetworkAlert[] {
  return vendor === "all" ? [...alerts] : alerts.filter((alert) => alert.vendor === vendor);
}

export function openAlerts(alerts: readonly NetworkAlert[], acknowledged: readonly string[]): NetworkAlert[] {
  return alerts.filter((alert) => !acknowledged.includes(alert.id));
}

export function activityInScope(entries: readonly ActivityEntry[], vendor: VendorFilter): ActivityEntry[] {
  return vendor === "all" ? [...entries] : entries.filter((entry) => entry.source === vendor);
}

export function filterPayments(payments: readonly PaymentRecord[], filter: PaymentFilter): PaymentRecord[] {
  return filter === "all" ? [...payments] : payments.filter((payment) => payment.status === filter);
}

export function toggleInList(list: readonly string[], id: string): string[] {
  return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
}

export interface DeviceScopeSummary {
  label: string;
  online: number;
  total: number;
  detail: string;
}

export function deviceSummary(vendor: VendorFilter): DeviceScopeSummary {
  if (vendor === "mikrotik") {
    const { routers } = mikrotikOverview;
    return {
      label: "MikroTik routers online",
      online: routers.online,
      total: sumStatusCounts(routers),
      detail: `${routers.warning} warning, ${routers.offline} offline`,
    };
  }
  if (vendor === "omada") {
    const { accessPoints } = omadaOverview;
    return {
      label: "Omada access points online",
      online: accessPoints.online,
      total: sumStatusCounts(accessPoints),
      detail: `${accessPoints.warning} warning, ${accessPoints.offline} offline`,
    };
  }
  const routers = mikrotikOverview.routers;
  const aps = omadaOverview.accessPoints;
  return {
    label: "Routers and access points online",
    online: routers.online + aps.online,
    total: sumStatusCounts(routers) + sumStatusCounts(aps),
    detail: "MikroTik routers plus Omada access points",
  };
}
