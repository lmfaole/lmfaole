/**
 * What an album's page says of the visitor's own listening to it: its plays over time (one weekly album chart from Last.fm a stretch, shared by every album's page), their plays of each of its
 * tracks, how long it is and about how long they have listened to it. Pure, so a test pins it; `sources.ts` asks Last.fm for what it is read from.
 */

import { albumKey } from "./albums.ts"
import type { Play, TopTrack } from "./lastfm.ts"
import type { Month } from "./months.ts"
import { dateAt } from "./weeks.ts"
import { plain } from "./spotify.ts"

type Json = Record<string, unknown>
const object = (value: unknown): Json => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Json) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value : "")

/** The user's albums in a stretch of time (unix seconds, `to` not included), the most played first: the same for every album's page, so it is asked once. */
export const albumChartUrl = (base: string, from: number, to: number): string => `${base}&method=user.getweeklyalbumchart&from=${from}&to=${to}`

/** One album of a chart: its title, its artist and its plays in the stretch. */
export interface ChartAlbum {
  title: string
  artist: string
  plays: number
}

export function parseAlbumChart(answer: unknown): ChartAlbum[] {
  return list(object(object(answer)["weeklyalbumchart"])["album"]).flatMap((value) => {
    const album = object(value)
    const title = text(album["name"]).trim()
    const artist = text(object(album["artist"])["#text"]).trim()
    const plays = Number(text(album["playcount"]))
    return title === "" || artist === "" || !Number.isFinite(plays) ? [] : [{ title, artist, plays }]
  })
}

/** The plays of an album in a chart: of all its editions («Junior», «Junior (Deluxe Edition)»), by the artist whatever its case; 0 where it is not in it. */
export const albumPlaysIn = (chart: readonly ChartAlbum[], artist: string, title: string): number =>
  chart.filter((one) => plain(one.artist) === plain(artist) && albumKey(one.title) === albumKey(title)).reduce((sum, one) => sum + one.plays, 0)

/**
 * The user's plays of each track of an album, from their most played songs of all time (their first thousand, `user.gettoptracks`): by title whatever its case, punctuation and edition
 * («- Remastered»). A track not among them is not in the map: it was played less than the thousandth song, or not at all.
 */
export function trackPlays(top: readonly TopTrack[], artist: string, titles: readonly string[]): Map<string, number> {
  const by = new Map<string, number>()
  for (const track of top) if (plain(track.artist) === plain(artist)) by.set(albumKey(track.title), (by.get(albumKey(track.title)) ?? 0) + track.plays)
  return new Map(titles.flatMap((title) => {
    const plays = by.get(albumKey(title))
    return plays === undefined ? [] : [[title, plays] as const]
  }))
}

/** How long the album is, in seconds: the sum of its tracks, only where every track's length is known. */
export function albumSeconds(tracks: readonly { seconds: number | null }[]): number | null {
  if (tracks.length === 0 || tracks.some((track) => track.seconds === null)) return null
  return tracks.reduce((sum, track) => sum + (track.seconds ?? 0), 0)
}

/** The fewest plays of an album that an estimate of the time spent on it is made from: with fewer, the length of the tracks played says more than an average. */
const FEWEST_PLAYS = 3

/**
 * About how long the user has listened to an album, in seconds: its plays (`album.getinfo`'s count of theirs) times the length of a play of it, which is the average of its tracks weighted by how
 * much they played each where their plays of the tracks are known (`trackPlays`), else the plain average. `null` where it would be a guess: too few plays, or the lengths of half the tracks unknown.
 */
