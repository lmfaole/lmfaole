import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { FactList } from "@lmfaole/designsystem/components/fact-list"
import { FilterChips } from "@lmfaole/designsystem/components/filter-chips"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { List } from "@lmfaole/designsystem/components/list"
import { Sparkline } from "@lmfaole/designsystem/components/sparkline"
import { Text } from "@lmfaole/designsystem/components/text"

import { sourcesOf, transformed } from "../lib/image-sources.ts"
import { shortWhen } from "../lib/when.ts"
import { albumHref, albumSlug, artistHref, personHref, trackHref, trackSlug } from "../lib/pages.ts"
import type { SpotifyArtist } from "../lib/spotify.ts"
import type { PeriodData } from "../lib/week-source.ts"
import { WEEKDAY_NAMES } from "../lib/weeks.ts"
import { hourText, rankChange, longLength, playsChange, signed, type TopArtist, type WatchStats, type WeekStats } from "../lib/wrapped.ts"
import type { ReactNode } from "react"


/** What has a page of its own to link to: the slugs of the artists, albums and songs among the recent plays, and the address of each title among the films and shows seen. */
export interface Linkable {
  artists: ReadonlySet<string>
  albums: ReadonlySet<string>
  tracks: ReadonlySet<string>
  titles: ReadonlyMap<string, string>
}

const number = (n: number): string => n.toLocaleString("nb-NO")
/** A count with its noun: «1 avspilling», «12 avspillinger». */
const count = (n: number, one: string, many: string): string => `${number(n)} ${n === 1 ? one : many}`
const capital = (word: string): string => word.slice(0, 1).toUpperCase() + word.slice(1)

/** The numbers of the week: how much, how long (an estimate, and how much of it is known), and when. */
function Numbers({ stats, previousTotal, previous, truncated }: { stats: WeekStats; previousTotal: number | null; /** What the change is from: «uken før», «måneden før». */ previous: string; truncated: boolean }) {
  const change = playsChange(stats.total, previousTotal)
  const { listening } = stats
  return (
    <PageSection id="tall" title="Tall" icon="chart">
      <Stack>
        <FactList
          facts={[
            ["Avspillinger", `${number(stats.total)}${change === null ? "" : ` (${signed(change)} fra ${previous})`}`],
            ["Ulike artister", number(stats.artists)],
            ["Ulike låter", number(stats.tracks)],
            ["Lyttetid, anslag", stats.total === 0 ? null : `≈ ${longLength(listening.seconds)}`],
            ["Lengde kjent for", stats.total === 0 ? null : `${number(listening.knownPlays)} av ${count(stats.total, "avspilling", "avspillinger")}`],
            ["Travleste dag", stats.busiestDay === null ? null : `${capital(WEEKDAY_NAMES[stats.busiestDay.day] ?? "")} (${number(stats.busiestDay.plays)})`],
            ["Travleste time", stats.busiestHour === null ? null : `${hourText(stats.busiestHour.hour)} (${number(stats.busiestHour.plays)})`],
            ["Per dag, mandag til søndag", stats.total === 0 ? null : <Sparkline data={stats.byDay} ariaLabel={`Avspillinger per dag, mandag til søndag: ${stats.byDay.join(", ")}`} />],
          ]}
        />
        {truncated ? <Text role="quiet">Ikke alle avspillingene ble lest, så tallene kan være litt for lave.</Text> : null}
      </Stack>
    </PageSection>
  )
}

/** The top artists, each with its picture (Spotify's, by name), how many plays, and how its place moved since the week before. */
function ArtistRows({ artists, pictures, linked, base }: { artists: readonly TopArtist[]; pictures: ReadonlyMap<string, SpotifyArtist>; linked: ReadonlySet<string>; base: string }) {
  return (
    <List
      kind="artist"
      ranked
      rows={artists.map((artist) => {
        const found = pictures.get(artist.name)
        return {
          key: artist.name,
          title: artist.name,
          ...(linked.has(artist.name) ? { href: artistHref(base, artist.name) } : {}),
          picture: { sources: transformed(found?.images ?? []) },
          meta: [found === undefined ? null : { label: "Åpne i Spotify", href: found.url, external: true }],
          value: count(artist.plays, "avspilling", "avspillinger"),
          amount: artist.plays,
          change: artist.change === null ? null : rankChange(artist.change),
        }
      })}
    />
  )
}

/** The top artists, a section of its own: its pictures come from Spotify, which a page may ask for only as far as its limit goes, so the page puts this in a server island (`TopArtists.astro`) that has a budget of its own. */
export function ArtistsSection({ artists, pictures, linked, base }: { artists: readonly TopArtist[]; pictures: ReadonlyMap<string, SpotifyArtist>; linked: ReadonlySet<string>; base: string }) {
  return (
    <PageSection id="toppartister" title="Toppartister" icon="person">
      <ArtistRows artists={artists} pictures={pictures} linked={linked} base={base} />
    </PageSection>
  )
}

