/**
 * TP-Link Omada module: domain types.
 *
 * ISOLATION RULE: this module must never import from another vendor module. It may use shared
 * presentation code (`components/ui`, `lib/utils`) and the shared primitive types `CurrencyCode`
 * and `DeviceStatus`. Nothing outside the app shell, the route file and a summary link may import
 * from here. Omada and MikroTik are different systems; do not add a shared "universal device"
 * abstraction.
 */
import type { CurrencyCode } from "@/types/portal";
import type { DeviceStatus } from "@/types/vendor";

// ---------------------------------------------------------------------------------------------
// Hardware catalog
// ---------------------------------------------------------------------------------------------

export type OmadaFormFactor = "outdoor" | "ceiling" | "wall";
export type OmadaWifiGeneration = "wifi4" | "wifi5" | "wifi6";
export type OmadaBand = "2.4GHz" | "5GHz";
export type UplinkSpeed = "fast" | "gigabit" | "2.5g";

/** "provided" = supplied by the operator for this model; the others are shown as unconfirmed. */
export type ImageProvenance = "provided" | "inferred" | "representative";

/** "tp-link" = checked against a TP-Link datasheet or product page; otherwise several retailer listings. */
export type OmadaSpecSource = "tp-link" | "retailer-listings";

export interface OmadaImage {
  /** Path under /public. */
  src: string;
  alt: string;
  width: number;
  height: number;
  provenance: ImageProvenance;
  caption?: string;
}

export interface OmadaBandSpec {
  band: OmadaBand;
  /** Maximum signal rate in Mbps, or null when not verified. */
  maxMbps: number | null;
}

/** null means "not verified". */
export interface OmadaPowerSpec {
  poeAf: boolean | null;
  poeAt: boolean | null;
  passive24v: boolean | null;
  dc: boolean | null;
}

export interface OmadaApModel {
  id: string;
  displayName: string;
  productCode: string;
  /** TP-Link's speed class, for example "N300" or "AC1200". */
  speedClass: string;
  formFactor: OmadaFormFactor;
  generation: OmadaWifiGeneration;
  bands: readonly OmadaBandSpec[];
  antennas: string | null;
  uplink: UplinkSpeed | null;
  ethernetPorts: number | null;
  power: OmadaPowerSpec;
  ipRating: string | null;
  ssidLimit: number | null;
  dimensionsMm: string | null;
  hardwareImage: OmadaImage | null;
  gallery: readonly OmadaImage[];
  specSource: OmadaSpecSource;
  datasheetUrl: string | null;
  specNote?: string;
}

export type OmadaControllerKind = "software" | "hardware";

export interface OmadaControllerModel {
  id: string;
  displayName: string;
  kind: OmadaControllerKind;
  maxAccessPoints: number | null;
  maxDevices: number | null;
  maxClients: number | null;
  captivePortalConfig: boolean;
  note: string;
}

// ---------------------------------------------------------------------------------------------
// Tenant ecosystem
// ---------------------------------------------------------------------------------------------

export interface OmadaTenant {
  id: string;
  name: string;
  currency: CurrencyCode;
}

export interface OmadaController {
  id: string;
  tenantId: string;
  name: string;
  modelId: string;
  address: string;
  /** Unknown until a real read exists (Phase 2). */
  version: string | null;
  status: DeviceStatus;
}

export interface OmadaSite {
  id: string;
  controllerId: string;
  name: string;
}

export type SsidSecurity = "open" | "wpa2-psk";

export interface OmadaSsid {
  id: string;
  name: string;
  security: SsidSecurity;
  /** True when unauthenticated clients are sent to the external portal. */
  portalEnabled: boolean;
  clientIsolation: boolean;
  vlanId: number | null;
}

export interface OmadaAccessPoint {
  id: string;
  tenantId: string;
  siteId: string;
  name: string;
  modelId: string;
  macAddress: string;
  ipAddress: string;
  status: DeviceStatus;
  statusNote: string | null;
  firmware: string | null;
  channel24: number | null;
  channel5: number | null;
  /** True for access points created in the UI during the demo. */
  isDemoAdded: boolean;
}

export interface ApMetrics {
  uptimeMinutes: number;
  channelUtilization24: number;
  channelUtilization5: number | null;
  uplinkMbps: number;
}

/** A SYNTHNET plan the portal can authorize a client for. Mirrors the portal demo plans. */
export interface OmadaAccessPlan {
  id: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  durationMinutes: number;
  downloadMbps: number;
  uploadMbps: number;
}

export type ClientPortalState = "authorized" | "unauthenticated" | "not-required";

export interface OmadaClient {
  id: string;
  tenantId: string;
  siteId: string;
  apId: string;
  ssidId: string;
  macAddress: string;
  ipAddress: string;
  hostName: string;
  band: OmadaBand;
  signalDbm: number;
  linkRateMbps: number;
  portalState: ClientPortalState;
  username: string | null;
  planId: string | null;
  authorizedMinutesLeft: number | null;
  uptimeMinutes: number;
  downloadedMb: number;
  uploadedMb: number;
}

export interface OmadaPortalConfig {
  authType: "external-portal-server";
  portalUrl: string;
  ssidIds: readonly string[];
  preAuthAllowedHosts: readonly string[];
}

// ---------------------------------------------------------------------------------------------
// Compatibility and setup documentation as data
// ---------------------------------------------------------------------------------------------

export interface PortalParameter {
  name: string;
  meaning: string;
}

export interface SetupStep {
  id: string;
  title: string;
  detail: string;
  /** Where the work happens. */
  where: "network" | "controller" | "synthnet";
  /** "now" can be done today; "phase2" needs the live integration. */
  phase: "now" | "phase2";
}

export interface OpenQuestion {
  id: string;
  question: string;
}
