import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscriberView } from "@/features/subscribers/SubscriberView";

export const metadata: Metadata = { title: "Subscribers" };
export default function SubscribersPage() {
  return <><PageHeader title="Subscribers" description="Manage tenant access, plans and network identifiers across the building." /><SubscriberView /></>;
}
