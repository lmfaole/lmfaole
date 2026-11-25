import { strict as assert } from "node:assert"
import { test } from "node:test"

import { type Env, type Get } from "./sources.ts"
import { loadMonth, loadWeek, MAX_FIRSTS_LOOKUPS, MAX_LENGTH_LOOKUPS, MAX_PLAY_PAGES } from "./week-source.ts"
import { parseMonth } from "./months.ts"
import { parseWeek, type Week } from "./weeks.ts"

const found = parseWeek("2026-47")
if (found === null) throw new Error("the week")
const WEEK: Week = found
const ENV: Env = { LASTFM_API_KEY: "k", LASTFM_USER: "me", TRAKT_CLIENT_ID: "c", TRAKT_USER: "me" }
const AFTER = Date.parse("2026-11-23T08:00:00+01:00")
const DURING = Date.parse("2026-11-19T08:00:00+01:00")

const scrobble = (track: string, artist: string, at: number) => ({ name: track, artist: { "#text": artist }, album: { "#text": "LP" }, url: `https://last.fm/${artist}/${track}`, image: [], date: { uts: String(at) } })

interface Options {
  /** The plays of each page, by number. */
  pages?: unknown[][]
  totalPages?: number
  /** The artists on the chart of everything before the week (those with plays), by name. */
  before?: Record<string, number>
  /** The chart before the week is cut at a thousand artists, so what is not on it may still have been played; `totals` is then each artist's total plays, and `after` its plays after the week. */
  cut?: boolean
  totals?: Record<string, number>
  after?: Record<string, number>
  /** The chart of everything before the week fails. */
  beforeDown?: boolean
  hits?: boolean
  down?: ("lastfm" | "trakt")[]
}

function fake(options: Options = {}): { get: Get; asked: { url: string; ttl: number }[] } {
  const asked: { url: string; ttl: number }[] = []
  const pages = options.pages ?? [[scrobble("A1", "Alpha", WEEK.start + 100), scrobble("B1", "Beta", WEEK.start + 200)]]
  const get: Get = async (url, request) => {
    asked.push({ url, ttl: request.ttl })
    const hit = options.hits === true
    if (url.startsWith("https://ws.audioscrobbler.com/")) {
      if (options.down?.includes("lastfm")) throw new Error("lastfm down")
      const method = new URL(url).searchParams.get("method")
      if (method === "user.getrecenttracks") {
        const page = Number(new URL(url).searchParams.get("page"))
        return { data: { recenttracks: { "@attr": { page: String(page), totalPages: String(options.totalPages ?? pages.length), total: "99" }, track: pages[page - 1] ?? [] } }, hit }
      }
      if (method === "user.getweeklyartistchart") {
        const from = Number(new URL(url).searchParams.get("from"))
        const chart = (counts: Record<string, number>, filler = 0) => ({ weeklyartistchart: { artist: [...Object.entries(counts).filter(([, plays]) => plays > 0).map(([name, plays], index) => ({ name, playcount: String(plays), "@attr": { rank: String(index + 1) } })), ...Array.from({ length: filler }, (_, index) => ({ name: `Filler ${index}`, playcount: "1", "@attr": { rank: String(index + 100) } }))] } })
        if (from === 0) {
          if (options.beforeDown === true) throw new Error("chart down")
          const counts = options.before ?? {}
          return { data: chart(counts, options.cut === true ? 1000 - Object.values(counts).filter((plays) => plays > 0).length : 0), hit }
        }
        if (from === WEEK.end) return { data: chart(options.after ?? {}), hit }
        return { data: { weeklyartistchart: { artist: [{ name: "Alpha", playcount: "7", "@attr": { rank: "2" } }, { name: "Gamma", playcount: "3", "@attr": { rank: "5" } }] } }, hit }
      }
      if (method === "track.getinfo") return { data: { track: { duration: "200000" } }, hit }
      if (method === "artist.getinfo") {
        const total = options.totals?.[new URL(url).searchParams.get("artist") ?? ""]
        if (total === undefined) throw new Error("no answer")
        return { data: { artist: { stats: { userplaycount: String(total) } } }, hit }
      }
    }
    if (url.startsWith("https://api.trakt.tv/")) {
      if (options.down?.includes("trakt")) throw new Error("trakt down")
      return { data: url.includes("/history/movies") ? [{ id: 1, watched_at: "2026-11-18T20:00:00.000Z", type: "movie", movie: { title: "Heat", year: 1995, ids: { slug: "heat", tmdb: 949 } } }] : [], hit }
    }
    return { data: {}, hit }
  }
  return { get, asked }
}

