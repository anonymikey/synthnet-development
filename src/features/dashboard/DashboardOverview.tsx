"use client";

import useSWR from "swr";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatNumber } from "@/lib/utils/format";

type DashboardData = {
  metrics: { activeSessions: number; mikrotikSessions: number; omadaSessions: number; devicesOnline: number; devicesTotal: number; throughput: { mikrotik: number[]; omada: number[] } };
};
const fetcher = (url: string) => fetch(url).then((response) => response.ok ? response.json() : { metrics: { activeSessions: 0, mikrotikSessions: 0, omadaSessions: 0, devicesOnline: 0, devicesTotal: 0, throughput: { mikrotik: [], omada: [] } } });

export function DashboardOverview() {
  const { data, isLoading, mutate } = useSWR<DashboardData>("/api/admin/overview", fetcher, { refreshInterval: 15000 });
  const metrics = data?.metrics ?? { activeSessions: 0, mikrotikSessions: 0, omadaSessions: 0, devicesOnline: 0, devicesTotal: 0, throughput: { mikrotik: [], omada: [] } };
  const points = Math.max(metrics.throughput.mikrotik.length, metrics.throughput.omada.length, 1);
  const line = (values: number[]) => {
    const max = Math.max(...values, 1);
    return values.map((value, index) => `${(index / Math.max(points - 1, 1)) * 100},${100 - (value / max) * 82}`).join(" ");
  };
  return <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between"><div><p className="text-sm text-muted">Live multi-vendor network health</p><p className="mt-1 text-xs text-muted">Zero-state safe when the database has no telemetry yet.</p></div><Button size="sm" variant="secondary" onClick={() => mutate()} disabled={isLoading}><RefreshCw aria-hidden="true" data-icon="inline-start" />Refresh</Button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Active subscriber leases", metrics.activeSessions, "Across both vendors"], ["MikroTik sessions", metrics.mikrotikSessions, "Hotspot leases"], ["Omada clients", metrics.omadaSessions, "Wireless clients"], ["Hardware online", `${metrics.devicesOnline} / ${metrics.devicesTotal}`, "Controllers and routers"]].map(([label, value, detail]) => <Card key={String(label)} className="p-5"><p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p><p className="mt-2 text-2xl font-bold text-fg">{isLoading ? "…" : typeof value === "number" ? formatNumber(value) : value}</p><p className="mt-1 text-xs text-muted">{detail}</p></Card>)}</div>
    <Card><CardHeader title="Vendor throughput" description="Separate stream lines keep MikroTik and Omada telemetry comparable without combining unlike measurements." /><div className="p-5"><div className="relative h-64 overflow-hidden rounded-lg border border-line bg-raised"><div className="absolute inset-0 grid grid-rows-4 divide-y divide-line/60">{[0,1,2,3].map((row) => <div key={row} />)}</div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full p-4" role="img" aria-label="MikroTik and Omada throughput lines"><polyline points={line(metrics.throughput.mikrotik)} fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5" vectorEffect="non-scaling-stroke" /><polyline points={line(metrics.throughput.omada)} fill="none" stroke="currentColor" className="text-signal" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeDasharray="4 3" /></svg><div className="absolute bottom-3 left-5 flex gap-5 text-xs text-muted"><span><i className="mr-2 inline-block size-2 rounded-full bg-accent" />MikroTik</span><span><i className="mr-2 inline-block size-2 rounded-full bg-signal" />Omada</span></div></div></div></Card>
  </div>;
}
