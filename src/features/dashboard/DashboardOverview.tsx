"use client";

import useSWR from "swr";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils/format";

type Overview = { metrics: { revenue: number; previousRevenue: number; transactions: number; completed: number; pending: number; activeSessions: number }; transactions: Array<{ id: string; amount: number; status: string; gateway_type: string; created_at: string }>; };
const fetcher = (url: string) => fetch(url).then(async (response) => { if (!response.ok) throw new Error("Unable to load overview"); return response.json(); });

export function DashboardOverview() {
  const { data, error, isLoading, mutate } = useSWR<Overview>("/api/admin/overview", fetcher, { refreshInterval: 15000 });
  const metrics = data?.metrics;
  const change = metrics?.previousRevenue ? Math.round(((metrics.revenue - metrics.previousRevenue) / metrics.previousRevenue) * 100) : 0;
  return <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between"><div><p className="text-sm text-muted">Live Supabase operations data</p><p className="mt-1 text-xs text-muted">Automatically refreshed every 15 seconds.</p></div><Button size="sm" variant="secondary" onClick={() => mutate()} disabled={isLoading}><RefreshCw aria-hidden="true" data-icon="inline-start" />Refresh</Button></div>
    {error ? <Card className="p-5"><p role="alert" className="text-sm text-danger">Unable to load live dashboard metrics.</p></Card> : <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Completed revenue", value: formatMoney(metrics?.revenue ?? 0, "KES") }, { label: "Active leases", value: String(metrics?.activeSessions ?? 0) }, { label: "Transactions", value: String(metrics?.transactions ?? 0) }, { label: "Pending callbacks", value: String(metrics?.pending ?? 0) }].map((stat) => <Card key={stat.label} className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</p><p className="mt-2 text-2xl font-bold text-fg">{isLoading ? "…" : stat.value}</p>{stat.label === "Completed revenue" ? <p className="mt-1 text-xs text-muted">{change >= 0 ? "Up" : "Down"} {Math.abs(change)}% against prior month</p> : null}</Card>)}</div>
      <Card><CardHeader title="Recent payment callbacks" description="Transactions received from the live Courtney Tech payment pipeline." />{data?.transactions.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Transaction", "Gateway", "Amount", "Status", "Received"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{data.transactions.map((item) => <tr key={item.id}><td className="px-5 py-4 font-mono text-xs text-fg">{item.id.slice(0, 8)}</td><td className="px-5 py-4 text-muted">{item.gateway_type}</td><td className="px-5 py-4 text-fg">{formatMoney(Number(item.amount), "KES")}</td><td className="px-5 py-4 capitalize text-fg">{item.status}</td><td className="px-5 py-4 text-muted">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="m-5 rounded-lg border border-line bg-raised p-6 text-center"><p className="font-medium text-fg">Awaiting first automated Courtney Tech M-Pesa transaction callback.</p><p className="mt-2 text-sm text-muted">Payment activity will appear here as soon as the first callback is received.</p></div>}</Card>
    </>}
  </div>;
}
