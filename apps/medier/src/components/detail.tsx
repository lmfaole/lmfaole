import type { ReactNode } from "react"

import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { FactList } from "@lmfaole/designsystem/components/fact-list"
import { LogoList } from "@lmfaole/designsystem/components/logos"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { List } from "@lmfaole/designsystem/components/list"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Tiles } from "@lmfaole/designsystem/components/tiles"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"

import type { AlbumInfo, ArtistInfo, TopTrack, TrackInfo } from "../lib/lastfm.ts"
import { firstSentences } from "../lib/lastfm.ts"
import { type AlbumPage, type Appearance, type ArtistPage, artistHref, albumHref, personHref, titleHref, type TitlePage, type TrackPage, trackSlug, trackHref } from "../lib/pages.ts"
import type { SpotifyAlbum, SpotifyArtist, SpotifyTrack } from "../lib/spotify.ts"
import { albumKey, type ShelfAlbum } from "../lib/albums.ts"
import { coversFromPlays } from "../lib/artist-listening.ts"
import { type ArtistLink, type LatestRelease as Release, latestReleaseText, releaseCover } from "../lib/musicbrainz-artist.ts"
import type { StudioAlbum } from "../lib/musicbrainz.ts"
import { albumSeconds, durationText, listenedSeconds, trackPlays } from "../lib/album-listening.ts"
import { countryName, placeText, type Release as AlbumEdition } from "../lib/musicbrainz-release.ts"
import type { AlbumRelease as AlbumReleaseData, AlbumsFrom, ArtistListening } from "../lib/sources.ts"
import { sourcesOf, transformed } from "../lib/image-sources.ts"
import { type Person, profileSources } from "../lib/tmdb.ts"
import { episodesCode } from "../lib/trakt.ts"
import type { Provider, WatchProviders as Providers } from "../lib/watch-providers.ts"
import { latestSetlist, placeOf, type Setlists as SetlistData } from "../lib/setlistfm.ts"
import { ageOn, lengthText, longDay, releaseText } from "../lib/days.ts"
import { shortWhen } from "../lib/when.ts"
import { PlayRows } from "./sections.tsx"

/** A big count in few characters: «5,1 mill.» from a million, the whole number («320 000») below. */
const compactCount = (n: number): string => (n >= 1_000_000 ? new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 }).format(n) : n.toLocaleString("nb-NO"))
const count = (n: number, one: string, many: string): string => `${n.toLocaleString("nb-NO")} ${n === 1 ? one : many}`

