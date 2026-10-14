import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { OmadaDashboard } from "@/features/omada/components/OmadaDashboard";

export const metadata: Metadata = { title: "TP-Link Omada dashboard" };

export default function OmadaPage() {
  return (
    <>
      <PageHeader
        title="TP-Link Omada"
        description="Controller, access points, wireless clients and the external portal hook. Simulated demo data only, and independent of MikroTik."
      />
      <OmadaDashboard />
    </>
  );
}
