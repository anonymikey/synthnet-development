"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/form";
import { OMADA_AP_CATALOG } from "@/features/omada/omada.catalog";

export interface NewApInput { name: string; ssid: string; modelCode: string; macAddress: string; ipAddress: string }
interface AddAccessPointDialogProps { open: boolean; existingNames: readonly string[]; onSubmit: (input: NewApInput) => void | Promise<void>; onCancel: () => void }
const MODEL_OPTIONS = OMADA_AP_CATALOG.map((model) => ({ value: model.productCode, label: `${model.displayName} (${model.speedClass})` }));
const DEFAULT_MODEL = MODEL_OPTIONS[0]?.value ?? "EAP110-Outdoor";

export function AddAccessPointDialog({ open, existingNames, onSubmit, onCancel }: AddAccessPointDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [form, setForm] = useState({ name: "", ssid: "", modelCode: DEFAULT_MODEL, macAddress: "", ipAddress: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) { setForm({ name: "", ssid: "", modelCode: DEFAULT_MODEL, macAddress: "", ipAddress: "" }); setError(""); dialog.showModal(); } if (!open && dialog.open) dialog.close(); }, [open]);
  async function handleSubmit(event: FormEvent) { event.preventDefault(); const name = form.name.trim(); if (name.length < 3 || existingNames.some((item) => item.toLowerCase() === name.toLowerCase())) { setError("Use a unique name with at least 3 characters."); return; } setSaving(true); setError(""); try { await onSubmit({ ...form, name, ssid: form.ssid.trim(), macAddress: form.macAddress.trim() }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to add this access point."); } finally { setSaving(false); } }
  return <dialog ref={ref} aria-labelledby="add-ap-title" onCancel={(event) => { event.preventDefault(); onCancel(); }} className="w-[calc(100%-2rem)] max-w-lg rounded-lg border border-line bg-raised p-0 text-fg shadow-pop backdrop:bg-black/60">
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 p-6">
      <div><h2 id="add-ap-title" className="text-lg font-semibold">Add Omada AP</h2><p className="mt-1 text-sm text-muted">Power the access point, give it internet, then add its network identity here.</p></div>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted"><li>Open the AP settings page.</li><li>Set the Controller Inform URL to <strong className="text-fg">ctl1.wencreatives.com</strong>.</li><li>Return here with the MAC address.</li></ol>
      <TextField label="WiFi name" value={form.ssid} placeholder="e.g. SYNTHNET FREE WIFI" onChange={(value) => setForm((current) => ({ ...current, ssid: value }))} />
      <TextField label="Access point name" value={form.name} placeholder="Outdoor AP 01" onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
      <SelectField label="Model" value={form.modelCode} options={MODEL_OPTIONS} onChange={(value) => setForm((current) => ({ ...current, modelCode: value }))} />
      <TextField label="Access point MAC" value={form.macAddress} placeholder="C0:3A:55:FE:4C:28" onChange={(value) => setForm((current) => ({ ...current, macAddress: value }))} />
      <TextField label="IP address (optional)" value={form.ipAddress} placeholder="192.168.20.5" onChange={(value) => setForm((current) => ({ ...current, ipAddress: value }))} />
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onCancel}>Close</Button><Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add"}</Button></div>
    </form>
  </dialog>;
}
