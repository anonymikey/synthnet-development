import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "SYNTHNET: hotspot billing and network operations",
    template: "%s | SYNTHNET",
  },
  description:
    "SYNTHNET brings subscribers, payments, MikroTik routers, TP-Link Omada access points and an editable captive portal into one console.",
};

export const viewport: Viewport = {
  themeColor: "#0A0D12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-ink text-fg">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
