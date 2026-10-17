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
const fetcher = (url: string) => fetch(url).then(async (res) => { if (!res.ok) throw new Error("Unable to load packages"); return res.json() as Promise<Package[]>; });
const blank = { name: "", price: "", duration_minutes: "60", speed_limit_down_mbps: "5", speed_limit_up_mbps: "5" };

export function BillingView() {
  const { data: packages = [], error, mutate } = useSWR<Package[]>("/api/packages", fetcher);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Package | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const updateField = (field: keyof typeof blank, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const reset = () => { setForm(blank); setEditingId(null); };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage("");
    const response = await fetch("/api/packages", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingId, ...form, price: Number(form.price), duration_minutes: Number(form.duration_minutes), speed_limit_down_mbps: Number(form.speed_limit_down_mbps), speed_limit_up_mbps: Number(form.speed_limit_up_mbps) }) });
    if (!response.ok) { setMessage((await response.json()).error ?? "Unable to save package."); setSaving(false); return; }
    await mutate(); reset(); setSaving(false); setMessage(editingId ? "Package updated." : "Package added.");
  };
  const remove = async () => { if (!pendingDelete) return; const response = await fetch(`/api/packages?id=${encodeURIComponent(pendingDelete.id)}`, { method: "DELETE" }); if (response.ok) { await mutate(); setMessage("Package deleted."); } else setMessage("Unable to delete package."); setPendingDelete(null); };
  const edit = (item: Package) => { setEditingId(item.id); setForm({ name: item.name, price: String(item.price), duration_minutes: String(item.duration_minutes), speed_limit_down_mbps: String(item.speed_limit_down_mbps), speed_limit_up_mbps: String(item.speed_limit_up_mbps) }); };

  return <div className="flex flex-col gap-5">
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
    <ConfirmDialog open={pendingDelete !== null} title={`Delete “${pendingDelete?.name ?? "package"}”?`} description="This permanently removes the package from the live catalog and the captive portal." confirmLabel="Delete package" destructive onCancel={() => setPendingDelete(null)} onConfirm={remove} />
  </div>;
}
