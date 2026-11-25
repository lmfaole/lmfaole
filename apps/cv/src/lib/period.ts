// The years a CV row covers, from its two days: «2023–2025», «2025–nå» while it goes on (no end day), one year when both fall in it.

const yearOf = (day: string): string => day.slice(0, 4)

export function periodLabel(from: string | null, to: string | null, fallbackYear: number): string {
  const start = from === null ? String(fallbackYear) : yearOf(from)
  if (to === null) return `${start}–nå`
  const end = yearOf(to)
  return end === start ? start : `${start}–${end}`
}
