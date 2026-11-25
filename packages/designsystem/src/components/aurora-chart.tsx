import { type AuroraChartSlot, darkAt, formatKp, formatSlot, summariseAurora } from "../lib/aurora-chart"
import { greyStep } from "../lib/chart-colors"
import { type MeteogramDark, dayOf, formatDay, formatHour, placeDark } from "../lib/meteogram"
import { ChartEmpty } from "./chart-empty"
import { ChartSummary } from "./chart-summary"
import { ChartTable } from "./chart-table"

interface AuroraChartProps {
  /** The Kp index every three hours, in order, as NOAA gives it: the last day measured and the next days forecast. */
  data: readonly AuroraChartSlot[]
  /** The Kp the place needs for the aurora to be seen over it (about 0 in Tromsø, 5 in Oslo): drawn as a dashed line. */
  needed: number
  /** The spans without the sun (sunset to sunrise, ISO), as for the `Meteogram`: shaded, and only a column in the dark can reach. */
  dark?: readonly MeteogramDark[]
  /** Now (ISO): a line that parts what was measured from what is forecast. */
  now?: string
  /** Names the chart for a screen reader: «Nordlys i Oslo de neste tre døgnene». */
  ariaLabel: string
  /** A text that says what it shows; by default the highest Kp and the dark hours that reach the line (`summariseAurora`). */
  summary?: string
}

/** The drawing's own fixed height, in rem (ten lines of the root's text). */
const HEIGHT = "10rem"
const TICKS = [0, 3, 6, 9] as const
const REACH = "var(--primary)"
const REST = greyStep(36)
const top = (kp: number): number => 100 - (Math.min(Math.max(kp, 0), 9) / 9) * 100

/**
 * The chance of the northern lights through the next days: the Kp index (how active the Earth's magnetic field is, 0–9) as a column every three
 * hours, the Kp the place needs as a dashed line, and the dark hours shaded. A column that reaches the line in the dark is in the accent, the rest
 * a grey; the line and the shade say it as well as the colour, and the summary says it in words. A plain `<svg>` and positioned text, rendered on
 * the server, like the `Meteogram` beside it; every slot (time, Kp, measured or forecast, clouds) is a table under it.
 */
export function AuroraChart({ data: slots, needed, dark = [], now, ariaLabel, summary }: AuroraChartProps) {
  if (slots.length === 0) return <ChartEmpty what="nordlysvarsler" />
  const count = slots.length
  const { spans } = placeDark(slots, dark, 3)
  const darkness = slots.map((_, index) => darkAt(index, spans))
  const first = new Date(slots[0]?.time ?? "").getTime()
  const at = (time: string): number => (new Date(time).getTime() - first) / (3 * 3_600_000)
  const nowAt = now === undefined ? null : at(now)
  const shownNow = nowAt !== null && nowAt >= 0 && nowAt <= count ? nowAt : null
  // A day's name too near «Nå» (a sixth of the width before it, a twelfth after) is left out, so the two never run into each other on a phone.
  const days = slots.flatMap((slot, index) => (index === 0 || dayOf(slot.time) !== dayOf(slots[index - 1]?.time ?? "") ? [index] : [])).filter((index) => shownNow === null || index < shownNow - count / 6 || index > shownNow + count / 12)
  const text = summary ?? summariseAurora(slots, needed, darkness)
  const line = top(needed)
  const clouds = slots.some((slot) => slot.clouds !== undefined && slot.clouds !== null)
  return (
    <div className="@container grid gap-3">
      <div role="img" aria-label={ariaLabel} className="text-muted-foreground grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2 text-xs tabular-nums">
        <span />
        <div className="relative h-5" aria-hidden>
          {days.map((index) => (
            <span key={index} className="text-foreground absolute top-0 font-medium whitespace-nowrap" style={{ left: `${(index / count) * 100}%` }}>
              {formatDay(slots[index]?.time ?? "")}
            </span>
          ))}
          {shownNow === null ? null : (
            <span className="text-foreground absolute top-0 -translate-x-1/2 font-medium" style={{ left: `${(shownNow / count) * 100}%` }}>
              Nå
            </span>
          )}
        </div>
        <div className="relative" style={{ height: HEIGHT }} aria-hidden>
          {TICKS.map((tick) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2 whitespace-nowrap" style={{ top: `${top(tick)}%` }}>
              {tick === 0 ? "Kp 0" : tick}
            </span>
          ))}
        </div>
        <div className="relative" style={{ height: HEIGHT }}>
          <svg className="block h-full w-full overflow-visible" viewBox={`0 0 ${count} 100`} preserveAspectRatio="none" aria-hidden>
            {spans.map((span) => (
              <rect key={span.from} x={span.from} y={0} width={span.to - span.from} height={100} fill="var(--foreground)" fillOpacity={0.06} />
            ))}
            {TICKS.map((tick) => (
              <line key={tick} x1={0} x2={count} y1={top(tick)} y2={top(tick)} stroke={tick === 0 ? "var(--muted-foreground)" : "var(--border)"} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {days
              .filter((index) => index > 0)
              .map((index) => (
                <line key={index} x1={index} x2={index} y1={0} y2={100} stroke="var(--border)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              ))}
            {slots.map((slot, index) => (
              <rect key={slot.time} data-chart-mark x={index + 0.15} y={top(slot.kp)} width={0.7} height={Math.max(100 - top(slot.kp), 0.5)} rx={0.08} fill={slot.kp >= needed && darkness[index] === true ? REACH : REST} />
            ))}
            <line x1={0} x2={count} y1={line} y2={line} stroke="var(--foreground)" strokeWidth={1.5} strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
            {nowAt === null || nowAt < 0 || nowAt > count ? null : <line x1={nowAt} x2={nowAt} y1={0} y2={100} stroke="var(--foreground)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />}
          </svg>
          <span className="bg-background/80 text-foreground absolute right-0 -translate-y-full rounded px-1 whitespace-nowrap" style={{ top: `${line}%` }} aria-hidden>
            {formatKp(needed)} trengs her
          </span>
        </div>
        <span />
        <div className="relative mt-1 h-5" aria-hidden>
          {slots.map((slot, index) =>
            index % 2 === 0 ? (
              <span key={slot.time} className={`absolute top-0 -translate-x-1/2 ${index % 4 === 2 ? "@max-[32rem]:hidden" : ""}`} style={{ left: `${(index / count) * 100}%` }}>
                {formatHour(slot.time)}
              </span>
            ) : null,
          )}
        </div>
      </div>
      {text === null ? null : <ChartSummary text={text} />}
      <ChartTable
        caption={ariaLabel}
        columns={["Tid", "Kp", "Målt eller varslet", "Mørkt", ...(clouds ? ["Skyer"] : [])]}
        rows={slots.map((slot, index) => [
          formatSlot(slot.time),
          formatKp(slot.kp),
          slot.observed === true ? "Målt" : "Varslet",
          darkness[index] === true ? "Ja" : "Nei",
          ...(clouds ? [slot.clouds === undefined || slot.clouds === null ? "–" : `${slot.clouds} %`] : []),
        ])}
      />
    </div>
  )
}
