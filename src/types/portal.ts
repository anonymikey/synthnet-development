export const CURRENCY_CODES = ["KES", "UGX", "TZS", "USD"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const PORTAL_FONTS = ["sans", "serif", "rounded", "mono"] as const;
export type PortalFont = (typeof PORTAL_FONTS)[number];

export const PORTAL_BACKGROUND_MODES = ["solid", "gradient", "image"] as const;
export type PortalBackgroundMode = (typeof PORTAL_BACKGROUND_MODES)[number];

export const PORTAL_ALIGNMENTS = ["left", "center"] as const;
export type PortalAlign = (typeof PORTAL_ALIGNMENTS)[number];

export interface PortalPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: CurrencyCode;
  durationMinutes: number;
  speedMbps: number;
  /** null means unlimited data. */
  dataCapMb: number | null;
  highlighted: boolean;
}

export interface PortalBrand {
  name: string;
  tagline: string;
  /** Used when no logo image is uploaded. */
  logoInitials: string;
  /** data: URL of an uploaded image, or null. */
  logoDataUrl: string | null;
}

export interface PortalTheme {
  primaryColor: string;
  backgroundColor: string;
  gradientEndColor: string;
  textColor: string;
  cardColor: string;
  cardTextColor: string;
  backgroundMode: PortalBackgroundMode;
  /** data: URL of an uploaded image, or null. */
  backgroundImage: string | null;
  /** Darkening applied over a background image, 0 to 80 (%). */
  imageOverlay: number;
  font: PortalFont;
  cornerRadius: number;
  align: PortalAlign;
}

export interface PortalContent {
  headline: string;
  subtitle: string;
  plansTitle: string;
  payButtonLabel: string;
  voucherButtonLabel: string;
  trialButtonLabel: string;
  successTitle: string;
  successMessage: string;
  termsText: string;
  supportPhone: string;
  supportEmail: string;
  footerText: string;
}

export interface PortalMethods {
  mpesa: {
    enabled: boolean;
    label: string;
    instructions: string;
    phonePlaceholder: string;
  };
  voucher: {
    enabled: boolean;
    label: string;
    placeholder: string;
  };
  freeTrial: {
    enabled: boolean;
    label: string;
    minutes: number;
    speedMbps: number;
  };
}

export interface PortalSections {
  showPlans: boolean;
  showSupport: boolean;
  showTerms: boolean;
  showFooter: boolean;
  requireTermsAcceptance: boolean;
}

export interface PortalConfig {
  version: 1;
  brand: PortalBrand;
  theme: PortalTheme;
  content: PortalContent;
  methods: PortalMethods;
  sections: PortalSections;
  plans: PortalPlan[];
}

export type PortalMethodId = "mpesa" | "voucher" | "trial";
