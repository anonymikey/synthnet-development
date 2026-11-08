import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SessionsView } from "@/features/sessions/SessionsView";
export const metadata: Metadata = { title: "Active sessions" };
export default function SessionsPage() { return <><PageHeader title="Active sessions" description="See who is online, what they are using, and close a session when needed." /><SessionsView /></>; }
