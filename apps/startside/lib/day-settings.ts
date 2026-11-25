/**
 * How the front page follows the time of day, as the visitor has set it (the settings page): the `startside_day` cookie, a query string.
 * `mode=auto|off`, `greeting=on|off`, `starts=HH:MM,HH:MM,HH:MM,HH:MM` (when morgen, arbeidsdag, kveld and natt start), `weekend=on|off`,
 * `weekenddays=6,0` (0 is Sunday), `show.<part>=id,id` (the sections at that part of the day), `weather.<part>=today|tomorrow` and
 * `pulls.<part>=all|mine`. What is absent, or not understood, is the default, field by field: today's behaviour (lib/day.ts, lib/plan.ts).
 * Pure, so a test pins it.
 */
import type { DayPart } from "./day.ts"
import type { SectionId } from "./plan.ts"

export const DAY_COOKIE = "startside_day"

export const PARTS: readonly DayPart[] = ["morgen", "arbeidsdag", "kveld", "natt"]
export const PART_LABEL: Record<DayPart, string> = { morgen: "Morgen", arbeidsdag: "Arbeidsdag", kveld: "Kveld", natt: "Natt" }

/** Monday first, as a Norwegian week; the values are `Date.getDay()`'s. */
export const WEEKDAYS: readonly { value: string; label: string }[] = [
  { value: "1", label: "Mandag" },
  { value: "2", label: "Tirsdag" },
  { value: "3", label: "Onsdag" },
  { value: "4", label: "Torsdag" },
  { value: "5", label: "Fredag" },
  { value: "6", label: "Lørdag" },
  { value: "0", label: "Søndag" },
]
const SECTION_IDS: readonly SectionId[] = ["alerts", "pulls", "issues", "discussions", "weather"]

export type OnOff = "on" | "off"
export type WeatherWindow = "today" | "tomorrow"
export type PullsMode = "all" | "mine"

export interface DaySettings {
  /** `off`: the same front page all day (every chosen section, the weather for today, all pull requests). */
  mode: "auto" | "off"
  greeting: OnOff
  /** When each part of the day starts, in minutes after midnight, Oslo time; increasing in the day's cyclic order from the morning. */
  starts: Record<DayPart, number>
  /** Whether weekends have their own behaviour (`weekendPlan` in lib/plan.ts). */
  weekend: OnOff
  /** The days that are weekend days, 0 (Sunday) to 6 (Saturday). */
  weekendDays: number[]
  show: Record<DayPart, SectionId[]>
  weather: Record<DayPart, WeatherWindow>
  pulls: Record<DayPart, PullsMode>
}

export const DEFAULT_DAY_SETTINGS: DaySettings = {
  mode: "auto",
  greeting: "on",
  starts: { morgen: 5 * 60, arbeidsdag: 9 * 60, kveld: 16 * 60, natt: 22 * 60 },
  weekend: "on",
  weekendDays: [6, 0],
  show: {
    morgen: ["weather", "alerts", "pulls", "issues", "discussions"],
    arbeidsdag: ["alerts", "pulls", "issues", "discussions", "weather"],
    kveld: ["alerts", "pulls", "weather"],
    natt: ["weather"],
  },
  weather: { morgen: "today", arbeidsdag: "today", kveld: "tomorrow", natt: "tomorrow" },
  pulls: { morgen: "all", arbeidsdag: "all", kveld: "mine", natt: "mine" },
}

const MINUTES_IN_DAY = 24 * 60
/** The steps a start can be set in. */
export const START_STEP = 15

/** `HH:MM` (or `H:MM`, or a whole hour `H`), 00:00–23:45 in steps of 15 minutes, as minutes after midnight; `null` for anything else. */
export function parseTime(value: string | null | undefined): number | null {
  const match = /^\s*(\d{1,2})(?::(\d{2}))?\s*$/.exec(value ?? "")
  if (match === null) return null
  const hours = Number(match[1])
  const minutes = Number(match[2] ?? "0")
  if (hours > 23 || minutes > 59 || minutes % START_STEP !== 0) return null
  return hours * 60 + minutes
}

/** Minutes after midnight as `HH:MM`. */
export function formatTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

/** Whether the starts follow one another around the clock: arbeidsdag after morgen, kveld after that, natt after that, before morgen again. */
export function startsInOrder(starts: Record<DayPart, number>): boolean {
  const offsets = PARTS.map((part) => (starts[part] - starts.morgen + MINUTES_IN_DAY) % MINUTES_IN_DAY)
  return offsets.every((offset, index) => index === 0 || offset > offsets[index - 1])
}

const isOnOff = (value: string | null): value is OnOff => value === "on" || value === "off"
const isWeather = (value: string | null): value is WeatherWindow => value === "today" || value === "tomorrow"
const isPulls = (value: string | null): value is PullsMode => value === "all" || value === "mine"

/** Section ids, the known ones, each once, in the canonical order; an empty list is allowed (nothing at that time). */
export function sectionList(values: Iterable<string>): SectionId[] {
  const wanted = new Set([...values].map((value) => value.trim()))
  return SECTION_IDS.filter((id) => wanted.has(id))
}