/** A film's length as «2 t 50 min»; under an hour just the minutes. */
export const runtimeText = (minutes: number): string => (minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} t${minutes % 60 === 0 ? "" : ` ${minutes % 60} min`}`)

/** The ways out of a page of music: Last.fm, and Spotify where the search found it. */
const musicLinks = (lastfm: string, spotify: string | null): { href: string; label: string }[] => [{ href: lastfm, label: "Åpne på Last.fm" }, ...(spotify === null ? [] : [{ href: spotify, label: "Åpne i Spotify" }])]

/** Last.fm's text is its users' own (CC BY-SA): said, and linked back to, under it. */
const lastfmText = (href: string) => ({ label: "Last.fm, brukernes egen (CC BY-SA)", href })

/** A film or a show: its poster, when and how often it was seen, where it can be seen (`providers`, a server island the page puts in), every viewing, and last the way to it on Trakt. */
export function TitleDetail({ page, base, providers }: { page: TitlePage; base: string; /** Where it streams, rents or sells in Norway (`WatchProviders`), a server island the page puts in. */ providers?: ReactNode }) {
  const latest = page.viewings[0]
  const cast = page.info?.cast ?? []
  const crew = page.info?.crew ?? []
  const episodes = page.viewings.flatMap((watch) => (watch.episode === null ? [] : [watch.episode]))
  return (
    <DetailLayout
      facts={[
        ["Sjanger", page.info === null || page.info.genres.length === 0 ? null : page.info.genres.join(", ")],
        page.kind === "film" ? ["Varighet", page.info?.runtime == null ? null : runtimeText(page.info.runtime)] : ["Sesonger", page.info?.seasons == null ? null : String(page.info.seasons)],
        ["Vurdering på TMDB", page.info?.rating == null ? null : `${page.info.rating.value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} av 10`],
        ["Sist sett", latest === undefined ? null : shortWhen(latest.watchedAt)],
        page.kind === "film" ? ["Sett", count(page.viewings.length, "gang", "ganger")] : ["Episoder sett", count(new Set(episodes.map((episode) => `${episode.season}:${episode.number}`)).size, "episode", "episoder")],
      ]}
      links={[{ href: page.traktUrl, label: "Åpne på Trakt" }]}
    >
      {page.info?.overview == null ? null : (
        <PageSection id="om" title={page.kind === "film" ? "Om filmen" : "Om serien"} icon="info" source={{ label: "TMDB" }}>
          <Text>{page.info.overview}</Text>
        </PageSection>
      )}
      {providers}
      {cast.length === 0 ? null : (
        <PageSection id="rolleliste" title="Rolleliste" icon="people">
          <Tiles kind="person" tiles={cast.map((one) => ({ key: `${one.id}`, href: personHref(base, one.id, one.name), title: one.name, picture: { sources: transformed(profileSources(one.profile)) }, meta: [one.role || null] }))} />
        </PageSection>
      )}
      {crew.length === 0 ? null : (
        <PageSection id="stab" title="Bak kamera" icon="video">
          <List columns={{ name: "Navn", value: "Rolle" }} rows={crew.map((one) => ({ key: `${one.id}-${one.role}`, title: one.name, href: personHref(base, one.id, one.name), value: one.role }))} />
        </PageSection>
      )}
      <PageSection id="sett" title={page.kind === "film" ? "Når den ble sett" : "Sette episoder"} icon="history">
        <List
          columns={{ name: page.kind === "film" ? "Visning" : "Episode", value: "Sett" }}
          rows={page.viewings.map((watch) => ({
            key: String(watch.id),
            title: watch.episode === null ? "Film" : `${episodesCode([watch.episode])}${watch.episode.title === "" ? "" : ` · ${watch.episode.title}`}`,
            value: shortWhen(watch.watchedAt),
          }))}
        />
      </PageSection>
    </DetailLayout>
  )
}

const logos = (label: string, providers: readonly Provider[]): ReactNode => (providers.length === 0 ? null : <LogoList label={label} items={providers.map((one) => ({ name: one.name, src: one.logo }))} />)

/**
 * Where a film or a show can be seen in Norway, from TMDB: in a subscription, to rent and to buy, each service by its logo and name, and the link to TMDB's page of them. The data is JustWatch's, and TMDB
 * asks that it says so where it is shown. Nothing where it is nowhere (or TMDB did not answer).
 */
export function WatchProviders({ providers }: { providers: Providers | null }) {
  if (providers === null) return null
  return (
    <PageSection id="se" title="Hvor den kan ses" icon="tv">
      <Stack>
        <FactList
          facts={[
            ["Strømming", logos("Strømming", providers.stream)],
            ["Leie", logos("Leie", providers.rent)],
            ["Kjøp", logos("Kjøp", providers.buy)],
          ]}
        />
        <Text role="note">
          <TextLink href={providers.link} external>Se alle tilbud på TMDB</TextLink>. Strømmedata fra JustWatch.
        </Text>
      </Stack>
    </PageSection>
  )
}

/**
 * An artist's concerts from setlist.fm: the songs of the newest one that has its setlist written down, in the order played, and the last few concerts, when and where, each linked to its page there.
 * setlist.fm's terms ask that its data is shown as it is and links back to it: the names are setlist.fm's own, and each says where it is from. Nothing where it has none.
 */
export function Setlists({ setlists }: { setlists: SetlistData | null }) {
  if (setlists === null) return null
  const latest = latestSetlist(setlists)
  return (
    <>
      {latest === null ? null : (
        <PageSection id="settliste" title="Siste settliste" icon="music">
          <Stack>
            <FactList
              facts={[
                ["Dato", longDay(latest.date)],
                ["Sted", placeOf(latest)],
                ["Turné", latest.tour],
              ]}
            />
            <List ranked columns={{ name: "Låt", value: "Merknad" }} rows={latest.songs.map((song, index) => ({ key: `${index}`, title: song.name, ...(song.encore ? { value: "Ekstranummer" } : {}) }))} />
            <Text role="note">
              <TextLink href={latest.url} external>Settlisten på setlist.fm</TextLink>, slik den er skrevet ned der.
            </Text>
          </Stack>
        </PageSection>
      )}
      <PageSection id="konserter" title="Siste konserter" icon="calendar">
        <Stack>
          <List columns={{ name: "Konsert", value: "Dato" }} rows={setlists.concerts.slice(0, 5).map((concert) => ({ key: concert.id, title: placeOf(concert), href: concert.url, external: true, value: longDay(concert.date) }))} />
          <Text role="note">
            Fra <TextLink href={setlists.url} external>setlist.fm</TextLink>.
          </Text>
        </Stack>
      </PageSection>
    </>
  )
}

/**
 * The artists like one that the owner plays too, with Spotify's pictures (`pictures`, by name; the page's server island asks for them with a budget of its own, and its fallback has none). `url` is
 * the artist on Last.fm, which found them.
 */
export function SimilarArtists({ similar, pictures, linked, base, url }: { similar: ArtistListening["similar"]; pictures: ReadonlyMap<string, SpotifyArtist>; /** The names that have a page of their own here. */ linked: ReadonlySet<string>; base: string; url: string }) {
  if (similar.length === 0) return null
  return (
    <PageSection id="lignende" title="Lignende artister som også er spilt" icon="people">
      <Stack>
        <List
          kind="artist"
          rows={similar.map((one) => {
            const spotify = pictures.get(one.name) ?? null
            return {
              key: one.name,
              title: one.name,
              ...(linked.has(one.name) ? { href: artistHref(base, one.name) } : {}),
              picture: { sources: transformed(spotify?.images ?? []) },
              meta: [spotify === null ? null : { label: "Åpne i Spotify", href: spotify.url, external: true }],
              value: count(one.plays, "avspilling", "avspillinger"),
            }
          })}
        />
        <Text role="note">
          Artistene <TextLink href={url} external>Last.fm</TextLink> finner lignende, blant de mest spilte.
        </Text>
      </Stack>
    </PageSection>
  )
}

/**
 * The visitor's most played songs by an artist, each with its album's cover (`covers`, by title: from the recent plays, and from Last.fm for the others in the page's server island; a song with none
 * keeps its empty frame). `linked` are the titles that have a page of their own here.
 */
export function TopTracks({ artist, tracks, covers, linked, base }: { artist: string; tracks: readonly TopTrack[]; covers: ReadonlyMap<string, string>; linked: ReadonlySet<string>; base: string }) {
  if (tracks.length === 0) return null
  return (
    <PageSection id="mest-spilte" title="Mest spilte" icon="play">
      <List
        kind="track"
        ranked
        rows={tracks.map((track) => ({
          key: track.title,
          title: track.title,
          ...(linked.has(track.title) ? { href: trackHref(base, artist, track.title) } : {}),
          picture: { sources: sourcesOf(covers.get(track.title) ?? null) },
          value: count(track.plays, "avspilling", "avspillinger"),
          amount: track.plays,
        }))}
      />
    </PageSection>
  )
}

/**
 * The artist's newest album, single or EP from the last two years, or the one that is coming (`musicbrainz-artist.ts`): its cover (`releaseCover`: the plays', else the Cover Art Archive's), what it is
 * and when, and a link to the album's page where it is among the plays (`played`: the edition played, by `albumKey`). Nothing where there is none.
 */
export function LatestRelease({ artist, release, played, covers, base, today }: { artist: string; release: Release | null; played: ReadonlyMap<string, string>; covers: ReadonlyMap<string, string>; base: string; today: string }) {
  if (release === null) return null
  const { kind, when } = latestReleaseText(release, today)
  const edition = played.get(albumKey(release.title))
  return (
    <PageSection id="utgivelse" title={release.upcoming ? "Neste utgivelse" : "Siste utgivelse"} icon="new">
      <List kind="album" rows={[{ key: release.id, title: release.title, ...(edition === undefined ? {} : { href: albumHref(base, artist, edition) }), picture: { sources: sourcesOf(releaseCover(release, covers)) }, meta: [kind], value: when }]} />
    </PageSection>
  )
}

/** The artist's links on from MusicBrainz (its own site, Wikipedia, Bandcamp…), the last section of its page, each named for where it goes. Nothing where there are none. */
export function ArtistLinks({ links }: { links: readonly ArtistLink[] }) {
  if (links.length === 0) return null
  return (
    <PageSection id="lenker" title="Mer om artisten" icon="link">
      <List rows={links.map((link) => ({ key: link.kind, title: link.label, href: link.url, external: true }))} />
    </PageSection>
  )
}

/** The year an album came out, from MusicBrainz's day, as a tile's line. */
const yearOf = (released: string | null): string | null => (released === null ? null : released.slice(0, 4))

/**
 * An artist: its newest release where it is news, what Last.fm's users write of it, then the owner's own listening to it (their plays over time, their most played songs by it), its albums, its concerts, its recent plays, the artists like it
 * that they play too, and last the ways on from MusicBrainz (its own site, Wikipedia…); beside, Last.fm's listeners and the ways to it on Last.fm and Spotify. The picture and the link to it are Spotify's; the tags, the listeners and the text are Last.fm's (its text is the users', CC BY-SA, with
 * the link back where it is shown). `chart` is the chart of the plays over time, an island the page puts in; `songs` the most played songs with their covers (`TopTracks`), another.
 */
export function ArtistDetail({ page, base, info, listening, links, chart, similar, songs, latest, onward, concerts }: { page: ArtistPage; base: string; info: { lastfm: ArtistInfo | null; spotify: SpotifyArtist | null; albums: ShelfAlbum[]; albumsFrom: AlbumsFrom }; listening: ArtistListening | null; /** The slugs of the songs and the artists that have a page of their own here. */ links: { tracks: ReadonlySet<string>; artists: ReadonlySet<string> }; chart?: ReactNode; /** The artists like it that the owner plays too (`SimilarArtists`), a server island the page puts in. */ similar?: ReactNode; /** The most played songs (`TopTracks`), a server island the page puts in; without it they are shown with the covers of the recent plays. */ songs?: ReactNode; /** The newest release (`LatestRelease`), a server island the page puts in. */ latest?: ReactNode; /** The links on from MusicBrainz (`ArtistLinks`), a server island the page puts in, the last section. */ onward?: ReactNode; /** The last concerts and the newest setlist (`Setlists`), a server island the page puts in. */ concerts?: ReactNode }) {
  const { lastfm, spotify, albums, albumsFrom } = info
  // The albums among the recent plays have a page of their own here, under the name of the edition that was played; the others are only named.
  const played = new Map(page.plays.filter((play) => play.album !== "").map((play) => [albumKey(play.album), play.album]))
  const tracks = listening?.tracks ?? []
  // The plays, the place, the share of all and last month's plays are the head's figures, and when it was first heard is in the chart: each is said once.
  return (
    <DetailLayout facts={[["Lyttere på Last.fm", listeners(lastfm?.listeners)]]} links={musicLinks(page.url, spotify?.url ?? null)}>
      {latest}
      {lastfm?.bio == null ? null : (
        <PageSection id="om" title="Om artisten" icon="info" source={lastfmText(page.url)}>
          <Text>{lastfm.bio}</Text>
        </PageSection>
      )}
      {chart === undefined ? null : (
        <PageSection id="lytting" title="Lytting" icon="chart">
          {chart}
        </PageSection>
      )}
      {songs ?? <TopTracks artist={page.name} tracks={tracks} covers={coversFromPlays(page.plays, page.name, tracks.map((track) => track.title))} linked={new Set(tracks.flatMap((track) => (links.tracks.has(trackSlug(page.name, track.title)) ? [track.title] : [])))} base={base} />}
      {albums.length === 0 ? null : (
        <PageSection id="album" title="Album" icon="music">
          <Stack>
            <Tiles
              kind="album"
              tiles={albums.map((album) => {
                const edition = played.get(albumKey(album.title))
                return {
                  key: album.title,
                  href: edition === undefined ? null : albumHref(base, page.name, edition),
                  title: album.title,
                  picture: { sources: sourcesOf(album.image) },
                  meta: [yearOf(album.released), album.plays === null ? null : `${compactCount(album.plays)} avspillinger`],
                }
              })}
            />
            <Text role="note">
              {albumsFrom === "musicbrainz" ? (
                <>
                  Albumene ifølge <TextLink href="https://musicbrainz.org" external>MusicBrainz</TextLink>, eldste først, uten singler, EP-er, livealbum og samlinger. Avspillingene er alle
                  brukernes på <TextLink href={page.url} external>Last.fm</TextLink>.
                </>
              ) : (
                <>
                  De mest spilte albumene på <TextLink href={page.url} external>Last.fm</TextLink>, etter avspillinger der. Singler, EP-er, livealbum og samlinger er holdt utenfor så godt det lar
                  seg gjøre.
                </>
              )}
            </Text>
          </Stack>
        </PageSection>
      )}
      {concerts}
      {page.plays.length === 0 ? null : (
        <PageSection id="siste" title="Siste avspillinger" icon="history">
          <PlayRows plays={page.plays} base={base} artistLinks={false} />
        </PageSection>
      )}
      {similar}
      {onward}
    </DetailLayout>
  )
}

/**
 * A person from the credits: their picture and what TMDB says of them, the films and shows of the ones seen that they are named in (with the part, or the job), and the way
 * to them on TMDB. `person` is TMDB's page of them (`null` where it did not answer), `found` what the credits of the titles seen say, which is enough for a page without it.
 */
export function PersonDetail({ id, person, found, base }: { id: number; person: Person | null; found: { name: string; profile: string | null; appearances: Appearance[] }; base: string }) {
  const until = person?.deathday ?? new Date().toISOString().slice(0, 10)
  const age = person?.birthday == null ? null : ageOn(person.birthday, until)
  return (
    <DetailLayout
      facts={[
        ["Født", person?.birthday == null ? null : `${longDay(person.birthday)}${person.deathday == null && age !== null ? ` (${age} år)` : ""}`],
        ["Fødested", person?.place ?? null],
        ["Død", person?.deathday == null ? null : `${longDay(person.deathday)}${age === null ? "" : ` (${age} år)`}`],
      ]}
      links={[{ href: `https://www.themoviedb.org/person/${id}`, label: "Åpne på TMDB" }]}
    >
      {person?.biography == null ? null : (
        <PageSection id="om" title="Om personen" icon="info" source={{ label: "TMDB" }}>
          <Text>{firstSentences(person.biography, 900)}</Text>
        </PageSection>
      )}
      <PageSection id="sett" title="I det som er sett" icon="film">
        <List
          kind="film"
          rows={found.appearances.map(({ page, roles }) => ({ key: page.slug, title: page.title, href: titleHref(base, page.slug, page.kind), kind: page.kind === "film" ? "film" : "show", picture: { sources: sourcesOf(page.poster) }, meta: [roles.join(", ") || null], value: page.year === null ? (page.kind === "film" ? "Film" : "Serie") : String(page.year) }))}
        />
      </PageSection>
    </DetailLayout>
  )
}

