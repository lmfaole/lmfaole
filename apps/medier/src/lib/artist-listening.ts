/**
 * What an artist's page says of the owner's own listening to it: its plays over time and what the chart of them says, its place among all they have heard, their most played songs by it and the
 * artists like it that they hear too. Pure, so a test pins it; `sources.ts` asks Last.fm for what it is read from.
 */

import type { ChartArtist, Play, SimilarArtist, TopArtist, TopTrack } from "./lastfm.ts"
import { plain } from "./spotify.ts"
import { dateAt, osloMidnight } from "./weeks.ts"

/** Names are the same artist whatever their case («AURORA» and «Aurora»). */
const same = (a: string, b: string): boolean => a.localeCompare(b, "nb", { sensitivity: "accent" }) === 0

/** How long one point of the chart of an artist's plays is: the finest that keeps the chart to `MAX_PERIODS` points. */
export type PeriodUnit = "month" | "quarter" | "half" | "year"

/** A stretch of the calendar in Oslo time, as a half-open range of unix seconds, named short (on the axis) and in full (in a sentence). */
export interface Period {
  label: string
  long: string
  start: number
  end: number
}

/** The most points the chart of an artist's plays has: one weekly chart from Last.fm each, shared by every artist's page, so a first visit asks at most this many. */
export const MAX_PERIODS = 24

const UNITS: readonly (readonly [PeriodUnit, number])[] = [["month", 1], ["quarter", 3], ["half", 6], ["year", 12]]
const MONTHS = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"] as const
const SHORT_MONTHS = ["jan.", "feb.", "mars", "april", "mai", "juni", "juli", "aug.", "sep.", "okt.", "nov.", "des."] as const

function named(unit: PeriodUnit, year: number, month: number): { label: string; long: string } {
  if (unit === "month") return { label: `${SHORT_MONTHS[month - 1] ?? ""} ${year}`, long: `${MONTHS[month - 1] ?? ""} ${year}` }
  if (unit === "quarter") {
    const quarter = Math.floor((month - 1) / 3) + 1
    return { label: `${quarter}. kv. ${year}`, long: `${quarter}. kvartal ${year}` }
  }
  if (unit === "half") {
    const half = month <= 6 ? 1 : 2
    return { label: `${half}. halvår ${year}`, long: `${half}. halvår ${year}` }
  }
  return { label: String(year), long: String(year) }
}

/**
 * The stretches from the one the user started on Last.fm in to the one `nowMs` is in, oldest first, in the finest unit (month, quarter, half-year, year) that gives at most `most` of them; in years, only the
 * last `most`. They begin on the calendar's own boundaries, so a stretch is the same from one day to the next and its chart is kept.
 */
export function listeningPeriods(registered: number, nowMs: number, most = MAX_PERIODS): { unit: PeriodUnit; periods: Period[] } {
  const from = dateAt(registered * 1000)
  const to = dateAt(nowMs)
  const first = from.year * 12 + from.month - 1
  const last = to.year * 12 + to.month - 1
  const [unit, step] = UNITS.find(([, months]) => Math.floor(last / months) - Math.floor(first / months) + 1 <= most) ?? ["year", 12]
  const periods: Period[] = []
  for (let at = Math.max(Math.floor(first / step), Math.floor(last / step) - most + 1) * step; at <= last; at += step) {
    const year = Math.floor(at / 12)
    const month = (at % 12) + 1
    const next = at + step
    periods.push({ ...named(unit, year, month), start: osloMidnight(year, month, 1), end: osloMidnight(Math.floor(next / 12), (next % 12) + 1, 1) })
  }
  return { unit, periods }
}

/** How many times the artist was played in a chart (0 where it is not in it). */
export const playsIn = (chart: readonly ChartArtist[], name: string): number => chart.find((one) => same(one.name, name))?.plays ?? 0

/** The artist's place among all the user has heard (1 is the most played), its plays, and what share of all their plays it is (0 to 1); `null` where it is not among them. */
export function placeAmong(top: readonly TopArtist[], name: string, total: number | null): { rank: number; plays: number; share: number | null } | null {
  const index = top.findIndex((one) => same(one.name, name))
  const found = top[index]
  if (found === undefined) return null
  return { rank: index + 1, plays: found.plays, share: total === null || total <= 0 ? null : found.plays / total }
}

/** «3,1 %»; a share under a tenth of a percent is «under 0,1 %». */
export function shareText(share: number): string {
  const percent = share * 100
  return percent < 0.1 ? "under 0,1 %" : `${percent.toLocaleString("nb-NO", { maximumFractionDigits: percent < 10 ? 1 : 0 })} %`
}