/** Weekday numbers 0–6, each once, in the order given; `null` when something was written and none of it was a day. */
export function weekdayList(values: Iterable<string>): number[] | null {
  const written = [...values].map((value) => value.trim()).filter((value) => value !== "")
  const days = [...new Set(written.filter((value) => /^[0-6]$/.test(value)).map(Number))]
  return written.length > 0 && days.length === 0 ? null : days
}

const perPart = <T>(read: (part: DayPart) => T): Record<DayPart, T> => Object.fromEntries(PARTS.map((part) => [part, read(part)])) as Record<DayPart, T>

/** The cookie's value read back (raw, still encoded, or decoded); each field that is missing or not understood is its default. */
export function parseDaySettings(value: string | null | undefined): DaySettings {
  let text = value ?? ""
  try {
    text = decodeURIComponent(text)
  } catch {
    // Not encoded after all: read as it is.
  }
  const params = new URLSearchParams(text.slice(0, 2000))
  const fallback = DEFAULT_DAY_SETTINGS
  const mode = params.get("mode")
  const greeting = params.get("greeting")
  const weekend = params.get("weekend")
  const writtenStarts = (params.get("starts") ?? "").split(",").map(parseTime)
  const starts =
    writtenStarts.length === PARTS.length && writtenStarts.every((start) => start !== null) ? perPart((part) => writtenStarts[PARTS.indexOf(part)] as number) : undefined
  const days = params.has("weekenddays") ? weekdayList((params.get("weekenddays") ?? "").split(",")) : null
  return {
    mode: mode === "auto" || mode === "off" ? mode : fallback.mode,
    greeting: isOnOff(greeting) ? greeting : fallback.greeting,
    starts: starts !== undefined && startsInOrder(starts) ? starts : { ...fallback.starts },
    weekend: isOnOff(weekend) ? weekend : fallback.weekend,
    weekendDays: days ?? [...fallback.weekendDays],
    show: perPart((part) => {
      const written = params.get(`show.${part}`)
      return written === null ? [...fallback.show[part]] : sectionList(written.split(","))
    }),
    weather: perPart((part) => {
      const written = params.get(`weather.${part}`)
      return isWeather(written) ? written : fallback.weather[part]
    }),
    pulls: perPart((part) => {
      const written = params.get(`pulls.${part}`)
      return isPulls(written) ? written : fallback.pulls[part]
    }),
  }
}

const sameSet = <T>(a: readonly T[], b: readonly T[]): boolean => a.length === b.length && a.every((item) => b.includes(item))

/** The cookie's value (not yet encoded for a cookie): only what differs from the default, so the cookie stays small; `""` is all defaults. */
export function serializeDaySettings(settings: DaySettings): string {
  const fallback = DEFAULT_DAY_SETTINGS
  const params = new URLSearchParams()
  if (settings.mode !== fallback.mode) params.set("mode", settings.mode)
  if (settings.greeting !== fallback.greeting) params.set("greeting", settings.greeting)
  if (PARTS.some((part) => settings.starts[part] !== fallback.starts[part])) params.set("starts", PARTS.map((part) => formatTime(settings.starts[part])).join(","))
  if (settings.weekend !== fallback.weekend) params.set("weekend", settings.weekend)
  if (!sameSet(settings.weekendDays, fallback.weekendDays)) params.set("weekenddays", settings.weekendDays.join(","))
  for (const part of PARTS) {
    if (!sameSet(settings.show[part], fallback.show[part])) params.set(`show.${part}`, sectionList(settings.show[part]).join(","))
  }
  for (const part of PARTS) if (settings.weather[part] !== fallback.weather[part]) params.set(`weather.${part}`, settings.weather[part])
  for (const part of PARTS) if (settings.pulls[part] !== fallback.pulls[part]) params.set(`pulls.${part}`, settings.pulls[part])
  return params.toString()
}

const YEAR = 60 * 60 * 24 * 365

/** The `Set-Cookie` that keeps the settings for a year on `path`; all defaults removes the cookie. */
export function dayCookieString(value: string, path: string): string {
  return `${DAY_COOKIE}=${encodeURIComponent(value)}; Path=${path === "" ? "/" : path}; Max-Age=${value === "" ? 0 : YEAR}; SameSite=Lax; Secure`
}

/** What the settings page's form said about the time of day; only read when the form has `day=1`. */
export type DayForm = { settings: DaySettings; errors: { starts?: string }; written: { starts?: string } }

/**
 * The settings with what the form changed. A radio or time field that is absent is left as it is. A checkbox group sends nothing when none
 * is ticked, so the form says which groups it has (`has=weekenddays`, `has=show`, hidden): those are read as they are (none ticked is none;
 * do not disable them), the others are left as they are. Each settings subpage has only its own fields. The starts are
 * `starts.morgen`, `starts.arbeidsdag`, `starts.kveld` and `starts.natt` (`HH:MM`); written wrong or out of order they are left as they
 * were, and the error says why.
 */
