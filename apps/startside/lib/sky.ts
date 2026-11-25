import { CHANCE_LABEL, kpNeeded, type AuroraSlot } from "./aurora.ts"
import { addDays, osloTime, TIME_ZONE } from "./day.ts"
import { daylightMinutes, sunDay, type SunDay } from "./sun.ts"

/** The sun and the aurora in words, as the weather page and the front page say them. */

const CLOCK = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE })
const HOUR = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE })
const DATE = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", timeZone: TIME_ZONE })
const KP = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 })

export const formatClock = (date: Date | string): string => CLOCK.format(new Date(date))

/** «7 t 9 min», «45 min», «24 t». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return hours === 0 ? `${rest} min` : rest === 0 ? `${hours} t` : `${hours} t ${rest} min`
}

/** The first day after `date` (within a season) whose sun is not of `kind`: when the polar night or the midnight sun ends. */
function endOf(kind: SunDay["kind"], date: string, lat: number, lon: number): string | null {
  for (let day = 1; day <= 120; day += 1) {
    const next = addDays(date, day)
    if (sunDay(next, lat, lon).kind !== kind) return next
  }
  return null
}

/** A number and what it counts, as the page shows it large (the design system's `KeyFigure`). */
export interface Figure {
  value: string
  label: string
}

/** The sun today as figures: the sunrise, the sunset and the daylight with its change since yesterday; or the polar night or the midnight sun and when it ends. */
export function sunFigures(date: string, lat: number, lon: number): Figure[] {
  const today = sunDay(date, lat, lon)
  const shortDate = (day: string) => DATE.format(new Date(`${day}T12:00:00Z`))
  if (today.kind !== "normal") {
    const until = endOf(today.kind, date, lat, lon)
    const polar = today.kind === "polar-night"
    return [{ value: polar ? "Mørketid" : "Midnattssol", label: polar ? "sola er under horisonten" : "sola er oppe hele døgnet" }, ...(until === null ? [] : [{ value: shortDate(until), label: polar ? "sola er tilbake" : "sola går ned igjen" }])]
  }
  const change = daylightMinutes(today) - daylightMinutes(sunDay(addDays(date, -1), lat, lon))
  return [
    { value: formatClock(today.rise), label: "soloppgang" },
    { value: formatClock(today.set), label: "solnedgang" },
    { value: formatDuration(daylightMinutes(today)), label: change === 0 ? "dagslys, som i går" : `dagslys, ${formatDuration(Math.abs(change))} ${change > 0 ? "lengre" : "kortere"}` },
  ]
}

const MONTH = new Intl.DateTimeFormat("nb-NO", { month: "short", timeZone: TIME_ZONE })

/** The daylight in hours on the 15th of each month of a year, for the shape of the year; `month` is the date's month (`YYYY-MM`). */
export function daylightByMonth(year: number, lat: number, lon: number): { month: string; label: string; hours: number }[] {
  return Array.from({ length: 12 }, (_, index) => {
    const month = `${year}-${String(index + 1).padStart(2, "0")}`
    return { month, label: MONTH.format(new Date(`${month}-15T12:00:00Z`)).replace(".", ""), hours: Math.round(daylightMinutes(sunDay(`${month}-15`, lat, lon)) / 6) / 10 }
  })
}

/** «21–24». */
export const slotHours = (slot: Pick<AuroraSlot, "from" | "to">): string => `${HOUR.format(new Date(slot.from))}–${HOUR.format(new Date(slot.to)).replace(/^00$/, "24")}`
/** «i kveld» for a slot that starts in the afternoon or evening in Oslo, «i natt» for one after midnight. */
export const nightWord = (slot: Pick<AuroraSlot, "from">): string => (osloTime(new Date(slot.from)).hour >= 12 ? "i kveld" : "i natt")
export const formatKp = (kp: number): string => `Kp ${KP.format(kp)}`

/** One slot's figures: «Kp 4,7 · 10 % skyer». */
export function slotLine(slot: AuroraSlot): string {
  return slot.clouds === null ? formatKp(slot.kp) : `${formatKp(slot.kp)} · ${slot.clouds} % skyer`
}

/** The words for a chance, short, as a figure. */
const CHANCE_SHORT = { god: "God", mulig: "Mulig", liten: "Liten" } as const

/** The coming night as figures: the best time and its chance, the Kp it takes here, and how much of the moon is lit (`lit` 0–1, or `null`). */
export function auroraFigures(best: AuroraSlot | undefined, lat: number, lit: number | null): Figure[] {
  const needed = { value: formatKp(Math.round(kpNeeded(lat) * 2) / 2), label: "trengs her" }
  const moon = lit === null ? [] : [{ value: `${Math.round(lit * 100)} %`, label: "av månen opplyst" }]
  if (best === undefined) return [{ value: "For lyst", label: "for nordlys det neste døgnet" }, needed, ...moon]
  return [
    { value: slotHours(best), label: `beste tid ${nightWord(best)}` },
    { value: CHANCE_SHORT[best.chance], label: best.chance === "liten" && best.sky !== "liten" ? "sjanse, skyene skjuler" : "sjanse for nordlys" },
    needed,
    ...moon,
  ]
}

export { CHANCE_LABEL }
