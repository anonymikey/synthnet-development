import type {
  BillingProfile,
  ClientLease,
  HotspotServer,
  MikrotikRouter,
  MikrotikTenant,
  RouterMetrics,
} from "@/features/mikrotik/mikrotik.types";

/**
 * Deterministic demo data for ONE localized tenant. Nothing here comes from a real router.
 *
 * Assumptions to confirm (only the KES 600 base price was specified):
 *  - The gateway is an RB951Ui-2nD. Confirm with `/system routerboard print`.
 *  - The billing period is monthly, and "Plus" / "Max" are illustrative steps of KES 300
 *    above the KES 600 base. Speeds, shared-users and pool ranges are illustrative.
 *  - Leases are modelled as DHCP leases plus the client's hotspot login state. How SYNTHNET
 *    will join `/ip dhcp-server lease` with `/ip hotspot active` is a Phase 2 decision.
 */

export const DEMO_TENANT: MikrotikTenant = {
  id: "tenant-greenfield",
  name: "Greenfield Hotspot",
  currency: "KES",
};

export const SEED_ROUTERS: readonly MikrotikRouter[] = [
  {
    id: "rtr-gf-gw-01",
    tenantId: DEMO_TENANT.id,
    name: "GF-Gateway-01",
    modelId: "rb951ui-2nd",
    managementAddress: "10.10.10.1",
    status: "online",
    routerOsVersion: null,
    isDemoAdded: false,
  },
];

/** Metrics for seeded routers. Memory is bounded by the catalog RAM (64 MB for the RB951Ui-2nD). */
export const SEED_METRICS: Readonly<Record<string, RouterMetrics>> = {
  "rtr-gf-gw-01": {
    cpuLoadPercent: 34,
    memoryUsedMb: 41,
    uptimeMinutes: 14 * 1440 + 6 * 60 + 12,
    rxMbps: 3.4,
    txMbps: 14.2,
  },
};

export const SEED_HOTSPOT_SERVERS: readonly HotspotServer[] = [
  {
    id: "hs-gf-1",
    routerId: "rtr-gf-gw-01",
    name: "hotspot1",
    interfaceName: "bridge-lan",
    addressPool: "hs-pool-1 (10.10.10.10-10.10.10.254)",
    serverProfile: "hsprof1",
    loginBy: ["http-chap", "http-pap"],
    enabled: true,
  },
];

export const BILLING_PROFILES: readonly BillingProfile[] = [
  {
    id: "bp-base-600",
    name: "Base",
    description: "Entry package: the KES 600 base tier",
    price: 600,
    currency: "KES",
    billingPeriod: "monthly",
    downloadMbps: 4,
    uploadMbps: 2,
    sharedUsers: 1,
    routerosProfileName: "base-600",
  },
  {
    id: "bp-plus-900",
    name: "Plus",
    description: "Base plus one step (illustrative)",
    price: 900,
    currency: "KES",
    billingPeriod: "monthly",
    downloadMbps: 8,
    uploadMbps: 4,
    sharedUsers: 2,
    routerosProfileName: "plus-900",
  },
  {
    id: "bp-max-1200",
    name: "Max",
    description: "Base plus two steps (illustrative)",
    price: 1200,
    currency: "KES",
    billingPeriod: "monthly",
    downloadMbps: 12,
    uploadMbps: 6,
    sharedUsers: 3,
    routerosProfileName: "max-1200",
  },
];

/** 26 devices. Index → [hostname, profile, authorized]. 14 Base, 6 Plus, 3 Max; 3 have a lease but are not logged in yet. */
const DEVICE_TABLE: ReadonlyArray<readonly [string, string | null, boolean]> = [
  ["android-3f2a", "bp-base-600", true],
  ["iphone-ada", "bp-base-600", true],
  ["laptop-gf-02", "bp-plus-900", true],
  ["tecno-spark-9", "bp-base-600", true],
  ["galaxy-a14", "bp-base-600", true],
  ["smart-tv-lounge", "bp-max-1200", true],
  ["redmi-note-12", "bp-base-600", true],
  ["pixel-6a", "bp-plus-900", true],
  ["desktop-shop-1", "bp-max-1200", true],
  ["itel-p40", "bp-base-600", true],
  ["android-91bc", "bp-base-600", true],
  ["iphone-13", "bp-plus-900", true],
  ["laptop-guest", null, false],
  ["infinix-hot-30", "bp-base-600", true],
  ["android-77de", "bp-base-600", true],
  ["tablet-kids", "bp-plus-900", true],
  ["oppo-a57", "bp-base-600", true],
  ["android-c0f1", null, false],
  ["galaxy-s21", "bp-base-600", true],
  ["laptop-office", "bp-max-1200", true],
  ["vivo-y16", "bp-base-600", true],
  ["android-5a9e", "bp-base-600", true],
  ["iphone-se", "bp-plus-900", true],
  ["nokia-g21", "bp-base-600", true],
  ["android-e412", null, false],
  ["tecno-camon-20", "bp-plus-900", true],
];

function hex2(value: number): string {
  return (value % 256).toString(16).toUpperCase().padStart(2, "0");
}

/** Builds the demo leases with plain arithmetic, so the output is identical on every run. */
function buildLeases(): ClientLease[] {
  return DEVICE_TABLE.map(([hostName, profileId, authorized], index) => {
    const n = index + 1;
    const uptimeMinutes = authorized ? (n * 37) % 540 + 12 : (n * 11) % 25 + 1;
    const downloadedMb = authorized ? Math.round(((n * 53) % 1900) + 40) : 0;
    const uploadedMb = authorized ? Math.round(downloadedMb * (0.08 + (n % 5) * 0.03)) : 0;
    return {
      id: `lease-${String(n).padStart(2, "0")}`,
      tenantId: DEMO_TENANT.id,
      routerId: "rtr-gf-gw-01",
      // 02:xx:xx is a locally administered MAC range, so these can never match a real device.
      macAddress: `02:5E:A1:${hex2(n * 7)}:${hex2(n * 13)}:${hex2(n * 29)}`,
      ipAddress: `10.10.10.${10 + n}`,
      hostName,
      username: authorized ? `sub${String(((n * 137) % 900) + 100)}` : null,
      profileId,
      authorized,
      uptimeMinutes,
      downloadedMb,
      uploadedMb,
      leaseExpiresInMinutes: 60 * 8 - ((n * 17) % 240),
    };
  });
}

export const SEED_LEASES: readonly ClientLease[] = buildLeases();
