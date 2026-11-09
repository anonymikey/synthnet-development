"use client";

import { Check, Clipboard, Copy, Info, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SelectField, TextField } from "@/components/ui/form";

function validIpv4(value: string): boolean {
  const parts = value.trim().split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

type Vendor = "mikrotik" | "omada";
type Step = 1 | 2 | 3;

export function SafeConfigurationWizard() {
  const [vendor, setVendor] = useState<Vendor>("mikrotik");
  const [step, setStep] = useState<Step>(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mikrotik, setMikrotik] = useState({ name: "Main hotspot", routerOs: "routeros7", service: "hotspot", customerInterface: "bridge", gateway: "10.5.50.1", poolStart: "10.5.50.2", poolEnd: "10.5.50.254", portal: "https://synthnet.anonymiketech.space/portal" });
  const [omada, setOmada] = useState({ controllerType: "software", controllerUrl: "https://192.168.20.10:8043", site: "Main site", guestSsid: "SYNTHNET-GUEST", portal: "https://synthnet.anonymiketech.space/portal" });
  const valid = vendor === "mikrotik"
    ? mikrotik.name.trim().length >= 3 && mikrotik.customerInterface.trim().length > 0 && validIpv4(mikrotik.gateway) && validIpv4(mikrotik.poolStart) && validIpv4(mikrotik.poolEnd) && mikrotik.portal.startsWith("https://")
    : omada.controllerUrl.startsWith("https://") && omada.site.trim().length > 0 && omada.guestSsid.trim().length > 0 && omada.portal.startsWith("https://");
  const preview = useMemo(() => vendor === "mikrotik"
    ? `# SYNTHNET SAFE PREVIEW — all commands are comments and will not change the router\n# Review the interface, subnet, DHCP scope, and backup plan first.\n# Router: ${mikrotik.name}\n# RouterOS: ${mikrotik.routerOs}\n# Service: ${mikrotik.service}\n# Customer interface: ${mikrotik.customerInterface}\n# Gateway: ${mikrotik.gateway}/24\n# Pool: ${mikrotik.poolStart}-${mikrotik.poolEnd}\n# Portal: ${mikrotik.portal}\n#\n# NEXT LIVE STEPS (not executed by this wizard):\n# 1. Export a RouterOS backup and configuration snapshot.\n# 2. Confirm ${mikrotik.customerInterface} is the customer-facing bridge/VLAN, not WAN.\n# 3. Run the reviewed SYNTHNET onboarding command from MikroTik.\n# 4. Confirm the router calls home before enabling customer traffic.\n# 5. Test one phone, one payment, one expiry, and one disconnect.\n#\n# No password, token, or live router call is stored by this wizard.`
    : `SYNTHNET SAFE OMADA PREVIEW\n\nController: ${omada.controllerType}\nController URL: ${omada.controllerUrl}\nSite: ${omada.site}\nGuest SSID: ${omada.guestSsid}\nExternal portal: ${omada.portal}\n\nLIVE CHECKLIST (not executed by this wizard):\n1. Confirm the controller and APs are reachable from the same management network.\n2. Adopt each AP in the selected Omada site and verify Connected status.\n3. Create the guest SSID and enable External Portal Server.\n4. Allow the portal hostname in Pre-Authentication Access.\n5. Create a hotspot operator account; keep its password server-side.\n6. Test redirect parameters, payment callback, authorization, expiry, and reconnect.\n\nNo controller login, AP adoption, or password is stored by this wizard.`, [vendor, mikrotik, omada]);

  async function copyPreview() {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function next() {
    if (step === 1) setStep(2);
    else if (step === 2 && valid) setStep(3);
  }

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-accent/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 text-accent" size={20} />
          <div>
            <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-fg">Safe network configuration wizard</h2><Badge tone="success">Preview only</Badge></div>
            <p className="mt-1 max-w-3xl text-sm text-muted">Prepare the exact settings before touching customer traffic. This wizard never contacts a router or controller, never adopts an AP, and never stores credentials.</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Choose vendor", "Enter network facts", "Review before action"].map((label, index) => <div key={label} className={`rounded-md border p-3 text-sm ${step === index + 1 ? "border-accent bg-accent/10 text-fg" : "border-line bg-raised text-muted"}`}><span className="mr-2 font-mono text-xs">0{index + 1}</span>{label}</div>)}
      </div>
      {step === 1 ? <Card className="p-5"><CardHeader title="What are you setting up?" description="Choose one vendor. You can return and create the other preview later." /><div className="grid gap-3 p-5 sm:grid-cols-2"><button type="button" onClick={() => setVendor("mikrotik")} className={`rounded-md border p-4 text-left ${vendor === "mikrotik" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><strong className="text-fg">MikroTik HotSpot / PPPoE</strong><span className="mt-1 block text-sm text-muted">RouterOS interface, customer subnet, pool and portal path.</span></button><button type="button" onClick={() => setVendor("omada")} className={`rounded-md border p-4 text-left ${vendor === "omada" ? "border-accent bg-accent/10" : "border-line bg-raised"}`}><strong className="text-fg">TP-Link Omada</strong><span className="mt-1 block text-sm text-muted">Controller, site, guest SSID and external portal checklist.</span></button></div></Card> : null}
      {step === 2 && vendor === "mikrotik" ? <Card className="p-5"><CardHeader title="MikroTik network facts" description="These values are validated locally and are not sent anywhere." /><div className="grid gap-4 p-5 md:grid-cols-2"><TextField label="Router name" value={mikrotik.name} onChange={(value) => setMikrotik({ ...mikrotik, name: value })} /><SelectField label="RouterOS" value={mikrotik.routerOs} options={[{ value: "routeros7", label: "RouterOS 7" }, { value: "routeros6", label: "RouterOS 6" }]} onChange={(value) => setMikrotik({ ...mikrotik, routerOs: value })} /><SelectField label="Service" value={mikrotik.service} options={[{ value: "hotspot", label: "HotSpot captive portal" }, { value: "pppoe", label: "PPPoE customers" }]} onChange={(value) => setMikrotik({ ...mikrotik, service: value })} /><TextField label="Customer interface / bridge" value={mikrotik.customerInterface} onChange={(value) => setMikrotik({ ...mikrotik, customerInterface: value })} hint="Do not use the WAN interface." /><TextField label="Customer gateway IPv4" value={mikrotik.gateway} onChange={(value) => setMikrotik({ ...mikrotik, gateway: value })} /><TextField label="Pool start IPv4" value={mikrotik.poolStart} onChange={(value) => setMikrotik({ ...mikrotik, poolStart: value })} /><TextField label="Pool end IPv4" value={mikrotik.poolEnd} onChange={(value) => setMikrotik({ ...mikrotik, poolEnd: value })} /><TextField label="Portal URL" value={mikrotik.portal} onChange={(value) => setMikrotik({ ...mikrotik, portal: value })} hint="HTTPS is required for a production captive portal." /></div></Card> : null}
      {step === 2 && vendor === "omada" ? <Card className="p-5"><CardHeader title="Omada controller facts" description="This prepares adoption and external-portal settings; it does not log in or adopt devices." /><div className="grid gap-4 p-5 md:grid-cols-2"><SelectField label="Controller type" value={omada.controllerType} options={[{ value: "software", label: "Software Controller" }, { value: "oc200", label: "OC200" }, { value: "oc300", label: "OC300" }, { value: "cloud", label: "Cloud Controller" }]} onChange={(value) => setOmada({ ...omada, controllerType: value })} /><TextField label="Controller URL" value={omada.controllerUrl} onChange={(value) => setOmada({ ...omada, controllerUrl: value })} hint="The URL must be reachable from the SynthNet server for server-side authorization." /><TextField label="Omada site" value={omada.site} onChange={(value) => setOmada({ ...omada, site: value })} /><TextField label="Guest SSID" value={omada.guestSsid} onChange={(value) => setOmada({ ...omada, guestSsid: value })} /><TextField label="External portal URL" value={omada.portal} onChange={(value) => setOmada({ ...omada, portal: value })} hint="Allow this hostname in Pre-Authentication Access." /></div></Card> : null}
      {step === 3 ? <Card className="p-5"><CardHeader title="Review before any live action" description="Copy this preview into your change record. It is intentionally non-executable." action={<Button variant="secondary" onClick={copyPreview}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy preview"}</Button>} /><pre className="m-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-ink p-4 text-xs leading-5 text-muted">{preview}</pre><div className="mx-5 mb-5 rounded-md border border-warning/30 bg-warning/10 p-4 text-sm text-warning"><div className="flex items-start gap-2"><Info size={16} className="mt-0.5 shrink-0" /><p>Do not paste a generated command into production until the interface, subnet, backup and rollback plan have been checked by the network operator.</p></div><label className="mt-4 flex items-start gap-2 text-fg"><input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} className="mt-0.5" />I understand this preview does not change hardware and that live setup requires a separate reviewed action.</label></div></Card> : null}
      <div className="flex flex-wrap justify-between gap-3"><Button variant="secondary" onClick={() => setStep((Math.max(1, step - 1) as Step))} disabled={step === 1}><Clipboard size={16} />Back</Button>{step < 3 ? <Button onClick={next} disabled={step === 2 && !valid}>Continue</Button> : <Button disabled={!acknowledged} onClick={() => setStep(2)}>Return to edit</Button>}</div>
    </div>
  );
}
