"use client";

import { ChevronLeft, ChevronRight, Unplug } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField, TextField } from "@/components/ui/form";
import {
  formatMegabytes,
  formatUptime,
  leaseTotals,
  paginate,
  queryLeases,
  type LeaseSortKey,
  type LoginFilter,
} from "@/features/mikrotik/mikrotik.logic";
import type { BillingProfile, ClientLease } from "@/features/mikrotik/mikrotik.types";

const PAGE_SIZE = 10;

const LOGIN_OPTIONS: ReadonlyArray<{ value: LoginFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "authorized", label: "Logged in" },
  { value: "pending", label: "Not logged in" },
];

const SORT_OPTIONS: ReadonlyArray<{ value: LeaseSortKey; label: string }> = [
  { value: "uptime", label: "Longest uptime" },
  { value: "downloaded", label: "Most downloaded" },
  { value: "ip", label: "IP address" },
];

interface LeaseGridProps {
  routerName: string;
  leases: readonly ClientLease[];
  profiles: readonly BillingProfile[];
  onDisconnect: (lease: ClientLease) => void;
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-ink/40 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-fg">{value}</p>
    </div>
  );
}

export function LeaseGrid({ routerName, leases, profiles, onDisconnect }: LeaseGridProps) {
  const [search, setSearch] = useState("");
  const [profileId, setProfileId] = useState("all");
  const [login, setLogin] = useState<LoginFilter>("all");
  const [sort, setSort] = useState<LeaseSortKey>("uptime");
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<ClientLease | null>(null);

  const totals = useMemo(() => leaseTotals(leases), [leases]);
  const filtered = useMemo(
    () => queryLeases(leases, { search, profileId, login, sort }),
    [leases, search, profileId, login, sort],
  );
  const view = paginate(filtered, page, PAGE_SIZE);

  const profileOptions = [
    { value: "all", label: "All profiles" },
    { value: "none", label: "No profile (not logged in)" },
    ...profiles.map((profile) => ({ value: profile.id, label: profile.name })),
  ];
  const profileName = (id: string | null) => profiles.find((profile) => profile.id === id)?.name ?? "None";

  function clearFilters() {
    setSearch("");
    setProfileId("all");
    setLogin("all");
    setPage(1);
  }

  return (
    <Card>
      <CardHeader
        title={`Client leases on ${routerName}`}
        description="Demo devices. MAC addresses are in a locally administered range so they cannot match real hardware."
      />
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Tile label="Leases" value={String(totals.total)} />
          <Tile label="Logged in" value={String(totals.authorized)} />
          <Tile label="Not logged in" value={String(totals.pending)} />
          <Tile label="Data used" value={formatMegabytes(totals.downloadedMb + totals.uploadedMb)} />
        </div>

        {leases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-8 text-center">
            <p className="text-sm font-medium text-fg">No leases on this router</p>
            <p className="mt-1 text-sm text-muted">Only the seeded gateway has demo clients.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <TextField
                label="Search leases"
                value={search}
                placeholder="Host, IP, MAC or username"
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
              <SelectField
                label="Billing profile"
                value={profileId}
                options={profileOptions}
                onChange={(value) => {
                  setProfileId(value);
                  setPage(1);
                }}
              />
              <SelectField label="Sort by" value={sort} options={SORT_OPTIONS} onChange={setSort} />
            </div>
            <SegmentedControl
              label="Login state"
              value={login}
              options={LOGIN_OPTIONS}
              onChange={(value) => {
                setLogin(value);
                setPage(1);
              }}
            />

            {filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-8 text-center">
                <p className="text-sm font-medium text-fg">No leases match these filters</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-line">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <caption className="sr-only">Client leases for {routerName}</caption>
                  <thead className="bg-raised text-muted">
                    <tr>
                      {["Host", "IP address", "MAC address", "User", "Profile", "State", "Uptime", "Down / up", "Lease ends", ""].map(
                        (heading, index) => (
                          <th key={heading || `action-${index}`} scope="col" className="px-3 py-2.5 font-medium">
                            {heading || <span className="sr-only">Actions</span>}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {view.items.map((lease) => (
                      <tr key={lease.id}>
                        <td className="px-3 py-2.5 font-medium text-fg">{lease.hostName}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-fg">{lease.ipAddress}</td>
                        <td className="px-3 py-2.5 font-mono text-xs text-muted">{lease.macAddress}</td>
                        <td className="px-3 py-2.5 text-fg">{lease.username ?? "–"}</td>
                        <td className="px-3 py-2.5 text-fg">{profileName(lease.profileId)}</td>
                        <td className="px-3 py-2.5">
                          {lease.authorized ? <Badge tone="success">Logged in</Badge> : <Badge tone="warning">Not logged in</Badge>}
                        </td>
                        <td className="px-3 py-2.5 text-muted">{formatUptime(lease.uptimeMinutes)}</td>
                        <td className="px-3 py-2.5 text-muted">
                          {formatMegabytes(lease.downloadedMb)} / {formatMegabytes(lease.uploadedMb)}
                        </td>
                        <td className="px-3 py-2.5 text-muted">{formatUptime(lease.leaseExpiresInMinutes)}</td>
                        <td className="px-3 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`Disconnect ${lease.hostName} (demo)`}
                            onClick={() => setPending(lease)}
                          >
                            <Unplug aria-hidden="true" className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted" aria-live="polite">
                  Page {view.page} of {view.pageCount} · {view.total} {view.total === 1 ? "lease" : "leases"}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={view.page <= 1} onClick={() => setPage(view.page - 1)}>
                    <ChevronLeft aria-hidden="true" className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={view.page >= view.pageCount}
                    onClick={() => setPage(view.page + 1)}
                  >
                    Next
                    <ChevronRight aria-hidden="true" className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={`Disconnect ${pending?.hostName ?? "this device"}?`}
        description="This removes the device from the demo list in your browser. No router is contacted and no real session is ended."
        confirmLabel="Disconnect (demo)"
        destructive
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) onDisconnect(pending);
          setPending(null);
        }}
      />
    </Card>
  );
}
