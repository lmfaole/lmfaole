/**
 * Warnings from the authorities where the reader is (farevarsler): MET's weather warnings (MetAlerts) and NVE's flood, landslide and avalanche
 * warnings (Varsom), read into one shape, with the level as the official colour. Green, past and marine warnings are left out. Pure: the
 * answers in, the warnings out; the page passes `now`.
 */
import { osloOffsetMinutes, TIME_ZONE } from "./format.ts"

export type WarningLevel = "yellow" | "orange" | "red"
export type WarningKind = "weather" | "flood" | "landslide" | "avalanche"

export interface Warning {
  key: string
  kind: WarningKind
  level: WarningLevel
  title: string
  area: string
  from: string
  to: string
  description?: string
  source: "MET" | "Varsom"
  href: string
  /** MET's event (`wind`, `snow`, `rain` …), for the icon. */
  event?: string
}

const RANK: Record<WarningLevel, number> = { red: 0, orange: 1, yellow: 2 }

/** The most serious first, then the soonest. */
export const byUrgency = (a: Warning, b: Warning): number => RANK[a.level] - RANK[b.level] || a.from.localeCompare(b.from)

// MET (MetAlerts 2.0) --------------------------------------------------------------------------------------------------------------------------------------------

interface MetFeature {
  properties?: {
    id?: string
    awareness_level?: string
    eventAwarenessName?: string
    event?: string
    area?: string
    description?: string
    consequences?: string
    geographicDomain?: string
    web?: string
    eventEndingTime?: string
  }
  when?: { interval?: string[] }
}

/** Yr's page of warnings, where the full one is when MET's own link is missing. */
export const MET_WARNINGS_PAGE = "https://www.yr.no/nb/farevarsler"

/** `"2; yellow; Moderate"` is yellow; green and anything else is no warning. */
export function metLevel(awareness: string | undefined): WarningLevel | null {
  const colour = awareness?.split(";")[1]?.trim().toLowerCase()
  return colour === "yellow" || colour === "orange" || colour === "red" ? colour : null
}

/** MET's answer for a position (`current.json?lat&lon`): the warnings on land, yellow or worse, not yet over. */
export function parseMetAlerts(body: unknown, now: Date): Warning[] {
  const features = (body as { features?: MetFeature[] } | null)?.features
  if (!Array.isArray(features)) return []
  return features.flatMap((feature): Warning[] => {
    const p = feature.properties
    const level = metLevel(p?.awareness_level)
    const [from, to] = feature.when?.interval ?? []
    if (p === undefined || level === null || from === undefined || p.geographicDomain === "marine") return []
    const end = to ?? p.eventEndingTime ?? from
    if (Date.parse(end) <= now.getTime()) return []
    const web = p.web?.trim()
    return [
      {
        key: `met/${p.id ?? `${p.event}-${from}`}`,
        kind: "weather",
        level,
        title: p.eventAwarenessName ?? "Farevarsel",
        area: p.area ?? "",
        from,
        to: end,
        ...(p.description === undefined ? {} : { description: [p.description, p.consequences].filter(Boolean).join(" ") }),
        source: "MET",
        href: web !== undefined && /^https:\/\//.test(web) ? web : MET_WARNINGS_PAGE,
        ...(p.event === undefined ? {} : { event: p.event }),
      },
    ]
  })
}

// NVE (Varsom: flood, landslide, avalanche) --------------------------------------------------------------------------------------------------------------------

/** NVE's levels: 1 is green, 2 yellow, 3 orange, 4 red; the avalanche scale goes to 5, which is red too. */
export function nveLevel(level: string | number | undefined): WarningLevel | null {
  const n = Number(level)
  return n === 2 ? "yellow" : n === 3 ? "orange" : n >= 4 ? "red" : null
}

interface NveWarning {
  Id?: string
  ActivityLevel?: string
  DangerTypeName?: string | null
  MainText?: string | null
  WarningText?: string | null
  ValidFrom?: string
  ValidTo?: string
  MunicipalityList?: { Id?: string; Name?: string }[] | null
}

const NVE_TITLES = { flood: "Flomfare", landslide: "Jordskredfare" } as const
export const VARSOM_PAGES = { flood: "https://www.varsom.no/flom-og-jordskred/varsling/", landslide: "https://www.varsom.no/flom-og-jordskred/varsling/", avalanche: "https://www.varsom.no/snoskred/varsling/" } as const

