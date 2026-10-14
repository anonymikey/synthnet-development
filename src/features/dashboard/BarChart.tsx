import { formatNumber } from "@/lib/utils/format";
import type { RevenuePoint } from "@/types/overview";

interface BarChartProps {
  data: readonly RevenuePoint[];
  summary: string;
  caption: string;
}

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { left: 48, right: 12, top: 26, bottom: 28 };

function niceMax(value: number): number {
  const step = value > 100000 ? 100000 : 10000;
  return Math.ceil(value / step) * step;
}

function compact(value: number): string {
  return value >= 1000 ? `${formatNumber(Math.round(value / 1000))}k` : String(value);
}

/** Dependency-free bar chart. Every bar carries a value label, so colour is never the only cue. */
export function BarChart({ data, summary, caption }: BarChartProps) {
  const max = niceMax(Math.max(...data.map((d) => d.amount)));
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const slot = innerW / data.length;
  const barW = slot * 0.5;
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;
  const ticks = [0, 1, 2, 3, 4].map((step) => (max * step) / 4);

  return (
    <figure>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary} className="h-auto w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-line" strokeWidth="1" />
            <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted" fontSize="11">
              {compact(tick)}
            </text>
          </g>
        ))}
        {data.map((point, index) => {
          const cx = PAD.left + slot * index + slot / 2;
          const latest = index === data.length - 1;
          return (
            <g key={point.label}>
              <rect
                x={cx - barW / 2}
                y={y(point.amount)}
                width={barW}
                height={PAD.top + innerH - y(point.amount)}
                rx="3"
                className={latest ? "fill-accent" : "fill-signal/60"}
              />
              <text x={cx} y={y(point.amount) - 6} textAnchor="middle" className="fill-fg" fontSize="11" fontWeight="600">
                {compact(point.amount)}
              </text>
              <text x={cx} y={HEIGHT - 8} textAnchor="middle" className="fill-muted" fontSize="11">
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-3 text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}
