/** Imports the owner's own history from the old monorepo's data dump (`monorepo/data-dump/<db>/<table>.jsonl`) into D1, once.
 *  Only what is the owner's own and can't be fetched again; registry copies and derived tables stay in the dump. Every table is declared in
 *  `SPECS` below: where it comes from, the row it becomes and what it is checked against so nothing is in twice.
 *
 *  D1's free plan writes 100,000 rows a day for the whole account, and the crons write too, so before each batch it asks the account's
 *  analytics how much has been written today (UTC) and stops below `--max-day`. A cursor per table (`scripts/.import-dump/state.json`)
 *  makes the next run carry on where this one stopped; the writes are INSERT OR IGNORE, so a batch run twice adds nothing.
 *  `music/listens` goes last and only up to the activity worker's ListenBrainz cursor: later plays are written by the worker itself.
 *
 *  node scripts/import-dump.ts [--dry-run [--refresh]] [--local [--persist-to dir]] [--only db[/table]] [--max-day 85000] [--batch-rows 5000]
 *                              [--restart] [--listens-ahead] [--export-r2] [--dump ../monorepo/data-dump] */

import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { gzipSync } from "node:zlib"

export type Value = string | number | null
export type Row = Value[]
export type Rec = Record<string, unknown>
export type Db = "site" | "library" | "gameplay" | "watching" | "music"

export interface Context {
  /** A dump table, `<db>/<table>`, as objects. */
  read(path: string): Rec[]
  /** The answer to one of the spec's `lookups`, asked of the database being written to. */
  lookup(name: string): Rec[]
  now: number
  listensAhead: boolean
}

export interface Spec {
  db: Db
  table: string
  columns: string[]
  /** Secondary indexes on the table: D1 counts a row written for each. */
  indexes?: number
  lookups?: Record<string, string>
  /** One entry per source row, always in the same order (the cursor counts them): the row to write, or null to leave it out. */
  prepare(ctx: Context): (Row | null)[]
  /** True for the first row not to write yet; the table stops there until a later run. */
  pause?(row: Row, ctx: Context): boolean
  /** Makes the insert `INSERT OR IGNORE … SELECT * FROM (VALUES …) AS v WHERE <guard>`, the columns being v.column1, v.column2, … */
  guard?: string
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const WORK = join(ROOT, "scripts/.import-dump")
const ACCOUNT = "5d49b98b68b70cbd1c81be0f18501262"
export const CLIENT = "monorepo-dump"
const CONFIG: Record<Db, string> = {
  music: join(ROOT, "workers/activity/wrangler.jsonc"),
  gameplay: join(ROOT, "workers/activity/wrangler.jsonc"),
  watching: join(ROOT, "workers/activity/wrangler.jsonc"),
  library: join(ROOT, "packages/db/wrangler.jsonc"),
  site: join(ROOT, "packages/db/wrangler.jsonc"),
}

// ---------------------------------------------------------------------------------------------------------------- reading the dump

/** A cell as the dump writes it: plain JSON, or `{$real}` (a whole-number REAL), `{$int}` (an integer beyond 2^53, as text),
 *  `{$text}` (text with a NUL, base64) or `{$blob}` (base64). */
export function decode(cell: unknown): unknown {
  if (cell === null || typeof cell !== "object" || Array.isArray(cell)) return cell
  const c = cell as Rec
  if ("$real" in c) return Number(c.$real)
  if ("$int" in c) {
    const n = BigInt(String(c.$int))
    return Number.isSafeInteger(Number(n)) ? Number(n) : n.toString()
  }
  if ("$text" in c) return Buffer.from(String(c.$text), "base64").toString("utf8")
  if ("$blob" in c) return Buffer.from(String(c.$blob), "base64")
  return cell
}

/** JSON Lines whose first line is the column names and every other line a row's values. */
export function parseJsonl(text: string): Rec[] {
  const lines = text.split("\n").filter((line) => line.length > 0)
  if (lines.length === 0) return []
  const header = JSON.parse(lines[0]!) as string[]
  return lines.slice(1).map((line) => {
    const values = JSON.parse(line) as unknown[]
    const rec: Rec = {}
    header.forEach((column, i) => (rec[column] = decode(values[i])))
    return rec
  })
}

// ---------------------------------------------------------------------------------------------------------------- small helpers

export const value = (v: unknown): Value => {
  if (v === null || v === undefined) return null
  if (typeof v === "number") return v
  if (typeof v === "boolean") return v ? 1 : 0
  if (typeof v === "string") return v
  throw new Error(`can't write ${typeof v}`)
}
const text = (v: unknown): string | null => (v === null || v === undefined || v === "" ? null : String(v))
const num = (v: unknown): number | null => (v === null || v === undefined || v === "" ? null : Number(v))
const epoch = (iso: unknown): number | null => (typeof iso === "string" && iso ? Math.floor(Date.parse(iso) / 1000) : null)
/** SQLite's NOCASE: only A–Z are folded. */
export const fold = (s: unknown): string => String(s ?? "").replace(/[A-Z]/g, (c) => c.toLowerCase())
/** A title compared loosely: lower case, accents and everything but letters and digits gone. */
export const norm = (s: unknown): string =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "")
export const utcDay = (at: number): string => new Date(at * 1000).toISOString().slice(0, 10)
export const osloDay = (at: number): string => new Date(at * 1000).toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" })

/** Leaves out every row after the first with the same key. */
function firstOf<T>(items: (T | null)[], key: (item: T) => string): (T | null)[] {
  const seen = new Set<string>()
  return items.map((item) => {
    if (item === null) return null
    const k = key(item)
    if (seen.has(k)) return null
    seen.add(k)
    return item
  })
}

