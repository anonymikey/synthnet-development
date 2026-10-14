import type { Metadata } from "next";
import { PortalPage } from "@/features/captive-portal/PortalPage";

export const metadata: Metadata = {
  title: "Wi-Fi sign-in",
  robots: { index: false, follow: false },
};

export default function PortalRoute() {
  return <PortalPage />;
}