/** The top lists of albums and songs, each in the shape of what it is. */
function Tops({ stats, links, base }: { stats: WeekStats; links: Linkable; base: string }) {
  if (stats.total === 0) return null
  return (
    <>
      {stats.topAlbums.length === 0 ? null : (
        <PageSection id="toppalbum" title="Toppalbum" icon="music">
          <List
            kind="album"
            ranked
            rows={stats.topAlbums.map((album) => ({
              key: `${album.artist}-${album.title}`,
              title: album.title,
              ...(links.albums.has(albumSlug(album.artist, album.title)) ? { href: albumHref(base, album.artist, album.title) } : {}),
              picture: { sources: sourcesOf(album.image) },
              meta: [album.artist],
              value: count(album.plays, "avspilling", "avspillinger"),
              amount: album.plays,
            }))}
          />
        </PageSection>
      )}
      <PageSection id="topplater" title="Topplåter" icon="play">
        <List
          kind="track"
          ranked
          rows={stats.topTracks.map((track) => ({
            key: `${track.artist}-${track.title}`,
            title: track.title,
            ...(links.tracks.has(trackSlug(track.artist, track.title)) ? { href: trackHref(base, track.artist, track.title) } : {}),
            picture: { sources: sourcesOf(track.image) },
            meta: [track.artist],
            value: count(track.plays, "avspilling", "avspillinger"),
            amount: track.plays,
          }))}
        />
      </PageSection>
    </>
  )
}

/** The artists among the most played that were played for the first time this week; none, when there were none. */
function NewArtists({ names, links, base }: { names: readonly { name: string; plays: number }[] | null; links: Linkable; base: string }) {
  if (names === null) return null
  return (
    <PageSection id="nye" title="Nye artister" icon="new">
      {names.length === 0 ? (
        <EmptyState reason="nothing-yet" what="nye artister" description="Alle artistene du spilte mest hadde du hørt på før." />
      ) : (
        <List
          columns={{ name: "Artist", value: "Avspillinger" }}
          rows={names.map((artist) => ({
            key: artist.name,
            title: artist.name,
            ...(links.artists.has(artist.name) ? { href: artistHref(base, artist.name) } : {}),
            value: number(artist.plays),
          }))}
        />
      )}
    </PageSection>
  )
}

/** A film or a show as its page here, where it has one (among the titles seen lately), else its name. */
const titleOf = (links: Linkable, name: string): { title: string; href?: string } => {
  const href = links.titles.get(name)
  return href === undefined ? { title: name } : { title: name, href }
}

/** The shape of the viewings over the week, Monday to Sunday: for a week only, a month has its own chart of the days. */
const perDayFact = (stats: WatchStats, perDay: boolean): [string, ReactNode] => ["Per dag, mandag til søndag", perDay ? <Sparkline data={stats.byDay} ariaLabel={`Visninger per dag, mandag til søndag: ${stats.byDay.join(", ")}`} /> : null]
const busiestFact = (stats: WatchStats, one: string, many: string): [string, string | null] => ["Travleste dag", stats.busiestDay === null ? null : `${capital(WEEKDAY_NAMES[stats.busiestDay.day] ?? "")} (${count(stats.busiestDay.viewings, one, many)})`]

/**
 * The wrapped of the films of a week or a month, from Trakt: the numbers (films, how long, an estimate, and when), the genres and the directors (from TMDB, where it has been asked), and the films.
 * `perDay` is the sparkline of the weekdays, for a week; a month has its own chart of the days.
 */
export function FilmPeriod({ stats, links, base, perDay }: { stats: WatchStats; links: Linkable; base: string; perDay: boolean }) {
  if (stats.films === 0) {
    return (
      <PageSection id="tall" title="Tall" icon="chart">
        <EmptyState reason="no-results" what="filmer" description="Oppsummeringen lages av filmene du markerer som sett på Trakt i perioden. Velg en annen periode, eller se filmene du har sett sist." action={{ href: `${base}film/`, label: "Se filmene du har sett sist" }} />
      </PageSection>
    )
  }
  return (
    <>
      <PageSection id="tall" title="Tall" icon="chart">
        <FactList
          facts={[
            ["Filmer", number(stats.films)],
            ["Seertid, anslag", `≈ ${longLength(stats.minutes * 60)}`],
            busiestFact(stats, "film", "filmer"),
            perDayFact(stats, perDay),
          ]}
        />
      </PageSection>
      <PageSection id="filmer" title="Filmer" icon="film">
        <List kind="film" rows={stats.filmItems.map((one) => ({ key: `${one.title}-${one.watchedAt}`, ...titleOf(links, one.title), picture: { sources: sourcesOf(one.poster) }, meta: [one.year], value: shortWhen(one.watchedAt) }))} />
      </PageSection>
      {stats.genres.length === 0 ? null : (
        <PageSection id="sjangere" title="Sjangere" icon="tag">
          <List columns={{ name: "Sjanger", value: "Filmer" }} rows={stats.genres.map((genre) => ({ key: genre.name, title: genre.name, value: number(genre.films) }))} />
        </PageSection>
      )}
      {stats.directors.length === 0 ? null : (
        <PageSection id="regi" title="Regi" icon="person">
          <List columns={{ name: "Regissør", value: "Filmer" }} rows={stats.directors.map((director) => ({ key: String(director.id), title: director.name, href: personHref(base, director.id, director.name), value: number(director.films) }))} />
        </PageSection>
      )}
    </>
  )
}

