/** Network vendors supported by SYNTHNET. Each has its own isolated module. */
export type VendorId = "mikrotik" | "omada";

export type DeviceStatus = "online" | "offline" | "warning" | "unknown";

export const VENDOR_LABELS: Record<VendorId, string> = {
  mikrotik: "MikroTik",
  omada: "TP-Link Omada",
};