// ---------------------------------------------------------------------------------------------------------------- dedup rules

/** A dump listen is already in D1 when D1 has the same artist and track (case folded as NOCASE does) within a minute of it. */
export function nearListen(index: Map<string, number[]>, at: number, artist: unknown, track: unknown, slack = 60): boolean {
  return (index.get(`${fold(artist)}\u0000${fold(track)}`) ?? []).some((t) => Math.abs(t - at) <= slack)
}

export function listenIndex(rows: Rec[]): Map<string, number[]> {
  const index = new Map<string, number[]>()
  for (const r of rows) {
    const key = `${fold(r.artist)}\u0000${fold(r.track)}`
    const list = index.get(key)
    if (list) list.push(Number(r.listened_at))
    else index.set(key, [Number(r.listened_at)])
  }
  return index
}

export interface LoggedFilm {
  id: number
  watched_on: string | null
  title: string
  year: number | null
  tmdb_id: number | null
}

/** A viewing already in D1: `ref` is 'trakt:<history id>' or 'letterboxd:<id>', `days` the day(s) it may be on (Trakt keeps a time,
 *  which is both an Oslo and a UTC day). */
export interface Viewing {
  ref: string
  days: string[]
  title: string
  year: number | null
  tmdb_id: number | null
}

const sameFilm = (f: LoggedFilm, v: Viewing): boolean =>
  (f.tmdb_id !== null && f.tmdb_id === v.tmdb_id) ||
  (norm(f.title) === norm(v.title) && (f.year === null || v.year === null || Math.abs(f.year - v.year) <= 1))

/** Pairs each logged film with at most one viewing in D1, and each viewing with at most one logged film:
 *  1. a dated line and a viewing on that day of the same film (TMDB id, or title and a year at most one apart);
 *  2. a dated line and a film that are each the only one left on that day (Trakt and Letterboxd may both have it), with years at most one
 *     apart where both are known: a Norwegian title against an English one;
 *  3. an undated line and a viewing of the same film on any day (Trakt has those at the release date). */
export function matchFilms(log: LoggedFilm[], seen: Viewing[]): Map<number, string> {
  const used = new Set<string>()
  const out = new Map<number, string>()
  const take = (f: LoggedFilm, v: Viewing): void => {
    used.add(v.ref)
    out.set(f.id, v.ref)
  }
  const dated = log.filter((f) => f.watched_on !== null)
  for (const f of dated) {
    const v = seen.find((v) => !used.has(v.ref) && v.days.includes(f.watched_on!) && sameFilm(f, v))
    if (v) take(f, v)
  }
  for (const day of new Set(dated.filter((f) => !out.has(f.id)).map((f) => f.watched_on!))) {
    const films = dated.filter((f) => !out.has(f.id) && f.watched_on === day)
    const views = seen.filter((v) => !used.has(v.ref) && v.days.includes(day))
    const [f] = films, [v] = views
    const one = new Set(views.map((v) => v.tmdb_id ?? norm(v.title))).size === 1
    if (films.length === 1 && one && f && v && (f.year === null || v.year === null || Math.abs(f.year - v.year) <= 1)) take(f, v)
  }
  for (const f of log.filter((f) => f.watched_on === null)) {
    const v = seen.find((v) => !used.has(v.ref) && sameFilm(f, v))
    if (v) take(f, v)
  }
  return out
}

export interface LoggedEpisode {
  id: number
  watched_on: string | null
  series: string
  season: number | null
  episode: number | null
}

export interface SeenEpisode {
  watched_at: number
  show: string
  season: number | null
  episode: number | null
}

/** The logged episodes Trakt already has, one Trakt play for each: the same show (title compared loosely), season and episode on the same
 *  Oslo or UTC day, or, for a line with no day, a Trakt play with no day (Trakt keeps those at 1970-01-01). */
export function matchEpisodes(log: LoggedEpisode[], seen: SeenEpisode[]): Set<number> {
  const plays = new Map<string, { days: string[]; undated: boolean; used: boolean }[]>()
  for (const e of seen) {
    const key = `${norm(e.show)}|${e.season}|${e.episode}`
    const list = plays.get(key) ?? []
    list.push({ days: [osloDay(e.watched_at), utcDay(e.watched_at)], undated: e.watched_at < 86_400, used: false })
    plays.set(key, list)
  }
  const out = new Set<number>()
  for (const l of log) {
    const play = (plays.get(`${norm(l.series)}|${l.season}|${l.episode}`) ?? []).find(
      (p) => !p.used && (l.watched_on === null ? p.undated : !p.undated && p.days.includes(l.watched_on)),
    )
    if (play) {
      play.used = true
      out.add(l.id)
    }
  }
  return out
}

/** TMDB's stand-in name for an episode it has no title for, which says nothing the number doesn't. */
export const genericEpisode = (name: unknown): boolean => /^(episode|episodio|épisode|folge|afl\.?|avsnitt|episod|jakso)\s*\d+$/i.test(String(name ?? "").trim())

// ---------------------------------------------------------------------------------------------------------------- the tables

/** A dump table copied as it is, with some of its columns (named as in D1: `[d1, dump]` where they differ). */
function copy(db: Db, table: string, source: string, columns: (string | [string, string])[], keep: (r: Rec, ctx: Context) => boolean = () => true): Spec {
  const names = columns.map((c) => (typeof c === "string" ? c : c[0]))
  const from = columns.map((c) => (typeof c === "string" ? c : c[1]))
  return { db, table, columns: names, prepare: (ctx) => ctx.read(source).map((r) => (keep(r, ctx) ? from.map((c) => value(r[c])) : null)) }
}

