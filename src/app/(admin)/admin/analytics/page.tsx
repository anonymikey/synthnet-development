import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsView } from "@/features/analytics/AnalyticsView";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <><PageHeader title="Analytics" description="Understand usage, revenue conversion and subscription demand across your network." /><AnalyticsView /></>;
}
