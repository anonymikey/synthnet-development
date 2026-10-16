import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SubscribersView } from "@/features/subscribers/SubscribersView";

export const metadata: Metadata = { title: "Subscribers" };

export default function SubscribersPage() {
  return (
    <>
      <PageHeader title="Subscribers" description="Manage tenant access, hotspot plans, and remaining data balances." />
      <SubscribersView />
    </>
  );
}