const privateRepos = (ctx: Context): Set<string> => new Set(ctx.read("github/github_repos").filter((r) => r.private).map((r) => String(r.full_name)))
const notOn = (...prefixes: string[]) => (r: Rec) => !prefixes.some((p) => String(r.source ?? "").startsWith(p))
const LIST = ["log", "collection"] as const

export const SPECS: Spec[] = [
  // site: the CV (in the CV app's words), the glossary, page previews and public GitHub activity.
  copy("site", "cv_person", "cv/cv_person", ["id", "navn", "tittel", "arbeidsgiver", "sted"]),
  copy("site", "cv_employer", "cv/cv_employer", ["id", "navn", "sted"]),
  copy("site", "cv_position", "cv/cv_position", ["id", "arbeidsgiver_id", "fra", "til", "aar", "tittel", "beskrivelse", "kortbeskrivelse"]),
  copy("site", "cv_education", "cv/cv_education", ["id", "fra", "til", "aar", "grad", "institusjon", "beskrivelse", "kortbeskrivelse"]),
  copy("site", "cv_project", "cv/cv_project", ["id", "stilling_id", "fra", "til", "aar", "navn", "tittel", "url", "beskrivelse", "kortbeskrivelse", "repo"]),
  copy("site", "cv_link", "cv/cv_link", ["id", "navn", "url"]),
  copy("site", "glossary_term", "site/glossary_term", ["id", "term", "url"]),
  // The other apps (accounts, budget, life, photos, podcast) are gone.
  copy("site", "og_page", "site/og_page", ["id", "title", "description", "heading", "lead", "image"], (r) => /^(cv|music):/.test(String(r.id))),
  {
    db: "site",
    table: "github_repos",
    columns: ["full_name", "description", "language", "stars", "fork", "archived", "created_at", "pushed_at"],
    prepare: (ctx) =>
      ctx
        .read("github/github_repos")
        .map((r) => (r.private ? null : [text(r.full_name), text(r.description), text(r.language), num(r.stars) ?? 0, num(r.fork) ?? 0, num(r.archived) ?? 0, epoch(r.created_at), epoch(r.pushed_at)])),
  },
  {
    db: "site",
    table: "github_items",
    columns: ["id", "kind", "repo", "number", "title", "state", "merged", "created_at", "closed_at"],
    prepare: (ctx) => {
      const hidden = privateRepos(ctx)
      return ctx
        .read("github/github_items")
        .map((r) => (hidden.has(String(r.repo)) ? null : [num(r.id), text(r.kind), text(r.repo), num(r.number), text(r.title), text(r.state), num(r.merged) ?? 0, epoch(r.created_at), epoch(r.closed_at)]))
    },
  },
  copy("site", "github_days", "github/github_days", ["day", "contributions"]),
  {
    db: "site",
    table: "github_project_commits",
    columns: ["repo", "sha", "message", "committed_at"],
    prepare: (ctx) => {
      const hidden = privateRepos(ctx)
      return ctx.read("github/github_project_commits").map((r) => (hidden.has(String(r.repo)) ? null : [text(r.repo), text(r.sha), text(r.message), epoch(r.committed_at)]))
    },
  },

  // library: the book and board game logs and collections.
  {
    db: "library",
    table: "books",
    columns: ["list", "id", "title", "year", "status", "on_date", "rating", "format", "source", "openlibrary_id"],
    prepare: (ctx) =>
      LIST.flatMap((list) =>
        ctx.read(list === "log" ? "books/book_entry" : "books/book_collection").map((r) => [list, num(r.id), text(r.title), num(r.year), text(r.status), text(r.on_date), num(r.rating), text(r.format), text(r.source), text(r.ext_id)]),
      ),
  },
  {
    db: "library",
    table: "boardgames",
    columns: ["list", "id", "title", "status", "format"],
    prepare: (ctx) =>
      LIST.flatMap((list) => ctx.read(list === "log" ? "boardgames/boardgame_entry" : "boardgames/boardgame_collection").map((r) => [list, num(r.id), text(r.title), text(r.status), text(r.format)])),
  },

  // gameplay: what the worker (Steam, RetroAchievements) doesn't have.
  {
    db: "gameplay",
    table: "game_log",
    columns: ["id", "on_date", "title", "status", "hours", "platform", "source", "igdb_id", "note"],
    prepare: (ctx) =>
      ctx.read("games/game_entry").map((r) => (notOn("steam:", "ra:")(r) ? [num(r.id), text(r.on_date), text(r.title), text(r.status), num(r.amount), text(r.format), text(r.source), num(r.ext_id), text(r.note)] : null)),
  },
  {
    db: "gameplay",
    table: "game_collection",
    columns: ["id", "title", "year", "status", "platform", "added_on", "source", "igdb_id"],
    prepare: (ctx) =>
      ctx.read("games/game_collection").map((r) => (notOn("steam:")(r) ? [num(r.id), text(r.title), num(r.year), text(r.status), text(r.format), text(r.on_date), text(r.source), num(r.ext_id)] : null)),
  },
  copy("gameplay", "profile", "games/game_profile", ["source", "key", "day", "value"]),
  {
    // Unlocked ones from the services the worker doesn't read; `achievement_id` is '<game>/<id>[/<tier>]' as Steam's is '<game>/<name>'.
    // Pokémon GO's medals have no time (0).
    db: "gameplay",
    table: "achievements",
    columns: ["source", "achievement_id", "game_id", "title", "description", "points", "hardcore", "unlocked_at"],
    indexes: 1,
    prepare: (ctx) =>
      firstOf(
        ctx
          .read("games/game_achievement")
          .map((r): Row | null =>
            ["xbox", "pokemongo", "applegc"].includes(String(r.source)) && r.unlocked_at !== null && r.unlocked_at !== undefined
              ? [text(r.source), [r.game, r.id, r.tier].filter((p) => p !== null && p !== undefined).join("/"), text(r.game), text(r.title) ?? String(r.id), text(r.description), num(r.points), 0, num(r.unlocked_at)]
              : null,
          ),
        (row) => `${row[0]}|${row[1]}`,
      ),
  },

  // watching: the hand-kept logs, less what Trakt and Letterboxd already have.
  {
    db: "watching",
    table: "film_log",
    columns: ["id", "watched_on", "title", "year", "tmdb_id", "cinema", "seat", "note", "same_as"],
    lookups: {
      trakt: "SELECT id, watched_at, title, year, tmdb_id FROM watches WHERE type = 'movie' ORDER BY watched_at, id",
      letterboxd: "SELECT id, watched_on, title, year, tmdb_id FROM letterboxd ORDER BY watched_on, id",
    },
    prepare: (ctx) => {
      const log = ctx.read("film/film_watch").map((r) => ({ id: Number(r.id), watched_on: text(r.watched_on), title: String(r.title), year: num(r.year), tmdb_id: num(r.tmdb_id), cinema: text(r.cinema), seat: text(r.seat), note: text(r.note) }))
      const seen: Viewing[] = [
        ...ctx.lookup("trakt").map((v) => ({ ref: `trakt:${v.id}`, days: [osloDay(Number(v.watched_at)), utcDay(Number(v.watched_at))], title: String(v.title), year: num(v.year), tmdb_id: num(v.tmdb_id) })),
        ...ctx.lookup("letterboxd").map((v) => ({ ref: `letterboxd:${v.id}`, days: [String(v.watched_on)], title: String(v.title), year: num(v.year), tmdb_id: num(v.tmdb_id) })),
      ]
      const same = matchFilms(log, seen)
      return log.map((f) => {
        const ref = same.get(f.id) ?? null
        return ref && !(f.cinema ?? f.seat ?? f.note) ? null : [f.id, f.watched_on, f.title, f.year, f.tmdb_id, f.cinema, f.seat, f.note, ref]
      })
    },
  },
  {
    db: "watching",
    table: "tv_log",
    columns: ["id", "watched_on", "show", "tmdb_id", "season", "episode", "episode_title"],
    lookups: { trakt: "SELECT watched_at, show, season, episode FROM watches WHERE type = 'episode' ORDER BY watched_at, id" },
    prepare: (ctx) => {
      const log = ctx.read("tv/tv_watch").map((r) => ({ id: Number(r.id), watched_on: text(r.watched_on), series: String(r.series), season: num(r.season), episode: num(r.episode), tmdb_id: num(r.tmdb_id) }))
      const titles = new Map(ctx.read("tv/tv_episode").map((e) => [`${e.tmdb_id}|${e.season}|${e.episode}`, e.name]))
      const trakt = matchEpisodes(
        log,
        ctx.lookup("trakt").map((e) => ({ watched_at: Number(e.watched_at), show: String(e.show), season: num(e.season), episode: num(e.episode) })),
      )
      return log.map((l) => {
        if (trakt.has(l.id)) return null
        const name = titles.get(`${l.tmdb_id}|${l.season}|${l.episode}`)
        return [l.id, l.watched_on, l.series, l.tmdb_id, l.season, l.episode, genericEpisode(name) ? null : text(name)]
      })
    },
  },
  copy("watching", "cinemas", "film/film_cinema", ["name", "city", "country", "website"]),
  copy("watching", "apple_tv", "tv/apple_tv_play", ["started_at", "show", "season", "episode", "episode_title", ["watched_ms", "play_ms"]]),

  // music: likes, the record collection and concerts, then the listens.
  {
    db: "music",
    table: "spotify_saved",
    columns: ["spotify_id", "saved_at", "artist", "track", "album"],
    prepare: (ctx) => ctx.read("music/spotify_saved").map((r) => [text(r.spotify_id), num(r.added_at), String(r.artist_name).replaceAll("\u001f", ", "), text(r.track_name), text(r.album_name)]),
  },
  {
    db: "music",
    table: "spotify_saved_albums",
    columns: ["spotify_id", "saved_at", "artist", "album"],
    prepare: (ctx) => ctx.read("music/spotify_album_saved").map((r) => [text(r.spotify_id), num(r.added_at), String(r.artist_name).replaceAll("\u001f", ", "), text(r.album_name)]),
  },
  copy("music", "spotify_followed", "music/spotify_followed_artist", ["spotify_id", ["artist", "artist_name"]]),
  {
    db: "music",
    table: "apple_favorites",
    columns: ["kind", "item_ref", "preference", "description", "modified_at"],
    prepare: (ctx) => ctx.read("music/apple_favorite").map((r) => [text(r.kind), text(r.item_ref), text(r.preference), text(r.description), num(r.modified_at)]),
  },
  {
    // Discogs first, for its release id; the hand-kept list adds what Discogs doesn't have.
    db: "music",
    table: "collection",
    columns: ["artist", "title", "format", "kind", "status", "year", "added_on", "discogs_release_id"],
    prepare: (ctx) =>
      firstOf(
        [
          ...ctx.read("music/discogs_item").map((r) => [text(r.artist), text(r.title), text(r.format) ?? "", "album", text(r.status), num(r.year), text(r.added_on), num(r.release_id)]),
          ...ctx.read("music/music_collection").map((r) => [text(r.artist), text(r.title), text(r.format) ?? "", text(r.kind), text(r.status), num(r.year), text(r.added_on), null]),
        ],
        (row) => `${fold(row[0])}|${fold(row[1])}|${row[2]}`,
      ),
  },
  {
    db: "music",
    table: "concerts",
    columns: ["on_date", "title", "venue", "at_time"],
    prepare: (ctx) => {
      const events = ctx.read("music/music_concert_event")
      return firstOf(
        ctx.read("music/music_concert").map((r) => {
          const event = events.find((e) => e.on_date === r.watched_on && norm(e.title) === norm(r.title))
          return [text(r.watched_on), text(r.title), text(r.place), text(event?.at_time)]
        }),
        (row) => `${row[0]}|${row[1]}`,
      )
    },
  },
  {
    db: "music",
    table: "concert_acts",
    columns: ["on_date", "title", "artist", "billing", "setlist_url"],
    prepare: (ctx) => {
      const setlists = new Map<string, string>()
      for (const s of ctx.read("music/music_concert_setlist")) {
        const key = `${s.watched_on}|${s.title}|${fold(s.artist)}`
        if (s.url && !setlists.has(key)) setlists.set(key, String(s.url))
      }
      return firstOf(
        ctx.read("music/music_concert_act").map((r) => [text(r.watched_on), text(r.title), text(r.artist), text(r.billing), setlists.get(`${r.watched_on}|${r.title}|${fold(r.artist)}`) ?? null]),
        (row) => `${row[0]}|${row[1]}|${row[2]}`,
      )
    },
  },
  copy("music", "venues", "music/music_venue", ["venue", "lat", "lon"]),
  {
    // Last.fm's loved tracks; the worker keeps `loves` from Last.fm too, so most are there already.
    db: "music",
    table: "loves",
    columns: ["artist", "track", "loved_at"],
    indexes: 1,
    lookups: { loves: "SELECT artist, track FROM loves" },
    prepare: (ctx) => {
      const have = new Set(ctx.lookup("loves").map((r) => `${fold(r.artist)}\u0000${fold(r.track)}`))
      const loved = [...ctx.read("music/lastfm_loved")].sort((a, b) => Number(a.loved_at) - Number(b.loved_at))
      return firstOf(
        loved.map((r) => (have.has(`${fold(r.artist_name)}\u0000${fold(r.track_name)}`) ? null : [text(r.artist_name), text(r.track_name), num(r.loved_at)])),
        (row) => `${fold(row[0])}\u0000${fold(row[1])}`,
      )
    },
  },
  {
    // Oldest first, and only up to the worker's ListenBrainz cursor: past it the worker writes the plays itself (and would write a dump row
    // over again, its client and times being different). Not a play D1 already has within a minute (the guard says so again in SQL, in
    // case D1 got it since the lookup), nor the plays whose times the old repository guessed (they are in `undated_listens`).
    db: "music",
    table: "listens",
    columns: ["listened_at", "artist", "track", "album", "duration_ms", "recording_mbid", "release_mbid", "artist_mbids", "client", "inserted_at"],
    lookups: {
      cursor: "SELECT value FROM state WHERE key = 'cursor'",
      listens: "SELECT listened_at, artist, track FROM listens WHERE listened_at <= (SELECT CAST(value AS INTEGER) + 60 FROM state WHERE key = 'cursor')",
    },
    guard: `NOT EXISTS (SELECT 1 FROM listens l WHERE l.listened_at BETWEEN v.column1 - 60 AND v.column1 + 60 AND l.artist = v.column2 AND l.track = v.column3 AND l.client IS NOT '${CLIENT}')`,
    prepare: (ctx) => listenRows(ctx.read("music/listens"), ctx.read("music/listen_date_estimate"), listenIndex(ctx.lookup("listens")), ctx.now),
    pause: (row, ctx) => !ctx.listensAhead && Number(row[0]) > horizon(ctx),
  },
]

