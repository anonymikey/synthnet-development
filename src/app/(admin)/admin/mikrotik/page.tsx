import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { MikrotikDashboard } from "@/features/mikrotik/components/MikrotikDashboard";

export const metadata: Metadata = { title: "MikroTik dashboard" };

export default function MikrotikPage() {
  return (
    <>
      <PageHeader
        title="MikroTik"
        description="Connect MikroTik routers with a one-time WinBox setup command for hotspot and PPPoE operations."
      />
      <MikrotikDashboard />
    </>
  );
}
