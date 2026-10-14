import type {
  ApMetrics,
  ClientPortalState,
  OmadaAccessPlan,
  OmadaAccessPoint,
  OmadaBand,
  OmadaClient,
  OmadaController,
  OmadaPortalConfig,
  OmadaSite,
  OmadaSsid,
  OmadaTenant,
} from "@/features/omada/omada.types";

/**
 * Deterministic demo data for ONE localized tenant. Nothing here comes from a real controller.
 *
 * Assumptions to confirm:
 *  - The "AC1200" access point is an EAP225-Outdoor (TP-Link sells several AC1200 models).
 *  - The quantities (two EAP110-Outdoor, one EAP225-Outdoor), SSID names, addressing and the
 *    controller type are illustrative.
 *  - The plans mirror the captive-portal demo plans so the two screens agree.
 */

export const OMADA_DEMO_TENANT: OmadaTenant = {
  id: "tenant-harborview",
  name: "Harbor View Wi-Fi",
  currency: "KES",
};

/**
 * Where unauthenticated clients are sent. This is the SYNTHNET external portal page.
 * Change it here if the portal moves; the Portal tab and tests read this constant.
 */
export const EXTERNAL_PORTAL_URL = "https://synthnet.anonymiketech.space/portal";

/** A fixed timestamp (seconds since epoch) so demo redirect URLs are identical on every run. */
export const DEMO_EPOCH_SECONDS = 1791849600;

/** Landing page used in demo redirect URLs. */
export const DEMO_LANDING_PAGE = "http://example.com/";

export const SEED_CONTROLLER: OmadaController = {
  id: "ctl-local-1",
  tenantId: OMADA_DEMO_TENANT.id,
  name: "Local Omada Controller",
  modelId: "omada-software",
  address: "192.168.20.10",
  version: null,
  status: "online",
};

export const SEED_SITE: OmadaSite = {
  id: "site-main",
  controllerId: SEED_CONTROLLER.id,
  name: "Harbor View Main",
};

export const SSIDS: readonly OmadaSsid[] = [
  { id: "ssid-hotspot", name: "HarborView-Hotspot", security: "open", portalEnabled: true, clientIsolation: true, vlanId: null },
  { id: "ssid-staff", name: "HarborView-Staff", security: "wpa2-psk", portalEnabled: false, clientIsolation: false, vlanId: null },
];

export const PORTAL_CONFIG: OmadaPortalConfig = {
  authType: "external-portal-server",
  portalUrl: EXTERNAL_PORTAL_URL,
  ssidIds: ["ssid-hotspot"],
  preAuthAllowedHosts: ["synthnet.anonymiketech.space"],
};

export const SEED_APS: readonly OmadaAccessPoint[] = [
  {
    id: "ap-outdoor-01",
    tenantId: OMADA_DEMO_TENANT.id,
    siteId: SEED_SITE.id,
    name: "AP-Outdoor-01",
    modelId: "eap110-outdoor",
    macAddress: "02:7A:10:00:00:01",
    ipAddress: "192.168.20.2",
    status: "online",
    statusNote: null,
    firmware: null,
    channel24: 1,
    channel5: null,
    isDemoAdded: false,
  },
  {
    id: "ap-outdoor-02",
    tenantId: OMADA_DEMO_TENANT.id,
    siteId: SEED_SITE.id,
    name: "AP-Outdoor-02",
    modelId: "eap110-outdoor",
    macAddress: "02:7A:10:00:00:02",
    ipAddress: "192.168.20.3",
    status: "warning",
    statusNote: "2.4 GHz channel utilization is above 80%.",
    firmware: null,
    channel24: 6,
    channel5: null,
    isDemoAdded: false,
  },
  {
    id: "ap-yard-ac",
    tenantId: OMADA_DEMO_TENANT.id,
    siteId: SEED_SITE.id,
    name: "AP-Yard-AC",
    modelId: "eap225-outdoor",
    macAddress: "02:7A:10:00:00:03",
    ipAddress: "192.168.20.4",
    status: "online",
    statusNote: null,
    firmware: null,
    channel24: 11,
    channel5: 36,
    isDemoAdded: false,
  },
];

/** Bounded by the hardware: the EAP110-Outdoor has a 10/100 port, the EAP225-Outdoor a gigabit port. */
export const SEED_AP_METRICS: Readonly<Record<string, ApMetrics>> = {
  "ap-outdoor-01": { uptimeMinutes: 9 * 1440 + 4 * 60, channelUtilization24: 38, channelUtilization5: null, uplinkMbps: 100 },
  "ap-outdoor-02": { uptimeMinutes: 9 * 1440 + 4 * 60, channelUtilization24: 84, channelUtilization5: null, uplinkMbps: 100 },
  "ap-yard-ac": { uptimeMinutes: 6 * 1440 + 11 * 60, channelUtilization24: 45, channelUtilization5: 22, uplinkMbps: 1000 },
};