export const horizon = (ctx: Context): number => Number(ctx.lookup("cursor")[0]?.value ?? 0)

export function listenRows(listens: Rec[], estimates: Rec[], inD1: Map<string, number[]>, now: number): (Row | null)[] {
  const key = (at: unknown, artist: unknown, track: unknown) => `${at}\u0000${fold(artist)}\u0000${fold(track)}`
  const guessed = new Set(estimates.map((e) => key(e.listened_at, e.artist_name, e.track_name)))
  const sorted = [...listens].sort(
    (a, b) => Number(a.listened_at) - Number(b.listened_at) || fold(a.artist_name).localeCompare(fold(b.artist_name)) || fold(a.track_name).localeCompare(fold(b.track_name)),
  )
  return firstOf(
    sorted.map((r): Row | null => {
      const at = Number(r.listened_at)
      if (guessed.has(key(at, r.artist_name, r.track_name)) || nearListen(inD1, at, r.artist_name, r.track_name)) return null
      const mbid = text(r.artist_mbid)
      return [at, text(r.artist_name), text(r.track_name), text(r.release_name), num(r.duration_ms), text(r.recording_mbid), text(r.release_mbid), mbid && JSON.stringify([mbid]), CLIENT, now]
    }),
    (row) => key(row[0], row[1], row[2]),
  )
}

