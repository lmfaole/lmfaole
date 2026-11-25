/** Calendar dates (`YYYY-MM-DD`, no time of day): written out, and counted in years. Pure, with no time zone to move a date. */

const LONG_DAY = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

/** A calendar date (`YYYY-MM-DD`, no time of day) as «25. april 1940»: in UTC, so no time zone moves it a day. */
export function longDay(date: string): string {
  return LONG_DAY.format(new Date(`${date}T12:00:00Z`))
}

/** How old a person is (or was when they died) on the day, in whole years, from two calendar dates. */
export function ageOn(born: string, until: string): number | null {
  const [by, bm, bd] = born.split("-").map(Number)
  const [uy, um, ud] = until.split("-").map(Number)
  if (by === undefined || bm === undefined || bd === undefined || uy === undefined || um === undefined || ud === undefined) return null
  const years = uy - by - (um < bm || (um === bm && ud < bd) ? 1 : 0)
  return years >= 0 ? years : null
}

const MONTH_YEAR = new Intl.DateTimeFormat("nb-NO", { month: "long", year: "numeric", timeZone: "UTC" })

/** When something came out, as far as it is known: `2023-05-12` is «12. mai 2023», `2023-05` is «mai 2023» and `2023` is «2023»; anything else is nothing. */
export function releaseText(released: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(released)) return longDay(released)
  if (/^\d{4}-\d{2}$/.test(released)) return MONTH_YEAR.format(new Date(`${released}-15T12:00:00Z`))
  return /^\d{4}$/.test(released) ? released : null
}

/** A length in seconds as «3:35» (minutes and two-digit seconds), or «1:02:03» when it is an hour or more. */
export function lengthText(seconds: number): string {
  const total = Math.round(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const rest = String(total % 60).padStart(2, "0")
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}` : `${minutes}:${rest}`
}
