interface ChartSeries {
  id: string;
  label: string;
  values: number[];
  strokeClass: string;
  dashed?: boolean;
}

interface UsageChartProps {
  series: ChartSeries[];
  xLabels: ReadonlyArray<{ index: number; label: string }>;
  /** Text under the chart, for example "Peak throughput (Mbps), hourly". */
  caption: string;
  /** Plain-language description for screen readers. */
  summary: string;
}

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { left: 44, right: 12, top: 12, bottom: 28 };

function niceMax(value: number): number {
  const step = value > 1000 ? 250 : value > 400 ? 100 : 50;
  return Math.ceil(value / step) * step;
}

/** Dependency-free responsive line chart. Series differ by dash style as well as colour. */
export function UsageChart({ series, xLabels, caption, summary }: UsageChartProps) {
  const points = Math.max(...series.map((s) => s.values.length));
  const max = niceMax(Math.max(...series.flatMap((s) => s.values)));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (index / Math.max(1, points - 1)) * innerW;
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;
  const ticks = [0, 1, 2, 3, 4].map((step) => (max * step) / 4);

  return (
    <figure>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary} className="h-auto w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-line" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted" fontSize="11">
              {Math.round(tick)}
            </text>
          </g>
        ))}
        {xLabels.map((tick) => (
          <text key={tick.label} x={x(tick.index)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted" fontSize="11">
            {tick.label}
          </text>
        ))}
        {series.map((s) => (
          <path
            key={s.id}
            d={s.values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)} ${y(value).toFixed(1)}`).join(" ")}
            fill="none"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={s.dashed ? "7 5" : undefined}
            className={s.strokeClass}
          />
        ))}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
        {series.map((s) => (
          <span key={s.id} className="inline-flex items-center gap-2">
            <svg width="22" height="8" aria-hidden="true">
              <line
                x1="0"
                x2="22"
                y1="4"
                y2="4"
                strokeWidth="2.5"
                strokeDasharray={s.dashed ? "5 3" : undefined}
                className={s.strokeClass}
              />
            </svg>
            {s.label}
          </span>
        ))}
        <span className="ml-auto">{caption}</span>
      </figcaption>
    </figure>
  );
}
