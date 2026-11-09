import { Activity, BarChart3, CreditCard, ExternalLink, LayoutDashboard, Palette, Receipt, Router, Settings, ShieldCheck, Ticket, Users, Wifi, type LucideIcon } from "lucide-react";
export interface NavItem { label: string; icon: LucideIcon; href?: string; planned?: boolean; external?: boolean; }
export interface NavGroup { label: string; items: NavItem[]; }
export const NAV_GROUPS: NavGroup[] = [
  { label: "Overview", items: [{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" }] },
  { label: "Captive portal", items: [{ label: "Portal editor", icon: Palette, href: "/admin/captive-portal" }, { label: "Live portal", icon: ExternalLink, href: "/portal", external: true }] },
  { label: "Network vendors", items: [{ label: "Safe setup wizard", icon: ShieldCheck, href: "/admin/setup" }, { label: "MikroTik Dashboard", icon: Router, href: "/admin/mikrotik" }, { label: "TP-Link Omada Dashboard", icon: Wifi, href: "/admin/omada" }] },
  { label: "Business", items: [{ label: "Subscribers", icon: Users, href: "/admin/subscribers" }, { label: "Active sessions", icon: Activity, href: "/admin/sessions" }, { label: "Billing", icon: Receipt, href: "/admin/billing" }, { label: "Payments", icon: CreditCard, href: "/admin/payments" }, { label: "Vouchers", icon: Ticket, href: "/admin/vouchers" }, { label: "Analytics", icon: BarChart3, href: "/admin/analytics" }] },
  { label: "System", items: [{ label: "Settings", icon: Settings, href: "/admin/settings" }] },
];
const BREADCRUMBS: Record<string, string[]> = { "/dashboard": ["Dashboard"], "/admin/captive-portal": ["Captive portal", "Editor"], "/admin/setup": ["Network vendors", "Safe setup wizard"], "/admin/mikrotik": ["Network vendors", "MikroTik"], "/admin/omada": ["Network vendors", "TP-Link Omada"], "/admin/subscribers": ["Business", "Subscribers"], "/admin/sessions": ["Business", "Active sessions"], "/admin/billing": ["Business", "Billing"], "/admin/payments": ["Business", "Payments"], "/admin/vouchers": ["Business", "Vouchers"], "/admin/analytics": ["Business", "Analytics"], "/admin/settings": ["System", "Settings"] };
export function getBreadcrumbs(pathname: string): string[] { return BREADCRUMBS[pathname] ?? ["SYNTHNET"]; }
