import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { BillingView } from "@/features/billing/BillingView";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  return (
    <>
      <PageHeader title="Payments" description="Courtney Tech collection operations, gateway health, callbacks, and emergency lease controls." />
      <BillingView />
    </>
  );
}