const tagsText = (tags: readonly string[]): string | null => (tags.length === 0 ? null : tags.join(", "))
const listeners = (n: number | null | undefined): string | null => (n == null ? null : n.toLocaleString("nb-NO"))

/**
 * A track: its cover, who made it and from what, how long it is and how often it has been played, its plays here, and the ways to it on Last.fm and Spotify. The facts and the text are
 * Last.fm's (its text is the users', CC BY-SA, with the link back where it is shown); from Spotify there is only the link to it.
 */
export function TrackDetail({ page, base, info }: { page: TrackPage; base: string; info: { lastfm: TrackInfo | null; spotify: SpotifyTrack | null } }) {
  const { lastfm, spotify } = info
  return (
    <DetailLayout
      facts={[
        ["Artist", <TextLink href={artistHref(base, page.artist)}>{page.artist}</TextLink>],
        ["Album", page.album === null ? null : <TextLink href={albumHref(base, page.artist, page.album)}>{page.album}</TextLink>],
        ["Lengde", lastfm?.seconds == null ? null : lengthText(lastfm.seconds)],
        ["Sjangere", tagsText(lastfm?.tags ?? [])],
        ["Lyttere på Last.fm", listeners(lastfm?.listeners)],
        ["Spilt totalt", lastfm?.userPlays == null ? null : count(lastfm.userPlays, "gang", "ganger")],
        ["Blant de siste avspillingene", count(page.plays.length, "gang", "ganger")],
      ]}
      links={musicLinks(page.url, spotify?.url ?? null)}
    >
      {lastfm?.bio == null ? null : (
        <PageSection id="om" title="Om låten" icon="info" source={lastfmText(page.url)}>
          <Text>{lastfm.bio}</Text>
        </PageSection>
      )}
      <PageSection id="siste" title="Siste avspillinger" icon="history">
        <PlayRows plays={page.plays} base={base} artistLinks={false} trackLinks={false} />
      </PageSection>
    </DetailLayout>
  )
}

