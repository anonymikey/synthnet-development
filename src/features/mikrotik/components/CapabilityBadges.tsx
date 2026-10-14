import { Award, Cpu, Gauge, Router as RouterIcon, TriangleAlert, Wifi, type LucideIcon } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { capabilityChips } from "@/features/mikrotik/mikrotik.capabilities";
import type { HardwareTier, MikrotikModel } from "@/features/mikrotik/mikrotik.types";

const TIER_STYLE: Record<HardwareTier, { tone: BadgeTone; icon: LucideIcon }> = {
  entry: { tone: "warning", icon: TriangleAlert },
  starter: { tone: "info", icon: RouterIcon },
  soho: { tone: "accent", icon: Gauge },
  wifi6: { tone: "accent", icon: Wifi },
  gateway: { tone: "success", icon: Award },
};

interface CapabilityBadgesProps {
  model: MikrotikModel;
  /** Only the recommendation badge. */
  recommendationOnly?: boolean;
}

/** The operator's recommendation first (with an icon, never colour alone), then factual capability chips. */
export function CapabilityBadges({ model, recommendationOnly = false }: CapabilityBadgesProps) {
  const style = TIER_STYLE[model.tier];
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge tone={style.tone} icon={style.icon}>
        {model.recommendationLabel}
      </Badge>
      {recommendationOnly
        ? null
        : capabilityChips(model).map((chip) => (
            <Badge key={chip.id} icon={chip.id === "cpu" ? Cpu : undefined}>
              {chip.label}
            </Badge>
          ))}
    </div>
  );
}
