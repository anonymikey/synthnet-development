import type {
  ClientPortalState,
  OmadaAccessPlan,
  OmadaAccessPoint,
  OmadaBand,
  OmadaClient,
  OmadaSsid,
} from "@/features/omada/omada.types";

/** Pure helpers for the Omada module, kept free of React so they can be tested directly. */

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

export function isValidIpv4(value: string): boolean {
  const parts = value.trim().split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export type SignalQuality = "excellent" | "good" | "fair" | "weak";

/** A rule-of-thumb guide for the demo, not a TP-Link specification. */
export function signalQuality(dbm: number): SignalQuality {
  if (dbm >= -55) return "excellent";
  if (dbm >= -65) return "good";
  if (dbm >= -72) return "fair";
  return "weak";
}

export type ClientSortKey = "signal" | "uptime" | "downloaded";
export type PortalFilter = "all" | ClientPortalState;
export type BandFilter = "all" | OmadaBand;

export interface ClientQuery {
  search: string;
  /** "all" or an access point id. */
  apId: string;
  portal: PortalFilter;
  band: BandFilter;
  sort: ClientSortKey;
}

export function queryClients(clients: readonly OmadaClient[], query: ClientQuery): OmadaClient[] {
  const needle = query.search.trim().toLowerCase();
  const filtered = clients.filter((client) => {
    if (query.apId !== "all" && client.apId !== query.apId) return false;
    if (query.portal !== "all" && client.portalState !== query.portal) return false;
    if (query.band !== "all" && client.band !== query.band) return false;
    if (!needle) return true;
    return [client.hostName, client.ipAddress, client.macAddress, client.username ?? ""].some((field) =>
      field.toLowerCase().includes(needle),
    );
  });
  const sorted = [...filtered];
  if (query.sort === "signal") sorted.sort((a, b) => b.signalDbm - a.signalDbm);
  else if (query.sort === "uptime") sorted.sort((a, b) => b.uptimeMinutes - a.uptimeMinutes);
  else sorted.sort((a, b) => b.downloadedMb - a.downloadedMb);
  return sorted;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageCount: number;
  total: number;
}

export function paginate<T>(items: readonly T[], requestedPage: number, pageSize: number): Page<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page, pageCount, total: items.length };
}

export interface ClientTotals {
  total: number;
  authorized: number;
  unauthenticated: number;
  notRequired: number;
  downloadedMb: number;
  uploadedMb: number;
}

export function clientTotals(clients: readonly OmadaClient[]): ClientTotals {
  return clients.reduce<ClientTotals>(
    (totals, client) => ({
      total: totals.total + 1,
      authorized: totals.authorized + (client.portalState === "authorized" ? 1 : 0),
      unauthenticated: totals.unauthenticated + (client.portalState === "unauthenticated" ? 1 : 0),
      notRequired: totals.notRequired + (client.portalState === "not-required" ? 1 : 0),
      downloadedMb: totals.downloadedMb + client.downloadedMb,
      uploadedMb: totals.uploadedMb + client.uploadedMb,
    }),
    { total: 0, authorized: 0, unauthenticated: 0, notRequired: 0, downloadedMb: 0, uploadedMb: 0 },
  );
}

export function apClientCounts(clients: readonly OmadaClient[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const client of clients) counts[client.apId] = (counts[client.apId] ?? 0) + 1;
  return counts;
}

export interface PlanUsage {
  plan: OmadaAccessPlan;
  clients: number;
  /** Plan price times clients. A demo illustration, not a billing result. */
  listRevenue: number;
}

export function planUsage(clients: readonly OmadaClient[], plans: readonly OmadaAccessPlan[]): PlanUsage[] {
  return plans.map((plan) => {
    const count = clients.filter((client) => client.portalState === "authorized" && client.planId === plan.id).length;
    return { plan, clients: count, listRevenue: count * plan.price };
  });
}

export function nextApId(existingIds: readonly string[]): string {
  let n = existingIds.length + 1;
  while (existingIds.includes(`ap-demo-${n}`)) n += 1;
  return `ap-demo-${n}`;
}

/** Host part of a URL, or an empty string if it is not a valid absolute URL. */
export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

export interface PortalRedirectParams {
  clientMac: string;
  apMac: string;
  ssidName: string;
  t: number;
  radioId: number;
  site: string;
  redirectUrl: string;
}

/**
 * Builds the URL an Omada access point sends an unauthenticated client to when an External Portal
 * Server is configured. Parameter names and order follow TP-Link's "API and Code Sample for External
 * Portal Server" (Omada Controller 5.0.15 or above). In production the controller fills these in.
 */
export function buildPortalRedirectUrl(portalUrl: string, params: PortalRedirectParams): string {
  const pairs: Array<[string, string]> = [
    ["clientMac", params.clientMac],
    ["apMac", params.apMac],
    ["ssidName", params.ssidName],
    ["t", String(params.t)],
    ["radioId", String(params.radioId)],
    ["site", params.site],
    ["redirectUrl", params.redirectUrl],
  ];
  const query = pairs.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
  return `${portalUrl}${portalUrl.includes("?") ? "&" : "?"}${query}`;
}

/** Demo radio numbering (0 = 2.4 GHz, 1 = 5 GHz). Confirm the real values against the controller in Phase 2. */
export function demoRadioId(band: OmadaBand): number {
  return band === "2.4GHz" ? 0 : 1;
}

export function redirectParamsForClient(
  client: OmadaClient,
  ap: OmadaAccessPoint,
  ssid: OmadaSsid,
  siteName: string,
  epochSeconds: number,
  landingPage: string,
): PortalRedirectParams {
  return {
    clientMac: client.macAddress,
    apMac: ap.macAddress,
    ssidName: ssid.name,
    t: epochSeconds,
    radioId: demoRadioId(client.band),
    site: siteName,
    redirectUrl: landingPage,
  };
}

export function redirectUrlForClient(
  client: OmadaClient,
  ap: OmadaAccessPoint,
  ssid: OmadaSsid,
  siteName: string,
  portalUrl: string,
  epochSeconds: number,
  landingPage: string,
): string {
  return buildPortalRedirectUrl(portalUrl, redirectParamsForClient(client, ap, ssid, siteName, epochSeconds, landingPage));
}
