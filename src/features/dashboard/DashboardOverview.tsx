"use client";
import Link from "next/link";
import useSWR from "swr";
import { ArrowRight, CreditCard, RefreshCw, Router, Ticket, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney, formatNumber } from "@/lib/utils/format";

type DashboardData = { metrics: { revenue: number; conversionRate: number; activeSessions: number; revenueDay: number; revenueWeek: number; revenueMonth: number; mikrotikRevenue: number; omadaRevenue: number; mikrotikSessions: number; omadaSessions: number; devicesOnline: number; devicesTotal: number; throughput: { mikrotik: number[]; omada: number[] } } };
const empty: DashboardData["metrics"] = { revenue: 0, conversionRate: 0, activeSessions: 0, revenueDay: 0, revenueWeek: 0, revenueMonth: 0, mikrotikRevenue: 0, omadaRevenue: 0, mikrotikSessions: 0, omadaSessions: 0, devicesOnline: 0, devicesTotal: 0, throughput: { mikrotik: [], omada: [] } };
const fetcher = (url: string) => fetch(url).then((response) => response.ok ? response.json() : { metrics: empty });
const QUICK_LINKS: Array<{ title: string; detail: string; href: string; Icon: LucideIcon }> = [
  { title: "Connect a router", detail: "Generate a RouterOS setup token", href: "/admin/mikrotik", Icon: Router },
  { title: "Set packages", detail: "Add prices and speed limits", href: "/admin/billing", Icon: CreditCard },
  { title: "Print vouchers", detail: "Create a counter-sale batch", href: "/admin/vouchers", Icon: Ticket },
  { title: "Watch sessions", detail: "Review connected devices", href: "/admin/sessions", Icon: Users },
];
export function DashboardOverview() {
  const { data, isLoading, mutate } = useSWR<DashboardData>("/api/admin/overview", fetcher, { refreshInterval: 15000 });
  const metrics = data?.metrics ?? empty; const points = Math.max(metrics.throughput.mikrotik.length, metrics.throughput.omada.length, 1);
  const line = (values: number[]) => { const max = Math.max(...values, 1); return values.map((value, index) => `${(index / Math.max(points - 1, 1)) * 100},${100 - (value / max) * 82}`).join(" "); };
  const money = (value: number) => formatMoney(value, "KES");
  return <div className="flex flex-col gap-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted">Live multi-vendor network health</p><p className="mt-1 text-xs text-muted">Metrics come from Supabase. An empty account stays honest and gives you the next step instead of fake numbers.</p></div><Button size="sm" variant="secondary" onClick={() => mutate()} disabled={isLoading}><RefreshCw aria-hidden="true" data-icon="inline-start" />Refresh</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Revenue today", money(metrics.revenueDay), "Completed payment callbacks"], ["Conversion rate", `${metrics.conversionRate}%`, "Completed / attempted payments"], ["Active sessions", formatNumber(metrics.activeSessions), `${metrics.mikrotikSessions} MikroTik · ${metrics.omadaSessions} Omada`], ["Hardware online", `${metrics.devicesOnline} / ${metrics.devicesTotal}`, "Routers and access points"]].map(([label, value, detail]) => <Card key={label} className="p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-2xl font-bold text-fg">{isLoading ? "…" : value}</p><p className="mt-1 text-xs text-muted">{detail}</p></Card>)}</div>
    <Card><CardHeader title="Next operator moves" description="Use these paths to turn an empty workspace into a testable hotspot workflow." /><div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">{QUICK_LINKS.map(({ title, detail, href, Icon }) => <Link key={String(title)} href={String(href)} className="group rounded-lg border border-line bg-raised p-4 transition-colors hover:border-accent/50 hover:bg-accent/5"><span className="flex size-9 items-center justify-center rounded-md bg-accent/10 text-accent"><Icon aria-hidden="true" className="size-4" /></span><p className="mt-4 font-medium text-fg">{title}</p><p className="mt-1 text-xs text-muted">{detail}</p><ArrowRight aria-hidden="true" className="mt-4 size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" /></Link>)}</div></Card>
    <Card><CardHeader title="Vendor throughput" description="Separate stream lines keep MikroTik and Omada telemetry comparable without combining unlike measurements." /><div className="p-5"><div className="relative h-64 overflow-hidden rounded-lg border border-line bg-raised"><div className="absolute inset-0 grid grid-rows-4 divide-y divide-line/60">{[0, 1, 2, 3].map((row) => <div key={row} />)}</div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full p-4" role="img" aria-label="MikroTik and Omada throughput lines"><polyline points={line(metrics.throughput.mikrotik)} fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /><polyline points={line(metrics.throughput.omada)} fill="none" stroke="currentColor" className="text-signal" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" /></svg><div className="absolute bottom-3 left-5 flex gap-5 text-xs text-muted"><span><i className="mr-2 inline-block size-2 rounded-full bg-accent" />MikroTik</span><span><i className="mr-2 inline-block size-2 rounded-full bg-signal" />Omada</span></div></div></div></Card>
  </div>;
}
