import type { CurrencyCode } from "@/types/portal";

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

/** Deterministic money formatting (same output on server and client). */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  return `${currency} ${formatNumber(amount)}`;
}

function plural(value: number, unit: string): string {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return plural(minutes, "minute");
  if (minutes % 1440 === 0) return plural(minutes / 1440, "day");
  if (minutes % 60 === 0) return plural(minutes / 60, "hour");
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function formatData(megabytes: number | null): string {
  if (megabytes === null) return "Unlimited data";
  if (megabytes >= 1024) {
    const gb = megabytes / 1024;
    return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB data`;
  }
  return `${megabytes} MB data`;
}

export function formatMinutesAgo(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
