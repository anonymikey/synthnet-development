"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";

type PaymentStatus = "Paid" | "Pending" | "Failed";

const transactions = [
  { id: "TX-2401", tenant: "Amina Wanjiku", room: "A-101", amount: 900, mpesa: "QK72M8P4F1", date: "16 Oct 2026", status: "Paid" as PaymentStatus },
  { id: "TX-2400", tenant: "Cynthia Njeri", room: "B-203", amount: 1200, mpesa: "QK72M1D9K3", date: "15 Oct 2026", status: "Pending" as PaymentStatus },
  { id: "TX-2399", tenant: "Esther Achieng", room: "C-305", amount: 600, mpesa: "QK71Z8L2N6", date: "14 Oct 2026", status: "Paid" as PaymentStatus },
  { id: "TX-2398", tenant: "David Kamau", room: "B-204", amount: 900, mpesa: "QK71P4W6R8", date: "12 Oct 2026", status: "Failed" as PaymentStatus },
  { id: "TX-2397", tenant: "Brian Otieno", room: "A-102", amount: 600, mpesa: "QK70C2H5T9", date: "10 Oct 2026", status: "Paid" as PaymentStatus },
];

const tones = { Paid: "success", Pending: "warning", Failed: "danger" } as const;

export function BillingView() {
  const [room, setRoom] = useState("all");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const filtered = useMemo(() => transactions.filter((item) => (room === "all" || item.room.startsWith(room)) && (status === "all" || item.status === status)), [room, status]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[{ label: "Collected this month", value: "KES 8,100" }, { label: "Successful payments", value: "3" }, { label: "Needs attention", value: "2" }].map((stat) => <div key={stat.label} className="rounded-lg border border-line bg-surface px-4 py-3"><p className="text-xs text-muted">{stat.label}</p><p className="mt-1 text-xl font-semibold text-fg">{stat.value}</p></div>)}
      </div>
      <Card>
        <CardHeader title="Billing history" description="Recent M-Pesa collections and invoice states for rental units." />
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <label className="flex items-center gap-2 text-sm text-muted" htmlFor="billing-room">Room <select id="billing-room" value={room} onChange={(event) => setRoom(event.target.value)} className="rounded-md border border-line bg-raised px-3 py-2 text-sm text-fg"><option value="all">All rooms</option><option value="A">Block A</option><option value="B">Block B</option><option value="C">Block C</option></select></label>
          <label className="flex items-center gap-2 text-sm text-muted" htmlFor="billing-status">Status <select id="billing-status" value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus | "all")} className="rounded-md border border-line bg-raised px-3 py-2 text-sm text-fg"><option value="all">All statuses</option><option value="Paid">Paid</option><option value="Pending">Pending</option><option value="Failed">Failed</option></select></label>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><caption className="sr-only">Billing history ledger</caption><thead className="bg-raised text-muted"><tr>{["Transaction", "Tenant / room", "Amount", "M-Pesa tracking key", "Date", "Status"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((item) => <tr key={item.id} className="hover:bg-raised/50"><td className="px-4 py-3 font-mono text-xs text-muted">{item.id}</td><td className="px-4 py-3"><p className="font-medium text-fg">{item.tenant}</p><p className="text-xs text-muted">{item.room}</p></td><td className="px-4 py-3 font-medium text-fg">KES {item.amount.toLocaleString()}</td><td className="px-4 py-3 font-mono text-xs text-muted">{item.mpesa}</td><td className="px-4 py-3 text-muted">{item.date}</td><td className="px-4 py-3"><Badge tone={tones[item.status]}>{item.status}</Badge></td></tr>)}</tbody></table></div>
        {filtered.length === 0 ? <p className="p-6 text-center text-sm text-muted">No transactions match these filters.</p> : null}
      </Card>
    </div>
  );
}
