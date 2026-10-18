"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDuration, formatMoney } from "@/lib/utils/format";

type Package = { id: string; name: string; price: number; duration_minutes: number; speed_limit_down_mbps: number; speed_limit_up_mbps: number };
type Operations = { metrics: { revenue: number; conversionRate: number; activeSessions: number; revenueDay: number; revenueWeek: number; revenueMonth: number; mikrotikRevenue: number; omadaRevenue: number }; transactions: Array<{ id: string; phone_number: string; amount: number; status: string; gateway_type: string; mpesa_checkout_id: string | null; callback_metadata: Record<string, unknown>; created_at: string; packages: { name: string } | { name: string }[] | null }> };
type Health = { supabase: { status: string; latencyMs: number }; courtney: { status: string; latencyMs: number | null }; webhook: { status: string } };
const fetcher = <T,>(url: string) => fetch(url).then(async (res) => { if (!res.ok) throw new Error("Unable to load live data"); return res.json() as Promise<T>; });
const blank = { name: "", price: "", duration_minutes: "60", speed_limit_down_mbps: "5", speed_limit_up_mbps: "5" };

export function BillingView() {
  const { data: packages = [], error, mutate } = useSWR<Package[]>("/api/packages", fetcher);
  const { data: overview } = useSWR<Operations>("/api/admin/overview", fetcher, { refreshInterval: 15000 });
  const { data: health } = useSWR<Health>("/api/admin/gateway-health", fetcher, { refreshInterval: 30000 });
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [override, setOverride] = useState({ clientMac: "", username: "", packageId: "", gatewayType: "mikrotik", apMac: "" });
  const [overrideSaving, setOverrideSaving] = useState(false);
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const updateField = (field: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => { setForm(blank); setEditingId(null); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/packages", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes), speed_limit_down_mbps: Number(form.speed_limit_down_mbps), speed_limit_up_mbps: Number(form.speed_limit_up_mbps) }) });
    if (!response.ok) { setMessage((await response.json()).error ?? "Unable to save package."); setSaving(false); return; }
    await mutate(); reset(); setSaving(false); setMessage(editingId ? "Package updated." : "Package added.");
  };
  const remove = async () => { if (!pendingDelete) return; const response = await fetch(`/api/packages?id=${encodeURIComponent(pendingDelete.id)}`, { method: "DELETE" }); if (response.ok) { await mutate(); setMessage("Package deleted."); } else setMessage("Unable to delete package."); setPendingDelete(null); };
  const submitOverride = async (event: React.FormEvent) => {
    event.preventDefault(); setOverrideSaving(true); setMessage("");
    const response = await fetch("/api/admin/manual-override", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(override) });
    const result = await response.json().catch(() => null);
    setOverrideSaving(false);
    if (!response.ok) { setMessage(result?.error ?? "Unable to activate manual lease."); return; }
    setMessage(`Manual lease active until ${new Date(result.expiresAt).toLocaleString()}.`); setOverride({ clientMac: "", username: "", packageId: "", gatewayType: "mikrotik", apMac: "" });
  };
  const edit = (item: Package) => { setEditingId(item.id); setForm({ name: item.name, price: String(item.price), duration_minutes: String(item.duration_minutes), speed_limit_down_mbps: String(item.speed_limit_down_mbps), speed_limit_up_mbps: String(item.speed_limit_up_mbps) }); };

  const statusTone = (status: string) => status === "completed" ? "success" : status === "pending" ? "warning" : "danger";
  const packageName = (value: Operations["transactions"][number]["packages"]) => Array.isArray(value) ? value[0]?.name ?? "Unknown package" : value?.name ?? "Unknown package";

  return <div className="flex flex-col gap-5">
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[['TOTAL COLLECTED', formatMoney(overview?.metrics.revenue ?? 0, "KES")], ['CONVERSION RATE', `${overview?.metrics.conversionRate ?? 0}%`], ['ACTIVE SESSIONS', String(overview?.metrics.activeSessions ?? 0)], ['VENDOR SPLIT', `M ${formatMoney(overview?.metrics.mikrotikRevenue ?? 0, "KES")} · O ${formatMoney(overview?.metrics.omadaRevenue ?? 0, "KES")}`]].map(([label, value]) => <Card key={label} className="p-4"><p className="text-[10px] font-semibold tracking-[0.18em] text-muted">{label}</p><p className="mt-2 text-xl font-semibold text-fg">{value}</p></Card>)}
    </section>
    <Card><CardHeader title="Income traffic" description="Completed revenue across the active collection windows." /><div className="grid grid-cols-3 gap-3 px-5 pb-5">{[["Today", overview?.metrics.revenueDay], ["7 days", overview?.metrics.revenueWeek], ["30 days", overview?.metrics.revenueMonth]].map(([label, value]) => <div key={label} className="rounded-lg bg-raised p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-semibold text-fg">{formatMoney(Number(value ?? 0), "KES")}</p><div className="mt-3 h-1 rounded-full bg-line"><div className="h-1 rounded-full bg-accent" style={{ width: `${Math.min(100, (Number(value ?? 0) / Math.max(1, overview?.metrics.revenueMonth ?? 1)) * 100)}%` }} /></div></div>)}</div></Card>
    <Card><CardHeader title="Gateway health" description="Live connectivity signals for the payment lanes." /><div className="grid gap-3 p-5 sm:grid-cols-3">{[["Supabase synced", health?.supabase.status, health?.supabase.latencyMs], ["Courtney STK endpoint", health?.courtney.status, health?.courtney.latencyMs], ["M-Pesa webhook receiver", health?.webhook.status, null]].map(([label, status, latency]) => <div key={label} className="flex items-center justify-between rounded-lg border border-line bg-raised p-3"><div><p className="text-sm font-medium text-fg">{label}</p><p className="text-xs capitalize text-muted">{String(status ?? "checking")}{latency ? ` · ${latency}ms` : ""}</p></div><span className={`size-2 rounded-full ${status === "online" || status === "configured" || status === "reachable" ? "bg-emerald-400" : "bg-amber-400"}`} /></div>)}</div></Card>
    <Card><CardHeader title="Live transaction ledger" description="Recent Courtney Tech payment activity. Select a row to inspect callback metadata." /><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Time", "Subscriber", "Package", "Amount", "Checkout ID", "Gateway", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{(overview?.transactions ?? []).map((item) => <tr key={item.id} onClick={() => setExpandedTransaction(expandedTransaction === item.id ? null : item.id)} className="cursor-pointer hover:bg-raised"><td className="px-5 py-4 text-muted">{new Date(item.created_at).toLocaleString()}</td><td className="px-5 py-4 text-fg">{item.phone_number}</td><td className="px-5 py-4 text-fg">{packageName(item.packages)}</td><td className="px-5 py-4 text-fg">{formatMoney(Number(item.amount), "KES")}</td><td className="px-5 py-4 font-mono text-xs text-muted">{item.mpesa_checkout_id ?? "—"}</td><td className="px-5 py-4 capitalize text-fg">{item.gateway_type}</td><td className="px-5 py-4"><Badge tone={statusTone(item.status) as "success" | "warning" | "danger"}>{item.status}</Badge></td></tr>)}{expandedTransaction ? <tr><td colSpan={7} className="bg-raised px-5 py-4"><pre className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted">{JSON.stringify(overview?.transactions.find((item) => item.id === expandedTransaction)?.callback_metadata ?? {}, null, 2)}</pre></td></tr> : null}</tbody></table></div></Card>
    <Card><CardHeader title="Manual adjustment" description="Emergency lease activation. Every override is recorded as a completed cash/manual transaction." /><form onSubmit={submitOverride} className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-5"><input required placeholder="Client MAC" value={override.clientMac} onChange={(e) => setOverride({ ...override, clientMac: e.target.value })} className="h-10 rounded-md border border-line bg-raised px-3 text-sm text-fg" /><input placeholder="PPPoE username" value={override.username} onChange={(e) => setOverride({ ...override, username: e.target.value })} className="h-10 rounded-md border border-line bg-raised px-3 text-sm text-fg" /><select required value={override.packageId} onChange={(e) => setOverride({ ...override, packageId: e.target.value })} className="h-10 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option value="">Select package</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select value={override.gatewayType} onChange={(e) => setOverride({ ...override, gatewayType: e.target.value })} className="h-10 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option value="mikrotik">MikroTik</option><option value="omada">Omada</option></select><Button type="submit" disabled={overrideSaving}>{overrideSaving ? "Activating…" : "Activate lease"}</Button></form></Card>
    <Card><CardHeader title="Internet packages" description="Manage the live pricing tiers shown on the captive portal." action={<Badge tone="success">Live Supabase data</Badge>} />
      <form onSubmit={save} className="grid gap-3 border-b border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-5">
        {([['name','Name','text'],['price','Price (KES)','number'],['duration_minutes','Duration (minutes)','number'],['speed_limit_down_mbps','Download Mbps','number'],['speed_limit_up_mbps','Upload Mbps','number']] as const).map(([field, label, type]) => <label key={field} className="flex flex-col gap-1 text-xs font-medium text-muted">{label}<input required min={type === "number" ? "0" : undefined} type={type} value={form[field]} onChange={(event) => updateField(field, event.target.value)} className="h-10 rounded-md border border-line bg-raised px-3 text-sm text-fg outline-none focus:border-accent" /></label>)}
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5"><Button type="submit" disabled={saving}>{editingId ? <Pencil aria-hidden="true" data-icon="inline-start" /> : <Plus aria-hidden="true" data-icon="inline-start" />}{saving ? "Saving…" : editingId ? "Update package" : "Add package"}</Button>{editingId ? <Button type="button" variant="secondary" onClick={reset}>Cancel</Button> : null}</div>
      </form>
      {message ? <p role="status" className="px-5 py-3 text-sm text-accent">{message}</p> : null}
      {error ? <p role="alert" className="px-5 py-3 text-sm text-danger">Unable to load packages. Check the Supabase connection.</p> : null}
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">{packages.map((item) => <article key={item.id} className="rounded-lg border border-line bg-raised p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-fg">{item.name}</h3><p className="mt-1 text-sm text-muted">{formatDuration(item.duration_minutes)} · {item.speed_limit_down_mbps}/{item.speed_limit_up_mbps} Mbps</p></div><p className="text-lg font-bold text-fg">{formatMoney(Number(item.price), "KES")}</p></div><div className="mt-4 flex gap-2"><Button size="sm" variant="secondary" onClick={() => edit(item)}><Pencil aria-hidden="true" data-icon="inline-start" />Edit</Button><Button size="sm" variant="danger" onClick={() => setPendingDelete(item)}><Trash2 aria-hidden="true" data-icon="inline-start" />Delete</Button></div></article>)}</div>
      {!packages.length && !error ? <p className="px-5 pb-5 text-sm text-muted">No packages yet. Add the first tier above.</p> : null}
    </Card>
    <Card><CardHeader title="Payment activity" description="Live transactions received from the Courtney Tech callback pipeline." />{overview?.transactions?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Transaction", "Amount", "Status", "Received"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{overview.transactions.map((item) => <tr key={item.id}><td className="px-5 py-4 font-mono text-xs text-fg">{item.id.slice(0, 8)}</td><td className="px-5 py-4 text-fg">{formatMoney(Number(item.amount), "KES")}</td><td className="px-5 py-4 capitalize text-fg">{item.status}</td><td className="px-5 py-4 text-muted">{new Date(item.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="m-5 rounded-lg border border-line bg-raised p-6 text-center"><p className="font-medium text-fg">Awaiting first automated Courtney Tech M-Pesa transaction callback.</p><p className="mt-2 text-sm text-muted">Completed, pending, and failed payments will appear here.</p></div>}</Card>
    <ConfirmDialog open={pendingDelete !== null} title={`Delete “${pendingDelete?.name ?? "package"}”?`} description="This permanently removes the package from the live catalog and the captive portal." confirmLabel="Delete package" destructive onCancel={() => setPendingDelete(null)} onConfirm={remove} />
  </div>;
}
