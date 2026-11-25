/**
 * The history (plays from Last.fm, viewings from Trakt) as the design system's timeline takes it: one event per play or viewing, and the sessions they make as
 * spans on a time axis. Pure, so a test pins it; a page only passes the result on.
 */

import type { DurationSpan, TimelineEvent, TimelineTone } from "@lmfaole/designsystem/lib/timeline"

import type { Play } from "./lastfm.ts"
import { albumSlug, slugify } from "./pages.ts"
import { episodeCode, type Watch } from "./trakt.ts"
import { trackKey, TYPICAL_SECONDS, watchMinutes } from "./wrapped.ts"

export type { DurationSpan, TimelineEvent, TimelineTone }

/** The lane of the spans of each kind. */
export const MUSIC_ROW = "Musikk"
export const WATCH_ROW = "Film og TV"
/** A pause this long or longer ends a session. */
export const SESSION_GAP_MINUTES = 30

const MINUTE = 60_000

/** Newest first; a tie keeps the order it came in. */
const newestFirst = <T extends { at: string }>(events: readonly T[]): T[] => events.toSorted((a, b) => Date.parse(b.at) - Date.parse(a.at))

/** Ids that are unique even where two items share a time (a double scrobble). */
function uniqueIds(events: readonly TimelineEvent[]): TimelineEvent[] {
  const seen = new Map<string, number>()
  return events.map((event) => {
    const count = (seen.get(event.id) ?? 0) + 1
    seen.set(event.id, count)
    return count === 1 ? event : { ...event, id: `${event.id}-${count}` }
  })
}

/**
 * The plays as timeline events, newest first: «spilte <spor – artist>». Plays of one album that follow each other share a group, so a run of them collapses
 * («Vis 9 spor til»); a play with no album is grouped by its artist (`groupBy: "artist"` groups every play that way). What is playing now (no time) is left out:
 * it is `playingEvent`.
 * `href` is the track's link (the site's own page, say); the default is Last.fm's.
 */
export function playsTimeline(plays: readonly Play[], options: { groupBy?: "album" | "artist"; href?: (play: Play) => string | undefined } = {}): TimelineEvent[] {
  const { groupBy = "album", href = (play: Play) => play.url || undefined } = options
  const events = plays.flatMap((play): TimelineEvent[] => {
    if (play.playedAt === null) return []
    const link = href(play)
    const group = groupBy === "album" && play.album !== "" ? `album:${albumSlug(play.artist, play.album)}` : `artist:${slugify(play.artist)}`
    return [
      {
        id: `spilt-${Date.parse(play.playedAt) / 1000}`,
        at: play.playedAt,
        kind: "event",
        icon: "music",
        summary: "spilte",
        target: { label: `${play.track} – ${play.artist}`, ...(link === undefined ? {} : { href: link }) },
        ...(play.url === "" ? {} : { href: play.url }),
        group,
        groupNoun: "spor",
      },
    ]
  })
  return uniqueIds(newestFirst(events))
}

/**
 * The song playing now as the first event: «spiller <spor – artist>», ongoing (a live cue and «nå» for the time), at `now`. It has no group, so it stands
 * on its own above the finished plays. `href` is where its title links (Spotify's page of the song, say); none, and it is not a link.
 */
export function playingEvent(playing: { track: string; artist: string; url: string }, now: string, href?: string): TimelineEvent {
  return {
    id: "spiller-na",
    at: now,
    kind: "event",
    icon: "music",
    summary: "spiller",
    target: { label: `${playing.track} – ${playing.artist}`, ...(href === undefined ? {} : { href }) },
    ...(playing.url === "" ? {} : { href: playing.url }),
    ongoing: true,
  }
}

/** «Heat», «Andor, S2 E5». */
const watchLabel = (watch: Watch): string => (watch.episode === null ? watch.title : `${watch.title}, ${episodeCode(watch.episode)}`)

/**
 * The viewings as timeline events, newest first: «så <tittel>». Episodes of one show that follow each other share a group («Vis 6 episoder til»); a film stands alone.
 * `href` is the title's link (the site's page for it, say); the default is Trakt's.
 */
export function watchesTimeline(watches: readonly Watch[], options: { href?: (watch: Watch) => string | undefined } = {}): TimelineEvent[] {
  const { href = (watch: Watch) => watch.url || undefined } = options
  const events = watches.map((watch): TimelineEvent => {
    const link = href(watch)
    return {
      id: `sett-${watch.id}`,
      at: watch.watchedAt,
      kind: "event",
      icon: watch.kind === "film" ? "film" : "tv",
      summary: "så",
      target: { label: watchLabel(watch), ...(link === undefined ? {} : { href: link }) },
      ...(watch.url === "" ? {} : { href: watch.url }),
      ...(watch.episode === null ? {} : { group: `show:${slugify(watch.title)}`, groupNoun: "episoder" }),
    }
  })
  return uniqueIds(newestFirst(events))
}