/** What an album's facts say, as plain data, so a server island can be given them and add MusicBrainz's label and country (`albumFactsOf`). */
export interface AlbumFactsData {
  released: string | null
  /** How long it is, in seconds. */
  length: number | null
  tags: string[]
  listeners: number | null
  userPlays: number | null
  /** About how long the owner has listened to it, in seconds (`listenedSeconds`). */
  listened: number | null
}

/** What an album's facts are made of: Spotify's day, Last.fm's tracks, tags, listeners and the owner's plays, and the time spent on it estimated from them. */
export function albumFactsOf(page: AlbumPage, info: { lastfm: AlbumInfo | null; spotify: SpotifyAlbum | null; top: TopTrack[] | null }): AlbumFactsData {
  const { lastfm, spotify } = info
  const tracks = lastfm?.tracks ?? []
  const userPlays = lastfm?.userPlays ?? null
  return {
    released: spotify?.released == null ? null : releaseText(spotify.released),
    length: albumSeconds(tracks),
    tags: lastfm?.tags ?? [],
    listeners: lastfm?.listeners ?? null,
    userPlays,
    listened: listenedSeconds(tracks, userPlays, trackPlays(info.top ?? [], page.artist, tracks.map((track) => track.title))),
  }
}

/** The label and the country of an album's first release, where MusicBrainz has told them (`release`, from the page's server island), as one fact's value: «Columbia · USA». */
export function AlbumLabel({ release }: { release: AlbumEdition | null }) {
  const parts = [release === null || release.labels.length === 0 ? null : release.labels.slice(0, 3).join(", "), countryName(release?.country ?? null)].filter((part) => part !== null && part !== "")
  return parts.length === 0 ? null : parts.join(" · ")
}

