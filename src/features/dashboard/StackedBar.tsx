import { formatNumber } from "@/lib/utils/format";

export interface StackedSegment {
  label: string;
  value: number;
  /** Tailwind background class, for example "bg-success". */
  className: string;
}

interface StackedBarProps {
  segments: readonly StackedSegment[];
  summary: string;
}

/** A proportion bar with a labelled legend, so every segment is named and counted in text. */
export function StackedBar({ segments, summary }: StackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div>
      <div role="img" aria-label={summary} className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {segments.map((segment) =>
          segment.value > 0 ? (
            <div
              key={segment.label}
              className={segment.className}
              style={{ width: `${(segment.value / Math.max(1, total)) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        {segments.map((segment) => (
          <li key={segment.label} className="inline-flex items-center gap-2 text-fg">
            <span aria-hidden="true" className={`size-2.5 rounded-sm ${segment.className}`} />
            {segment.label}
            <span className="text-muted">{formatNumber(segment.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
