"use client";

import { ArrowUpRight, Loader2, Palette, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useToast } from "@/components/ui/Toast";
import { ActivityCard } from "@/features/dashboard/ActivityCard";
import { AlertsCard } from "@/features/dashboard/AlertsCard";
import { BillingCard } from "@/features/dashboard/BillingCard";
import { activityInScope, alertsInScope, openAlerts, toggleInList } from "@/features/dashboard/dashboard-logic";
import { StatCards } from "@/features/dashboard/StatCards";
import { SubscribersCard } from "@/features/dashboard/SubscribersCard";
import { TrafficCard } from "@/features/dashboard/TrafficCard";
import { VendorHealth } from "@/features/dashboard/VendorHealth";
import { networkAlerts, recentActivity } from "@/lib/mock-data/overview";
import { cn } from "@/lib/utils/cn";
import { simulateDelay } from "@/lib/utils/simulate";
import type { DashboardMetric, NetworkAlert, TimeRange, VendorFilter } from "@/types/overview";
import { VENDOR_LABELS } from "@/types/vendor";

const VENDOR_OPTIONS: ReadonlyArray<{ value: VendorFilter; label: string }> = [
  { value: "all", label: "All vendors" },
  { value: "mikrotik", label: VENDOR_LABELS.mikrotik },
  { value: "omada", label: VENDOR_LABELS.omada },
];

export function DashboardOverview() {
  const toast = useToast();
  const [vendor, setVendor] = useState<VendorFilter>("all");
  const [metric, setMetric] = useState<DashboardMetric>("throughput");
  const [range, setRange] = useState<TimeRange>("24h");
  const [acknowledged, setAcknowledged] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const scopedAlerts = alertsInScope(networkAlerts, vendor);
  const open = openAlerts(scopedAlerts, acknowledged);
  const scopedActivity = activityInScope(recentActivity, vendor);
  const showMikrotik = vendor !== "omada";
  const showOmada = vendor !== "mikrotik";

  async function handleRefresh() {
    setRefreshing(true);
    await simulateDelay(900);
    setRefreshing(false);
    toast.push({
      title: "Demo refresh complete",
      description: "The figures are static demo data. Refresh only simulates loading.",
      tone: "info",
    });
  }

  function handleToggleAlert(alert: NetworkAlert) {
    const wasAcknowledged = acknowledged.includes(alert.id);
    setAcknowledged((current) => toggleInList(current, alert.id));
    toast.push({
      title: wasAcknowledged ? "Alert reopened (demo)" : "Alert acknowledged (demo)",
      description: "Only this browser session changed. No device was contacted.",
      tone: "info",
    });
  }

  return (
    <div className="space-y-6" aria-busy={refreshing}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Vendor" value={vendor} options={VENDOR_OPTIONS} onChange={setVendor} />
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-muted sm:block">Demo data. Refresh only simulates loading.</p>
          <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            ) : (
              <RefreshCw aria-hidden="true" className="size-4" />
            )}
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className={cn("space-y-6 transition-opacity", refreshing && "opacity-60")}>
        <StatCards vendor={vendor} openAlerts={open} />

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TrafficCard
              vendor={vendor}
              metric={metric}
              range={range}
              onMetricChange={setMetric}
              onRangeChange={setRange}
            />
          </div>
          <Card>
            <CardHeader title="Captive portal" description="What subscribers see when they join your Wi-Fi." />
            <div className="space-y-4 p-5">
              <p className="text-sm text-muted">
                Edit the branding, plans and payment options, and preview the result live.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/captive-portal" className={buttonStyles("primary", "md")}>
                  <Palette aria-hidden="true" className="size-4" />
                  Edit portal
                </Link>
                <Link href="/portal" target="_blank" rel="noreferrer" className={buttonStyles("secondary", "md")}>
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                  Open live portal
                  <span className="sr-only">(opens in a new tab)</span>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {showMikrotik ? (
            <div className={showOmada ? "" : "lg:col-span-2"}>
              <VendorHealth vendor="mikrotik" />
            </div>
          ) : null}
          {showOmada ? (
            <div className={showMikrotik ? "" : "lg:col-span-2"}>
              <VendorHealth vendor="omada" />
            </div>
          ) : null}
        </div>

        <SubscribersCard />
        <BillingCard />

        <div className="grid gap-6 lg:grid-cols-2">
          <AlertsCard alerts={scopedAlerts} acknowledged={acknowledged} onToggle={handleToggleAlert} />
          <ActivityCard entries={scopedActivity} />
        </div>
      </div>
    </div>
  );
}