/** Mirrors the captive-portal demo plans (names, prices, durations, speeds). */
export const ACCESS_PLANS: readonly OmadaAccessPlan[] = [
  { id: "plan-hourly", name: "1 hour", price: 20, currency: "KES", durationMinutes: 60, downloadMbps: 5, uploadMbps: 5 },
  { id: "plan-daily", name: "Daily", price: 50, currency: "KES", durationMinutes: 1440, downloadMbps: 5, uploadMbps: 5 },
  { id: "plan-weekly", name: "Weekly", price: 250, currency: "KES", durationMinutes: 10080, downloadMbps: 8, uploadMbps: 8 },
  { id: "plan-monthly", name: "Monthly", price: 800, currency: "KES", durationMinutes: 43200, downloadMbps: 10, uploadMbps: 10 },
];

type ClientRow = readonly [
  hostName: string,
  apId: string,
  ssidId: string,
  band: OmadaBand,
  state: ClientPortalState,
  planId: string | null,
];

/** 22 clients: 16 authorized, 4 waiting at the portal, 2 on the staff network (no portal). */
const CLIENT_TABLE: readonly ClientRow[] = [
  ["android-a1", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "authorized", "plan-daily"],
  ["tecno-camon", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "authorized", "plan-weekly"],
  ["iphone-12", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "authorized", "plan-hourly"],
  ["itel-vision", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "unauthenticated", null],
  ["galaxy-a05", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "authorized", "plan-monthly"],
  ["redmi-12", "ap-outdoor-01", "ssid-hotspot", "2.4GHz", "authorized", "plan-daily"],
  ["laptop-pos", "ap-outdoor-01", "ssid-staff", "2.4GHz", "not-required", null],
  ["infinix-smart", "ap-outdoor-02", "ssid-hotspot", "2.4GHz", "authorized", "plan-hourly"],
  ["android-b7", "ap-outdoor-02", "ssid-hotspot", "2.4GHz", "unauthenticated", null],
  ["tablet-yard", "ap-outdoor-02", "ssid-hotspot", "2.4GHz", "authorized", "plan-daily"],
  ["oppo-a17", "ap-outdoor-02", "ssid-hotspot", "2.4GHz", "authorized", "plan-weekly"],
  ["nokia-c32", "ap-outdoor-02", "ssid-hotspot", "2.4GHz", "authorized", "plan-hourly"],
  ["iphone-14", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-monthly"],
  ["macbook-air", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-weekly"],
  ["galaxy-s23", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-daily"],
  ["pixel-7", "ap-yard-ac", "ssid-hotspot", "5GHz", "unauthenticated", null],
  ["android-c3", "ap-yard-ac", "ssid-hotspot", "2.4GHz", "authorized", "plan-hourly"],
  ["smart-tv-bar", "ap-yard-ac", "ssid-staff", "5GHz", "not-required", null],
  ["ipad-9", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-daily"],
  ["laptop-guest", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-weekly"],
  ["vivo-v27", "ap-yard-ac", "ssid-hotspot", "2.4GHz", "unauthenticated", null],
  ["samsung-tab", "ap-yard-ac", "ssid-hotspot", "5GHz", "authorized", "plan-hourly"],
];

function hex2(value: number): string {
  return (value % 256).toString(16).toUpperCase().padStart(2, "0");
}

/** Plain arithmetic, so the output is identical on every run. */
function buildClients(): OmadaClient[] {
  return CLIENT_TABLE.map(([hostName, apId, ssidId, band, portalState, planId], index) => {
    const n = index + 1;
    const plan = ACCESS_PLANS.find((candidate) => candidate.id === planId) ?? null;
    const rateCap = band === "2.4GHz" ? 300 : 867;
    const linkRateMbps =
      band === "2.4GHz" ? Math.min(rateCap, 72 + ((n * 41) % 228)) : Math.min(rateCap, 234 + ((n * 131) % 633));

    let uptimeMinutes: number;
    if (portalState === "authorized" && plan) uptimeMinutes = ((n * 29) % (Math.min(plan.durationMinutes, 480) - 5)) + 3;
    else if (portalState === "unauthenticated") uptimeMinutes = ((n * 7) % 12) + 1;
    else uptimeMinutes = ((n * 53) % 600) + 20;

    const downloadedMb = portalState === "unauthenticated" ? 0 : ((n * 61) % 1700) + 30;
    const uploadedMb = portalState === "unauthenticated" ? 0 : Math.round(downloadedMb * (0.07 + (n % 4) * 0.03));
    const authorized = portalState === "authorized" && plan !== null;

    return {
      id: `client-${String(n).padStart(2, "0")}`,
      tenantId: OMADA_DEMO_TENANT.id,
      siteId: SEED_SITE.id,
      apId,
      ssidId,
      // 02:xx is a locally administered MAC range, so these can never match a real device.
      macAddress: `02:7A:C1:${hex2(n * 7)}:${hex2(n * 13)}:${hex2(n * 29)}`,
      ipAddress: `192.168.20.${40 + n}`,
      hostName,
      band,
      signalDbm: -(42 + ((n * 11) % 31)),
      linkRateMbps,
      portalState,
      username: authorized ? `sub${String(((n * 137) % 900) + 100)}` : null,
      planId: authorized ? planId : null,
      authorizedMinutesLeft: authorized && plan ? plan.durationMinutes - uptimeMinutes : null,
      uptimeMinutes,
      downloadedMb,
      uploadedMb,
    };
  });
}

export const SEED_CLIENTS: readonly OmadaClient[] = buildClients();
