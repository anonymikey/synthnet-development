import type { OmadaApModel, OmadaBand, OmadaWifiGeneration } from "@/features/omada/omada.types";

/** Plain-language descriptions of an access point model, shared by cards, matrix and detail view. */

const WIFI_LABELS: Record<OmadaWifiGeneration, string> = {
  wifi4: "Wi-Fi 4",
  wifi5: "Wi-Fi 5",
  wifi6: "Wi-Fi 6",
};

const BAND_LABELS: Record<OmadaBand, string> = { "2.4GHz": "2.4 GHz", "5GHz": "5 GHz" };

export function wifiLabel(model: OmadaApModel): string {
  return WIFI_LABELS[model.generation];
}

export function bandsSummary(model: OmadaApModel): string {
  return model.bands
    .map((spec) => `${BAND_LABELS[spec.band]}${spec.maxMbps !== null ? ` up to ${spec.maxMbps} Mbps` : ""}`)
    .join(" + ");
}

export function maxRateFor(model: OmadaApModel, band: OmadaBand): number | null {
  return model.bands.find((spec) => spec.band === band)?.maxMbps ?? null;
}

export function supportsBand(model: OmadaApModel, band: OmadaBand): boolean {
  return model.bands.some((spec) => spec.band === band);
}

export function uplinkSummary(model: OmadaApModel): string {
  const speed = model.uplink === "fast" ? "Fast Ethernet" : model.uplink === "gigabit" ? "Gigabit Ethernet" : model.uplink === "2.5g" ? "2.5G Ethernet" : null;
  if (!speed) return "Not verified";
  return model.ethernetPorts !== null ? `${model.ethernetPorts} × ${speed}` : speed;
}

export function powerSummary(model: OmadaApModel): string {
  const { poeAf, poeAt, passive24v, dc } = model.power;
  const parts: string[] = [];
  if (poeAf) parts.push("802.3af PoE");
  if (poeAt) parts.push("802.3at PoE+");
  if (passive24v) parts.push("24 V passive PoE");
  if (dc) parts.push("DC input");
  return parts.length > 0 ? parts.join(", ") : "Not verified";
}

export interface ApChip {
  id: string;
  label: string;
}

/** Short facts shown as badges. Only things that are true (or verified) are listed. */
export function apChips(model: OmadaApModel): ApChip[] {
  const chips: ApChip[] = [
    { id: "speed", label: model.speedClass },
    { id: "wifi", label: wifiLabel(model) },
    { id: "bands", label: model.bands.length === 2 ? "Dual-band" : `${BAND_LABELS[model.bands[0]?.band ?? "2.4GHz"]} only` },
  ];
  if (model.formFactor === "outdoor") chips.push({ id: "outdoor", label: model.ipRating ? `Outdoor ${model.ipRating}` : "Outdoor" });
  if (model.uplink === "gigabit" || model.uplink === "2.5g") chips.push({ id: "gigabit", label: "Gigabit uplink" });
  if (model.uplink === "fast") chips.push({ id: "fast", label: "Fast Ethernet uplink" });
  if (model.power.poeAf || model.power.poeAt) chips.push({ id: "poe", label: "Standard PoE" });
  if (model.power.passive24v) chips.push({ id: "passive", label: "Passive PoE" });
  if (model.antennas?.includes("detachable")) chips.push({ id: "antennas", label: "Detachable antennas" });
  return chips;
}

export interface SpecRow {
  label: string;
  value: string;
}

export function specRows(model: OmadaApModel): SpecRow[] {
  return [
    { label: "Product code", value: model.productCode },
    { label: "Speed class", value: `${model.speedClass} · ${wifiLabel(model)}` },
    { label: "Radios", value: bandsSummary(model) },
    { label: "Antennas", value: model.antennas ?? "Not verified" },
    { label: "Wired uplink", value: uplinkSummary(model) },
    { label: "Power", value: powerSummary(model) },
    { label: "Weather rating", value: model.ipRating ?? (model.formFactor === "outdoor" ? "Not verified" : "Indoor") },
    { label: "SSIDs (max)", value: model.ssidLimit !== null ? String(model.ssidLimit) : "Not verified" },
    { label: "Size", value: model.dimensionsMm ?? "Not verified" },
  ];
}

export function specSourceLabel(model: OmadaApModel): string {
  return model.specSource === "tp-link"
    ? "Checked against TP-Link's datasheet or product page"
    : "Checked against several retailer listings of TP-Link's datasheet";
}
