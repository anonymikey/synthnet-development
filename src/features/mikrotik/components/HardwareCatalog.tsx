"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField, TextField } from "@/components/ui/form";
import { CapabilityBadges } from "@/features/mikrotik/components/CapabilityBadges";
import { RouterPhoto } from "@/features/mikrotik/components/RouterPhoto";
import {
  cpuSummary,
  ethernetSummary,
  poeSummary,
  ramLabel,
  specSourceLabel,
  wirelessSummary,
} from "@/features/mikrotik/mikrotik.capabilities";
import { MIKROTIK_CATALOG, TIER_GROUP_LABELS, TIER_ORDER } from "@/features/mikrotik/mikrotik.catalog";
import type { HardwareTier, MikrotikModel } from "@/features/mikrotik/mikrotik.types";

type CatalogView = "cards" | "matrix";
type TierFilter = "all" | HardwareTier;

const VIEW_OPTIONS: ReadonlyArray<{ value: CatalogView; label: string }> = [
  { value: "cards", label: "Cards" },
  { value: "matrix", label: "Matrix" },
];

const TIER_OPTIONS: ReadonlyArray<{ value: TierFilter; label: string }> = [
  { value: "all", label: "All tiers" },
  ...TIER_ORDER.map((tier) => ({ value: tier, label: TIER_GROUP_LABELS[tier] })),
];

export function filterCatalog(models: readonly MikrotikModel[], tier: TierFilter, search: string): MikrotikModel[] {
  const needle = search.trim().toLowerCase();
  return models.filter((model) => {
    if (tier !== "all" && model.tier !== tier) return false;
    if (!needle) return true;
    return `${model.displayName} ${model.productCode}`.toLowerCase().includes(needle);
  });
}

export function HardwareCatalog() {
  const [view, setView] = useState<CatalogView>("cards");
  const [tier, setTier] = useState<TierFilter>("all");
  const [search, setSearch] = useState("");

  const models = useMemo(() => filterCatalog(MIKROTIK_CATALOG, tier, search), [tier, search]);
  const withoutPhoto = MIKROTIK_CATALOG.filter((model) => model.hardwareImage === null).length;

  return (
    <Card>
      <CardHeader
        title="Supported hardware catalog"
        description={`${MIKROTIK_CATALOG.length} MikroTik models. Photos are still missing for ${withoutPhoto} of them.`}
        action={<SegmentedControl label="Catalog view" value={view} options={VIEW_OPTIONS} onChange={setView} />}
      />
      <div className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Tier" value={tier} options={TIER_OPTIONS} onChange={setTier} />
          <TextField label="Search models" value={search} placeholder="For example hAP or RB5009" onChange={setSearch} />
        </div>

        {models.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-8 text-center">
            <p className="text-sm font-medium text-fg">No models match</p>
            <p className="mt-1 text-sm text-muted">Try another tier or clear the search.</p>
          </div>
        ) : view === "cards" ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {models.map((model) => (
              <li key={model.id} className="flex flex-col gap-3 rounded-lg border border-line bg-ink/40 p-4">
                <RouterPhoto model={model} size="md" showNote />
                <div>
                  <h3 className="font-semibold text-fg">{model.displayName}</h3>
                  <p className="text-xs text-muted">{TIER_GROUP_LABELS[model.tier]}</p>
                </div>
                <CapabilityBadges model={model} />
                <dl className="mt-auto space-y-1 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">CPU</dt>
                    <dd className="text-right text-fg">{cpuSummary(model)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">RAM</dt>
                    <dd className="text-fg">{ramLabel(model)}</dd>
                  </div>
                </dl>
                <p className="text-xs text-muted">{specSourceLabel(model)}.</p>
                {model.specNote ? <p className="text-xs text-warning">{model.specNote}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full min-w-[980px] text-left text-sm">
              <caption className="sr-only">MikroTik hardware comparison matrix</caption>
              <thead className="bg-raised text-muted">
                <tr>
                  {["Model", "Recommendation", "CPU", "RAM", "Wired ports", "Wireless", "PoE"].map((heading) => (
                    <th key={heading} scope="col" className="px-3 py-2.5 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {models.map((model) => (
                  <tr key={model.id}>
                    <th scope="row" className="px-3 py-3 text-left font-medium text-fg">
                      {model.displayName}
                      <span className="block text-xs font-normal text-muted">{model.productCode}</span>
                    </th>
                    <td className="px-3 py-3 text-fg">{model.recommendationLabel}</td>
                    <td className="px-3 py-3 text-muted">{cpuSummary(model)}</td>
                    <td className="px-3 py-3 text-fg">{ramLabel(model)}</td>
                    <td className="px-3 py-3 text-muted">{ethernetSummary(model)}</td>
                    <td className="px-3 py-3 text-muted">{wirelessSummary(model)}</td>
                    <td className="px-3 py-3 text-muted">{poeSummary(model)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
}
