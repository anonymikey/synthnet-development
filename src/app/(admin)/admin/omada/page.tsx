import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { OmadaDashboard } from "@/features/omada/components/OmadaDashboard";

export const metadata: Metadata = { title: "TP-Link Omada dashboard" };

export default function OmadaPage() {
  return (
    <>
      <PageHeader
        title="TP-Link Omada"
        description="Register TP-Link Omada access points, prepare controller adoption, and monitor the live wireless inventory."
      />
      <OmadaDashboard />
    </>
  );
}
