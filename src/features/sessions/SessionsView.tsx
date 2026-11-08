"use client";
import useSWR from "swr";
import { LogOut, RefreshCw, Router, Wifi } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils/format";

type Session = { id: string; client_mac: string; ap_mac: string | null; gateway_type: "mikrotik" | "omada"; session_start: string; session_end: string | null; status: string; transaction_id: string | null };
type Overview = { sessions: Session[] };
const fetcher = (url: string) => fetch(url).then(async (response) => { if (!response.ok) throw new Error("Unable to load sessions"); return response.json() as Promise<Overview>; });

export function SessionsView() {
  const { data, error, isLoading, mutate } = useSWR<Overview>("/api/admin/overview", fetcher, { refreshInterval: 15000 });
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const sessions = data?.sessions ?? [];
  async function disconnect(id: string) {
    setBusy(id); setMessage("");
    const response = await fetch(`/api/admin/sessions/${encodeURIComponent(id)}/disconnect`, { method: "POST" });
    const body = await response.json().catch(() => null);
    setBusy(null);
    if (!response.ok) { setMessage(body?.error ?? "Unable to disconnect this device."); return; }
    setMessage("Device disconnected and session closed.");
    await mutate();
  }
  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted">Who is online right now</p><p className="mt-1 text-xs text-muted">Sessions are loaded from Supabase. Hardware eviction depends on the configured vendor adapter.</p></div><Button size="sm" variant="secondary" onClick={() => mutate()} disabled={isLoading}><RefreshCw aria-hidden="true" data-icon="inline-start" />Refresh</Button></div>
    {message ? <p role="status" className="rounded-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">{message}</p> : null}
    <Card><CardHeader title="Active sessions" description={`${sessions.length} active device${sessions.length === 1 ? "" : "s"} across MikroTik and Omada.`} />
      {error ? <p role="alert" className="p-5 text-sm text-danger">Unable to load active sessions. Check the Supabase connection.</p> : sessions.length === 0 ? <div className="m-5 rounded-lg border border-dashed border-line bg-raised p-8 text-center"><p className="font-medium text-fg">No active sessions yet.</p><p className="mt-2 text-sm text-muted">Complete a payment or activate a manual lease from Billing to see connected devices here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Client", "Vendor", "Access point", "Started", "Expires", "Payment", "Action"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{sessions.map((session) => <tr key={session.id}><td className="px-5 py-4 font-mono text-xs text-fg">{session.client_mac}</td><td className="px-5 py-4"><Badge tone={session.gateway_type === "mikrotik" ? "accent" : "info"}>{session.gateway_type === "mikrotik" ? <><Router aria-hidden="true" className="mr-1 inline size-3" />MikroTik</> : <><Wifi aria-hidden="true" className="mr-1 inline size-3" />Omada</>}</Badge></td><td className="px-5 py-4 font-mono text-xs text-muted">{session.ap_mac ?? "Gateway session"}</td><td className="px-5 py-4 text-muted">{new Date(session.session_start).toLocaleString()}</td><td className="px-5 py-4 text-muted">{session.session_end ? new Date(session.session_end).toLocaleString() : "No expiry"}</td><td className="px-5 py-4 text-muted">{session.transaction_id ? formatMoney(0, "KES") + " · recorded" : "Manual"}</td><td className="px-5 py-4"><Button size="sm" variant="danger" onClick={() => disconnect(session.id)} disabled={busy === session.id}><LogOut aria-hidden="true" data-icon="inline-start" />{busy === session.id ? "Closing…" : "Disconnect"}</Button></td></tr>)}</tbody></table></div>}
    </Card>
  </div>;
}