/** The user's most played songs by the artist, most first, at most `limit`. */
export const tracksBy = (tracks: readonly TopTrack[], name: string, limit = 10): TopTrack[] => tracks.filter((track) => same(track.artist, name)).slice(0, limit)

/**
 * The covers of songs by an artist that the recent plays show, by title as given: a play carries its album's cover, so a song played lately needs no question for it. A title is matched whatever its
 * case and punctuation (`plain`); a song with no cover among the plays is not in the map.
 */
export function coversFromPlays(plays: readonly Play[], name: string, titles: readonly string[]): Map<string, string> {
  const found = new Map<string, string>()
  for (const play of plays) if (play.image !== null && same(play.artist, name) && !found.has(plain(play.track))) found.set(plain(play.track), play.image)
  return new Map(titles.flatMap((title) => {
    const cover = found.get(plain(title))
    return cover === undefined ? [] : [[title, cover] as const]
  }))
}

/** Of the artists Last.fm finds like this one, those the user has played too, the most alike first, with their plays; at most `limit`. */
export function similarHeard(similar: readonly SimilarArtist[], top: readonly TopArtist[], name: string, limit = 6): { name: string; plays: number; url: string }[] {
  return similar.flatMap((one) => {
    if (same(one.name, name)) return []
    const heard = top.find((artist) => same(artist.name, one.name))
    return heard === undefined ? [] : [{ name: heard.name, plays: heard.plays, url: heard.url || one.url }]
  }).slice(0, limit)
}

const ORDINALS = ["", "nest", "tredje", "fjerde", "femte", "sjette", "sjuende", "åttende", "niende", "tiende"] as const

/** «Mest spilte artist», «Fjerde mest spilte artist» up to the tenth, then «Nr. 42 av de mest spilte artistene»; «Artist» where its place is not known. */
export function artistKind(rank: number | null): string {
  if (rank === null) return "Artist"
  if (rank === 1) return "Mest spilte artist"
  const word = ORDINALS[rank - 1]
  return word === undefined ? `Nr. ${rank.toLocaleString("nb-NO")} av de mest spilte artistene` : `${word.charAt(0).toUpperCase()}${word.slice(1)} mest spilte artist`
}

const PER: Readonly<Record<PeriodUnit, string>> = { month: "måned", quarter: "kvartal", half: "halvår", year: "år" }

const plural = (n: number, one: string, many: string): string => `${n.toLocaleString("nb-NO")} ${n === 1 ? one : many}`

/** The figures in the artist's head: how much the user has played it, what share of all they have played that is, and how much they played it the last month. */
export function artistFigures(plays: number | null, share: number | null, lastMonth: number | null): { value: string; label: string }[] {
  return [
    plays === null ? null : { value: plays.toLocaleString("nb-NO"), label: plays === 1 ? "avspilling" : "avspillinger" },
    share === null ? null : { value: shareText(share), label: "av alle avspillinger" },
    lastMonth === null ? null : { value: lastMonth.toLocaleString("nb-NO"), label: "siste måned" },
  ].filter((one) => one !== null)
}

/**
 * What the chart of the plays over time says: its title (the message: when it was played most), its subtitle (what is counted, per what, from when to when) and its summary, which says when it was first played,
 * when most and how much so far in the stretch now. `null` with fewer than two stretches (the number says it better than a chart). The first stretch with plays is only «first» if there is one before it without.
 */
export function listeningChartText(unit: PeriodUnit, series: readonly { long: string; plays: number }[]): { title: string; description: string; summary: string } | null {
  const first = series[0]
  const last = series.at(-1)
  if (series.length < 2 || first === undefined || last === undefined) return null
  const description = `Avspillinger per ${PER[unit]}, ${first.long} til ${last.long}.`
  const start = series.findIndex((one) => one.plays > 0)
  const heard = series[start]
  if (heard === undefined) return { title: "Ikke spilt i perioden", description, summary: "Arealdiagram. Ingen avspillinger i perioden." }
  const peak = series.reduce((best, one) => (one.plays > best.plays ? one : best), heard)
  const since = start === 0 ? `Spilt alt i ${heard.long}, da historikken på Last.fm begynner` : `Først spilt i ${heard.long}`
  const most = `${plural(peak.plays, "avspilling", "avspillinger")}`
  const now = peak === last ? `mest hittil i ${last.long} (${most})` : `mest i ${peak.long} (${most}), ${plural(last.plays, "avspilling", "avspillinger")} hittil i ${last.long}`
  return { title: `Mest spilt i ${peak.long}`, description, summary: `Arealdiagram. ${since}, ${now}.` }
}
