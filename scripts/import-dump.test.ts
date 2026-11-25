import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { decode, genericEpisode, listenIndex, listenRows, literal, matchEpisodes, matchFilms, nearListen, parseJsonl, SPECS, statements, type Context, type Rec } from "./import-dump.ts"

const context = (tables: Record<string, Rec[]>, lookups: Record<string, Rec[]> = {}): Context => ({
  read: (path) => tables[path] ?? [],
  lookup: (name) => lookups[name] ?? [],
  now: 1_800_000_000,
  listensAhead: false,
})
const spec = (name: string) => SPECS.find((s) => `${s.db}/${s.table}` === name)!

describe("the dump's cells", () => {
  it("decodes the tagged values", () => {
    assert.equal(decode({ $real: 53 }), 53)
    assert.equal(decode({ $int: "9007199254740993" }), "9007199254740993")
    assert.equal(decode({ $int: "12" }), 12)
    assert.equal(decode({ $text: Buffer.from("a\u0000b").toString("base64") }), "a\u0000b")
  })

  it("reads the header line as the column names", () => {
    assert.deepEqual(parseJsonl('["a","b"]\n[1,{"$real":2}]\n["x",null]\n'), [
      { a: 1, b: 2 },
      { a: "x", b: null },
    ])
  })
})

describe("listens", () => {
  const listen = (listened_at: number, artist_name: string, track_name: string): Rec => ({ listened_at, artist_name, track_name, release_name: null, artist_mbid: "m", duration_ms: null })

  it("leaves out guessed times, plays D1 has within a minute (ASCII case folded) and repeats, oldest first", () => {
    const inD1 = listenIndex([{ listened_at: 1000, artist: "ABBA", track: "Waterloo" }])
    const rows = listenRows(
      [listen(3000, "Björk", "Joga"), listen(1050, "abba", "waterloo"), listen(1121, "ABBA", "Waterloo"), listen(2000, "X", "Y"), listen(3000, "BJöRK", "JOGA")],
      [{ listened_at: 2000, artist_name: "x", track_name: "y" }],
      inD1,
      7,
    )
    assert.deepEqual(
      rows.map((r) => r && [r[0], r[1]]),
      [null, [1121, "ABBA"], null, [3000, "Björk"], null],
    )
    assert.deepEqual(rows[1]?.slice(7), ['["m"]', "monorepo-dump", 7])
  })

  it("folds only A–Z, as SQLite's NOCASE does", () => {
    const inD1 = listenIndex([{ listened_at: 0, artist: "Ö", track: "t" }])
    assert.equal(nearListen(inD1, 30, "Ö", "T"), true)
    assert.equal(nearListen(inD1, 30, "ö", "t"), false)
    assert.equal(nearListen(inD1, 61, "Ö", "t"), false)
  })

  it("waits for the worker's cursor", () => {
    const listens = spec("music/listens")
    const ctx = context({}, { cursor: [{ value: "1000" }] })
    assert.equal(listens.pause!([1000], ctx), false)
    assert.equal(listens.pause!([1001], ctx), true)
    assert.equal(listens.pause!([1001], { ...ctx, listensAhead: true }), false)
  })
})

describe("films against Trakt and Letterboxd", () => {
  const film = (id: number, watched_on: string | null, title: string, year: number | null, tmdb_id: number | null) => ({ id, watched_on, title, year, tmdb_id })
  const seen = (ref: string, days: string[], title: string, year: number | null, tmdb_id: number | null) => ({ ref, days, title, year, tmdb_id })

  it("pairs by TMDB id or title on the day, the last one left on a day, and undated lines on any day, each viewing once", () => {
    const matches = matchFilms(
      [film(1, "2026-11-02", "Markens grøde", null, null), film(2, "2026-11-10", "Wolfs", 2024, 877817), film(3, "2026-11-10", "Wolfs", 2024, 877817), film(4, null, "Alien", 1979, null), film(5, "2020-01-01", "Heat", 1995, null)],
      [seen("trakt:0", ["2026-11-02"], "Growth of the Soil", 2026, 1729732), seen("letterboxd:a", ["2026-11-02"], "Growth of the Soil", 2026, 1729732), seen("trakt:1", ["2026-11-10", "2026-11-09"], "Wolfs", 2024, 877817), seen("trakt:2", ["1979-05-25"], "Alien", 1979, 348), seen("trakt:3", ["2020-01-01"], "Joker", 2019, 475557)],
    )
    assert.deepEqual([...matches].toSorted(), [
      [1, "trakt:0"],
      [2, "trakt:1"],
      [4, "trakt:2"],
    ])
  })

  it("keeps a matched line only for what it adds", () => {
    const rows = spec("watching/film_log").prepare(
      context(
        { "film/film_watch": [{ id: 1, watched_on: "2026-11-10", title: "Wolfs", year: 2024, tmdb_id: 877817 }, { id: 2, watched_on: "2026-11-23", title: "Rose", year: null, tmdb_id: null, cinema: "Vega kino" }] },
        { trakt: [{ id: 9, watched_at: Date.parse("2026-11-10T20:00:00Z") / 1000, title: "Wolfs", year: 2024, tmdb_id: 877817 }], letterboxd: [{ id: "l", watched_on: "2026-11-23", title: "Rose", year: 2026, tmdb_id: 5 }] },
      ),
    )
    assert.deepEqual(rows, [null, [2, "2026-11-23", "Rose", null, null, "Vega kino", null, null, "letterboxd:l"]])
  })
})