/** NVE's times have no zone and are Norwegian time: read in Oslo's offset at the time. */
export function nveTime(value: string): string {
  if (/[zZ]|[+-]\d\d:\d\d$/.test(value)) return new Date(value).toISOString()
  const asUtc = Date.parse(`${value.slice(0, 19)}Z`)
  const offset = osloOffsetMinutes(new Date(asUtc))
  return new Date(asUtc - offset * 60_000).toISOString()
}

/** NVE's flood or landslide warnings for a municipality: yellow or worse, not yet over. */
export function parseNveWarnings(body: unknown, kind: "flood" | "landslide", now: Date): Warning[] {
  if (!Array.isArray(body)) return []
  return (body as NveWarning[]).flatMap((warning): Warning[] => {
    const level = nveLevel(warning.ActivityLevel)
    if (level === null || warning.ValidFrom === undefined || warning.ValidTo === undefined) return []
    const to = nveTime(warning.ValidTo)
    if (Date.parse(to) <= now.getTime()) return []
    return [
      {
        key: `${kind}/${warning.Id ?? warning.ValidFrom}`,
        kind,
        level,
        title: warning.DangerTypeName ?? NVE_TITLES[kind],
        area: (warning.MunicipalityList ?? []).map((one) => one.Name).filter(Boolean).join(", "),
        from: nveTime(warning.ValidFrom),
        to,
        ...(warning.MainText ? { description: warning.MainText } : {}),
        source: "Varsom",
        href: VARSOM_PAGES[kind],
      },
    ]
  })
}

interface AvalancheWarning {
  RegionId?: number
  RegionName?: string
  DangerLevel?: string
  MainText?: string | null
  ValidFrom?: string
  ValidTo?: string
}

/** NVE's avalanche warning for the region a position is in: level 2 or more, not yet over. The region's own page has the full one. */
export function parseAvalanche(body: unknown, now: Date): Warning[] {
  if (!Array.isArray(body)) return []
  return (body as AvalancheWarning[]).flatMap((warning): Warning[] => {
    const level = nveLevel(warning.DangerLevel)
    if (level === null || warning.ValidFrom === undefined || warning.ValidTo === undefined) return []
    const to = nveTime(warning.ValidTo)
    if (Date.parse(to) <= now.getTime()) return []
    const region = warning.RegionName ?? ""
    return [
      {
        key: `avalanche/${warning.RegionId ?? region}/${warning.ValidFrom}`,
        kind: "avalanche",
        level,
        title: `Snøskredfare, faregrad ${warning.DangerLevel}`,
        area: region,
        from: nveTime(warning.ValidFrom),
        to,
        ...(warning.MainText ? { description: warning.MainText } : {}),
        source: "Varsom",
        href: region === "" ? VARSOM_PAGES.avalanche : `${VARSOM_PAGES.avalanche}varsel/${encodeURIComponent(region)}/${warning.ValidFrom.slice(0, 10)}`,
      },
    ]
  })
}

// In words -------------------------------------------------------------------------------------------------------------------------------------------------

const DAY = new Intl.DateTimeFormat("nb-NO", { weekday: "long", timeZone: TIME_ZONE })
const CLOCK = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TIME_ZONE })
const DATE = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE })

function dayWord(at: Date, now: Date): string {
  const days = Math.round((Date.parse(DATE.format(at)) - Date.parse(DATE.format(now))) / 86_400_000)
  return days === 0 ? "i dag" : days === 1 ? "i morgen" : days === -1 ? "i går" : DAY.format(at)
}

/** When a warning is in force, in words: «i dag 12:00 – i morgen 06:00», «nå – i dag 18:00» once it has begun. */
export function warningWhen(from: string, to: string, now: Date): string {
  const start = new Date(from)
  const end = new Date(to)
  const first = start.getTime() <= now.getTime() ? "nå" : `${dayWord(start, now)} ${CLOCK.format(start)}`
  return `${first} – ${dayWord(end, now)} ${CLOCK.format(end)}`
}

/** The icon of a warning, by what it is about. */
export function warningIcon(warning: Pick<Warning, "kind" | "event">): "wind" | "snow" | "rain" | "thunder" | "temperature" | "warning" {
  if (warning.kind === "avalanche") return "snow"
  if (warning.kind === "flood" || warning.kind === "landslide") return "rain"
  const event = warning.event ?? ""
  if (/wind|gale|storm|polarLow/i.test(event)) return "wind"
  if (/snow|blowingSnow|icing/i.test(event)) return "snow"
  if (/rain|rainFlood|flood/i.test(event)) return "rain"
  if (/lightning|thunder/i.test(event)) return "thunder"
  if (/forestFire|heat/i.test(event)) return "temperature"
  return "warning"
}