/**
 * An album's facts, each said only here: the artist is the head's «av …», the tracks are counted by their list, the owner's plays and time listened are the head's figures (`albumFigures`) and the recent plays have their section.
 * `label` is the label and the country of its first release (`AlbumLabel`, a server island the page puts in).
 */
const albumFacts = (facts: AlbumFactsData, label: ReactNode) =>
  [
    ["Utgitt", facts.released],
    ["Plateselskap og land", label ?? null],
    ["Lengde", facts.length === null ? null : durationText(facts.length)],
    ["Sjangere", tagsText(facts.tags)],
    ["Lyttere på Last.fm", listeners(facts.listeners)],
  ] as const

/** An album in the artist's discography: its page where it has one here (`linked`, by `albumKey`, to the title it was played under), else its name, and its year. */
function DiscographyAlbum({ album, artist, base, linked }: { album: StudioAlbum; artist: string; base: string; linked: ReadonlyMap<string, string> }) {
  const edition = linked.get(albumKey(album.title))
  const year = yearOf(album.released)
  return (
    <>
      {edition === undefined ? album.title : <TextLink href={albumHref(base, artist, edition)}>{album.title}</TextLink>}
      {year === null ? null : ` (${year})`}
    </>
  )
}

/**
 * What MusicBrainz says of an album, as the sections after its tracks: who made it (its first official release's credits), its other editions, and its place among the artist's albums with the
 * ones before and after it (with `chart`, the owner's plays of each of them). `linked` are the artist's albums that have a page here, by `albumKey`, to the title each was played under.
 */
