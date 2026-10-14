import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MikrotikDashboard } from "@/features/mikrotik/components/MikrotikDashboard";

export const metadata: Metadata = { title: "MikroTik dashboard" };

export default function MikrotikPage() {
  return (
    <>
      <PageHeader
        title="MikroTik"
        description="Router inventory, hotspot leases, billing profiles and the supported hardware catalog. Simulated demo data only."
      />
      <MikrotikDashboard />
    </>
  );
}
