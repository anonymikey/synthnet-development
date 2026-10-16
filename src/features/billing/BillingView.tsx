"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMoney } from "@/lib/utils/format";

type PaymentStatus = "Paid" | "Pending" | "Failed";
type Payment = { id: string; tenant: string; unit: string; amount: number; key: string; date: string; status: PaymentStatus; method: string };
const payments: Payment[] = [
  { id: "INV-10492", tenant: "Amina Wanjiku", unit: "A-101", amount: 600, key: "QK72H9P3LZ", date: "16 Oct 2026, 09:42", status: "Paid", method: "M-Pesa" },
  { id: "INV-10491", tenant: "Brian Otieno", unit: "A-102", amount: 900, key: "QK72G1T8NB", date: "16 Oct 2026, 08:18", status: "Paid", method: "M-Pesa" },
  { id: "INV-10490", tenant: "Carol Njeri", unit: "A-203", amount: 1200, key: "Pending callback", date: "16 Oct 2026, 07:56", status: "Pending", method: "M-Pesa" },
  { id: "INV-10489", tenant: "David Kamau", unit: "B-104", amount: 600, key: "QK71Z4K2AA", date: "15 Oct 2026, 17:20", status: "Failed", method: "M-Pesa" },
  { id: "INV-10488", tenant: "Esther Achieng", unit: "B-205", amount: 900, key: "QK71W8C5MV", date: "15 Oct 2026, 12:05", status: "Paid", method: "M-Pesa" },
];
const tones = { Paid: "success", Pending: "warning", Failed: "danger" } as const;
export function BillingView() {
  const [status, setStatus] = useState<"All statuses" | PaymentStatus>("All statuses");
  const [unit, setUnit] = useState("All rooms");
  const filtered = useMemo(() => payments.filter((item) => (status === "All statuses" || item.status === status) && (unit === "All rooms" || item.unit.startsWith(unit))), [status, unit]);
  return <div className="flex flex-col gap-5"><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Collected this month", value: formatMoney(24000, "KES") }, { label: "Successful payments", value: "96.4%" }, { label: "Needs attention", value: "2" }].map((stat) => <Card key={stat.label} className="px-5 py-4"><p className="text-xs font-medium uppercase tracking-wider text-muted">{stat.label}</p><p className="mt-2 text-2xl font-bold text-fg">{stat.value}</p></Card>)}</div><Card><CardHeader title="Billing history" description="M-Pesa payment requests and invoice status for building tenants." action={<Button size="sm" variant="secondary">Export ledger</Button>} /><div className="flex flex-wrap gap-2 border-b border-line px-5 py-3"><label className="sr-only" htmlFor="billing-room">Filter by room</label><select id="billing-room" value={unit} onChange={(event) => setUnit(event.target.value)} className="h-9 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option>All rooms</option><option>A-</option><option>B-</option></select><label className="sr-only" htmlFor="billing-status">Filter by status</label><select id="billing-status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-9 rounded-md border border-line bg-raised px-3 text-sm text-fg"><option>All statuses</option><option>Paid</option><option>Pending</option><option>Failed</option></select><span className="ml-auto self-center text-xs text-muted">Showing {filtered.length} transactions</span></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-raised text-xs uppercase tracking-wider text-muted"><tr>{["Invoice", "Tenant", "Amount", "M-Pesa tracking key", "Date", "Status"].map((heading) => <th key={heading} className="px-5 py-3 font-medium">{heading}</th>)}</tr></thead><tbody className="divide-y divide-line">{filtered.map((item) => <tr key={item.id} className="hover:bg-raised/50"><td className="px-5 py-4 font-mono text-xs text-muted">{item.id}</td><td className="px-5 py-4"><span className="font-medium text-fg">{item.tenant}</span><span className="block text-xs text-muted">Unit {item.unit}</span></td><td className="px-5 py-4 font-medium text-fg">{formatMoney(item.amount, "KES")}</td><td className="px-5 py-4 font-mono text-xs text-muted">{item.key}</td><td className="px-5 py-4 text-xs text-muted">{item.date}</td><td className="px-5 py-4"><Badge tone={tones[item.status]}>{item.status}</Badge></td></tr>)}</tbody></table></div></Card></div>;
}
