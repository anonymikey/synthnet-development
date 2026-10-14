"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { AUTHORIZE_FIELDS, OPEN_QUESTIONS, SETUP_STEPS } from "@/features/omada/omada.compat";
import type { SetupStep } from "@/features/omada/omada.types";

const WHERE_LABEL: Record<SetupStep["where"], string> = {
  network: "Your network",
  controller: "Omada controller",
  synthnet: "SYNTHNET",
};

/** A tick-list for the setup steps you can do today. Ticks live in this page only and are not saved. */
export function SetupGuide() {
  const [done, setDone] = useState<string[]>([]);
  const nowSteps = SETUP_STEPS.filter((step) => step.phase === "now");
  const laterSteps = SETUP_STEPS.filter((step) => step.phase === "phase2");
  const doneCount = nowSteps.filter((step) => done.includes(step.id)).length;

  function toggle(id: string) {
    setDone((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <h2 className="text-base font-semibold text-fg">Run Omada access points without MikroTik</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Omada access points can broadcast the network and send new guests to the SYNTHNET portal on their own. Your
          MikroTik setup is not involved and is not touched. You still need a router or gateway for DHCP and internet, but
          it can be any brand.
        </p>
        <p className="mt-3 flex items-start gap-2 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            In Phase 1 the portal redirect can be previewed but not tested end to end, because SYNTHNET cannot yet
            authorize clients on a controller.
          </span>
        </p>
      </Card>

      <Card>
        <CardHeader
          title="Setup checklist"
          description={`${doneCount} of ${nowSteps.length} steps you can do today are ticked. Ticks are not saved.`}
        />
        <ul className="divide-y divide-line">
          {nowSteps.map((step, index) => {
            const checked = done.includes(step.id);
            return (
              <li key={step.id} className="px-5 py-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(step.id)}
                    className="mt-1 size-4 shrink-0 accent-[rgb(var(--c-accent))]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={checked ? "font-medium text-muted line-through" : "font-medium text-fg"}>
                        {index + 1}. {step.title}
                      </span>
                      <Badge>{WHERE_LABEL[step.where]}</Badge>
                    </span>
                    <span className="mt-1 block text-sm text-muted">{step.detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Still to build (Phase 2)" description="These need the live integration and are not available yet." />
        <ul className="divide-y divide-line">
          {laterSteps.map((step) => (
            <li key={step.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-fg">{step.title}</span>
                <Badge tone="info">{WHERE_LABEL[step.where]}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">{step.detail}</p>
            </li>
          ))}
        </ul>
        <div className="border-t border-line p-5">
          <p className="mb-2 text-sm font-medium text-fg">The authorize request will carry these fields</p>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {AUTHORIZE_FIELDS.map((field) => (
              <div key={field.name}>
                <dt className="font-mono text-xs text-fg">{field.name}</dt>
                <dd className="text-sm text-muted">{field.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <Card>
        <CardHeader title="Questions I need answered" description="These decide the Phase 2 design." />
        <ul className="list-disc space-y-1.5 p-5 pl-10 text-sm text-muted">
          {OPEN_QUESTIONS.map((item) => (
            <li key={item.id}>{item.question}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
