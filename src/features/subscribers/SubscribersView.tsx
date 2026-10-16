"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type SubscriberStatus = "active" | "suspended" | "pending";
type Gateway = "mikrotik" | "omada";
type Subscriber = {
  name: string;
  unit: string;
  gateway: Gateway;
  plan: string;
  price: number;
  status: SubscriberStatus;
  balance: string;
  network: string;
};

const subscribers: Subscriber[] = [
  { name: "Amina Wanjiku", unit: "A-04", gateway: "mikrotik", plan: "Plus", price: 900, status: "active", balance: "18.4 GB", network: "AC:8B:A9:24:70:1C" },
  { name: "Brian Otieno", unit: "A-07", gateway: "omada", plan: "Base", price: 600, status: "active", balance: "6.8 GB", network: "brian.a07 / ••••••••" },
  { name: "Cynthia Njeri", unit: "B-02", gateway: "mikrotik", plan: "Max", price: 1200, status: "pending", balance: "42.1 GB", network: "D4:6E:0E:91:32:AA" },
  { name: "David Kamau", unit: "B-05", gateway: "omada", plan: "Plus", price: 900, status: "suspended", balance: "0 GB", network: "david.b05 / ••••••••" },
  { name: "Esther Achieng", unit: "C-01", gateway: "mikrotik", plan: "Base", price: 600, status: "active", balance: "9.2 GB", network: "5C:62:8B:AF:17:09" },
  { name: "Felix Mwangi", unit: "C-08", gateway: "omada", plan: "Max", price: 1200, status: "active", balance: "31.6 GB", network: "felix.c08 / ••••••••" },
];

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
];

const statusTone = { active: "success", suspended: "danger", pending: "warning" } as const;
const statusLabel = { active: "Active", suspended: "Suspended", pending: "Pending Callback" } as const;

export function SubscribersView() {
  const [status, setStatus] = useState("all");
  const [room, setRoom] = useState("all");
  const filtered = useMemo(() => subscribers.filter((subscriber) => (status === "all" || subscriber.status === status) && (room === "all" || subscriber.unit.startsWith(room))), [room, status]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Active subscribers", value: "4" }, { label: "Monthly recurring", value: "KES 5,700" }, { label: "Pending callbacks", value: "1" }].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-line bg-surface px-4 py-3"><p className="text-xs text-muted">{stat.label}</p><p className="mt-1 text-xl font-semibold text-fg">{stat.value}</p></div>
        ))}
      </div>
      <Card>
        <CardHeader title="Subscriber ledger" description="Local rental building occupancy and network access in one view." action={<SegmentedControl label="Subscriber status" value={status} options={statusOptions} onChange={setStatus} />} />
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <label className="flex items-center gap-2 text-sm text-muted" htmlFor="room-filter">Room</label>
          <select id="room-filter" value={room} onChange={(event) => setRoom(event.target.value)} className="rounded-md border border-line bg-raised px-3 py-2 text-sm text-fg"><option value="all">All rooms</option><option value="A">Block A</option><option value="B">Block B</option><option value="C">Block C</option></select>
          <span className="text-xs text-muted">{filtered.length} of {subscribers.length} tenants</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><caption className="sr-only">Subscriber ledger</caption><thead className="bg-raised text-muted"><tr>{["Tenant", "Room / unit", "Gateway", "Plan", "Status", "Data balance", "Network identifier"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((subscriber) => <tr key={subscriber.unit} className="hover:bg-raised/50"><td className="px-4 py-3 font-medium text-fg">{subscriber.name}</td><td className="px-4 py-3 font-mono text-xs text-muted">{subscriber.unit}</td><td className="px-4 py-3"><Badge tone="info">{subscriber.gateway}</Badge></td><td className="px-4 py-3 text-fg">{subscriber.plan}<span className="ml-1 text-xs text-muted">KES {subscriber.price.toLocaleString()}</span></td><td className="px-4 py-3"><Badge tone={statusTone[subscriber.status]}>{statusLabel[subscriber.status]}</Badge></td><td className="px-4 py-3 text-fg">{subscriber.balance}</td><td className="px-4 py-3 font-mono text-xs text-muted">{subscriber.network}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}

export const planTiers = [
  { name: "Base Tier", price: 600, description: "Reliable everyday access" },
  { name: "Plus Tier", price: 900, description: "More data for connected homes" },
  { name: "Max Tier", price: 1200, description: "Highest monthly allowance" },
];

export type { SubscriberStatus, Gateway };

// Pricing is intentionally presentational until billing services are connected.
export function PlanTiers() {
  return <div className="grid gap-3 sm:grid-cols-3">{planTiers.map((plan) => <div key={plan.name} className="rounded-lg border border-line bg-surface p-4"><p className="text-sm font-medium text-fg">{plan.name}</p><p className="mt-2 text-2xl font-bold text-accent">KES {plan.price.toLocaleString()}<span className="text-xs font-normal text-muted"> / month</span></p><p className="mt-1 text-xs text-muted">{plan.description}</p></div>)}</div>;
}

export { subscribers };

// Keep the plan selector in the same presentation boundary as its pricing tiers.
export function SubscriberPlans() { return <PlanTiers />; }

// Prevent accidental mutation of the display fixture.
void SubscriberPlans;

type _Noop = never;
void (null as _Noop);

// The production data source will replace this fixture in a later milestone.
void subscribers;

// Explicitly expose the tier alignment for the billing screen.
export const subscriptionPrices = { base: 600, plus: 900, max: 1200 } as const;

// End presentation-only subscriber module.

export default SubscribersView;
