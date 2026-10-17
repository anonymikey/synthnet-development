"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils/format";

const fetcher = (url: string) => fetch(url).then(async (response) => { if (!response.ok) throw new Error("Unable to load subscribers"); return response.json(); });
type Subscriber = { id: string; client_mac: string; ap_mac: string | null; gateway_type: "mikrotik" | "omada"; session_start: string; session_end: string | null; status: "active" | "expired"; transaction_id: string; transactions: { amount: number; package_id: string | null; packages: { name: string } | null } | null };

export function SubscriberView() {
  const { data = [], error } = useSWR<Subscriber[]>("/api/admin/subscribers", fetcher, { refreshInterval: 15000 });
  const active = data.filter((item) => item.status === "active");
  const revenue = active.reduce((sum, item) => sum + Number(item.transactions?.amount ?? 0), 0);
  return <div className="flex flex-col gap-5">
    <div className="grid gap-3 sm:grid-cols-3">{[{ label: "Active subscriber leases", value: String(active.length) }, { label: "Active lease value", value: formatMoney(revenue, "KES") }, { label: "Gateway sessions", value: String(new Set(active.map((item) => item.gateway_type)).size) }].map((stat) => <Card key={stat.label} className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</p><p className="mt-2 text-2xl font-bold text-fg">{stat.value}</p></Card>)}</div>
    <Card><CardHeader title="Live subscriber leases" description="Active hotspot authentications recorded by the hardware authorization engine." />
      {error ? <p role="alert" className="p-5 text-sm text-danger">Unable to load live subscriber leases.</p> : active.length === 0 ? <div className="m-5 rounded-lg border border-line bg-raised p-6 text-center"><p className="font-medium text-fg">No active subscriber leases found.</p><p className="mt-2 text-sm text-muted">Ready to capture incoming hotspot client authentications.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Client MAC", "Gateway", "Package", "Amount", "Started", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{active.map((item) => <tr key={item.id}><td className="px-5 py-4 font-mono text-xs text-fg">{item.client_mac}</td><td className="px-5 py-4"><Badge tone={item.gateway_type === "mikrotik" ? "accent" : "info"}>{item.gateway_type}</Badge></td><td className="px-5 py-4 text-fg">{item.transactions?.packages?.name ?? "Unassigned package"}</td><td className="px-5 py-4 text-fg">{formatMoney(Number(item.transactions?.amount ?? 0), "KES")}</td><td className="px-5 py-4 text-muted">{new Date(item.session_start).toLocaleString()}</td><td className="px-5 py-4"><Badge tone="success">active</Badge></td></tr>)}</tbody></table></div>}
    </Card>
  </div>;
}