// ---------------------------------------------------------------------------------------------------------------- SQL

export function literal(v: Value): string {
  if (v === null) return "NULL"
  if (typeof v === "number") {
    if (!Number.isFinite(v)) throw new Error(`not a number: ${v}`)
    return String(v)
  }
  if (v.includes("\u0000")) return `CAST(X'${Buffer.from(v, "utf8").toString("hex")}' AS TEXT)`
  return `'${v.replaceAll("'", "''")}'`
}

/** Multi-row INSERT OR IGNORE statements, each at most `maxBytes` long (D1 takes 100 KB) and `maxRows` rows. */
export function statements(spec: Pick<Spec, "table" | "columns" | "guard">, rows: Row[], maxBytes = 90_000, maxRows = 500): string[] {
  const head = `INSERT OR IGNORE INTO ${spec.table} (${spec.columns.join(", ")}) ${spec.guard ? "SELECT * FROM (VALUES " : "VALUES "}`
  const tail = spec.guard ? `) AS v WHERE ${spec.guard};` : ";"
  const fixed = Buffer.byteLength(head) + Buffer.byteLength(tail)
  const out: string[] = []
  let tuples: string[] = []
  let size = fixed
  for (const row of rows) {
    if (row.length !== spec.columns.length) throw new Error(`${spec.table}: ${row.length} values for ${spec.columns.length} columns`)
    const tuple = `(${row.map(literal).join(", ")})`
    const bytes = Buffer.byteLength(tuple) + 2
    if (fixed + bytes > maxBytes) throw new Error(`${spec.table}: a row of ${bytes} bytes doesn't fit in a statement`)
    if (tuples.length > 0 && (size + bytes > maxBytes || tuples.length >= maxRows)) {
      out.push(head + tuples.join(",\n") + tail)
      tuples = []
      size = fixed
    }
    tuples.push(tuple)
    size += bytes
  }
  if (tuples.length > 0) out.push(head + tuples.join(",\n") + tail)
  return out
}

