import { Badge } from "@/components/ui/Badge";
import { apChips } from "@/features/omada/omada.capabilities";
import type { OmadaApModel } from "@/features/omada/omada.types";

/** Factual capability chips derived from the model's verified specs. */
export function ApBadges({ model, limit }: { model: OmadaApModel; limit?: number }) {
  const chips = apChips(model);
  const shown = limit ? chips.slice(0, limit) : chips;
  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((chip) => (
        <Badge key={chip.id}>{chip.label}</Badge>
      ))}
    </div>
  );
}
