import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PortalEditor } from "@/features/captive-portal/PortalEditor";

export const metadata: Metadata = { title: "Captive portal editor" };

export default function CaptivePortalEditorPage() {
  return (
    <>
      <PageHeader
        title="Captive portal"
        description="Design the page subscribers see when they join your Wi-Fi. Changes appear in the preview straight away. Save to update the live portal page."
      />
      <PortalEditor />
    </>
  );
}
