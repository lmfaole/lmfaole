import { formatChartValue } from "../lib/chart-format"
import { summariseDumbbell } from "../lib/chart-summary-complex"
import { type DumbbellRow, axisPosition, axisRange, sortByChange } from "../lib/dumbbell"
import { ENTITY_LINK, STRETCHED_LINK, STRETCHED_ROW } from "../lib/link-style"
import { ChartEmpty } from "./chart-empty"
import { ChartSummary } from "./chart-summary"
import { ChartTable } from "./chart-table"

interface DumbbellChartProps {
  /** One row per thing, with its value at the start and at the end: two years, before and after. At most twelve. */
  data: readonly DumbbellRow[]
  /** What the two moments are called: «2024», «2025». */
  fromLabel: string
  toLabel: string
  ariaLabel: string
  /** How a value is written next to its row; the number as it is by default. */
  formatValue?: (value: number) => string
  /** Keep the order given; by default the biggest change comes first. */
  keepOrder?: boolean
  summary?: string
}

const sign = (delta: number): string => (delta > 0 ? "+" : delta < 0 ? "" : "±")

/**
 * The change in several things between two moments, a dot at the start and a dot at the end joined by a line (a dumbbell, the slope chart's
 * horizontal cousin): the place of a dot on one shared axis is read more exactly than the height of two columns, and the gap is the change. The start is a
 * hollow ring and the end a smaller filled dot, so even two values that are the same still show both, so the direction is not told by colour; the change is also written as a number and its sign. Biggest change first.
 * The dots and the line are in `--chart-accent` (the theme's primary by default); the exact values are in «Vis tallene». For more than two moments it is an `AreaChart` per thing; for one value against a goal, `Progress`. A row with `href` (a day's own forecast) has its label as a
 * link that covers the whole row (the values and the dumbbell too), and the rows are then a list a screen reader moves through rather than one picture.
 */
export function DumbbellChart({ data: rows, fromLabel, toLabel, ariaLabel, formatValue = formatChartValue, keepOrder = false, summary }: DumbbellChartProps) {
  if (rows.length === 0) return <ChartEmpty what="data" />
  const shown = keepOrder ? [...rows] : sortByChange(rows)
  const { min, max } = axisRange(shown)
  const text = summary ?? summariseDumbbell(shown, fromLabel, toLabel)
  return (
    <div className="grid gap-3">
      <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-full border-2 border-current" />
          {fromLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-current" />
          {toLabel}
        </span>
      </div>
      {shown.some((row) => row.href !== undefined) ? (
        // With links the rows are a list a screen reader can move through: each its label (a link) and its values in words, the drawing hidden.
        <ul aria-label={ariaLabel} className="grid gap-4">
          {shown.map((row) => (
            <li key={row.label} className={row.href === undefined ? undefined : STRETCHED_ROW}>
              <Row row={row} min={min} max={max} formatValue={formatValue} linked />
            </li>
          ))}
        </ul>
      ) : (
        <div role="img" aria-label={ariaLabel} className="grid gap-4">
          {shown.map((row) => (
            <div key={row.label} aria-hidden>
              <Row row={row} min={min} max={max} formatValue={formatValue} linked={false} />
            </div>
          ))}
        </div>
      )}
      {text === null ? null : <ChartSummary text={text} />}
      <ChartTable caption={ariaLabel} columns={["Hva", fromLabel, toLabel, "Endring"]} rows={shown.map((row) => [row.label, row.from, row.to, row.to - row.from])} />
    </div>
  )
}

function Row({ row, min, max, formatValue, linked }: { row: DumbbellRow; min: number; max: number; formatValue: (value: number) => string; linked: boolean }) {
  const delta = row.to - row.from
  const start = axisPosition(row.from, min, max)
  const end = axisPosition(row.to, min, max)
  return (
    <div className="grid gap-1.5">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        {linked && row.href !== undefined ? (
          <a href={row.href} data-stretched="" className={`min-w-0 break-words font-medium ${ENTITY_LINK} ${STRETCHED_LINK}`}>
            {row.label}
          </a>
        ) : (
          <span className="min-w-0 break-words font-medium">{row.label}</span>
        )}
        <span className="shrink-0 tabular-nums">
          {formatValue(row.from)} → {formatValue(row.to)} <span className="text-muted-foreground">({sign(delta)}{formatValue(delta)})</span>
        </span>
      </div>
      {/* No pointer events: the dots are positioned, and would otherwise sit above a linked row's cover. */}
      <div className="pointer-events-none relative h-4 text-(--chart-accent,var(--primary))" aria-hidden>
        <span className="bg-border absolute inset-x-0 top-1/2 h-px" />
        <span className="absolute top-1/2 h-0.75 -translate-y-1/2 rounded-full bg-current" style={{ left: `${Math.min(start, end)}%`, width: `${Math.abs(end - start)}%`, opacity: 0.55 }} />
        <span className="bg-background absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-current" style={{ left: `${start}%` }} />
        <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" style={{ left: `${end}%` }} />
      </div>
    </div>
  )
}
