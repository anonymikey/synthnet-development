"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PortalView } from "@/features/captive-portal/PortalView";
import { loadPortalConfig } from "@/lib/mock-services/portal-storage";
import type { PortalConfig } from "@/types/portal";

/** The public captive portal page. Reads the config saved from the editor in this browser. */
export function PortalPage() {
  const [config, setConfig] = useState<PortalConfig | null>(null);

  useEffect(() => {
    setConfig(loadPortalConfig());
  }, []);

  if (!config) {
    return <div role="status" aria-busy="true" className="min-h-dvh bg-ink" />;
  }

  return (
    <main>
      <PortalView config={config} fullPage />
      <Link
        href="/admin/captive-portal"
        className="fixed bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
      >
        <Pencil aria-hidden="true" className="size-3.5" />
        Edit this portal
      </Link>
    </main>
  );
}
