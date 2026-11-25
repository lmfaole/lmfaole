import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"
import { List, type ListRow } from "@lmfaole/designsystem/components/list"
import { NowPlayingCard } from "@lmfaole/designsystem/components/now-playing-card"

import type { Play, TopArtist } from "../lib/lastfm.ts"
import type { Playing } from "../lib/now.ts"
import type { SpotifyArtist } from "../lib/spotify.ts"
import { sourcesOf, transformed } from "../lib/image-sources.ts"
import { albumHref, artistHref, titleHref, titlePages, trackHref } from "../lib/pages.ts"
import { episodesCode, groupViewings, type Viewing, type Watch } from "../lib/trakt.ts"
import { shortWhen } from "../lib/when.ts"

/**
 * The plays, newest first, each with its cover; the artist links to the artist's page here (`artistLinks` off on that page itself). `now` is the song playing this
 * moment, first, marked «nå»: its artist only links where there is a page for it, which is an artist among the plays.
 */
export function PlayRows({ plays, base, limit, artistLinks = true, trackLinks = true, albumLinks = true, now = null, within, start = false }: { plays: readonly Play[]; base: string; limit?: number; artistLinks?: boolean; trackLinks?: boolean; albumLinks?: boolean; now?: Playing | null; /** On an album's page every play has its cover, artist and album: only the song and when are said. */ within?: "album"; /** The app's own start (the front page, Musikk): an empty list there is a first, empty start (`reason="first-run"`, with the brand). */ start?: boolean }) {
  const rows = [
    ...(now === null ? [] : [{ key: `now-${now.url}`, artist: now.artist, track: now.track, album: now.album, image: now.image, aside: "Spilles nå", live: true, played: false }]),
    ...plays.map((play) => ({ key: `${play.playedAt}-${play.url}`, artist: play.artist, track: play.track, album: play.album, image: play.image, aside: play.playedAt === null ? "Spilles nå" : shortWhen(play.playedAt), live: play.playedAt === null, played: play.playedAt !== null })),
  ]
  const shown = limit === undefined ? rows : rows.slice(0, limit)
  if (shown.length === 0) {
    const description = "Avspillingene som Last.fm fører opp, dukker opp her. Det kan også være at Last.fm ikke svarte akkurat nå."
    const action = { href: "https://www.last.fm/about/trackmymusic", label: "Slik fører Last.fm opp avspillinger" }
    return <EmptyState reason={start ? "first-run" : "nothing-yet"} what="avspillinger" description={description} action={action} />
  }
  if (within === "album") {
    return (
      <List
        columns={{ name: "Låt", value: "Spilt" }}
        rows={shown.map((row) => ({
          key: row.key,
          title: row.track,
          ...(trackLinks && row.played ? { href: trackHref(base, row.artist, row.track) } : {}),
          ...(row.live ? { live: true } : { value: row.aside }),
        }))}
      />
    )
  }
  const known = new Set(plays.map((play) => play.artist))
  return (
    <List
      kind="track"
      rows={shown.map((row): ListRow => ({
        key: row.key,
        picture: { sources: sourcesOf(row.image) },
        title: row.track,
        // A song that is playing now has no page of its own (it is not among the finished plays the pages are made of).
        ...(trackLinks && row.played ? { href: trackHref(base, row.artist, row.track) } : {}),
        meta: [
          artistLinks && known.has(row.artist) ? { label: row.artist, href: artistHref(base, row.artist) } : row.artist,
          albumLinks && row.played && row.album !== "" ? { label: row.album, href: albumHref(base, row.artist, row.album) } : row.album,
        ],
        ...(row.live ? { live: true } : { value: row.aside }),
      }))}
    />
  )
}

/** What plays now, large: a disc of Last.fm's cover turning under the page's light (the cover as it is where Last.fm has none). */
export function NowPlayingSection({ now }: { now: Playing }) {
  const cover = now.disc ?? now.image
  return <NowPlayingCard disc={now.disc !== null} sources={sourcesOf(cover)} title={now.track} detail={[now.artist, now.album].filter(Boolean).join(" · ")} />
}

/**
 * The most played artists of the last month, ranked, each with its picture from Spotify where Spotify has an artist of that name. A picture from Spotify is attributed to it and
 * links back (their developer policy): the row's detail line has the link, and the list ends with Spotify's mark.
 */