test("every page of the week's plays is read, and the stats are made from all of them, with the week before's chart for the change", async () => {
  const pages = [[scrobble("A1", "Alpha", WEEK.start + 100), scrobble("A2", "Alpha", WEEK.start + 200)], [scrobble("B1", "Beta", WEEK.start + 300)], [scrobble("A3", "Alpha", WEEK.start + 400)]]
  const { get, asked } = fake({ pages, before: { Alpha: 5 } })
  const data = await loadWeek(ENV, get, WEEK, AFTER, "music")
  assert.equal(data.music?.stats.total, 4)
  assert.equal(data.music?.truncated, false)
  assert.equal(data.music?.stats.topArtists[0]?.name, "Alpha")
  assert.deepEqual(data.music?.stats.topArtists[0]?.change, { kind: "up", by: 1 })
  assert.equal(data.music?.previousTotal, 10)
  assert.equal(asked.filter((one) => one.url.includes("getrecenttracks")).length, 3)
  assert.ok(asked.find((one) => one.url.includes("getrecenttracks"))?.url.includes(`from=${WEEK.start}&to=${WEEK.end - 1}`))
})

test("a week of more plays than the pages that are read is cut, and says so", async () => {
  const { get, asked } = fake({ totalPages: MAX_PLAY_PAGES + 4 })
  const data = await loadWeek(ENV, get, WEEK, AFTER, "music")
  assert.equal(data.music?.truncated, true)
  assert.equal(asked.filter((one) => one.url.includes("getrecenttracks")).length, MAX_PLAY_PAGES)
})

test("an artist is new when it is not on the chart of everything before the week, and the chart failing is not knowing", async () => {
  const pages = [[scrobble("A1", "Alpha", WEEK.start + 1), scrobble("B1", "Beta", WEEK.start + 2), scrobble("C1", "Gamma", WEEK.start + 3)]]
  const some = await loadWeek(ENV, fake({ pages, before: { Alpha: 12 } }).get, WEEK, AFTER, "music")
  assert.deepEqual(some.music?.newArtists?.map((artist) => artist.name), ["Beta", "Gamma"])
  assert.deepEqual((await loadWeek(ENV, fake({ pages, before: { alpha: 12, BETA: 3, Gamma: 1 } }).get, WEEK, AFTER, "music")).music?.newArtists, [])
  const unknown = await loadWeek(ENV, fake({ pages, beforeDown: true }).get, WEEK, AFTER, "music")
  assert.equal(unknown.music?.newArtists, null)
})

test("when the chart is cut at a thousand, what is not on it is asked about by the owner's total less the plays in the week and after it", async () => {
  const pages = [[scrobble("A1", "Alpha", WEEK.start + 1), scrobble("B1", "Beta", WEEK.start + 2), scrobble("B2", "Beta", WEEK.start + 3), scrobble("C1", "Gamma", WEEK.start + 4)]]
  const run = fake({ pages, cut: true, before: { Alpha: 12 }, totals: { Beta: 6, Gamma: 1 }, after: { Beta: 3 } })
  const got = await loadWeek(ENV, run.get, WEEK, AFTER, "music")
  // Beta: 6 in all, 2 in the week, 3 after it: one before, so not new. Gamma: 1 in all, 1 in the week: new.
  assert.deepEqual(got.music?.newArtists?.map((artist) => artist.name), ["Gamma"])
  assert.equal(run.asked.filter((one) => one.url.includes("getartisttracks")).length, 0)
  const unknown = await loadWeek(ENV, fake({ pages, cut: true, before: { Alpha: 12 } }).get, WEEK, AFTER, "music")
  assert.equal(unknown.music?.newArtists, null)
})

test("a page asks about no more song lengths than the limit that were not kept, and what is kept is free, so all of the sample are had", async () => {
  const many = Array.from({ length: 30 }, (_, index) => scrobble(`T${index}`, `Artist ${index}`, WEEK.start + index))
  const cold = fake({ pages: [many] })
  await loadWeek(ENV, cold.get, WEEK, AFTER, "music")
  const lengths = cold.asked.filter((one) => one.url.includes("track.getinfo")).length
  assert.ok(lengths >= MAX_LENGTH_LOOKUPS && lengths < MAX_LENGTH_LOOKUPS + 3, `lengths ${lengths}`)
  const warm = fake({ pages: [many], hits: true })
  await loadWeek(ENV, warm.get, WEEK, AFTER, "music")
  assert.equal(warm.asked.filter((one) => one.url.includes("track.getinfo")).length, 20)
})

test("a cut chart asks about no more artists than the limit that were not kept", async () => {
  const many = Array.from({ length: 12 }, (_, index) => scrobble(`T${index}`, `Artist ${index}`, WEEK.start + index))
  const run = fake({ pages: [many], cut: true, totals: Object.fromEntries(many.map((_, index) => [`Artist ${index}`, 1])) })
  await loadWeek(ENV, run.get, WEEK, AFTER, "music")
  const asked = run.asked.filter((one) => one.url.includes("artist.getinfo")).length
  assert.ok(asked >= MAX_FIRSTS_LOOKUPS && asked < MAX_FIRSTS_LOOKUPS + 3, `artists ${asked}`)
})

test("a week that is over is kept for a day and the one going on for minutes", async () => {
  const done = fake()
  await loadWeek(ENV, done.get, WEEK, AFTER, "music")
  const live = fake()
  await loadWeek(ENV, live.get, WEEK, DURING, "music")
  const ttl = (run: ReturnType<typeof fake>) => run.asked.find((one) => one.url.includes("getrecenttracks"))?.ttl
  assert.equal(ttl(done), 24 * 3600)
  assert.equal(ttl(live), 300)
  assert.equal((await loadWeek(ENV, fake().get, WEEK, AFTER, "music")).complete, true)
  assert.equal((await loadWeek(ENV, fake().get, WEEK, DURING, "music")).complete, false)
})