/** What a row costs: D1 counts the row and an entry in each index as rows written. */
export const billable = (spec: Spec, rows: number): number => rows * (1 + (spec.indexes ?? 0))
/** Roughly what a row adds to the database: its values, a little per row, once more for each index. */
export const rowBytes = (spec: Spec, row: Row): number =>
  (row.reduce<number>((sum, v) => sum + (v === null ? 1 : typeof v === "number" ? (Number.isInteger(v) ? 4 : 8) : Buffer.byteLength(v)), 0) + 8) * (1 + (spec.indexes ?? 0))

// ---------------------------------------------------------------------------------------------------------------- R2

export const R2_EXPORTS: [string, string][] = [
  ["music/apple_play", "raw/apple/plays"],
  ["music/apple_track", "raw/apple/tracks"],
  ["music/apple_playlist", "raw/apple/playlists"],
  ["music/apple_playlist_track", "raw/apple/playlist_tracks"],
  ["music/spotify_play", "raw/spotify/plays"],
  ["music/spotify_playlist", "raw/spotify/playlists"],
  ["music/spotify_playlist_track", "raw/spotify/playlist_tracks"],
]

export const ndjson = (rows: Rec[]): string => rows.map((r) => JSON.stringify(r, (_, v: unknown) => (Buffer.isBuffer(v) ? v.toString("base64") : v)) + "\n").join("")

// ---------------------------------------------------------------------------------------------------------------- running it

interface Options {
  dryRun: boolean
  refresh: boolean
  local: boolean
  persistTo: string | undefined
  only: string | undefined
  maxDay: number
  batchRows: number
  restart: boolean
  listensAhead: boolean
  dump: string
}

type State = Record<"remote" | "local", Record<string, number>>

const STATE_FILE = join(WORK, "state.json")
const loadState = (): State => (existsSync(STATE_FILE) ? (JSON.parse(readFileSync(STATE_FILE, "utf8")) as State) : { remote: {}, local: {} })
const saveState = (state: State): void => writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + "\n")
const n = (x: number): string => x.toLocaleString("en-US")

function wrangler(args: string[]): string {
  try {
    return execFileSync(join(ROOT, "node_modules/.bin/wrangler"), args, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 30, stdio: ["ignore", "pipe", "pipe"] })
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string }
    throw new Error(`wrangler ${args.slice(0, 3).join(" ")} failed:\n${e.stdout ?? ""}\n${e.stderr ?? ""}`)
  }
}

const d1Args = (db: Db, o: Options): string[] => [
  "d1",
  "execute",
  db,
  "--config",
  CONFIG[db],
  ...(o.local ? ["--local", ...(o.persistTo ? ["--persist-to", resolve(o.persistTo)] : [])] : ["--remote"]),
  "-y",
  "--json",
]

interface D1Result {
  results?: Rec[]
  meta?: { rows_written?: number }
}

function query(db: Db, sql: string, o: Options): Rec[] {
  const out = JSON.parse(wrangler([...d1Args(db, o), "--command", sql])) as D1Result[]
  return out.flatMap((r) => r.results ?? [])
}

/** Runs a file of statements and says how many rows it wrote: D1's own count remotely (indexes included), SQLite's `total_changes()`
 *  locally (where wrangler gives none). */
function executeFile(db: Db, file: string, o: Options): number {
  const out = JSON.parse(wrangler([...d1Args(db, o), "--file", file])) as D1Result[]
  if (o.local) return Number(out.at(-1)?.results?.[0]?.written ?? 0)
  return out.reduce((sum, r) => sum + Number(r.meta?.rows_written ?? r.results?.[0]?.["Rows written"] ?? 0), 0)
}