export function TopArtistRows({ artists, base, pictures, pages = true }: { artists: readonly TopArtist[]; base: string; pictures: ReadonlyMap<string, SpotifyArtist>; /** An artist links to its page here; without (top artists from ListenBrainz, which has no pages here), to the artist at its source. */ pages?: boolean }) {
  if (artists.length === 0) return <EmptyState reason="nothing-yet" what="artister" />
  return (
    <List
      kind="artist"
      ranked
      rows={artists.map((artist) => {
        const found = pictures.get(artist.name)
        return {
          key: artist.name,
          picture: { sources: transformed(found?.images ?? []) },
          title: artist.name,
          ...(pages ? { href: artistHref(base, artist.name) } : { href: artist.url, external: true }),
          meta: [`${artist.plays.toLocaleString("nb-NO")} avspillinger`, found === undefined ? null : { label: "Åpne i Spotify", href: found.url, external: true }],
        }
      })}
    />
  )
}

/** The films (`kind` film) or the episodes (`kind` episode), newest first, each with its poster and a link to its page here: the film's, or the show's. */
export function WatchRows({ items, base, limit, kind }: { items: readonly Watch[]; base: string; limit?: number; kind: Watch["kind"] }) {
  const rows = groupViewings(items)
  const pageOf = new Map(titlePages(items).flatMap((page) => page.viewings.map((watch) => [String(watch.id), titleHref(base, page.slug, page.kind)] as const)))
  const shown = limit === undefined ? rows : rows.slice(0, limit)
  if (shown.length === 0) {
    return kind === "film" ? (
      <EmptyState reason="nothing-yet" what="filmer" description="Filmer som er markert som sett på Trakt, dukker opp her. Det kan også være at Trakt ikke svarte akkurat nå." />
    ) : (
      <EmptyState reason="nothing-yet" what="episoder" description="Episoder som er markert som sett på Trakt, dukker opp her. Det kan også være at Trakt ikke svarte akkurat nå." />
    )
  }
  return (
    <List
      kind={kind === "film" ? "film" : "show"}
      rows={shown.map((viewing) => {
        const href = pageOf.get(viewing.key)
        return {
          key: viewing.key,
          picture: { sources: sourcesOf(viewing.poster) },
          title: viewing.title,
          ...(href === undefined ? {} : { href }),
          meta: viewingDetail(viewing),
          value: shortWhen(viewing.watchedAt),
        }
      })}
    />
  )
}

/** The shows among the episodes, the one watched last first, each with how many episodes of it were seen and a link to its page. */
export function ShowRows({ items, base }: { items: readonly Watch[]; base: string }) {
  const shows = titlePages(items).filter((page) => page.kind === "episode")
  return (
    <List
      kind="show"
      rows={shows.map((show) => ({
        key: show.slug,
        picture: { sources: sourcesOf(show.poster) },
        title: show.title,
        href: titleHref(base, show.slug, show.kind),
        meta: [show.year, `${show.viewings.length} ${show.viewings.length === 1 ? "episode" : "episoder"} sett`],
        value: shortWhen(show.viewings[0]?.watchedAt ?? ""),
      }))}
    />
  )
}

/** What a row says under its title: a film's year; an episode's place and title; a run's count and range. The code comes first, so a narrow screen cuts the episode's title, never where it is in the show. */
function viewingDetail(viewing: Viewing): (string | number | null)[] {
  const [only] = viewing.episodes
  if (viewing.kind === "film") return ["Film", viewing.year]
  if (viewing.episodes.length > 1) return [episodesCode(viewing.episodes), `${viewing.episodes.length} episoder`]
  return [episodesCode(viewing.episodes), only === undefined || only.title === "" ? null : only.title]
}

/** «Kunne ikke hente data fra Last.fm» when a source did not answer, and nothing when all did: where the data comes from is said once, at the foot of the front page (`SOURCES`). */
export function Fetched({ sources }: { sources: readonly { at: string | null; source: string }[] }) {
  const failed = sources.filter(({ at }) => at === null).map(({ source }) => source)
  if (failed.length === 0) return null
  return <ErrorMessage what={`data fra ${failed.join(" og ")}`} error={failed.map((source) => `${source} svarte ikke.`).join(" ")} retry />
}