/** The `groupNouns` the timeline takes today, from the events' own `groupNoun`. */
export function groupNounsOf(events: readonly TimelineEvent[]): Record<string, string> {
  const nouns: Record<string, string> = {}
  for (const event of events) if (event.group !== undefined && event.groupNoun !== undefined) nouns[event.group] ??= event.groupNoun
  return nouns
}

/** A stretch of time something took, in ISO, with what it was. */
export interface Interval {
  start: string
  end: string
  label: string
}

/** Each play from when it began to when it ended: its length where it is known (`lengths`, seconds by `trackKey`), a typical song's where it is not. */
export function playIntervals(plays: readonly Play[], lengths: ReadonlyMap<string, number> = new Map()): Interval[] {
  return plays.flatMap((play): Interval[] => {
    if (play.playedAt === null) return []
    const known = lengths.get(trackKey(play.artist, play.track))
    const seconds = known !== undefined && known > 0 ? known : TYPICAL_SECONDS
    return [{ start: play.playedAt, end: new Date(Date.parse(play.playedAt) + seconds * 1000).toISOString(), label: play.track }]
  })
}

/** Each viewing up to when it was marked as seen (Trakt's time is the end): a film's runtime where TMDB has it, a typical length where not. */
export function watchIntervals(watches: readonly Watch[]): Interval[] {
  return watches.map((watch) => {
    const minutes = watchMinutes(watch)
    const end = Date.parse(watch.watchedAt)
    return { start: new Date(end - minutes * MINUTE).toISOString(), end: new Date(end).toISOString(), label: watch.title }
  })
}

/**
 * The intervals (in any order) as sessions, oldest first: a session runs on while the next interval begins less than `gapMinutes` after the end of what came
 * before (overlaps included). `name` says what a session is called from what it holds.
 */
export function sessions(intervals: readonly Interval[], gapMinutes: number, options: { key: string; row: string; name: (items: readonly Interval[]) => string; tone?: TimelineTone }): DurationSpan[] {
  const runs: { start: number; end: number; items: Interval[] }[] = []
  for (const interval of intervals.toSorted((a, b) => Date.parse(a.start) - Date.parse(b.start))) {
    const start = Date.parse(interval.start)
    const end = Math.max(start, Date.parse(interval.end))
    const last = runs.at(-1)
    if (last !== undefined && start - last.end < gapMinutes * MINUTE) {
      last.items.push(interval)
      last.end = Math.max(last.end, end)
    } else runs.push({ start, end, items: [interval] })
  }
  return runs.map((run) => {
    const start = new Date(run.start).toISOString()
    return { key: `${options.key}-${start}`, label: options.name(run.items), start, end: new Date(run.end).toISOString(), row: options.row, ...(options.tone === undefined ? {} : { tone: options.tone }) }
  })
}

/**
 * «Lytteøkt, 12 spor», in the music lane. `playingAt` is now, when a song plays: it is one more song of the last session (or the start of a new one), and that
 * session goes on (no end).
 */
export function listeningSessions(plays: readonly Play[], options: { lengths?: ReadonlyMap<string, number>; gapMinutes?: number; playingAt?: string } = {}): DurationSpan[] {
  const { playingAt } = options
  const playing = playingAt === undefined ? [] : [{ start: playingAt, end: playingAt, label: "" }]
  const spans = sessions([...playIntervals(plays, options.lengths), ...playing], options.gapMinutes ?? SESSION_GAP_MINUTES, { key: "lytteokt", row: MUSIC_ROW, name: (items) => `Lytteøkt, ${items.length} spor` })
  const last = spans.at(-1)
  if (playingAt === undefined || last === undefined) return spans
  const { end: _end, ...ongoing } = last
  return [...spans.slice(0, -1), ongoing]
}

/** The spans that are at least in part between `start` and `end`, so none is drawn as a sliver at an edge of the axis. */
export function spansWithin(spans: readonly DurationSpan[], start: string, end: string): DurationSpan[] {
  const [from, to] = [Date.parse(start), Date.parse(end)]
  return spans.filter((span) => Date.parse(span.start) < to && (span.end === undefined || Date.parse(span.end) > from))
}

/** One title by itself («Heat»), one show's episodes («Andor, 3 episoder»), or a mix («Titteøkt, 3 titler»), in the film and TV lane. */
export function watchSessions(watches: readonly Watch[], options: { gapMinutes?: number; row?: string } = {}): DurationSpan[] {
  return sessions(watchIntervals(watches), options.gapMinutes ?? SESSION_GAP_MINUTES, {
    key: "titteokt",
    row: options.row ?? WATCH_ROW,
    name: (items) => {
      const titles = new Set(items.map((item) => item.label))
      const [only] = titles
      if (titles.size === 1 && only !== undefined) return items.length === 1 ? only : `${only}, ${items.length} episoder`
      return `Titteøkt, ${items.length} titler`
    },
  })
}
