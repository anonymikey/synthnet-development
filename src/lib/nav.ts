import {
  BarChart3,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Palette,
  Receipt,
  Router,
  Settings,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Items without an href, or marked planned, render as disabled rows. */
  href?: string;
  planned?: boolean;
  /** Opens in a new tab. */
  external?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }],
  },
  {
    label: "Captive portal",
    items: [
      { label: "Portal editor", icon: Palette, href: "/admin/captive-portal" },
      { label: "Live portal", icon: ExternalLink, href: "/portal", external: true },
    ],
  },
  {
    label: "Network vendors",
    items: [
      { label: "MikroTik Dashboard", icon: Router, href: "/admin/mikrotik" },
      { label: "TP-Link Omada Dashboard", icon: Wifi, href: "/admin/omada" },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Subscribers", icon: Users, href: "/admin/subscribers" },
      { label: "Billing", icon: Receipt, href: "/admin/billing" },
      { label: "Payments", icon: CreditCard, planned: true },
      { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", icon: Settings, href: "/admin/settings" }],
  },
];

const BREADCRUMBS: Record<string, string[]> = {
  "/dashboard": ["Dashboard"],
  "/admin/captive-portal": ["Captive portal", "Editor"],
  "/admin/mikrotik": ["Network vendors", "MikroTik"],
  "/admin/omada": ["Network vendors", "TP-Link Omada"],
  "/admin/subscribers": ["Business", "Subscribers"],
  "/admin/billing": ["Business", "Billing"],
  "/admin/analytics": ["Business", "Analytics"],
  "/admin/settings": ["System", "Settings"],
};

export function getBreadcrumbs(pathname: string): string[] {
  return BREADCRUMBS[pathname] ?? ["SYNTHNET"];
}
