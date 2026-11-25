/** The texts the calendar and the dumbbell say about themselves when nobody has written better, in Norwegian. See `chart-summary.ts` for the simple ones. */
import { formatChartValue as fmt } from "./chart-format.ts"
import { dayName, type CalendarDay } from "./heatmap.ts"

/** What a value counts: one word for every number («min»), or the singular and the plural («1 visning», «2 visninger»). */
export type Unit = string | { one: string; many: string }

/** The word for `n` of the unit; the plural for a word that has no singular given. */
export const unitWord = (n: number, unit: Unit): string => (typeof unit === "string" ? unit : n === 1 ? unit.one : unit.many)

export function summariseCalendar(days: readonly CalendarDay[], unit: Unit): string | null {
  if (days.length === 0) return null
  const sorted = days.toSorted((a, b) => a.date.localeCompare(b.date))
  const total = sorted.reduce((sum, day) => sum + day.value, 0)
  const active = sorted.filter((day) => day.value > 0)
  const busiest = sorted.reduce((best, day) => (day.value > best.value ? day : best), sorted[0] ?? { date: "", value: 0 })
  const range = `${dayName(sorted[0]?.date ?? "")} til ${dayName(sorted.at(-1)?.date ?? "")}`
  const peak = busiest.value > 0 ? ` Travleste dag: ${dayName(busiest.date)} (${fmt(busiest.value)}).` : ""
  return `Kalenderdiagram, ${range}: ${fmt(total)} ${unitWord(total, unit)} på ${fmt(active.length)} av ${fmt(sorted.length)} dager.${peak}`
}

export function summariseDumbbell(rows: readonly { label: string; from: number; to: number }[], fromLabel: string, toLabel: string): string | null {
  const first = rows[0]
  if (first === undefined) return null
  const change = (row: { from: number; to: number }) => row.to - row.from
  const biggest = rows.reduce((best, row) => (Math.abs(change(row)) > Math.abs(change(best)) ? row : best), first)
  const up = rows.filter((row) => change(row) > 0).length
  const down = rows.filter((row) => change(row) < 0).length
  return `Endring fra ${fromLabel} til ${toLabel}: ${fmt(up)} opp, ${fmt(down)} ned. Størst endring: ${biggest.label} (${change(biggest) > 0 ? "+" : ""}${fmt(change(biggest))}).`
}