export function listenedSeconds(tracks: readonly { title: string; seconds: number | null }[], plays: number | null, perTrack: ReadonlyMap<string, number>): number | null {
  const timed = tracks.filter((track): track is { title: string; seconds: number } => track.seconds !== null)
  if (plays === null || plays < FEWEST_PLAYS || timed.length === 0 || timed.length * 2 < tracks.length) return null
  const weighed = timed.filter((track) => (perTrack.get(track.title) ?? 0) > 0)
  const weight = weighed.reduce((sum, track) => sum + (perTrack.get(track.title) ?? 0), 0)
  const average = weight > 0 ? weighed.reduce((sum, track) => sum + track.seconds * (perTrack.get(track.title) ?? 0), 0) / weight : timed.reduce((sum, track) => sum + track.seconds, 0) / timed.length
  return plays * average
}

/** A length as «47 min» or «1 t 12 min». */
export function durationText(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} t${minutes % 60 === 0 ? "" : ` ${minutes % 60} min`}`
}

/** About how long, rounded as a person would say it: «omtrent 40 min», «omtrent 6 t», «omtrent 120 t». */
export function aboutText(seconds: number): string {
  const minutes = seconds / 60
  if (minutes < 55) return `omtrent ${Math.max(5, Math.round(minutes / 5) * 5)} min`
  const hours = minutes / 60
  return `omtrent ${(hours < 10 ? Math.round(hours * 2) / 2 : Math.round(hours)).toLocaleString("nb-NO")} t`
}

/** The user's albums of all time, the most played first, their first thousand: one answer every album's page shares (`user.gettopalbums`). */
export const allTimeAlbumsUrl = (base: string): string => `${base}&method=user.gettopalbums&period=overall&limit=1000`

/** The user's albums of all time (`user.gettopalbums`), as a chart: title, artist and their plays of it. */
export function parseTopAlbumsOfUser(answer: unknown): ChartAlbum[] {
  return list(object(object(answer)["topalbums"])["album"]).flatMap((value) => {
    const album = object(value)
    const title = text(album["name"]).trim()
    const artist = text(object(album["artist"])["name"]).trim()
    const plays = Number(text(album["playcount"]))
    return title === "" || artist === "" || !Number.isFinite(plays) ? [] : [{ title, artist, plays }]
  })
}

/** One of the artist's studio albums with the user's plays of it (of all its editions; 0 where it is not among their thousand most played albums). */
export interface DiscographyAlbum {
  title: string
  released: string | null
  plays: number
}

/** The artist's studio albums in the order they came out, each with the user's plays of it. */
export const discographyPlays = (studio: readonly { title: string; released: string | null }[], top: readonly ChartAlbum[], artist: string): DiscographyAlbum[] =>
  studio.map((album) => ({ title: album.title, released: album.released, plays: albumPlaysIn(top, artist, album.title) }))

/** The fewest albums a chart of a discography is drawn for: with fewer, the numbers say it better. */
export const FEWEST_ALBUMS = 3

const ORDINAL = ["", "nest", "tredje", "fjerde", "femte", "sjette", "sjuende", "åttende", "niende", "tiende"] as const
const playsText = (n: number): string => `${n.toLocaleString("nb-NO")} ${n === 1 ? "avspilling" : "avspillinger"}`

/**
 * What the chart of the user's plays of each of the artist's albums says: its title (where this album is among them: «Junior er albumet av Röyksopp du har spilt mest»), its subtitle (what is counted,
 * in what order, over what time) and its summary. `null` with fewer than `FEWEST_ALBUMS` albums, this one not among them, or none played.
 */
export function discographyChartText(albums: readonly DiscographyAlbum[], title: string, artist: string): { title: string; description: string; summary: string; highlight: string } | null {
  const here = albums.find((album) => albumKey(album.title) === albumKey(title))
  if (albums.length < FEWEST_ALBUMS || here === undefined || albums.every((album) => album.plays === 0)) return null
  const top = albums.reduce((best, album) => (album.plays > best.plays ? album : best))
  const rank = 1 + albums.filter((album) => album.plays > here.plays).length
  const word = ORDINAL[rank - 1]
  const heading =
    here.plays === 0 ? `Du har ikke spilt ${here.title}, men ${top.title} er det du har spilt mest` : rank === 1 ? `${here.title} er albumet av ${artist} du har spilt mest` : word === undefined ? `Du har spilt ${top.title} mest av albumene til ${artist}` : `${here.title} er det ${word} mest spilte albumet ditt av ${artist}`
  const first = albums[0]
  const last = albums.at(-1)
  const span = first?.released != null && last?.released != null ? `, ${first.released.slice(0, 4)}–${last.released.slice(0, 4)}` : ""
  return {
    title: heading,
    description: `Dine avspillinger av hvert av de ${albums.length} studioalbumene${span}, eldste først, siden du begynte på Last.fm. Alle utgaver av et album telles sammen.`,
    summary: `Søylediagram. ${here.title}: ${playsText(here.plays)}, nummer ${rank} av ${albums.length}. Mest spilt: ${top.title} (${playsText(top.plays)}). Et album utenfor de tusen du har spilt mest, telles som 0.`,
    highlight: here.title,
  }
}

/** The figures in the head of an album's page: the user's plays of it, about how long they have listened to it, and what share it is of their plays of the artist. */
export function albumFigures(plays: number | null, listened: number | null, artistPlays: number | null): { value: string; label: string }[] {
  const share = plays === null || artistPlays === null || artistPlays <= 0 || plays > artistPlays ? null : plays / artistPlays
  return [
    plays === null ? null : { value: plays.toLocaleString("nb-NO"), label: plays === 1 ? "avspilling" : "avspillinger" },
    listened === null ? null : { value: aboutText(listened).replace(/^omtrent /, ""), label: "lyttetid, omtrent" },
    share === null ? null : { value: `${Math.round(share * 100).toLocaleString("nb-NO")} %`, label: "av alt du har hørt av artisten" },
  ].filter((one) => one !== null)
}

const two = (n: number): string => String(n).padStart(2, "0")
const DAY_MS = 86_400_000

/**
 * The user's plays of an album each day of the months read (oldest first, whole months): a row for every day from the first of the oldest to the end of the newest or `today` (`YYYY-MM-DD`, Oslo),
 * whichever is first, 0 where they did not play it. A play counts on its date in Oslo, whatever edition of the album it was.
 */
export function albumDayCounts(months: readonly Month[], plays: readonly Play[], artist: string, title: string, today: string): { date: string; value: number }[] {
  const first = months[0]
  const newest = months.at(-1)
  if (first === undefined || newest === undefined) return []
  const counts = new Map<string, number>()
  for (const play of plays) {
    if (play.playedAt === null || plain(play.artist) !== plain(artist) || albumKey(play.album) !== albumKey(title)) continue
    const at = dateAt(Date.parse(play.playedAt))
    const date = `${at.year}-${two(at.month)}-${two(at.day)}`
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }
  const end = newest.last < today ? newest.last : today
  const days: { date: string; value: number }[] = []
  for (let time = Date.parse(`${first.first}T00:00:00Z`); ; time += DAY_MS) {
    const date = new Date(time).toISOString().slice(0, 10)
    if (date > end) break
    days.push({ date, value: counts.get(date) ?? 0 })
  }
  return days
}

const dayText = (date: string): string => new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))

/** What the calendar of the days the user played an album says: its title (how many days), and its subtitle (what is counted, from which day to which). `null` with no days read. */
export function albumDaysText(days: readonly { date: string; value: number }[], title: string): { title: string; description: string } | null {
  const first = days[0]
  const last = days.at(-1)
  if (first === undefined || last === undefined) return null
  const played = days.filter((day) => day.value > 0).length
  const total = days.reduce((sum, day) => sum + day.value, 0)
  return {
    title: played === 0 ? `Du har ikke spilt ${title} i det siste` : `Du har spilt ${title} ${played.toLocaleString("nb-NO")} ${played === 1 ? "dag" : "dager"} i det siste`,
    description: `Dine avspillinger av albumet hver dag fra ${dayText(first.date)} til ${dayText(last.date)}: ${playsText(total)} i alt.`,
  }
}
