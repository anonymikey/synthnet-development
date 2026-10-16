"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatData, formatMoney } from "@/lib/utils/format";

type Status = "Active" | "Suspended" | "Pending Callback";
type Vendor = "mikrotik" | "omada";
type Subscriber = { name: string; unit: string; vendor: Vendor; plan: string; price: number; status: Status; balance: number | null; identifier: string; access: "Hotspot" | "PPPoE" };

const subscribers: Subscriber[] = [
  { name: "Amina Wanjiku", unit: "A-101", vendor: "mikrotik", plan: "Base Tier", price: 600, status: "Active", balance: 1840, identifier: "84:2E:27:9C:1A:04", access: "Hotspot" },
  { name: "Brian Otieno", unit: "A-102", vendor: "omada", plan: "Plus Tier", price: 900, status: "Active", balance: 3200, identifier: "brian.otieno", access: "PPPoE" },
  { name: "Carol Njeri", unit: "A-203", vendor: "mikrotik", plan: "Max Tier", price: 1200, status: "Pending Callback", balance: 410, identifier: "carol.njeri", access: "PPPoE" },
  { name: "David Kamau", unit: "B-104", vendor: "omada", plan: "Base Tier", price: 600, status: "Suspended", balance: 0, identifier: "3C:52:82:11:7D:90", access: "Hotspot" },
  { name: "Esther Achieng", unit: "B-205", vendor: "mikrotik", plan: "Plus Tier", price: 900, status: "Active", balance: null, identifier: "C8:7F:54:2B:09:FE", access: "Hotspot" },
];

const statusTone = { Active: "success", Suspended: "danger", "Pending Callback": "warning" } as const;

export function SubscriberView() {
  const [room, setRoom] = useState("All rooms");
  const [status, setStatus] = useState<"All status" | Status>("All status");
  const filtered = useMemo(() => subscribers.filter((item) => (room === "All rooms" || item.unit.startsWith(room)) && (status === "All status" || item.status === status)), [room, status]);
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Active subscribers", value: "3" }, { label: "Monthly recurring", value: formatMoney(3000, "KES") }, { label: "Pending callbacks", value: "1" }].map((stat) => <Card key={stat.label} className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</p><p className="mt-2 text-2xl font-bold text-fg">{stat.value}</p></Card>)}
      </div>
      <Card>
        <CardHeader title="Building subscribers" description="Local rental building roster across MikroTik and Omada gateways." action={<Button size="sm">Add subscriber</Button>} />
        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3">
          <label className="sr-only" htmlFor="room-filter">Filter by room</label><select id="room-filter" value={room} onChange={(event) => setRoom(event.target.value)} className="h-9 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option>All rooms</option><option>A-</option><option>B-</option></select>
          <label className="sr-only" htmlFor="status-filter">Filter by status</label><select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option>All status</option><option>Active</option><option>Suspended</option><option>Pending Callback</option></select>
          <span className="ml-auto self-center text-xs text-muted">{filtered.length} of {subscribers.length} tenants</span>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Tenant", "Unit", "Gateway", "Plan", "Status", "Data balance", "Network identifier"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((item) => <tr key={item.unit} className="hover:bg-raised/50"><td className="px-5 py-4 font-medium text-fg">{item.name}</td><td className="px-5 py-4 text-muted">{item.unit}</td><td className="px-5 py-4"><Badge tone={item.vendor === "mikrotik" ? "accent" : "info"}>{item.vendor}</Badge></td><td className="px-5 py-4"><span className="font-medium text-fg">{item.plan}</span><span className="block text-xs text-muted">{formatMoney(item.price, "KES")} / month</span></td><td className="px-5 py-4"><Badge tone={statusTone[item.status]}>{item.status}</Badge></td><td className="px-5 py-4 text-fg">{formatData(item.balance)}</td><td className="px-5 py-4"><span className="text-xs text-muted">{item.access === "Hotspot" ? "Registered MAC Address" : "PPPoE username / password"}</span><span className="block font-mono text-xs text-fg">{item.identifier} {item.access === "PPPoE" ? " / ••••••••" : ""}</span></td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}
