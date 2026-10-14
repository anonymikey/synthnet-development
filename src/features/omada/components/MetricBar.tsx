interface MetricBarProps {
  label: string;
  /** 0 to 100. */
  percent: number;
  valueText: string;
}

/** A labelled meter exposed as text and as progressbar semantics. */
export function MetricBar({ label, percent, valueText }: MetricBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const tone = clamped >= 80 ? "bg-danger" : clamped >= 60 ? "bg-warning" : "bg-accent";
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-fg">{valueText}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-valuetext={valueText}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
      >
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
