import type { BillingProfile, ClientLease } from "@/features/mikrotik/mikrotik.types";

/** Pure helpers for the MikroTik module, kept free of React so they can be tested directly. */

export function formatUptime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatMegabytes(megabytes: number): string {
  if (megabytes >= 1024) return `${(megabytes / 1024).toFixed(1)} GB`;
  return `${Math.round(megabytes)} MB`;
}

export function memoryUsagePercent(usedMb: number, totalMb: number): number {
  if (totalMb <= 0) return 0;
  return Math.min(100, Math.round((usedMb / totalMb) * 100));
}

export function isValidIpv4(value: string): boolean {
  const parts = value.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function ipToNumber(ip: string): number {
  return ip.split(".").reduce((total, part) => total * 256 + Number(part), 0);
}

export type LeaseSortKey = "uptime" | "downloaded" | "ip";
export type LoginFilter = "all" | "authorized" | "pending";

export interface LeaseQuery {
  search: string;
  /** "all", "none" (no profile), or a billing profile id. */
  profileId: string;
  login: LoginFilter;
  sort: LeaseSortKey;
}

export function queryLeases(leases: readonly ClientLease[], query: LeaseQuery): ClientLease[] {
  const needle = query.search.trim().toLowerCase();
  const filtered = leases.filter((lease) => {
    if (query.login === "authorized" && !lease.authorized) return false;
    if (query.login === "pending" && lease.authorized) return false;
    if (query.profileId === "none" && lease.profileId !== null) return false;
    if (query.profileId !== "all" && query.profileId !== "none" && lease.profileId !== query.profileId) return false;
    if (!needle) return true;
    return [lease.hostName, lease.ipAddress, lease.macAddress, lease.username ?? ""].some((field) =>
      field.toLowerCase().includes(needle),
    );
  });

  const sorted = [...filtered];
  if (query.sort === "uptime") sorted.sort((a, b) => b.uptimeMinutes - a.uptimeMinutes);
  else if (query.sort === "downloaded") sorted.sort((a, b) => b.downloadedMb - a.downloadedMb);
  else sorted.sort((a, b) => ipToNumber(a.ipAddress) - ipToNumber(b.ipAddress));
  return sorted;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

/** Clamps the requested page into range, so deleting the last row of a page never shows an empty page. */
export function paginate<T>(items: readonly T[], requestedPage: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageCount, total: items.length };
}

export interface LeaseTotals {
  total: number;
  authorized: number;
  pending: number;
  downloadedMb: number;
  uploadedMb: number;
}

export function leaseTotals(leases: readonly ClientLease[]): LeaseTotals {
  return leases.reduce<LeaseTotals>(
    (totals, lease) => ({
      total: totals.total + 1,
      authorized: totals.authorized + (lease.authorized ? 1 : 0),
      pending: totals.pending + (lease.authorized ? 0 : 1),
      downloadedMb: totals.downloadedMb + lease.downloadedMb,
      uploadedMb: totals.uploadedMb + lease.uploadedMb,
    }),
    { total: 0, authorized: 0, pending: 0, downloadedMb: 0, uploadedMb: 0 },
  );
}

export interface ProfileUsage {
  profile: BillingProfile;
  leases: number;
  /** Monthly revenue these leases represent at list price. A demo figure, not a billing result. */
  listRevenue: number;
}

export function profileUsage(leases: readonly ClientLease[], profiles: readonly BillingProfile[]): ProfileUsage[] {
  return profiles.map((profile) => {
    const count = leases.filter((lease) => lease.authorized && lease.profileId === profile.id).length;
    return { profile, leases: count, listRevenue: count * profile.price };
  });
}

export function nextRouterId(existingIds: readonly string[]): string {
  let n = existingIds.length + 1;
  while (existingIds.includes(`rtr-demo-${n}`)) n += 1;
  return `rtr-demo-${n}`;
}
