export const TIME_ZONE = "Europe/Oslo"

export const clock = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE })
export const dateLine = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: TIME_ZONE })
export const short = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", timeZone: TIME_ZONE })
export const long = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE })
export const number = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 })

/** A temperature with the sign and the degree: `−3°` (the minus sign, not a hyphen). */
export const degrees = (value: number): string => `${Math.round(value) < 0 ? "−" : ""}${Math.abs(Math.round(value))}°`

/** Oslo's offset from UTC at an instant, in minutes: 60 in winter, 120 in summer. */
export function osloOffsetMinutes(instant: Date): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "shortOffset" }).formatToParts(instant).find((part) => part.type === "timeZoneName")?.value ?? "GMT+1"
  const [, sign, hours, minutes] = /GMT([+-])(\d+)(?::(\d+))?/.exec(name) ?? [, "+", "1", "0"]
  return (sign === "-" ? -1 : 1) * (Number(hours) * 60 + Number(minutes ?? 0))
}

/** Oslo's offset as ISO writes it: «+01:00». */
export const osloOffset = (instant: Date): string => `+${String(osloOffsetMinutes(instant) / 60).padStart(2, "0")}:00`
