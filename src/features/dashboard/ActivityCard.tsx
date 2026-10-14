import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatMinutesAgo } from "@/lib/utils/format";
import type { ActivityEntry, ActivitySource } from "@/types/overview";
import { VENDOR_LABELS } from "@/types/vendor";

const SOURCE_LABELS: Record<ActivitySource, string> = {
  mikrotik: VENDOR_LABELS.mikrotik,
  omada: VENDOR_LABELS.omada,
  billing: "Billing",
  portal: "Captive portal",
};

export function ActivityCard({ entries }: { entries: readonly ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader title="Recent activity" description="Demo events. Nothing here came from a real system." />
      {entries.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm font-medium text-fg">No activity for this vendor</p>
          <p className="mt-1 text-sm text-muted">Switch the vendor filter to see other activity.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 px-5 py-3">
              <Badge>{SOURCE_LABELS[entry.source]}</Badge>
              <p className="min-w-0 flex-1 text-sm text-fg">{entry.text}</p>
              <span className="shrink-0 text-xs text-muted">{formatMinutesAgo(entry.minutesAgo)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
