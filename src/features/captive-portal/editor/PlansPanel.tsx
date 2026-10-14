"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { NumberField, SelectField, TextField, ToggleField } from "@/components/ui/form";
import type { PanelProps } from "@/features/captive-portal/editor/types";
import { formatDuration, formatMoney } from "@/lib/utils/format";
import { makeId } from "@/lib/utils/simulate";
import { CURRENCY_CODES, type CurrencyCode, type PortalPlan } from "@/types/portal";

const CURRENCY_OPTIONS = CURRENCY_CODES.map((code) => ({ value: code, label: code }));

function newPlan(currency: CurrencyCode): PortalPlan {
  return {
    id: makeId("plan"),
    name: "New plan",
    description: "",
    price: 100,
    currency,
    durationMinutes: 1440,
    speedMbps: 5,
    dataCapMb: null,
    highlighted: false,
  };
}

export function PlansPanel({ config, onChange }: PanelProps) {
  const { plans } = config;
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDelete = plans.find((plan) => plan.id === pendingDeleteId) ?? null;

  const setPlans = (next: PortalPlan[]) => onChange({ ...config, plans: next });
  const patchPlan = (id: string, patch: Partial<PortalPlan>) =>
    setPlans(plans.map((plan) => (plan.id === id ? { ...plan, ...patch } : plan)));

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= plans.length) return;
    const next = [...plans];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    setPlans(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Plans appear on the portal when M-Pesa payment is turned on. Prices here are demo values, not billing rules.
      </p>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line p-8 text-center">
          <p className="text-sm font-medium text-fg">No plans yet</p>
          <p className="mt-1 text-sm text-muted">Add your first plan so subscribers have something to buy.</p>
        </div>
      ) : null}

      <ul className="space-y-4">
        {plans.map((plan, index) => (
          <li key={plan.id} className="space-y-4 rounded-lg border border-line bg-ink/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-fg">{plan.name || "Untitled plan"}</p>
                <p className="text-xs text-muted">
                  {formatMoney(plan.price, plan.currency)} · {formatDuration(plan.durationMinutes)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {plan.highlighted ? <Badge tone="accent">Most popular</Badge> : null}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Move ${plan.name} up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ChevronUp aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Move ${plan.name} down`}
                  disabled={index === plans.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown aria-hidden="true" className="size-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  aria-label={`Delete ${plan.name}`}
                  onClick={() => setPendingDeleteId(plan.id)}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Name" value={plan.name} maxLength={40} onChange={(name) => patchPlan(plan.id, { name })} />
              <TextField
                label="Description"
                value={plan.description}
                maxLength={80}
                onChange={(description) => patchPlan(plan.id, { description })}
              />
              <NumberField
                label="Price"
                value={plan.price}
                min={0}
                max={1000000}
                onChange={(price) => patchPlan(plan.id, { price })}
              />
              <SelectField
                label="Currency"
                value={plan.currency}
                options={CURRENCY_OPTIONS}
                onChange={(currency) => patchPlan(plan.id, { currency })}
              />
              <NumberField
                label="Duration (minutes)"
                value={plan.durationMinutes}
                min={1}
                max={525600}
                hint={`Shown as ${formatDuration(plan.durationMinutes)}.`}
                onChange={(durationMinutes) => patchPlan(plan.id, { durationMinutes: Math.round(durationMinutes) })}
              />
              <NumberField
                label="Speed (Mbps)"
                value={plan.speedMbps}
                min={1}
                max={1000}
                onChange={(speedMbps) => patchPlan(plan.id, { speedMbps })}
              />
            </div>

            <ToggleField
              label="Limit data"
              description="Turn off for unlimited data."
              checked={plan.dataCapMb !== null}
              onChange={(limited) => patchPlan(plan.id, { dataCapMb: limited ? 10240 : null })}
            />
            {plan.dataCapMb !== null ? (
              <NumberField
                label="Data cap (MB)"
                value={plan.dataCapMb}
                min={1}
                max={10000000}
                onChange={(dataCapMb) => patchPlan(plan.id, { dataCapMb: Math.round(dataCapMb) })}
              />
            ) : null}
            <ToggleField
              label="Mark as most popular"
              description="Adds a badge to this plan on the portal."
              checked={plan.highlighted}
              onChange={(highlighted) => patchPlan(plan.id, { highlighted })}
            />
          </li>
        ))}
      </ul>

      <Button
        variant="secondary"
        onClick={() => setPlans([...plans, newPlan(plans[plans.length - 1]?.currency ?? "KES")])}
      >
        <Plus aria-hidden="true" className="size-4" />
        Add plan
      </Button>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete “${pendingDelete?.name ?? "plan"}”?`}
        description="This removes the plan from the portal draft. It only affects this demo in your browser."
        confirmLabel="Delete plan"
        destructive
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) setPlans(plans.filter((plan) => plan.id !== pendingDeleteId));
          setPendingDeleteId(null);
        }}
      />
    </div>
  );
}
