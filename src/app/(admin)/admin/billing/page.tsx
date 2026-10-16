import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BillingView } from "@/features/billing/BillingView";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  return (
    <>
      <PageHeader title="Billing" description="Review invoices, M-Pesa tracking keys, and payment outcomes by tenant." />
      <BillingView />
    </>
  );
}
