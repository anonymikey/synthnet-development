import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { profileUsage } from "@/features/mikrotik/mikrotik.logic";
import type { BillingProfile, ClientLease, HotspotServer } from "@/features/mikrotik/mikrotik.types";
import { formatMoney } from "@/lib/utils/format";

interface ProfilesPanelProps {
  routerName: string;
  servers: readonly HotspotServer[];
  profiles: readonly BillingProfile[];
  leases: readonly ClientLease[];
}

export function ProfilesPanel({ routerName, servers, profiles, leases }: ProfilesPanelProps) {
  const usage = profileUsage(leases, profiles);
  const listRevenue = usage.reduce((sum, entry) => sum + entry.listRevenue, 0);
  const currency = profiles[0]?.currency ?? "KES";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title={`Hotspot servers on ${routerName}`} description="How the hotspot is attached to the router." />
        {servers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-fg">No hotspot server on this router</p>
            <p className="mt-1 text-sm text-muted">Demo routers added by hand have no hotspot configuration.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Hotspot servers</caption>
              <thead className="bg-raised text-muted">
                <tr>
                  {["Name", "Interface", "Address pool", "Server profile", "Login by", "State"].map((heading) => (
                    <th key={heading} scope="col" className="px-4 py-2.5 font-medium">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {servers.map((server) => (
                  <tr key={server.id}>
                    <td className="px-4 py-3 font-medium text-fg">{server.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-fg">{server.interfaceName}</td>
                    <td className="px-4 py-3 text-muted">{server.addressPool}</td>
                    <td className="px-4 py-3 font-mono text-xs text-fg">{server.serverProfile}</td>
                    <td className="px-4 py-3 text-muted">{server.loginBy.join(", ")}</td>
                    <td className="px-4 py-3">
                      {server.enabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="neutral">Disabled</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Billing profiles" description="SYNTHNET tiers and the router user profile each one would map to." />
        <div className="space-y-5 p-5">
          <p className="flex items-start gap-2 rounded-md border border-info/30 bg-info/10 p-3 text-xs text-info">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>
              Only the {formatMoney(600, currency)} base price was specified. The higher tiers, speeds, shared-user limits
              and the monthly period are illustrative until your real hotspot profiles are reviewed in Phase 2.
            </span>
          </p>
          <ul className="grid gap-4 md:grid-cols-3">
            {usage.map(({ profile, leases: count, listRevenue: revenue }) => (
              <li key={profile.id} className="rounded-lg border border-line bg-ink/40 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-fg">{profile.name}</h3>
                  <Badge tone="accent">{formatMoney(profile.price, profile.currency)} / month</Badge>
                </div>
                <p className="mt-1 text-sm text-muted">{profile.description}</p>
                <dl className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Speed (down / up)</dt>
                    <dd className="text-fg">
                      {profile.downloadMbps} / {profile.uploadMbps} Mbps
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Devices per account</dt>
                    <dd className="text-fg">{profile.sharedUsers}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Router profile name</dt>
                    <dd className="font-mono text-xs text-fg">{profile.routerosProfileName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Logged-in devices here</dt>
                    <dd className="text-fg">{count}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">At list price</dt>
                    <dd className="text-fg">{formatMoney(revenue, profile.currency)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">
            Devices on this router at list price: {formatMoney(listRevenue, currency)} per month. This counts devices, not
            accounts, so it is an illustration and not a billing result.
          </p>
        </div>
      </Card>
    </div>
  );
}
