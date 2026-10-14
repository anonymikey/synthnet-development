import { defaultPortalConfig } from "@/lib/mock-data/portal-defaults";
import { isHexColor } from "@/lib/utils/color";
import {
  CURRENCY_CODES,
  PORTAL_ALIGNMENTS,
  PORTAL_BACKGROUND_MODES,
  PORTAL_FONTS,
  type PortalConfig,
  type PortalPlan,
} from "@/types/portal";

/**
 * Browser-only persistence for the captive-portal demo.
 * This is NOT a production store: data lives in this browser's localStorage only.
 */
export const PORTAL_STORAGE_KEY = "synthnet.portal.config.v1";

const MAX_DATA_URL_LENGTH = 1_200_000;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, fallback: string, maxLength: number): string {
  return typeof value === "string" ? value.slice(0, maxLength) : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function hex(value: unknown, fallback: string): string {
  return typeof value === "string" && isHexColor(value) ? value : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((candidate) => candidate === value) ?? fallback;
}

function imageDataUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("data:image/") || value.length > MAX_DATA_URL_LENGTH) return null;
  return value;
}

function sanitizePlan(value: unknown, index: number): PortalPlan | null {
  if (!isRecord(value)) return null;
  const capRaw = value.dataCapMb;
  return {
    id: str(value.id, `plan-${index + 1}`, 40),
    name: str(value.name, "Plan", 40),
    description: str(value.description, "", 80),
    price: num(value.price, 0, 0, 1_000_000),
    currency: oneOf(value.currency, CURRENCY_CODES, "KES"),
    durationMinutes: Math.round(num(value.durationMinutes, 60, 1, 525_600)),
    speedMbps: num(value.speedMbps, 5, 1, 1000),
    dataCapMb: capRaw === null || capRaw === undefined ? null : num(capRaw, 1024, 1, 10_000_000),
    highlighted: bool(value.highlighted, false),
  };
}

function sanitizePlans(value: unknown): PortalPlan[] {
  if (!Array.isArray(value)) return defaultPortalConfig.plans.map((plan) => ({ ...plan }));
  const seen = new Set<string>();
  const plans: PortalPlan[] = [];
  value.forEach((item, index) => {
    const plan = sanitizePlan(item, index);
    if (!plan) return;
    const id = seen.has(plan.id) ? `${plan.id}-${index}` : plan.id;
    seen.add(id);
    plans.push({ ...plan, id });
  });
  return plans;
}

/**
 * Turns unknown input (localStorage, imported JSON) into a valid PortalConfig.
 * Unknown or invalid fields fall back to defaults, so a corrupt value never crashes the UI.
 */
