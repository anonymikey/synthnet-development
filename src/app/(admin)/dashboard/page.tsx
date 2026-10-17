import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardOverview } from "@/features/dashboard/DashboardOverview";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Operations overview"
        description="Live network health, subscriber leases, billing activity and payment callbacks from your Supabase operations data."
      />
      <DashboardOverview />
    </>
  );
}