export async function rowsWrittenToday(day: string): Promise<number> {
  const { token } = JSON.parse(wrangler(["auth", "token", "--json"])) as { token: string }
  const body = JSON.stringify({
    query: `{ viewer { accounts(filter: {accountTag: "${ACCOUNT}"}) { d1AnalyticsAdaptiveGroups(limit: 10000, filter: {date_geq: "${day}"}) { sum { rowsWritten } } } } }`,
  })
  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body })
  const json = (await response.json()) as { data?: { viewer: { accounts: { d1AnalyticsAdaptiveGroups: { sum: { rowsWritten: number } }[] }[] } }; errors?: unknown[] }
  if (!response.ok || json.errors?.length || !json.data) throw new Error(`analytics: ${response.status} ${JSON.stringify(json.errors ?? json)}`)
  return json.data.viewer.accounts.flatMap((a) => a.d1AnalyticsAdaptiveGroups).reduce((sum, g) => sum + g.sum.rowsWritten, 0)
}

function makeContext(db: Db, spec: Spec, o: Options, now: number): Context {
  const files = new Map<string, Rec[]>()
  const answers = new Map<string, Rec[]>()
  const mode = o.local ? "local" : "remote"
  return {
    now,
    listensAhead: o.listensAhead,
    read(path) {
      let rows = files.get(path)
      if (!rows) files.set(path, (rows = parseJsonl(readFileSync(join(o.dump, `${path}.jsonl`), "utf8"))))
      return rows
    },
    lookup(name) {
      const known = answers.get(name)
      if (known) return known
      const rows = ask(name)
      answers.set(name, rows)
      return rows
    },
  }

  function ask(name: string): Rec[] {
    const sql = spec.lookups?.[name]
    if (!sql) throw new Error(`${db}/${spec.table} has no lookup ${name}`)
    const cache = join(WORK, "cache", mode, `${db}.${spec.table}.${name}.json`)
    if (o.dryRun && !o.refresh) {
      if (existsSync(cache)) return JSON.parse(readFileSync(cache, "utf8")) as Rec[]
      console.warn(`  (no ${mode} answer saved for ${db}/${spec.table} ${name}: counted as if D1 had nothing; --refresh asks D1)`)
      return []
    }
    const rows = query(db, sql, o)
    mkdirSync(dirname(cache), { recursive: true })
    writeFileSync(cache, JSON.stringify(rows))
    return rows
  }
}

interface Prepared {
  spec: Spec
  name: string
  ctx: Context
  items: (Row | null)[]
  cursor: number
}

