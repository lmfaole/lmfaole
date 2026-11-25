/**
 * An artist's concerts from setlist.fm (https://www.setlist.fm), found by the artist's MusicBrainz id: when and where, and what was played. setlist.fm's terms ask that its data is shown as it is and
 * linked back to it, so the names are kept as setlist.fm writes them (a city in English, a song with its own spelling). Pure, with a test.
 */

const API = "https://api.setlist.fm/rest/1.0"

/** The first page (twenty) of an artist's setlists, newest first; one coming is among them, with no songs yet. */
export const setlistsUrl = (mbid: string): string => `${API}/artist/${encodeURIComponent(mbid)}/setlists?p=1`

/** setlist.fm's key goes in a header, and it answers XML unless JSON is asked for. */
export const setlistHeaders = (key: string): Record<string, string> => ({ "x-api-key": key, Accept: "application/json" })

export interface Song {
  name: string
  /** Played as an encore. */
  encore: boolean
}

export interface Concert {
  id: string
  /** The day, `YYYY-MM-DD`. */
  date: string
  venue: string
  city: string
  country: string
  tour: string | null
  /** The concert on setlist.fm. */
  url: string
  /** Every song in the order played, the encores last; none where no one has written it down yet. */
  songs: Song[]
}

/** The concerts of an artist, and its page on setlist.fm. */
export interface Setlists {
  url: string
  concerts: Concert[]
}

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "")

/** setlist.fm's `dd-MM-yyyy` as `YYYY-MM-DD`; `null` for anything else. */
export function concertDate(value: unknown): string | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text(value))
  return match === null ? null : `${match[3]}-${match[2]}-${match[1]}`
}

function concert(value: unknown): Concert | null {
  const one = record(value)
  const date = concertDate(one["eventDate"])
  const url = text(one["url"])
  if (date === null || !url.startsWith("https://")) return null
  const venue = record(one["venue"])
  const city = record(venue["city"])
  const songs = list(record(one["sets"])["set"]).flatMap((set) => {
    const encore = typeof record(set)["encore"] === "number"
    return list(record(set)["song"]).flatMap((song) => {
      const name = text(record(song)["name"])
      return name === "" ? [] : [{ name, encore }]
    })
  })
  const tour = text(record(one["tour"])["name"])
  return { id: text(one["id"]) || url, date, venue: text(venue["name"]), city: text(city["name"]), country: text(record(city["country"])["name"]), tour: tour === "" ? null : tour, url, songs }
}

/** The concerts in setlist.fm's answer that have been (on or before `today`, `YYYY-MM-DD`), newest first; `null` where there are none. */
export function parseSetlists(answer: unknown, today: string): Setlists | null {
  const concerts = list(record(answer)["setlist"])
    .map(concert)
    .filter((one): one is Concert => one !== null && one.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
  if (concerts.length === 0) return null
  const artist = text(record(record(list(record(answer)["setlist"])[0])["artist"])["url"])
  return { url: artist.startsWith("https://") ? artist : "https://www.setlist.fm", concerts }
}

/** The newest concert whose songs are written down: the setlist a page shows. */
export const latestSetlist = (setlists: Setlists): Concert | null => setlists.concerts.find((one) => one.songs.length > 0) ?? null

/** Where a concert was, as setlist.fm names it: «Royal Arena, Copenhagen, Denmark», leaving out what it has not got. */
export const placeOf = (concert: Pick<Concert, "venue" | "city" | "country">): string => [concert.venue, concert.city, concert.country].filter((part) => part !== "").join(", ")
