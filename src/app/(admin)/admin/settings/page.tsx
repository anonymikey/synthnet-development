import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SettingsView } from "@/features/settings/SettingsView";

export const metadata: Metadata = { title: "System settings" };

export default function SettingsPage() {
  return <><PageHeader title="System settings" description="Manage company details, gateway connections and automation behavior." /><SettingsView /></>;
}
