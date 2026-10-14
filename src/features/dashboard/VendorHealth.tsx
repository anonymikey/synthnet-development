import { Router, Wifi } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { StackedBar } from "@/features/dashboard/StackedBar";
import { mikrotikOverview, omadaOverview, sumStatusCounts } from "@/lib/mock-data/overview";
import { formatNumber } from "@/lib/utils/format";
import type { StatusCounts } from "@/types/overview";
import type { VendorId } from "@/types/vendor";

function deviceBar(counts: StatusCounts, noun: string) {
  const total = sumStatusCounts(counts);
  return (
    <StackedBar
      summary={`${total} ${noun}: ${counts.online} online, ${counts.warning} warning, ${counts.offline} offline`}
      segments={[
        { label: "Online", value: counts.online, className: "bg-success" },
        { label: "Warning", value: counts.warning, className: "bg-warning" },
        { label: "Offline", value: counts.offline, className: "bg-danger" },
      ]}
    />
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-2xl font-bold text-fg">{formatNumber(value)}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function VendorHealth({ vendor }: { vendor: VendorId }) {
  if (vendor === "mikrotik") {
    return (
      <Card>
        <CardHeader
          title="MikroTik"
          description="Routers and hotspot servers"
          action={<Badge icon={Router}>Demo data</Badge>}
        />
        <div className="space-y-5 p-5">
          <div>
            <p className="mb-2 text-sm font-medium text-fg">
              Routers <span className="font-normal text-muted">({sumStatusCounts(mikrotikOverview.routers)} total)</span>
            </p>
            {deviceBar(mikrotikOverview.routers, "routers")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Metric label="Hotspot servers" value={mikrotikOverview.hotspotServers} />
            <Metric label="Active hotspot sessions" value={mikrotikOverview.activeHotspotSessions} />
          </div>
          <Link href="/admin/mikrotik" className="inline-block text-sm font-medium text-accent underline-offset-2 hover:underline">
            Open the MikroTik dashboard
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="TP-Link Omada"
        description="Controllers, sites and access points"
        action={<Badge icon={Wifi}>Demo data</Badge>}
      />
      <div className="space-y-5 p-5">
        <div>
          <p className="mb-2 text-sm font-medium text-fg">
            Access points <span className="font-normal text-muted">({sumStatusCounts(omadaOverview.accessPoints)} total)</span>
          </p>
          {deviceBar(omadaOverview.accessPoints, "access points")}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Metric label="Controllers" value={omadaOverview.controllers} />
          <Metric label="Sites" value={omadaOverview.sites} />
          <Metric label="Wireless clients" value={omadaOverview.connectedClients} />
        </div>
        <Link href="/admin/omada" className="inline-block text-sm font-medium text-accent underline-offset-2 hover:underline">
          Open the Omada dashboard
        </Link>
      </div>
    </Card>
  );
}