describe("episodes against Trakt", () => {
  it("pairs on the same day (Oslo or UTC), and undated lines with Trakt's undated plays, each play once", () => {
    const at = Date.parse("2022-02-17T23:30:00Z") / 1000
    const matched = matchEpisodes(
      [
        { id: 1, watched_on: "2022-02-18", series: "Severance", season: 1, episode: 1 },
        { id: 2, watched_on: "2022-02-18", series: "Severance", season: 1, episode: 1 },
        { id: 3, watched_on: null, series: "Skam", season: 1, episode: 2 },
        { id: 4, watched_on: null, series: "Skam", season: 1, episode: 3 },
      ],
      [
        { watched_at: at, show: "Severance", season: 1, episode: 1 },
        { watched_at: 0, show: "SKAM", season: 1, episode: 2 },
        { watched_at: at, show: "Skam", season: 1, episode: 3 },
      ],
    )
    assert.deepEqual([...matched].toSorted(), [1, 3])
  })

  it("drops TMDB's stand-in episode names", () => {
    assert.equal(genericEpisode("Episode 4"), true)
    assert.equal(genericEpisode("Episode of the Year"), false)
  })
})

describe("what is left out", () => {
  it("leaves out GitHub items in private repositories", () => {
    const rows = spec("site/github_items").prepare(
      context({
        "github/github_repos": [{ full_name: "lmfaole/secret", private: 1 }],
        "github/github_items": [
          { id: 1, kind: "pr", repo: "lmfaole/secret", number: 1, title: "x", state: "open", merged: 0, created_at: "2020-01-01T00:00:00Z", closed_at: null },
          { id: 2, kind: "pr", repo: "navikt/aksel", number: 2, title: "y", state: "closed", merged: 1, created_at: "2020-01-01T00:00:00Z", closed_at: null },
        ],
      }),
    )
    assert.deepEqual(rows, [null, [2, "pr", "navikt/aksel", 2, "y", "closed", 1, 1577836800, null]])
  })

  it("leaves the games the worker has (Steam, RetroAchievements) to the worker", () => {
    const rows = spec("gameplay/game_log").prepare(context({ "games/game_entry": [{ id: 1, title: "Portal 2", status: "playing", source: "steam:620" }, { id: 2, title: "Halo", status: "playing", source: "xbox:1", amount: 1.5 }] }))
    assert.equal(rows[0], null)
    assert.deepEqual(rows[1]?.slice(0, 5), [2, null, "Halo", "playing", 1.5])
  })
})

describe("SQL", () => {
  it("quotes text, and writes text with a NUL as bytes", () => {
    assert.equal(literal("it's"), "'it''s'")
    assert.equal(literal("a\u0000"), "CAST(X'6100' AS TEXT)")
    assert.equal(literal(null), "NULL")
  })

  it("splits rows into statements under the size limit", () => {
    const rows = Array.from({ length: 300 }, (_, i) => [i, "x".repeat(1000)])
    const sql = statements({ table: "t", columns: ["a", "b"] }, rows, 90_000)
    assert.ok(sql.length >= 4)
    assert.ok(sql.every((s) => Buffer.byteLength(s) <= 90_000 && s.startsWith("INSERT OR IGNORE INTO t (a, b) VALUES (")))
    assert.equal(sql.join("").match(/\(\d+, 'x/g)?.length, 300)
  })

  it("wraps the rows in a guard where there is one", () => {
    const [sql] = statements({ table: "t", columns: ["a"], guard: "v.column1 > 0" }, [[1]])
    assert.equal(sql, "INSERT OR IGNORE INTO t (a) SELECT * FROM (VALUES (1)) AS v WHERE v.column1 > 0;")
  })
})
