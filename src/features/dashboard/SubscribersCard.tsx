import { Card, CardHeader } from "@/components/ui/Card";
import { StackedBar } from "@/features/dashboard/StackedBar";
import { planBreakdown } from "@/lib/mock-data/billing";
import { subscriberSummary } from "@/lib/mock-data/overview";
import { formatNumber } from "@/lib/utils/format";

export function SubscribersCard() {
  const { total, active, expired, suspended } = subscriberSummary;
  const largest = Math.max(...planBreakdown.map((plan) => plan.subscribers));

  return (
    <Card>
      <CardHeader title="Subscribers" description="Account status and active subscribers by plan." />
      <div className="grid gap-8 p-5 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-medium text-fg">
            Account status <span className="font-normal text-muted">({formatNumber(total)} total)</span>
          </p>
          <StackedBar
            summary={`${total} subscribers: ${active} active, ${expired} expired, ${suspended} suspended`}
            segments={[
              { label: "Active", value: active, className: "bg-success" },
              { label: "Expired", value: expired, className: "bg-warning" },
              { label: "Suspended", value: suspended, className: "bg-danger" },
            ]}
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-fg">
            Active subscribers by plan <span className="font-normal text-muted">({formatNumber(active)})</span>
          </p>
          <ul className="space-y-3">
            {planBreakdown.map((plan) => (
              <li key={plan.planId}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-fg">{plan.name}</span>
                  <span className="text-muted">
                    {formatNumber(plan.subscribers)} · {Math.round((plan.subscribers / active) * 100)}%
                  </span>
                </div>
                <div aria-hidden="true" className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${(plan.subscribers / largest) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}
