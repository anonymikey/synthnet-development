import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardOverview } from "@/features/dashboard/DashboardOverview";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Operations overview"
        description="Network health, subscribers, billing and alerts in one place. All figures are illustrative demo data. SYNTHNET is not connected to any MikroTik router, Omada controller or payment provider in Phase 1."
      />
      <DashboardOverview />
    </>
  );
}
