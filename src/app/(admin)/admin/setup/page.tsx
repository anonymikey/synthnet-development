import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SafeConfigurationWizard } from "@/features/setup/SafeConfigurationWizard";

export const metadata: Metadata = { title: "Safe network setup wizard" };

export default function SetupPage() {
  return (
    <>
      <PageHeader title="Safe setup wizard" description="Prepare MikroTik and Omada changes without contacting live hardware." />
      <SafeConfigurationWizard />
    </>
  );
}
