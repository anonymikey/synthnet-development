import { ethernetPortCount } from "@/features/mikrotik/mikrotik.catalog";
import type { MikrotikModel, WifiBand, WifiGeneration } from "@/features/mikrotik/mikrotik.types";

/** Presentation-neutral descriptions of a hardware model, shared by the cards, matrix and detail view. */

const WIFI_LABELS: Record<WifiGeneration, string> = {
  none: "No built-in Wi-Fi",
  wifi4: "Wi-Fi 4",
  wifi5: "Wi-Fi 5",
  wifi6: "Wi-Fi 6",
};

const BAND_LABELS: Record<WifiBand, string> = {
  "2.4GHz": "2.4 GHz",
  "5GHz": "5 GHz",
};

export function cpuSummary(model: MikrotikModel): string {
  const { chip, cores, nominalMhz, autoRangeMhz } = model.cpu;
  const speed = autoRangeMhz ? `${autoRangeMhz[0]}–${autoRangeMhz[1]} MHz auto` : `${nominalMhz} MHz`;
  return `${chip} · ${cores} ${cores === 1 ? "core" : "cores"} · ${speed}`;
}

export function ramLabel(model: MikrotikModel): string {
  return model.ramMb >= 1024 ? `${model.ramMb / 1024} GB` : `${model.ramMb} MB`;
}

export function ethernetSummary(model: MikrotikModel): string {
  const { fastEthernetPorts, gigabitPorts, multiGig2_5Ports, sfpPlusPorts } = model.ethernet;
  const parts: string[] = [];
  if (fastEthernetPorts > 0) parts.push(`${fastEthernetPorts} × Fast Ethernet`);
  if (gigabitPorts > 0) parts.push(`${gigabitPorts} × Gigabit`);
  if (multiGig2_5Ports > 0) parts.push(`${multiGig2_5Ports} × 2.5G`);
  if (sfpPlusPorts > 0) parts.push(`${sfpPlusPorts} × 10G SFP+`);
  return parts.join(" + ");
}

export function wirelessSummary(model: MikrotikModel): string {
  const { generation, bands } = model.wireless;
  if (generation === "none") return WIFI_LABELS.none;
  return `${WIFI_LABELS[generation]} · ${bands.map((band) => BAND_LABELS[band]).join(" + ")}`;
}

function verifiable(value: boolean | null): string {
  if (value === null) return "not verified";
  return value ? "yes" : "no";
}

export function poeSummary(model: MikrotikModel): string {
  return `In: ${verifiable(model.poeIn)} · Out: ${verifiable(model.poeOut)}`;
}

export function usbSummary(model: MikrotikModel): string {
  if (model.usb === null) return "not verified";
  return model.usb === "none" ? "None" : `USB ${model.usb}`;
}

export interface CapabilityChip {
  id: string;
  label: string;
}

/** Short facts shown as badges. Only things that are true (or verified) are listed. */
export function capabilityChips(model: MikrotikModel): CapabilityChip[] {
  const chips: CapabilityChip[] = [];
  const { flags } = model;

  chips.push({ id: "cpu", label: flags.multiCore ? `${model.cpu.cores}-core CPU` : "Single-core CPU" });
  chips.push({ id: "ram", label: `${ramLabel(model)} RAM` });
  chips.push({ id: "eth", label: flags.gigabitEthernet ? "Gigabit Ethernet" : "Fast Ethernet only" });
  if (flags.multiGigEthernet) chips.push({ id: "2g5", label: "2.5G port" });
  if (flags.sfpPlus10G) chips.push({ id: "sfp", label: "10G SFP+" });
  chips.push({ id: "wifi", label: flags.builtInWifi ? WIFI_LABELS[model.wireless.generation] : "No Wi-Fi" });
  if (flags.dualBandWifi) chips.push({ id: "dual", label: "Dual-band" });
  if (flags.usbPort && model.usb && model.usb !== "none") chips.push({ id: "usb", label: `USB ${model.usb}` });
  if (model.poeIn === true) chips.push({ id: "poein", label: "PoE in" });
  if (model.poeOut === true) chips.push({ id: "poeout", label: "PoE out" });
  return chips;
}

export interface SpecRow {
  label: string;
  value: string;
}

export function specRows(model: MikrotikModel): SpecRow[] {
  return [
    { label: "Product code", value: model.productCode },
    { label: "CPU", value: cpuSummary(model) },
    { label: "RAM", value: ramLabel(model) },
    { label: "Wired ports", value: `${ethernetSummary(model)} (${ethernetPortCount(model)} RJ45)` },
    { label: "USB", value: usbSummary(model) },
    { label: "Wireless", value: wirelessSummary(model) },
    { label: "PoE", value: poeSummary(model) },
  ];
}

export function specSourceLabel(model: MikrotikModel): string {
  return model.specSource === "mikrotik.com"
    ? "Checked against MikroTik's product page"
    : "Checked against several retailer listings of MikroTik's datasheet";
}
