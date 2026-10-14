import type { InvoiceSummary, PaymentRecord, PlanBreakdownEntry, RevenuePoint } from "@/types/overview";

/**
 * Illustrative billing demo data (KES). No real payments, customers or phone numbers.
 * Consistency rules (checked by tests):
 *  - plan subscribers sum to the active subscriber count,
 *  - pending invoices match the revenue summary,
 *  - the last revenue point is this month's revenue.
 */

export const planBreakdown: PlanBreakdownEntry[] = [
  { planId: "plan-hourly", name: "1 hour", subscribers: 214 },
  { planId: "plan-daily", name: "Daily", subscribers: 388 },
  { planId: "plan-weekly", name: "Weekly", subscribers: 331 },
  { planId: "plan-monthly", name: "Monthly", subscribers: 169 },
];

export const revenueHistory: RevenuePoint[] = [
  { label: "May", amount: 318400 },
  { label: "Jun", amount: 352100 },
  { label: "Jul", amount: 389700 },
  { label: "Aug", amount: 421500 },
  { label: "Sep", amount: 441900 },
  { label: "Oct", amount: 482300 },
];

export const invoiceSummary: InvoiceSummary = {
  paid: 1052,
  pending: 37,
  overdue: 58,
};

export const recentPayments: PaymentRecord[] = [
  { id: "PAY-10492", subscriber: "Subscriber 0412", plan: "Weekly", amount: 250, currency: "KES", method: "mpesa", status: "completed", minutesAgo: 3 },
  { id: "PAY-10491", subscriber: "Subscriber 0987", plan: "Daily", amount: 50, currency: "KES", method: "mpesa", status: "completed", minutesAgo: 7 },
  { id: "PAY-10490", subscriber: "Subscriber 0233", plan: "1 hour", amount: 20, currency: "KES", method: "mpesa", status: "pending", note: "Waiting for the customer's PIN", minutesAgo: 9 },
  { id: "PAY-10489", subscriber: "Subscriber 0765", plan: "Monthly", amount: 800, currency: "KES", method: "mpesa", status: "completed", minutesAgo: 16 },
  { id: "PAY-10488", subscriber: "Subscriber 0150", plan: "Daily", amount: 50, currency: "KES", method: "voucher", status: "completed", minutesAgo: 24 },
  { id: "PAY-10487", subscriber: "Subscriber 0871", plan: "Weekly", amount: 250, currency: "KES", method: "mpesa", status: "failed", note: "Request timed out", minutesAgo: 31 },
  { id: "PAY-10486", subscriber: "Subscriber 0319", plan: "1 hour", amount: 20, currency: "KES", method: "mpesa", status: "completed", minutesAgo: 42 },
  { id: "PAY-10485", subscriber: "Subscriber 0604", plan: "Monthly", amount: 800, currency: "KES", method: "mpesa", status: "completed", minutesAgo: 58 },
];
