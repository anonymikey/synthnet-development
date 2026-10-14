import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { UsageChart } from "@/features/dashboard/UsageChart";
import { getSeries, RANGE_SPECS, TIME_RANGE_OPTIONS } from "@/lib/mock-data/overview";
import { formatNumber } from "@/lib/utils/format";
import type { DashboardMetric, TimeRange, VendorFilter } from "@/types/overview";
import { VENDOR_LABELS, type VendorId } from "@/types/vendor";

const METRIC_OPTIONS: ReadonlyArray<{ value: DashboardMetric; label: string }> = [
  { value: "throughput", label: "Throughput" },
  { value: "users", label: "Connected users" },
];

const VENDOR_STYLE: Record<VendorId, { strokeClass: string; dashed: boolean }> = {
  mikrotik: { strokeClass: "stroke-accent", dashed: false },
  omada: { strokeClass: "stroke-signal", dashed: true },
};

interface TrafficCardProps {
  vendor: VendorFilter;
  metric: DashboardMetric;
  range: TimeRange;
  onMetricChange: (metric: DashboardMetric) => void;
  onRangeChange: (range: TimeRange) => void;
}

export function TrafficCard({ vendor, metric, range, onMetricChange, onRangeChange }: TrafficCardProps) {
  const vendors: VendorId[] = vendor === "all" ? ["mikrotik", "omada"] : [vendor];
  const spec = RANGE_SPECS[range];
  const unit = metric === "throughput" ? "Mbps" : "users";
  const metricName = metric === "throughput" ? "Peak throughput" : "Peak connected users";

  const series = vendors.map((id) => ({
    id,
    label:
      metric === "users"
        ? `${VENDOR_LABELS[id]} ${id === "mikrotik" ? "hotspot sessions" : "wireless clients"}`
        : VENDOR_LABELS[id],
    values: getSeries(metric, id, range),
    ...VENDOR_STYLE[id],
  }));

  const summary = `${metricName} over the last ${TIME_RANGE_OPTIONS.find((o) => o.value === range)?.label ?? range}. ${series
    .map((s) => `${s.label} peaks at ${formatNumber(Math.max(...s.values))} ${unit}`)
    .join(". ")}.`;

  return (
    <Card>
      <CardHeader
        title={metric === "throughput" ? "Throughput" : "Connected users"}
        description="Each vendor is measured by its own system, so the lines are shown separately."
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <SegmentedControl label="Metric" value={metric} options={METRIC_OPTIONS} onChange={onMetricChange} />
            <SegmentedControl label="Time range" value={range} options={TIME_RANGE_OPTIONS} onChange={onRangeChange} />
          </div>
        }
      />
      <div className="p-5">
        <UsageChart
          xLabels={spec.labels}
          caption={`${metricName} (${unit}), ${spec.description}`}
          summary={summary}
          series={series}
        />
      </div>
    </Card>
  );
}
