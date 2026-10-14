import { Server } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import type { OmadaControllerModel, OmadaController, OmadaSite } from "@/features/omada/omada.types";
import { formatNumber } from "@/lib/utils/format";

interface ControllerCardProps {
  controller: OmadaController;
  model: OmadaControllerModel;
  site: OmadaSite;
  adoptedAps: number;
}

function capacity(model: OmadaControllerModel): string {
  if (model.maxAccessPoints === null) return "Depends on the host PC or server";
  const clients = model.maxClients !== null ? `, up to ${formatNumber(model.maxClients)} clients` : "";
  return `Up to ${formatNumber(model.maxAccessPoints)} access points${clients}`;
}

export function ControllerCard({ controller, model, site, adoptedAps }: ControllerCardProps) {
  return (
    <Card>
      <CardHeader
        title={controller.name}
        description={model.displayName}
        action={<StatusBadge status={controller.status} />}
      />
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge icon={Server}>{model.kind === "software" ? "Local software controller" : "Hardware controller"}</Badge>
          <Badge>Demo data, not connected</Badge>
        </div>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted">Address</dt>
            <dd className="font-mono text-sm text-fg">{controller.address}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Site</dt>
            <dd className="text-sm text-fg">{site.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Adopted access points</dt>
            <dd className="text-sm text-fg">{adoptedAps}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Controller version</dt>
            <dd className="text-sm text-fg">{controller.version ?? "Not reported yet (needs Phase 2)"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted">Capacity</dt>
            <dd className="text-sm text-fg">{capacity(model)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted">{model.note}</p>
      </div>
    </Card>
  );
}
