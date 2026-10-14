"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { BarChart } from "@/features/dashboard/BarChart";
import { filterPayments } from "@/features/dashboard/dashboard-logic";
import { StackedBar } from "@/features/dashboard/StackedBar";
import { invoiceSummary, recentPayments, revenueHistory } from "@/lib/mock-data/billing";
import { revenueSummary } from "@/lib/mock-data/overview";
import { formatMinutesAgo, formatMoney, formatNumber } from "@/lib/utils/format";
import type { PaymentFilter, PaymentStatus } from "@/types/overview";

const FILTER_OPTIONS: ReadonlyArray<{ value: PaymentFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const STATUS_BADGE: Record<PaymentStatus, { tone: BadgeTone; label: string; icon: typeof Clock }> = {
  completed: { tone: "success", label: "Completed", icon: CheckCircle2 },
  pending: { tone: "warning", label: "Pending", icon: Clock },
  failed: { tone: "danger", label: "Failed", icon: XCircle },
};

export function BillingCard() {
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const payments = filterPayments(recentPayments, filter);
  const invoiceTotal = invoiceSummary.paid + invoiceSummary.pending + invoiceSummary.overdue;
  const latest = revenueHistory[revenueHistory.length - 1];

  return (
    <Card>
      <CardHeader
        title="Billing"
        description="Revenue, invoices and recent payments. All figures are demo data."
      />
      <div className="space-y-8 p-5">
        <div className="grid gap-8 lg:grid-cols-2">
          <BarChart
            data={revenueHistory}
            summary={`Monthly revenue in ${revenueSummary.currency} from ${revenueHistory[0]?.label ?? ""} to ${latest?.label ?? ""}. Latest month: ${formatMoney(latest?.amount ?? 0, revenueSummary.currency)}.`}
            caption={`Monthly revenue (${revenueSummary.currency}, thousands). The latest month is the current month to date.`}
          />
          <div>
            <p className="mb-3 text-sm font-medium text-fg">
              Invoices this month <span className="font-normal text-muted">({formatNumber(invoiceTotal)} total)</span>
            </p>
            <StackedBar
              summary={`${invoiceTotal} invoices: ${invoiceSummary.paid} paid, ${invoiceSummary.pending} pending, ${invoiceSummary.overdue} overdue`}
              segments={[
                { label: "Paid", value: invoiceSummary.paid, className: "bg-success" },
                { label: "Pending", value: invoiceSummary.pending, className: "bg-warning" },
                { label: "Overdue", value: invoiceSummary.overdue, className: "bg-danger" },
              ]}
            />
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-fg">Recent payments</h3>
            <SegmentedControl label="Payment status" value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
          </div>

          {payments.length === 0 ? (
            <p className="rounded-md border border-dashed border-line p-6 text-center text-sm text-muted">
              No payments with this status in the demo data.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border border-line">
              <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">Recent demo payments</caption>
                <thead className="bg-raised text-muted">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Reference</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Subscriber</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Plan</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Method</th>
                    <th scope="col" className="px-4 py-2.5 text-right font-medium">Amount</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {payments.map((payment) => {
                    const badge = STATUS_BADGE[payment.status];
                    return (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{payment.id}</td>
                        <td className="px-4 py-3 text-fg">{payment.subscriber}</td>
                        <td className="px-4 py-3 text-fg">{payment.plan}</td>
                        <td className="px-4 py-3 text-muted">{payment.method === "mpesa" ? "M-Pesa" : "Voucher"}</td>
                        <td className="px-4 py-3 text-right text-fg">{formatMoney(payment.amount, payment.currency)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={badge.tone} icon={badge.icon}>
                            {badge.label}
                          </Badge>
                          {payment.note ? <p className="mt-1 text-xs text-muted">{payment.note}</p> : null}
                        </td>
                        <td className="px-4 py-3 text-muted">{formatMinutesAgo(payment.minutesAgo)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
