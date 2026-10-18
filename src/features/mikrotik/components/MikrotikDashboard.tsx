"use client";

import { Check, Clipboard, Copy, Router as RouterIcon, ShieldCheck, Wifi } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField, SelectField } from "@/components/ui/form";

type Router = { id: string; name: string; location: string | null; router_os: string; service_type: string; status: string; last_seen_at: string | null };
const fetcher = (url: string) => fetch(url).then((response) => response.json());

export function MikrotikDashboard() {
  const { data, mutate } = useSWR<{ routers: Router[] }>("/api/admin/routers", fetcher, { refreshInterval: 5000 });
  const [form, setForm] = useState({ name: "", location: "", routerOs: "routeros7", serviceType: "hotspot" });
  const [setup, setSetup] = useState<{ token: string; command: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createSetup(event: React.FormEvent) {
    event.preventDefault(); setError(""); setSaving(true);
    const response = await fetch("/api/admin/routers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Unable to create setup."); setSaving(false); return; }
    const commandResponse = await fetch("/api/admin/routers/setup-command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: result.setupToken }) });
    const command = await commandResponse.json();
    setSetup({ token: result.setupToken, command: command.command }); setSaving(false); setForm({ name: "", location: "", routerOs: "routeros7", serviceType: "hotspot" }); mutate();
  }

  async function copyCommand() { if (!setup) return; await navigator.clipboard.writeText(setup.command); setCopied(true); setTimeout(() => setCopied(false), 1600); }

  return <div className="space-y-6">
    <Card className="border-accent/30 bg-accent/5 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-accent" size={20} /><div><h2 className="font-semibold text-fg">Connect a MikroTik router</h2><p className="mt-1 max-w-3xl text-sm text-muted">Create a one-time setup command, paste it into WinBox Terminal, and SYNTHNET will mark the router online when it calls home. No router password is stored.</p></div></div></Card>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Card className="p-5"><div className="mb-5 flex items-center gap-2"><RouterIcon size={18} className="text-accent" /><h2 className="font-semibold text-fg">New router setup</h2></div><form onSubmit={createSetup} className="space-y-4"><TextField label="Router name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} placeholder="Main Office Hotspot" /><TextField label="Location / site" value={form.location} onChange={(value) => setForm({ ...form, location: value })} placeholder="Nairobi CBD" /><SelectField label="RouterOS path" value={form.routerOs} options={[{ value: "routeros7", label: "RouterOS 7" }, { value: "routeros6", label: "RouterOS 6" }, { value: "upload", label: "Upload manually" }]} onChange={(value) => setForm({ ...form, routerOs: value })} /><div><p className="mb-2 text-sm font-medium text-fg">What will this router serve?</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setForm({ ...form, serviceType: "hotspot" })} className={`rounded-md border p-3 text-left text-sm ${form.serviceType === "hotspot" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><Wifi size={16} className="mb-2 text-accent" /><strong className="block text-fg">Hotspot vouchers</strong><span className="text-xs text-muted">Captive portal customers</span></button><button type="button" onClick={() => setForm({ ...form, serviceType: "pppoe" })} className={`rounded-md border p-3 text-left text-sm ${form.serviceType === "pppoe" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><RouterIcon size={16} className="mb-2 text-accent" /><strong className="block text-fg">PPPoE / static</strong><span className="text-xs text-muted">Fixed customers</span></button></div></div>{error ? <p className="text-sm text-red-400">{error}</p> : null}<Button type="submit" disabled={saving} className="w-full">{saving ? "Creating setup…" : "Create setup command"}</Button></form></Card>
      <div className="space-y-4">{setup ? <Card className="border-accent/40 p-5"><div className="flex items-center justify-between"><div><Badge tone="success" icon={Check}>Setup ready</Badge><h2 className="mt-3 font-semibold text-fg">Paste in WinBox Terminal</h2></div><Button variant="secondary" onClick={copyCommand}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy command"}</Button></div><pre className="mt-4 max-h-52 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-black/30 p-4 text-xs leading-5 text-muted">{setup.command}</pre><p className="mt-3 text-xs text-muted">The command sets reliable NTP, downloads a short-lived SYNTHNET script, imports it, and removes the file. Keep this tab open while the router calls home.</p></Card> : <Card className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><Clipboard className="text-muted" size={28} /><h2 className="mt-3 font-semibold text-fg">Your setup command appears here</h2><p className="mt-1 max-w-md text-sm text-muted">This mirrors the VunaFlow onboarding pattern: choose the RouterOS path, choose hotspot or PPPoE, then copy one command.</p></Card>}<Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-fg">Connected routers</h2><Badge>{data?.routers?.length ?? 0} total</Badge></div><div className="space-y-2">{(data?.routers ?? []).map((router) => <div key={router.id} className="flex items-center justify-between rounded-md border border-line bg-raised p-3"><div><p className="font-medium text-fg">{router.name}</p><p className="text-xs text-muted">{router.location ?? "No location"} · {router.router_os}</p></div><Badge tone={router.status === "online" ? "success" : "warning"}>{router.status}</Badge></div>)}{!data?.routers?.length ? <p className="py-5 text-center text-sm text-muted">No routers connected yet.</p> : null}</div></Card></div>
    </div>
  </div>;
}