export function AlbumRelease({ release, artist, base, linked, chart }: { release: AlbumReleaseData; artist: string; base: string; linked: ReadonlyMap<string, string>; /** The visitor's plays of each of the artist's albums with this one picked out (`DiscographyChart`, an island): it says the place, in place of «Plass». */ chart?: ReactNode }) {
  const { credits, editions, place, first } = release
  return (
    <>
      {credits === null ? null : (
        <PageSection id="medvirkende" title="Medvirkende" icon="people">
          <Stack>
            <FactList
              facts={[
                [credits.producers.length === 1 ? "Produsent" : "Produsenter", credits.producers],
                [credits.writers.length === 1 ? "Låtskriver" : "Låtskrivere", credits.writers],
                ["Musikere", credits.performers],
              ]}
            />
            <Text role="note">
              Fra <TextLink href={`https://musicbrainz.org/release/${first?.id ?? ""}`} external>MusicBrainz</TextLink>, for den første utgivelsen.
            </Text>
          </Stack>
        </PageSection>
      )}
      {editions.length === 0 ? null : (
        <PageSection id="utgaver" title="Utgaver" icon="tag">
          <List columns={{ name: "Utgave", value: "År" }} rows={editions.map((edition) => ({ key: `${edition.name}-${edition.year}`, title: edition.name, meta: [edition.labels.slice(0, 2).join(", ")], value: edition.year }))} />
        </PageSection>
      )}
      {place === null ? null : (
        <PageSection id="diskografi" title="I diskografien" icon="music" more={{ href: `${artistHref(base, artist)}#album`, label: `Alle albumene til ${artist}` }}>
          <Stack>
            {chart}
            <FactList
              facts={[
                ["Plass", chart === undefined ? placeText(place) : null],
                ["Forrige album", place.previous === null ? null : <DiscographyAlbum album={place.previous} artist={artist} base={base} linked={linked} />],
                ["Neste album", place.next === null ? null : <DiscographyAlbum album={place.next} artist={artist} base={base} linked={linked} />],
              ]}
            />
          </Stack>
        </PageSection>
      )}
    </>
  )
}

