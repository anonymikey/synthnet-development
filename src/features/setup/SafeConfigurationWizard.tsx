"use client";

import { Check, Copy, Info, ShieldCheck, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/form";

type Vendor = "mikrotik" | "omada";
type Step = 1 | 2 | 3;
const jsonHeaders = { "Content-Type": "application/json" };

function validIpv4(value: string) {
  const parts = value.trim().split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function SafeConfigurationWizard() {
  const [vendor, setVendor] = useState<Vendor>("mikrotik");
  const [step, setStep] = useState<Step>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [omadaPlan, setOmadaPlan] = useState("");
  const [mikrotik, setMikrotik] = useState({ name: "Main hotspot", routerOs: "routeros7", service: "hotspot", url: "https://10.5.50.1", username: "", password: "", customerInterface: "bridge", gateway: "10.5.50.1", poolStart: "10.5.50.2", poolEnd: "10.5.50.254", portal: "https://synthnet.anonymiketech.space/portal" });
  const [omada, setOmada] = useState({ controllerType: "software", baseUrl: "https://10.5.50.10:8043", controllerId: "", clientId: "", clientSecret: "", site: "Main site", guestSsid: "SYNTHNET-GUEST", portal: "https://synthnet.anonymiketech.space/portal" });
  const valid = vendor === "mikrotik"
    ? mikrotik.name.trim().length >= 3 && mikrotik.url.startsWith("https://") && mikrotik.customerInterface.trim().length > 0 && validIpv4(mikrotik.gateway) && validIpv4(mikrotik.poolStart) && validIpv4(mikrotik.poolEnd) && mikrotik.portal.startsWith("https://")
    : omada.baseUrl.startsWith("https://") && omada.controllerId.trim().length > 0 && omada.site.trim().length > 0 && omada.guestSsid.trim().length > 0 && omada.portal.startsWith("https://");
  const preview = useMemo(() => vendor === "mikrotik" ? script || "Generate a reviewed RouterOS script from the settings above." : omadaPlan || "Generate an Omada provisioning plan from the settings above.", [vendor, script, omadaPlan]);

  async function call(path: string, body: object) {
    setBusy(true); setStatus(null);
    try {
      const response = await fetch(path, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "The integration request failed.");
      return data;
    } finally { setBusy(false); }
  }
  async function testMikrotik() {
    try { const data = await call("/api/admin/integrations/mikrotik/test", { url: mikrotik.url, username: mikrotik.username, password: mikrotik.password }); setStatus(`RouterOS connected: ${data.resource?.["board-name"] ?? "device detected"}, ${data.interfaceCount} interfaces.`); } catch (error) { setStatus(error instanceof Error ? error.message : "RouterOS connection failed."); }
  }
  async function generateScript() {
    try { const data = await call("/api/admin/integrations/mikrotik/script", { routerName: mikrotik.name, routerOs: mikrotik.routerOs, service: mikrotik.service, customerInterface: mikrotik.customerInterface, gateway: mikrotik.gateway, poolStart: mikrotik.poolStart, poolEnd: mikrotik.poolEnd, portalUrl: mikrotik.portal }); setScript(data.script); setStatus("RouterOS script generated. It has not been sent to the router."); } catch (error) { setStatus(error instanceof Error ? error.message : "Script generation failed."); }
  }
  async function testOmada() {
    try { const data = await call("/api/admin/integrations/omada/test", { baseUrl: omada.baseUrl, omadacId: omada.controllerId, clientId: omada.clientId, clientSecret: omada.clientSecret }); setStatus(`Omada Open API connected. Site response received; token expires in ${data.tokenExpiresIn ?? "the controller-defined period"} seconds.`); } catch (error) { setStatus(error instanceof Error ? error.message : "Omada connection failed."); }
  }
  async function generateOmadaPlan() {
    try { const data = await call("/api/admin/integrations/omada/provision-plan", { siteName: omada.site, guestSsid: omada.guestSsid, portalUrl: omada.portal, controllerId: omada.controllerId }); setOmadaPlan(JSON.stringify(data.plan, null, 2)); setStatus("Omada provisioning plan generated. No SSID, site or AP was changed."); } catch (error) { setStatus(error instanceof Error ? error.message : "Omada plan generation failed."); }
  }
  async function copyPreview() { await navigator.clipboard.writeText(preview); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
  function next() { if (step === 1) setStep(2); else if (step === 2 && valid) setStep(3); }
  const setM = (key: string, value: string) => setMikrotik((current) => ({ ...current, [key]: value }));
  const setO = (key: string, value: string) => setOmada((current) => ({ ...current, [key]: value }));

  return <div className="space-y-6">
    <Card className="border-accent/30 bg-accent/5 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-accent" size={20} /><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-fg">Safe network configuration wizard</h2><Badge tone="success">Guarded integration</Badge></div><p className="mt-1 max-w-3xl text-sm text-muted">Connection tests use credentials only for the request and do not save them. Script generation is non-destructive. Applying a RouterOS script remains a separate, explicit action.</p></div></div></Card>
    <div className="grid gap-3 sm:grid-cols-3">{["Choose vendor", "Connect and configure", "Review before action"].map((label, index) => <div key={label} className={`rounded-md border p-3 text-sm ${step === index + 1 ? "border-accent bg-accent/10 text-fg" : "border-line bg-raised text-muted"}`}><span className="mr-2 font-mono text-xs">0{index + 1}</span>{label}</div>)}</div>
    {status ? <div role="status" className="rounded-md border border-info/30 bg-info/10 p-3 text-sm text-info">{status}</div> : null}
    {step === 1 ? <Card className="p-5"><CardHeader title="What are you setting up?" description="Choose the vendor whose server-side integration you want to test." /><div className="grid gap-3 p-5 sm:grid-cols-2"><button type="button" onClick={() => setVendor("mikrotik")} className={`rounded-md border p-4 text-left ${vendor === "mikrotik" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><strong className="text-fg">MikroTik RouterOS</strong><span className="mt-1 block text-sm text-muted">HTTPS REST connection for RouterOS 7 plus generated RouterOS scripts.</span></button><button type="button" onClick={() => setVendor("omada")} className={`rounded-md border p-4 text-left ${vendor === "omada" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><strong className="text-fg">TP-Link Omada</strong><span className="mt-1 block text-sm text-muted">Open API client-credentials test plus guest SSID and external-portal provisioning plan.</span></button></div></Card> : null}
    {step === 2 && vendor === "mikrotik" ? <Card className="p-5"><CardHeader title="MikroTik connection and script settings" description="RouterOS REST requires HTTPS and is supported on RouterOS 7. RouterOS 6 can still use the generated script path." /><div className="grid gap-4 p-5 md:grid-cols-2"><TextField label="Router name" value={mikrotik.name} onChange={(v) => setM("name", v)} /><SelectField label="RouterOS" value={mikrotik.routerOs} options={[{ value: "routeros7", label: "RouterOS 7 REST" }, { value: "routeros6", label: "RouterOS 6 script" }]} onChange={(v) => setM("routerOs", v)} /><TextField label="Router HTTPS URL" value={mikrotik.url} onChange={(v) => setM("url", v)} hint="Example: https://10.5.50.1; www-ssl must be enabled." /><TextField label="RouterOS username" value={mikrotik.username} onChange={(v) => setM("username", v)} autoComplete="username" /><TextField label="RouterOS password" value={mikrotik.password} onChange={(v) => setM("password", v)} type="password" autoComplete="current-password" /><TextField label="Customer interface / bridge" value={mikrotik.customerInterface} onChange={(v) => setM("customerInterface", v)} hint="Never point this at WAN." /><TextField label="Customer gateway IPv4" value={mikrotik.gateway} onChange={(v) => setM("gateway", v)} /><TextField label="Pool start IPv4" value={mikrotik.poolStart} onChange={(v) => setM("poolStart", v)} /><TextField label="Pool end IPv4" value={mikrotik.poolEnd} onChange={(v) => setM("poolEnd", v)} /><TextField label="HTTPS portal URL" value={mikrotik.portal} onChange={(v) => setM("portal", v)} /></div><div className="flex flex-wrap gap-3 border-t border-line p-5"><Button variant="secondary" onClick={testMikrotik} disabled={busy || !mikrotik.url || !mikrotik.username || !mikrotik.password}><Wifi size={16} />Test RouterOS REST</Button><Button variant="secondary" onClick={generateScript} disabled={busy || !valid}>Generate script</Button></div></Card> : null}
    {step === 2 && vendor === "omada" ? <Card className="p-5"><CardHeader title="Omada Open API and portal settings" description="Use a Client Credentials application created under Settings → Platform Integration → Open API." /><div className="grid gap-4 p-5 md:grid-cols-2"><SelectField label="Controller type" value={omada.controllerType} options={[{ value: "software", label: "Software Controller" }, { value: "oc200", label: "OC200" }, { value: "oc300", label: "OC300" }, { value: "cloud", label: "Cloud Controller" }]} onChange={(v) => setO("controllerType", v)} /><TextField label="Open API base URL" value={omada.baseUrl} onChange={(v) => setO("baseUrl", v)} hint="Use the Interface Access Address shown by Omada." /><TextField label="Omada controller ID" value={omada.controllerId} onChange={(v) => setO("controllerId", v)} /><TextField label="Open API client ID" value={omada.clientId} onChange={(v) => setO("clientId", v)} /><TextField label="Open API client secret" value={omada.clientSecret} onChange={(v) => setO("clientSecret", v)} type="password" autoComplete="off" /><TextField label="Omada site" value={omada.site} onChange={(v) => setO("site", v)} /><TextField label="Guest SSID" value={omada.guestSsid} onChange={(v) => setO("guestSsid", v)} /><TextField label="External portal URL" value={omada.portal} onChange={(v) => setO("portal", v)} /></div><div className="flex flex-wrap gap-3 border-t border-line p-5"><Button variant="secondary" onClick={testOmada} disabled={busy || !omada.clientId || !omada.clientSecret || !omada.controllerId}><Wifi size={16} />Test Open API and list sites</Button><Button variant="secondary" onClick={generateOmadaPlan} disabled={busy || !valid}>Generate guest provisioning plan</Button></div></Card> : null}
    {step === 3 ? <Card className="p-5"><CardHeader title="Review before any live action" description="Copy the generated output into your change record. It is not automatically applied." action={<Button variant="secondary" onClick={copyPreview}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy output"}</Button>} /><pre className="m-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-4 text-xs leading-5 text-muted">{preview}</pre><div className="mx-5 mb-5 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning"><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0" /><p>RouterOS execution can change customer traffic. Omada guest WLAN payloads are controller-version-specific and must be verified in the controller&apos;s Online API Document before applying.</p></div><label className="mt-4 flex items-start gap-2 text-fg"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5" />I understand this output has not changed hardware and live application requires a separate reviewed action.</label></div></Card> : null}
    <div className="flex flex-wrap justify-between gap-3"><Button variant="secondary" onClick={() => setStep(Math.max(1, step - 1) as Step)} disabled={step === 1}>Back</Button>{step < 3 ? <Button onClick={next} disabled={step === 2 && !valid}>Continue</Button> : <Button disabled={!acknowledged} onClick={() => setStep(2)}>Return to edit</Button>}</div>
  </div>;
}
