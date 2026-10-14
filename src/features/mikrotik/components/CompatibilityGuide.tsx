"use client";

import { Check, Copy, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import {
  EXPORT_REQUESTS,
  EXPORT_SAFETY_CHECKLIST,
  HOTSPOT_PAGE_FILES,
  HOTSPOT_VARIABLES,
} from "@/features/mikrotik/mikrotik.compat";

function CopyButton({ text, label }: { text: string; label: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.push({
        title: "Couldn't copy",
        description: "Your browser blocked clipboard access. Select the command and copy it by hand.",
        tone: "warning",
      });
    }
  }

  return (
    <Button variant="ghost" size="sm" aria-label={`Copy command: ${label}`} onClick={copy}>
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function CompatibilityGuide() {
  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold text-fg">Protecting your existing MikroTik setup</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          SYNTHNET must work alongside your current hotspot, not replace it. In Phase 1 nothing here reads from or writes to
          a router. When you are ready for Phase 2, the exports below let me review your real configuration first, so
          nothing is guessed. Your current login page stays exactly as it is until that review is done.
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Exports to run on the router"
          description="Run these in a Winbox or SSH terminal. Items marked review may contain private data."
        />
        <ul className="divide-y divide-line">
          {EXPORT_REQUESTS.map((request) => (
            <li key={request.id} className="space-y-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-fg">{request.title}</h3>
                <CopyButton text={request.command} label={request.title} />
              </div>
              <code className="block overflow-x-auto rounded-md border border-line bg-ink px-3 py-2 font-mono text-xs text-fg">
                {request.command}
              </code>
              <p className="text-sm text-muted">{request.why}</p>
              <p className="text-xs text-muted">
                Maps to: <span className="text-fg">{request.mapsTo}</span>
                {request.review ? <span className="ml-2 text-warning">Review before sharing</span> : null}
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Before you share anything" />
        <div className="p-5">
          <p className="mb-3 flex items-start gap-2 text-sm text-warning">
            <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>Hidden-sensitive exports are not fully sanitised. Check the file yourself.</span>
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
            {EXPORT_SAFETY_CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Hotspot login pages"
          description="Files in the hotspot html-directory. Please download copies of the ones you have changed."
        />
        <div className="space-y-5 p-5">
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="sr-only">Hotspot HTML files</caption>
              <thead className="bg-raised text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">File</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {HOTSPOT_PAGE_FILES.map((page) => (
                  <tr key={page.file}>
                    <td className="px-4 py-2.5 font-mono text-xs text-fg">{page.file}</td>
                    <td className="px-4 py-2.5 text-muted">{page.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[620px] text-left text-sm">
              <caption className="sr-only">Hotspot page variables</caption>
              <thead className="bg-raised text-muted">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Variable</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Meaning</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Available on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {HOTSPOT_VARIABLES.map((variable) => (
                  <tr key={variable.name}>
                    <td className="px-4 py-2.5 font-mono text-xs text-fg">{`$(${variable.name})`}</td>
                    <td className="px-4 py-2.5 text-muted">{variable.meaning}</td>
                    <td className="px-4 py-2.5 text-muted">{variable.availableOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted">
            Variables and file names follow MikroTik&apos;s &ldquo;Hotspot customisation&rdquo; documentation. The export
            commands above are standard RouterOS usage that has not yet been run against your routers.
          </p>
        </div>
      </Card>
    </div>
  );
}