/** The tracks of an album in order, each with how many times the owner has played it (`plays`, by title) as a bar, so the favourites stand out; with no plays known, only their lengths. */
function AlbumTracks({ tracks, plays, artist, base, played }: { tracks: AlbumInfo["tracks"]; plays: ReadonlyMap<string, number>; artist: string; base: string; played: ReadonlySet<string> }) {
  const link = (track: AlbumInfo["tracks"][number]) => (played.has(trackSlug(artist, track.title)) ? { href: trackHref(base, artist, track.title) } : {})
  if (plays.size === 0) {
    return <List ranked columns={{ name: "Spor", value: "Lengde" }} rows={tracks.map((track, index) => ({ key: `${index}-${track.title}`, title: track.title, ...link(track), value: track.seconds === null ? null : lengthText(track.seconds) }))} />
  }
  return (
    <Stack>
      <List
        ranked
        rows={tracks.map((track, index) => {
          const own = plays.get(track.title)
          return {
            key: `${index}-${track.title}`,
            title: track.title,
            ...link(track),
            meta: [track.seconds === null ? null : lengthText(track.seconds)],
            value: own === undefined ? null : count(own, "avspilling", "avspillinger"),
            amount: own ?? 0,
          }
        })}
      />
      <Text role="note">Avspillingene av hver låt, uansett hvilket album den ble spilt fra. En låt uten tall er ikke blant de tusen mest spilte.</Text>
    </Stack>
  )
}

/**
 * An album: what Last.fm's users write of it, its tracks in order with the owner's plays of each (each links to its page where it has been played), their plays of it over time (`chart`, a
 * server island the page puts in) and by day (`days`), what MusicBrainz says of who made it, its editions and its place among the artist's albums (`release`, another), the plays from it here,
 * and the ways to it on Last.fm and Spotify. The facts are `albumFactsOf`'s, with the label and the country (`label`, `AlbumLabel` in a third island); the day is Spotify's, the rest Last.fm's.
 */
export function AlbumDetail({ page, base, info, played, chart, days, release, label }: { page: AlbumPage; base: string; info: { lastfm: AlbumInfo | null; spotify: SpotifyAlbum | null; top: TopTrack[] | null }; /** The slugs of the tracks that have a page. */ played: ReadonlySet<string>; chart?: ReactNode; /** The days the visitor played it (a calendar, another island). */ days?: ReactNode; release?: ReactNode; /** The label and the country (`AlbumLabel`, a server island). */ label?: ReactNode }) {
  const { lastfm, spotify } = info
  const tracks = lastfm?.tracks ?? []
  return (
    <DetailLayout facts={albumFacts(albumFactsOf(page, info), label)} links={musicLinks(page.url, spotify?.url ?? null)}>
      {lastfm?.bio == null ? null : (
        <PageSection id="om" title="Om albumet" icon="info" source={lastfmText(page.url)}>
          <Text>{lastfm.bio}</Text>
        </PageSection>
      )}
      {tracks.length === 0 ? null : (
        <PageSection id="spor" title="Spor" icon="music">
          <AlbumTracks tracks={tracks} plays={trackPlays(info.top ?? [], page.artist, tracks.map((track) => track.title))} artist={page.artist} base={base} played={played} />
        </PageSection>
      )}
      {chart}
      {days}
      {release}
      <PageSection id="siste" title="Siste avspillinger" icon="history">
        <PlayRows plays={page.plays} base={base} within="album" />
      </PageSection>
    </DetailLayout>
  )
}
