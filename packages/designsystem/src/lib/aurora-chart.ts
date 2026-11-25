import { formatClock, formatDay } from "./meteogram.ts"

/** Three hours of the Kp index (0–9): when they start (ISO), the index, and whether it was measured (`true`) or is forecast. */
export interface AuroraChartSlot {
  time: string
  kp: number
  observed?: boolean
  /** The cloud cover in the three hours (0–100 %), where the app has it; said in the table. */
  clouds?: number | null
}

const KP = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 })

/** «Kp 4,7». */
export const formatKp = (kp: number): string => `Kp ${KP.format(kp)}`

/** «fre. 21–24». */
export function formatSlot(time: string, withDay = true): string {
  const end = new Date(new Date(time).getTime() + 3 * 3_600_000).toISOString()
  const to = formatClock(end).slice(0, 2)
  return `${withDay ? `${formatDay(time)} ` : ""}${formatClock(time).slice(0, 2)}–${to === "00" ? "24" : to}`
}

/** Where a slot starts on the axis, in slots from the first one's start, and whether it is dark at its middle (inside one of the dark spans). */
export function darkAt(slot: number, spans: readonly { from: number; to: number }[]): boolean {
  return spans.some((span) => slot + 0.5 >= span.from && slot + 0.5 < span.to)
}

/**
 * The aurora chart's summary in words: the highest Kp and when, and how many of the dark slots reach the Kp the place needs, or that none do.
 */
export function summariseAurora(slots: readonly AuroraChartSlot[], needed: number, dark: readonly boolean[]): string | null {
  const first = slots[0]
  if (first === undefined) return null
  const highest = slots.reduce((top, slot) => (slot.kp > top.kp ? slot : top), first)
  const runs: { from: string; to: string }[] = []
  let previous = false
  slots.forEach((slot, index) => {
    const reaches = slot.kp >= needed && dark[index] === true
    const last = runs.at(-1)
    if (reaches && previous && last !== undefined) last.to = slot.time
    else if (reaches) runs.push({ from: slot.time, to: slot.time })
    previous = reaches
  })
  const top = `Høyest ${formatKp(highest.kp)} ${formatSlot(highest.time)}.`
  if (runs.length === 0) return `${top} Ingen mørke timer når ${formatKp(needed)}, som trengs her.`
  const when = runs.slice(0, 3).map(({ from, to }) => `${formatSlot(from).split("–")[0]}–${formatSlot(to).split("–")[1]}`).join(", ")
  return `${top} ${formatKp(needed)}, som trengs her, nås i mørket ${when}${runs.length > 3 ? ` og ${runs.length - 3} ${runs.length === 4 ? "gang" : "ganger"} til` : ""}.`
}