async function run(o: Options): Promise<void> {
  const mode = o.local ? "local" : "remote"
  const state = loadState()
  const now = Math.floor(Date.now() / 1000)
  const specs = SPECS.filter((s) => !o.only || o.only === s.db || o.only === `${s.db}/${s.table}`)
  if (specs.length === 0) throw new Error(`--only ${o.only}: no such table`)
  console.log(`${o.dryRun ? "dry run" : mode}${o.only ? `, only ${o.only}` : ""}, dump ${o.dump}`)

  const prepare = (spec: Spec): Prepared => {
    const name = `${spec.db}/${spec.table}`
    const ctx = makeContext(spec.db, spec, o, now)
    return { spec, name, ctx, items: spec.prepare(ctx), cursor: o.restart ? 0 : (state[mode][name] ?? 0) }
  }

  if (o.dryRun) {
    const totals = new Map<Db, { rows: number; billable: number; bytes: number }>()
    console.log(`\n${"table".padEnd(32)}${"source".padStart(9)}${"kept".padStart(9)}${"done".padStart(9)}${"to write".padStart(10)}${"later".padStart(9)}${"rows billed".padStart(13)}${"~bytes".padStart(12)}`)
    for (const spec of specs) {
      const p = prepare(spec)
      const kept = p.items.filter((r) => r !== null) as Row[]
      let todo = 0, later = 0, bytes = 0
      let paused = false
      for (const row of p.items.slice(p.cursor)) {
        if (row === null) continue
        if (!paused && spec.pause?.(row, p.ctx)) paused = true
        if (paused) later++
        else {
          todo++
          bytes += rowBytes(spec, row)
        }
      }
      const t = totals.get(spec.db) ?? { rows: 0, billable: 0, bytes: 0 }
      totals.set(spec.db, { rows: t.rows + todo, billable: t.billable + billable(spec, todo), bytes: t.bytes + bytes })
      console.log(`${p.name.padEnd(32)}${n(p.items.length).padStart(9)}${n(kept.length).padStart(9)}${n(Math.min(p.cursor, p.items.length)).padStart(9)}${n(todo).padStart(10)}${n(later).padStart(9)}${n(billable(spec, todo)).padStart(13)}${n(bytes).padStart(12)}`)
      if (spec.pause && !o.listensAhead) console.log(`${"".padEnd(32)}(up to the worker's cursor ${new Date(horizon(p.ctx) * 1000).toISOString()}; "later" waits for it)`)
    }
    console.log("\nper database:")
    let all = 0
    for (const [db, t] of totals) {
      all += t.billable
      console.log(`  ${db.padEnd(10)} ${n(t.rows).padStart(8)} rows, ${n(t.billable).padStart(8)} rows billed, ~${(t.bytes / 1e6).toFixed(2)} MB`)
    }
    console.log(`  ${"all".padEnd(10)} ${n(all).padStart(8)} rows billed: ${Math.ceil(all / o.maxDay)} day(s) at --max-day ${n(o.maxDay)} (less what the crons write)`)
    return
  }

  mkdirSync(join(WORK, "sql"), { recursive: true })
  let day = new Date().toISOString().slice(0, 10)
  let base = o.local ? 0 : await rowsWrittenToday(day)
  let written = 0
  if (!o.local) console.log(`D1 rows written today (${day}, whole account): ${n(base)} of --max-day ${n(o.maxDay)}`)

  /** How many rows (billed) the next batch may write today. */
  let used = 0
  const allowance = async (): Promise<number> => {
    if (o.local) return o.batchRows
    const today = new Date().toISOString().slice(0, 10)
    if (today !== day) {
      day = today
      base = await rowsWrittenToday(day)
      written = 0
    }
    // The analytics lag a few minutes behind, so what this run wrote counts even when they don't show it yet.
    used = Math.max(await rowsWrittenToday(day), base + written)
    return Math.min(o.batchRows, o.maxDay - used)
  }

  let batchNo = 0
  const dbs = [...new Set(specs.map((s) => s.db))]
  for (const db of dbs) {
    const queue = specs.filter((s) => s.db === db).map(prepare)
    while (queue.some((p) => p.cursor < p.items.length)) {
      const limit = await allowance()
      if (limit <= 0) {
        console.log(`\nstopped: the account has written ${n(used)} rows today, --max-day is ${n(o.maxDay)}; run again after 00:00 UTC.`)
        return
      }
      // A batch: rows from the tables of one database, in order, until the allowance, 4.5 MB or a pause.
      const parts: { p: Prepared; to: number; rows: Row[] }[] = []
      let cost = 0, bytes = 0
      let stop = false
      for (const p of queue) {
        if (stop || p.cursor >= p.items.length) continue
        const rows: Row[] = []
        let i = p.cursor
        for (; i < p.items.length; i++) {
          const row = p.items[i]
          if (row === null || row === undefined) continue
          if (p.spec.pause?.(row, p.ctx)) {
            stop = true
            break
          }
          const size = rowBytes(p.spec, row) * 2
          if (cost + billable(p.spec, 1) > limit || bytes + size > 4_500_000) {
            stop = true
            break
          }
          rows.push(row)
          cost += billable(p.spec, 1)
          bytes += size
        }
        parts.push({ p, to: i, rows })
      }
      const sql = parts.flatMap(({ p, rows }) => statements(p.spec, rows))
      let got = 0
      if (sql.length > 0) {
        const file = join(WORK, "sql", `${mode}-${db}-${++batchNo}.sql`)
        writeFileSync(file, [...sql, ...(o.local ? ["SELECT total_changes() AS written;"] : [])].join("\n") + "\n")
        got = executeFile(db, file, o)
        rmSync(file)
      }
      written += got
      for (const { p, to } of parts) {
        p.cursor = to
        state[mode][p.name] = to
      }
      saveState(state)
      console.log(
        `${db}: ${parts.map(({ p, rows }) => `${p.spec.table} +${n(rows.length)} (${n(p.cursor)}/${n(p.items.length)})`).join(", ")} → ${n(got)} rows written${o.local ? "" : `, ${n(base + written)} today`}`,
      )
      const paused = parts.find(({ p, to }) => {
        const next = p.items[to]
        return next !== null && next !== undefined && p.spec.pause?.(next, p.ctx)
      })
      if (paused) {
        console.log(`${paused.p.name}: waiting at ${new Date(Number(paused.p.items[paused.to]![0]) * 1000).toISOString()}, past the worker's cursor; the rest comes on a later run`)
        queue.splice(queue.indexOf(paused.p), 1)
      } else if (parts.every(({ rows }) => rows.length === 0) && parts.some(({ p, to }) => to < p.items.length && p.items[to] !== null)) {
        console.log(`\nstopped: no room left today (--max-day ${n(o.maxDay)}); run again after 00:00 UTC.`)
        return
      }
    }
  }
  console.log(`\ndone: ${n(written)} rows written${o.local ? " (locally)" : ""}`)
}

function exportR2(dump: string): void {
  console.log("R2 files (not uploaded):")
  for (const [source, key] of R2_EXPORTS) {
    const rows = parseJsonl(readFileSync(join(dump, `${source}.jsonl`), "utf8"))
    const file = join(WORK, "r2", `${key}.ndjson.gz`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, gzipSync(ndjson(rows), { level: 9 }))
    console.log(`  ${source}: ${n(rows.length)} rows → ${file.slice(ROOT.length + 1)} (${(readFileSync(file).length / 1e6).toFixed(2)} MB)`)
  }
  console.log("\nupload with:")
  for (const [, key] of R2_EXPORTS)
    console.log(`npx wrangler r2 object put listens-archive/${key}.ndjson.gz --file scripts/.import-dump/r2/${key}.ndjson.gz --content-type application/x-ndjson --remote`)
}

if (import.meta.main) {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
      refresh: { type: "boolean", default: false },
      local: { type: "boolean", default: false },
      "persist-to": { type: "string" },
      only: { type: "string" },
      "max-day": { type: "string", default: "85000" },
      "batch-rows": { type: "string", default: "5000" },
      restart: { type: "boolean", default: false },
      "listens-ahead": { type: "boolean", default: false },
      "export-r2": { type: "boolean", default: false },
      dump: { type: "string", default: resolve(ROOT, "../monorepo/data-dump") },
    },
  })
  mkdirSync(WORK, { recursive: true })
  if (values["export-r2"]) exportR2(values.dump)
  else
    await run({
      dryRun: values["dry-run"],
      refresh: values.refresh,
      local: values.local,
      persistTo: values["persist-to"],
      only: values.only,
      maxDay: Number(values["max-day"]),
      batchRows: Number(values["batch-rows"]),
      restart: values.restart,
      listensAhead: values["listens-ahead"],
      dump: values.dump,
    })
}
