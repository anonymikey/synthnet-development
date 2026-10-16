"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useState } from "react";

const traffic = [
  { label: "00", mikrotik: 38, omada: 24 },
  { label: "04", mikrotik: 22, omada: 18 },
  { label: "08", mikrotik: 52, omada: 45 },
  { label: "12", mikrotik: 68, omada: 58 },
  { label: "16", mikrotik: 84, omada: 72 },
  { label: "20", mikrotik: 96, omada: 88 },
  { label: "24", mikrotik: 61, omada: 49 },
];

const revenue = [
  { label: "Initiated", value: 1248, percent: 100 },
  { label: "Prompt sent", value: 1181, percent: 95 },
  { label: "Completed", value: 1064, percent: 85 },
];

const packages = [
  { name: "Base", price: "KSh 600", subscribers: 482, width: 68 },
  { name: "Plus", price: "KSh 1,000", subscribers: 314, width: 47 },
  { name: "Max", price: "KSh 1,500", subscribers: 196, width: 30 },
];

export function AnalyticsView() {
  const [range, setRange] = useState("7d");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl label="Range" value={range} options={[{ value: "24h", label: "24 hours" }, { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} onChange={setRange} />
        <p className="text-xs text-muted">Demo reporting window · Last updated just now</p>
      </div>

      <Card>
        <CardHeader title="Peak usage & bandwidth" description="Total consumed bandwidth across connected vendor streams." action={<TrendingUp aria-hidden="true" className="size-4 text-accent" />} />
        <div className="flex flex-col gap-5 p-5">
          <div className="flex flex-wrap gap-4 text-xs text-muted"><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-accent" />MikroTik data stream</span><span className="flex items-center gap-2"><span className="size-2 rounded-full bg-purple-400" />Omada client stream</span></div>
          <div className="flex h-56 items-end gap-2 border-b border-l border-line px-3 pb-3 pt-6 sm:gap-4">
            {traffic.map((point) => <div key={point.label} className="flex h-full flex-1 items-end gap-1 sm:gap-2"><div className="flex h-full flex-1 items-end"><div className="w-full rounded-t-sm bg-accent/80" style={{ height: `${point.mikrotik}%` }} /></div><div className="flex h-full flex-1 items-end"><div className="w-full rounded-t-sm bg-purple-400/80" style={{ height: `${point.omada}%` }} /></div><span className="absolute sr-only">{point.label}: MikroTik {point.mikrotik}%, Omada {point.omada}%</span></div>)}
          </div>
          <div className="flex justify-between pl-4 text-[11px] text-muted">{traffic.map((point) => <span key={point.label}>{point.label}:00</span>)}</div>
          <div className="grid gap-3 sm:grid-cols-3"><Metric label="Peak hour" value="20:00" detail="Highest concurrent use" /><Metric label="Bandwidth" value="1.84 TB" detail="Across all gateways" /><Metric label="Avg. session" value="2h 18m" detail="Up 12.4% from prior" /></div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader title="M-Pesa revenue conversion" description="Initiated STK pushes compared with successful completions." action={<BarChart3 aria-hidden="true" className="size-4 text-accent" />} /><div className="flex flex-col gap-5 p-5">{revenue.map((item) => <div key={item.label} className="flex flex-col gap-2"><div className="flex justify-between text-sm"><span className="text-muted">{item.label}</span><span className="font-medium text-fg">{item.value.toLocaleString()}</span></div><div className="h-3 overflow-hidden rounded-full bg-raised"><div className="h-full rounded-full bg-accent" style={{ width: `${item.percent}%` }} /></div></div>)}<div className="rounded-md border border-line bg-raised p-4"><p className="text-2xl font-bold text-fg">85.3%</p><p className="text-xs text-muted">Successful completion rate · +3.8% vs prior window</p></div></div></Card>
        <Card><CardHeader title="Popular subscription packages" description="Active subscriber mix by current plan tier." /><div className="flex flex-col gap-5 p-5">{packages.map((item) => <div key={item.name} className="flex flex-col gap-2"><div className="flex items-center justify-between text-sm"><span className="font-medium text-fg">{item.name} <span className="ml-1 text-xs text-muted">{item.price}</span></span><span className="text-muted">{item.subscribers} subscribers</span></div><div className="h-3 overflow-hidden rounded-full bg-raised"><div className="h-full rounded-full bg-accent" style={{ width: `${item.width}%` }} /></div></div>)}<div className="flex items-center justify-between border-t border-line pt-4 text-sm"><span className="text-muted">Total active packages</span><span className="font-semibold text-fg">992</span></div></div></Card>
      </div>
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-md border border-line bg-raised p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-lg font-semibold text-fg">{value}</p><p className="mt-0.5 text-xs text-muted">{detail}</p></div>; }

export default AnalyticsView;