export function sanitizePortalConfig(raw: unknown): PortalConfig {
  const d = defaultPortalConfig;
  if (!isRecord(raw)) return structuredCloneConfig(d);

  const brand = isRecord(raw.brand) ? raw.brand : {};
  const theme = isRecord(raw.theme) ? raw.theme : {};
  const content = isRecord(raw.content) ? raw.content : {};
  const methods = isRecord(raw.methods) ? raw.methods : {};
  const mpesa = isRecord(methods.mpesa) ? methods.mpesa : {};
  const voucher = isRecord(methods.voucher) ? methods.voucher : {};
  const freeTrial = isRecord(methods.freeTrial) ? methods.freeTrial : {};
  const sections = isRecord(raw.sections) ? raw.sections : {};

  return {
    version: 1,
    brand: {
      name: str(brand.name, d.brand.name, 40),
      tagline: str(brand.tagline, d.brand.tagline, 80),
      logoInitials: str(brand.logoInitials, d.brand.logoInitials, 3),
      logoDataUrl: imageDataUrl(brand.logoDataUrl),
    },
    theme: {
      primaryColor: hex(theme.primaryColor, d.theme.primaryColor),
      backgroundColor: hex(theme.backgroundColor, d.theme.backgroundColor),
      gradientEndColor: hex(theme.gradientEndColor, d.theme.gradientEndColor),
      textColor: hex(theme.textColor, d.theme.textColor),
      cardColor: hex(theme.cardColor, d.theme.cardColor),
      cardTextColor: hex(theme.cardTextColor, d.theme.cardTextColor),
      backgroundMode: oneOf(theme.backgroundMode, PORTAL_BACKGROUND_MODES, d.theme.backgroundMode),
      backgroundImage: imageDataUrl(theme.backgroundImage),
      imageOverlay: num(theme.imageOverlay, d.theme.imageOverlay, 0, 80),
      font: oneOf(theme.font, PORTAL_FONTS, d.theme.font),
      cornerRadius: num(theme.cornerRadius, d.theme.cornerRadius, 0, 28),
      align: oneOf(theme.align, PORTAL_ALIGNMENTS, d.theme.align),
    },
    content: {
      headline: str(content.headline, d.content.headline, 80),
      subtitle: str(content.subtitle, d.content.subtitle, 200),
      plansTitle: str(content.plansTitle, d.content.plansTitle, 60),
      payButtonLabel: str(content.payButtonLabel, d.content.payButtonLabel, 40),
      voucherButtonLabel: str(content.voucherButtonLabel, d.content.voucherButtonLabel, 40),
      trialButtonLabel: str(content.trialButtonLabel, d.content.trialButtonLabel, 40),
      successTitle: str(content.successTitle, d.content.successTitle, 60),
      successMessage: str(content.successMessage, d.content.successMessage, 240),
      termsText: str(content.termsText, d.content.termsText, 600),
      supportPhone: str(content.supportPhone, d.content.supportPhone, 30),
      supportEmail: str(content.supportEmail, d.content.supportEmail, 80),
      footerText: str(content.footerText, d.content.footerText, 80),
    },
    methods: {
      mpesa: {
        enabled: bool(mpesa.enabled, d.methods.mpesa.enabled),
        label: str(mpesa.label, d.methods.mpesa.label, 30),
        instructions: str(mpesa.instructions, d.methods.mpesa.instructions, 240),
        phonePlaceholder: str(mpesa.phonePlaceholder, d.methods.mpesa.phonePlaceholder, 30),
      },
      voucher: {
        enabled: bool(voucher.enabled, d.methods.voucher.enabled),
        label: str(voucher.label, d.methods.voucher.label, 30),
        placeholder: str(voucher.placeholder, d.methods.voucher.placeholder, 40),
      },
      freeTrial: {
        enabled: bool(freeTrial.enabled, d.methods.freeTrial.enabled),
        label: str(freeTrial.label, d.methods.freeTrial.label, 30),
        minutes: Math.round(num(freeTrial.minutes, d.methods.freeTrial.minutes, 1, 1440)),
        speedMbps: num(freeTrial.speedMbps, d.methods.freeTrial.speedMbps, 1, 1000),
      },
    },
    sections: {
      showPlans: bool(sections.showPlans, d.sections.showPlans),
      showSupport: bool(sections.showSupport, d.sections.showSupport),
      showTerms: bool(sections.showTerms, d.sections.showTerms),
      showFooter: bool(sections.showFooter, d.sections.showFooter),
      requireTermsAcceptance: bool(sections.requireTermsAcceptance, d.sections.requireTermsAcceptance),
    },
    plans: sanitizePlans(raw.plans),
  };
}

function structuredCloneConfig(config: PortalConfig): PortalConfig {
  return JSON.parse(JSON.stringify(config)) as PortalConfig;
}

export function getDefaultPortalConfig(): PortalConfig {
  return structuredCloneConfig(defaultPortalConfig);
}

/** Loads the saved portal config; falls back to defaults if missing, blocked or corrupt. */
export function loadPortalConfig(): PortalConfig {
  try {
    const stored = window.localStorage.getItem(PORTAL_STORAGE_KEY);
    if (!stored) return getDefaultPortalConfig();
    return sanitizePortalConfig(JSON.parse(stored));
  } catch {
    return getDefaultPortalConfig();
  }
}

/** Returns false if the browser refused the write (storage full or blocked). */
export function savePortalConfig(config: PortalConfig): boolean {
  try {
    window.localStorage.setItem(PORTAL_STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}

export function clearSavedPortalConfig(): void {
  try {
    window.localStorage.removeItem(PORTAL_STORAGE_KEY);
  } catch {
    // Storage may be blocked; nothing else to do.
  }
}