/**
 * The wrapped of the TV of a week or a month, from Trakt: the numbers (episodes, shows, how long, an estimate, and when), then the shows most watched and the binges.
 * `perDay` is the sparkline of the weekdays, for a week; a month has its own chart of the days.
 */
export function TvPeriod({ stats, links, base, perDay }: { stats: WatchStats; links: Linkable; base: string; perDay: boolean }) {
  if (stats.episodes === 0) {
    return (
      <PageSection id="tall" title="Tall" icon="chart">
        <EmptyState reason="no-results" what="episoder" description="Oppsummeringen lages av episodene du markerer som sett på Trakt i perioden. Velg en annen periode, eller se episodene du har sett sist." action={{ href: `${base}tv/`, label: "Se episodene du har sett sist" }} />
      </PageSection>
    )
  }
  return (
    <>
      <PageSection id="tall" title="Tall" icon="chart">
        <FactList
          facts={[
            ["Episoder", number(stats.episodes)],
            ["Ulike serier", number(stats.showCount)],
            ["Maraton", stats.binges.length === 0 ? null : count(stats.binges.length, "dag", "dager")],
            ["Seertid, anslag", `≈ ${longLength(stats.minutes * 60)}`],
            busiestFact(stats, "episode", "episoder"),
            perDayFact(stats, perDay),
          ]}
        />
      </PageSection>
      <PageSection id="toppserier" title="Mest sette serier" icon="tv">
        <List kind="show" ranked rows={stats.shows.map((show) => ({ key: show.title, ...titleOf(links, show.title), picture: { sources: sourcesOf(show.poster) }, value: count(show.episodes, "episode", "episoder"), amount: show.episodes }))} />
      </PageSection>
      {stats.binges.length === 0 ? null : (
        <PageSection id="maraton" title="Maraton" icon="play">
          <Stack gap="tight">
            <Text role="quiet">Tre episoder eller flere av samme serie på én dag.</Text>
            <List columns={{ name: "Serie", value: "Episoder" }} rows={stats.binges.map((binge) => ({ key: binge.key, ...titleOf(links, binge.title), value: number(binge.episodes.length) }))} />
          </Stack>
        </PageSection>
      )}
    </>
  )
}

/** The weeks or the months to go to: this one so far, and the ones before it, newest first. `rows` have their name, the days they cover and where they are. */
export function OtherPeriods({ id, title, name, rows, current }: { id: string; title: string; /** What the first column is called: «Uke», «Måned». */ name: string; rows: readonly { key: string; label: string; range: string; href: string }[]; current: string }) {
  return (
    <PageSection id={id} title={title} icon="calendar">
      <List
        columns={{ name, value: "Dager" }}
        rows={rows.filter((one) => one.key !== current).map((one) => ({ key: one.key, title: one.label, href: one.href, value: one.range }))}
      />
    </PageSection>
  )
}

/** The way between the wrapped of a week and of a month: two links, the one you are on marked. */
export function PeriodChips({ current, weekHref, monthHref }: { current: "week" | "month"; weekHref: string; monthHref: string }) {
  return (
    <FilterChips
      label="Periode"
      chips={[
        { key: "week", label: "Uke", href: weekHref, current: current === "week" },
        { key: "month", label: "Måned", href: monthHref, current: current === "month" },
      ]}
    />
  )
}

/**
 * A week's or a month's wrapped of the music, in two parts with the top artists between them (a server island, see `ArtistsSection`): `head` is the numbers, `tail` the lists of albums and songs and who is
 * new. `previous` is what the change is from. Film and TV has its own (`FilmPeriod`).
 */
export function PeriodView({ data, links, base, previous, part }: { data: PeriodData; links: Linkable; base: string; previous: string; part: "head" | "tail" }) {
  const { music } = data
  if (part === "head") {
    if (music === null) return null
    return music.stats.total === 0 ? (
      <PageSection id="tall" title="Tall" icon="chart">
        <EmptyState reason="no-results" what="avspillinger" description="Oppsummeringen lages av det Last.fm førte opp i perioden. Velg en annen periode, eller se det du har hørt på sist." action={{ href: `${base}musikk/`, label: "Se de siste avspillingene" }} />
      </PageSection>
    ) : (
      <Numbers stats={music.stats} previousTotal={music.previousTotal} previous={previous} truncated={music.truncated} />
    )
  }
  if (music === null || music.stats.total === 0) return null
  return (
    <>
      <Tops stats={music.stats} links={links} base={base} />
      <NewArtists names={music.newArtists} links={links} base={base} />
    </>
  )
}