export function readDayForm(form: FormData, current: DaySettings): DayForm {
  const get = (name: string): string | null => {
    const value = form.get(name)
    return typeof value === "string" ? value : null
  }
  const has = form.getAll("has").map(String)
  const mode = get("mode")
  const greeting = get("greeting")
  const weekend = get("weekend")
  const result: DayForm = {
    settings: {
      mode: mode === "auto" || mode === "off" ? mode : current.mode,
      greeting: isOnOff(greeting) ? greeting : current.greeting,
      starts: { ...current.starts },
      weekend: isOnOff(weekend) ? weekend : current.weekend,
      weekendDays: has.includes("weekenddays") ? (weekdayList(form.getAll("weekenddays").map(String)) ?? [...current.weekendDays]) : [...current.weekendDays],
      show: perPart((part) => (has.includes("show") ? sectionList(form.getAll(`show.${part}`).map(String)) : [...current.show[part]])),
      weather: perPart((part) => {
        const written = get(`weather.${part}`)
        return isWeather(written) ? written : current.weather[part]
      }),
      pulls: perPart((part) => {
        const written = get(`pulls.${part}`)
        return isPulls(written) ? written : current.pulls[part]
      }),
    },
    errors: {},
    written: {},
  }
  const written = PARTS.map((part) => get(`starts.${part}`))
  if (written.every((value) => value === null)) return result
  result.written.starts = written.map((value) => value ?? "").join(",")
  const parsed = written.map((value, index) => (value === null ? current.starts[PARTS[index]] : parseTime(value)))
  const wrong = parsed.findIndex((value) => value === null)
  if (wrong !== -1) {
    result.errors.starts = `«${(written[wrong] ?? "").slice(0, 20)}» er ikke et klokkeslett. Skriv det som TT:MM, i hele kvarter, for eksempel 05:00.`
    return result
  }
  const starts = perPart((part) => parsed[PARTS.indexOf(part)] as number)
  if (!startsInOrder(starts)) {
    result.errors.starts = "Delene av døgnet må komme etter hverandre: morgen, så arbeidsdag, så kveld, så natt, før morgenen igjen."
    return result
  }
  result.settings.starts = starts
  return result
}

/** The time of day in a few words, for the settings overview: «Av», or «Automatisk · morgen fra 05:00» (and what differs from the defaults' kind). */
export function daySummary(settings: DaySettings): string {
  if (settings.mode === "off") return "Av · samme forside hele dagen"
  const parts = [`Automatisk · morgen fra ${formatTime(settings.starts.morgen)}`]
  if (settings.weekend === "off") parts.push("ingen egen helg")
  if (settings.greeting === "off") parts.push("uten hilsen")
  return parts.join(" · ")
}

/** A part of the day from its start to the next part's: «05:00–09:00». */
export function partSpan(starts: Record<DayPart, number>, part: DayPart): string {
  return `${formatTime(starts[part])}–${formatTime(starts[PARTS[(PARTS.indexOf(part) + 1) % PARTS.length]])}`
}

/** The overview's line for the starts: «Morgen 05:00 · arbeidsdag 09:00 · kveld 16:00 · natt 22:00». */
export function startsSummary(starts: Record<DayPart, number>): string {
  return PARTS.map((part, index) => `${index === 0 ? PART_LABEL[part] : PART_LABEL[part].toLowerCase()} ${formatTime(starts[part])}`).join(" · ")
}

const listed = (names: readonly string[]): string => (names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} og ${names.at(-1)}`)

/** The overview's line for the weekend: «Av», or the days, Monday first («Lørdag og søndag»), or that there are none. */
export function weekendSummary(settings: Pick<DaySettings, "weekend" | "weekendDays">): string {
  if (settings.weekend === "off") return "Av · alle dager er like"
  const days = WEEKDAYS.filter((day) => settings.weekendDays.includes(Number(day.value))).map((day, index) => (index === 0 ? day.label : day.label.toLowerCase()))
  return days.length === 0 ? "Ingen helgedager valgt" : listed(days)
}

/** The overview's line for what each part shows: «Alt hele døgnet», or how many sections each part has. */
export function showSummary(show: Record<DayPart, readonly string[]>, all: number): string {
  if (PARTS.every((part) => show[part].length === all)) return "Alt hele døgnet"
  return PARTS.map((part, index) => `${index === 0 ? PART_LABEL[part] : PART_LABEL[part].toLowerCase()} ${show[part].length}`).join(" · ") + ` av ${all}`
}

/** A part's line: its span, the weather and the pull requests («05:00–09:00 · været i dag · alle pull requests»). */
export function partSummary(settings: DaySettings, part: DayPart): string {
  return [partSpan(settings.starts, part), settings.weather[part] === "today" ? "været i dag" : "været i morgen", settings.pulls[part] === "all" ? "alle pull requests" : "bare dine pull requests"].join(" · ")
}
