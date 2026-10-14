/**
 * MikroTik module: domain types.
 *
 * ISOLATION RULE: this module must never import from any other vendor module. It may use shared
 * presentation code (`components/ui`, `lib/utils`) and shared primitive types (`CurrencyCode`,
 * `DeviceStatus`). Nothing outside the app shell, the route file and a summary link may import
 * from here.
 */
import type { CurrencyCode } from "@/types/portal";
import type { DeviceStatus } from "@/types/vendor";

// ---------------------------------------------------------------------------------------------
// Hardware catalog
// ---------------------------------------------------------------------------------------------

/** Product grouping used by the catalog. The labels live in mikrotik.catalog.ts. */
export type HardwareTier = "entry" | "starter" | "soho" | "wifi6" | "gateway";

/** How a photo was matched to a model. Anything other than "provided" is shown as unconfirmed. */
export type ImageProvenance = "provided" | "inferred" | "representative";

export interface HardwareImage {
  /** Path under /public, for example "/images/mikrotik/rb941-2nd.webp". */
  src: string;
  alt: string;
  width: number;
  height: number;
  provenance: ImageProvenance;
}

export interface CpuSpec {
  chip: string;
  cores: number;
  nominalMhz: number;
  /** Present when MikroTik lists an automatic frequency range. */
  autoRangeMhz?: readonly [number, number];
}

export interface EthernetSpec {
  fastEthernetPorts: number;
  gigabitPorts: number;
  multiGig2_5Ports: number;
  sfpPlusPorts: number;
}

export type WifiGeneration = "none" | "wifi4" | "wifi5" | "wifi6";
export type WifiBand = "2.4GHz" | "5GHz";

export interface WirelessSpec {
  generation: WifiGeneration;
  bands: readonly WifiBand[];
}

export type UsbType = "2.0" | "3.0";

/** Facts used by the UI to render capability badges. Kept explicit so tests can cross-check them. */
export interface PerformanceFlags {
  multiCore: boolean;
  gigabitEthernet: boolean;
  multiGigEthernet: boolean;
  sfpPlus10G: boolean;
  builtInWifi: boolean;
  dualBandWifi: boolean;
  wifi6: boolean;
  usbPort: boolean;
}

/** null means "not verified against a manufacturer or multi-source listing". */
export type Verifiable<T> = T | null;

export type SpecSource = "mikrotik.com" | "retailer-listings";

export interface MikrotikModel {
  id: string;
  /** Name as shown in SYNTHNET, for example "hAP lite (RB941-2nD)". */
  displayName: string;
  productCode: string;
  tier: HardwareTier;
  /** Operator-defined recommendation, shown as the main capability badge. */
  recommendationLabel: string;
  /** Plain-language caveat shown on the router detail, if any. */
  caveat?: string;
  cpu: CpuSpec;
  ramMb: number;
  ethernet: EthernetSpec;
  usb: Verifiable<UsbType | "none">;
  wireless: WirelessSpec;
  poeIn: Verifiable<boolean>;
  poeOut: Verifiable<boolean>;
  flags: PerformanceFlags;
  /** Photo for the UI. Null until a photo is supplied. */
  hardwareImage: HardwareImage | null;
  specSource: SpecSource;
  datasheetUrl: string | null;
  /** Free-text note about verification, for example conflicting retailer data. */
  specNote?: string;
}

// ---------------------------------------------------------------------------------------------
// Tenant ecosystem
// ---------------------------------------------------------------------------------------------

export interface MikrotikTenant {
  id: string;
  name: string;
  currency: CurrencyCode;
}

export interface MikrotikRouter {
  id: string;
  tenantId: string;
  name: string;
  modelId: string;
  managementAddress: string;
  status: DeviceStatus;
  /** Unknown until a real export or API read exists (Phase 2). */
  routerOsVersion: string | null;
  /** True for routers created in the UI during the demo. */
  isDemoAdded: boolean;
}

export interface RouterMetrics {
  cpuLoadPercent: number;
  memoryUsedMb: number;
  uptimeMinutes: number;
  rxMbps: number;
  txMbps: number;
}

export type HotspotLoginMethod = "http-chap" | "http-pap";

export interface HotspotServer {
  id: string;
  routerId: string;
  name: string;
  interfaceName: string;
  addressPool: string;
  /** Name of the RouterOS hotspot server profile (`/ip hotspot profile`). */
  serverProfile: string;
  loginBy: readonly HotspotLoginMethod[];
  enabled: boolean;
}

export type BillingPeriod = "monthly";

/** A SYNTHNET billing tier mapped to a RouterOS hotspot user profile (`/ip hotspot user profile`). */
export interface BillingProfile {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  billingPeriod: BillingPeriod;
  downloadMbps: number;
  uploadMbps: number;
  sharedUsers: number;
  /** Name the profile would have on the router. */
  routerosProfileName: string;
}

/** One client device lease on a router, with its hotspot login state. */
export interface ClientLease {
  id: string;
  tenantId: string;
  routerId: string;
  macAddress: string;
  ipAddress: string;
  hostName: string;
  /** Hotspot username; null until the client has logged in. */
  username: string | null;
  profileId: string | null;
  authorized: boolean;
  uptimeMinutes: number;
  downloadedMb: number;
  uploadedMb: number;
  leaseExpiresInMinutes: number;
}

// ---------------------------------------------------------------------------------------------
// Compatibility layer (Phase 2 documentation as data)
// ---------------------------------------------------------------------------------------------

export interface ExportRequest {
  id: string;
  title: string;
  command: string;
  why: string;
  mapsTo: string;
  /** True when the output may contain secrets or personal data that should be reviewed first. */
  review: boolean;
}

export interface HotspotVariable {
  name: string;
  meaning: string;
  availableOn: string;
}

export interface HotspotPageFile {
  file: string;
  purpose: string;
}
