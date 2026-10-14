"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField, TextField } from "@/components/ui/form";
import { ApBadges } from "@/features/omada/components/ApBadges";
import { ApPhoto } from "@/features/omada/components/ApPhoto";
import { bandsSummary, powerSummary, specSourceLabel, uplinkSummary, wifiLabel } from "@/features/omada/omada.capabilities";
import { FORM_FACTOR_LABELS, OMADA_AP_CATALOG, OMADA_CONTROLLER_CATALOG } from "@/features/omada/omada.catalog";
import type { OmadaApModel, OmadaFormFactor } from "@/features/omada/omada.types";
import { formatNumber } from "@/lib/utils/format";

type CatalogView = "cards" | "matrix";
type FormFilter = "all" | OmadaFormFactor;

const VIEW_OPTIONS: ReadonlyArray<{ value: CatalogView; label: string }> = [
  { value: "cards", label: "Cards" },
  { value: "matrix", label: "Matrix" },
];

const FORM_OPTIONS: ReadonlyArray<{ value: FormFilter; label: string }> = [
  { value: "all", label: "All types" },
  { value: "outdoor", label: FORM_FACTOR_LABELS.outdoor },
  { value: "ceiling", label: FORM_FACTOR_LABELS.ceiling },
  { value: "wall", label: FORM_FACTOR_LABELS.wall },
];

export function filterApCatalog(models: readonly OmadaApModel[], form: FormFilter, search: string): OmadaApModel[] {
  const needle = search.trim().toLowerCase();
  return models.filter((model) => {
    if (form !== "all" && model.formFactor !== form) return false;
    if (!needle) return true;
    return `${model.displayName} ${model.productCode} ${model.speedClass}`.toLowerCase().includes(needle);
  });
}

export function OmadaCatalog() {
  const [view, setView] = useState<CatalogView>("cards");
  const [form, setForm] = useState<FormFilter>("all");
  const [search, setSearch] = useState("");

  const models = useMemo(() => filterApCatalog(OMADA_AP_CATALOG, form, search), [form, search]);
  const withoutPhoto = OMADA_AP_CATALOG.filter((model) => model.hardwareImage === null).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Access point models"
          description={`${OMADA_AP_CATALOG.length} Omada models. Photos are still missing for ${withoutPhoto} of them.`}
          action={<SegmentedControl label="Catalog view" value={view} options={VIEW_OPTIONS} onChange={setView} />}
        />
        <div className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Type" value={form} options={FORM_OPTIONS} onChange={setForm} />
            <TextField label="Search models" value={search} placeholder="For example EAP225 or AX1800" onChange={setSearch} />
          </div>

          {models.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-8 text-center">
              <p className="text-sm font-medium text-fg">No models match</p>
              <p className="mt-1 text-sm text-muted">Try another type or clear the search.</p>
            </div>
          ) : view === "cards" ? (
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {models.map((model) => (
                <li key={model.id} className="flex flex-col gap-3 rounded-lg border border-line bg-ink/40 p-4">
                  <ApPhoto model={model} size="md" showNote />
                  <div>
                    <h3 className="font-semibold text-fg">{model.displayName}</h3>
                    <p className="text-xs text-muted">
                      {FORM_FACTOR_LABELS[model.formFactor]} · {model.speedClass}
                    </p>
                  </div>
                  <ApBadges model={model} />
                  <dl className="mt-auto space-y-1 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Radios</dt>
                      <dd className="text-right text-fg">{bandsSummary(model)}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">Uplink</dt>
                      <dd className="text-fg">{uplinkSummary(model)}</dd>
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
                <caption className="sr-only">Omada access point comparison matrix</caption>
                <thead className="bg-raised text-muted">
                  <tr>
                    {["Model", "Type", "Wi-Fi", "Radios", "Wired uplink", "Power"].map((heading) => (
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
                        <span className="block text-xs font-normal text-muted">{model.speedClass}</span>
                      </th>
                      <td className="px-3 py-3 text-fg">{FORM_FACTOR_LABELS[model.formFactor]}</td>
                      <td className="px-3 py-3 text-fg">{wifiLabel(model)}</td>
                      <td className="px-3 py-3 text-muted">{bandsSummary(model)}</td>
                      <td className="px-3 py-3 text-muted">{uplinkSummary(model)}</td>
                      <td className="px-3 py-3 text-muted">{powerSummary(model)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Controller options" description="The portal redirect is configured in a controller, so one is required." />
        <ul className="grid gap-4 p-5 md:grid-cols-3">
          {OMADA_CONTROLLER_CATALOG.map((controller) => (
            <li key={controller.id} className="rounded-lg border border-line bg-ink/40 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-fg">{controller.displayName}</h3>
                <Badge>{controller.kind === "software" ? "Software" : "Hardware"}</Badge>
              </div>
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Access points</dt>
                  <dd className="text-fg">{controller.maxAccessPoints !== null ? `Up to ${formatNumber(controller.maxAccessPoints)}` : "Depends on host"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Clients</dt>
                  <dd className="text-fg">{controller.maxClients !== null ? `Up to ${formatNumber(controller.maxClients)}` : "Depends on host"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Portal setup</dt>
                  <dd className="text-fg">{controller.captivePortalConfig ? "Yes" : "No"}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted">{controller.note}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