test("the films and episodes are asked for by the week's own range, and counted", async () => {
  const { get, asked } = fake()
  const data = await loadWeek(ENV, get, WEEK, AFTER, "film")
  assert.equal(data.watched?.stats.films, 1)
  const trakt = asked.find((one) => one.url.includes("/history/movies"))?.url ?? ""
  assert.ok(trakt.includes("start_at=2026-11-15T23%3A00%3A00.000Z") && trakt.includes("end_at=2026-11-22T22%3A59%3A59.000Z"), trakt)
})

test("a wrapped of the music asks only Last.fm, one of film only Trakt's films, and one of TV only its episodes", async () => {
  const music = fake()
  const heard = await loadWeek(ENV, music.get, WEEK, AFTER, "music")
  assert.equal(heard.watched, null)
  assert.equal(heard.music?.stats.total, 2)
  assert.ok(!music.asked.some((one) => one.url.includes("api.trakt.tv")))
  const film = fake()
  const seen = await loadWeek(ENV, film.get, WEEK, AFTER, "film")
  assert.equal(seen.music, null)
  assert.equal(seen.watched?.stats.films, 1)
  assert.ok(!film.asked.some((one) => one.url.includes("audioscrobbler") || one.url.includes("/history/episodes")))
  const tv = fake()
  const episodes = await loadWeek(ENV, tv.get, WEEK, AFTER, "tv")
  assert.equal(episodes.music, null)
  assert.equal(episodes.watched?.stats.films, 0)
  assert.ok(tv.asked.some((one) => one.url.includes("/history/episodes")))
  assert.ok(!tv.asked.some((one) => one.url.includes("audioscrobbler") || one.url.includes("/history/movies")))
})

test("a source that is not set up or is down gives nothing of its own", async () => {
  assert.equal((await loadWeek({ TRAKT_CLIENT_ID: "c", TRAKT_USER: "me" }, fake().get, WEEK, AFTER, "music")).music, null)
  assert.equal((await loadWeek(ENV, fake({ down: ["trakt"] }).get, WEEK, AFTER, "film")).watched, null)
  assert.equal((await loadWeek(ENV, fake({ down: ["lastfm"] }).get, WEEK, AFTER, "music")).music, null)
  assert.deepEqual(await loadWeek({}, fake().get, WEEK, AFTER, "film"), { week: WEEK, complete: true, music: null, watched: null })
})

const MONTH = parseMonth("2026-10")
if (MONTH === null) throw new Error("the month")

test("a month is read by its own range, the month before is the chart for the change, and a month of more pages than a week is read to its limit", async () => {
  const run = fake({ totalPages: 20 })
  const got = await loadMonth(ENV, run.get, MONTH, Date.parse("2026-11-02T08:00:00+01:00"), "music")
  assert.equal(got.month, MONTH)
  assert.equal(got.complete, true)
  assert.equal(got.music?.truncated, true)
  const pages = run.asked.filter((one) => one.url.includes("getrecenttracks"))
  assert.equal(pages.length, 14)
  assert.ok(pages[0]?.url.includes(`from=${MONTH.start}&to=${MONTH.end - 1}`))
  const chart = run.asked.find((one) => one.url.includes("getweeklyartistchart") && !one.url.includes("from=0"))?.url ?? ""
  const before = parseMonth("2026-09")
  assert.ok(before !== null && chart.includes(`from=${before.start}&to=${before.end}`), chart)
  assert.equal((await loadMonth(ENV, fake().get, MONTH, Date.parse("2026-10-20T08:00:00+01:00"), "music")).complete, false)
})

test("the history of a month is read by pages of a hundred, as long as a page is full", async () => {
  const hundred = Array.from({ length: 100 }, (_, index) => ({ id: index + 1, watched_at: "2026-10-18T20:00:00.000Z", type: "movie", movie: { title: `Film ${index}`, year: 2020, ids: { slug: `f-${index}`, tmdb: 1000 + index } } }))
  const asked: string[] = []
  const get: Get = async (url, request) => {
    asked.push(url)
    if (url.includes("/history/movies")) return { data: url.includes("page=1") ? hundred : [hundred[0]], hit: false }
    if (url.startsWith("https://ws.audioscrobbler.com/")) return { data: { recenttracks: { "@attr": { page: "1", totalPages: "1", total: "0" }, track: [] } }, hit: false }
    void request
    return { data: url.includes("/history/") ? [] : {}, hit: false }
  }
  const got = await loadMonth({ TRAKT_CLIENT_ID: "c", TRAKT_USER: "me" }, get, MONTH, Date.parse("2026-11-02T08:00:00+01:00"), "film")
  assert.equal(got.watched?.stats.films, 100)
  assert.equal(asked.filter((url) => url.includes("/history/movies")).length, 2)
  assert.equal(asked.filter((url) => url.includes("/history/episodes")).length, 0)
})
