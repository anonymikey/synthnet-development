"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useEffect, useMemo, useState } from "react";
import { PortalView } from "@/features/captive-portal/PortalView";
import { loadPortalConfig } from "@/lib/mock-services/portal-storage";
import type { PortalConfig } from "@/types/portal";

/** The public captive portal page. Reads the config saved from the editor in this browser. */
type Package = { id: string; name: string; price: number; duration_minutes: number; speed_limit_down_mbps: number; speed_limit_up_mbps: number };
const fetcher = (url: string) => fetch(url).then((response) => response.json() as Promise<Package[]>);

export function PortalPage() {
  const [config, setConfig] = useState<PortalConfig | null>(null);
  const { data: packages = [] } = useSWR<Package[]>("/api/packages", fetcher);

  useEffect(() => {
    setConfig(loadPortalConfig());
  }, []);

  const liveConfig = useMemo(() => config ? { ...config, plans: packages.map((item, index) => ({ id: item.id, name: item.name, description: `${item.speed_limit_down_mbps}/${item.speed_limit_up_mbps} Mbps internet access`, price: Number(item.price), currency: "KES" as const, durationMinutes: item.duration_minutes, speedMbps: item.speed_limit_down_mbps, dataCapMb: null, highlighted: index === 0 })) } : null, [config, packages]);

  if (!liveConfig) {
    return <div role="status" aria-busy="true" className="min-h-dvh bg-ink" />;
  }

  return (
    <main>
      <PortalView config={liveConfig} fullPage />
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
