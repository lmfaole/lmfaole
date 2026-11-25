import assert from "node:assert/strict"
import { test } from "node:test"
import { parseFeed, syncLetterboxd } from "./letterboxd.ts"
import { syncLoves } from "./loves.ts"
import { syncTrakt, type Entry, type Rating } from "./trakt.ts"
import { database } from "./testing.ts"

const count = (sqlite: ReturnType<typeof database>["sqlite"], table: string) => (sqlite.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n

/** A fake Trakt: history newest first, filtered by start_at/end_at (both inclusive), paged. */
function trakt(history: Entry[], ratings: Rating[]) {
  return async (input: string) => {
    const url = new URL(input)
    const limit = Number(url.searchParams.get("limit")), page = Number(url.searchParams.get("page"))
    if (url.pathname.endsWith("/ratings")) return Response.json(ratings.slice((page - 1) * limit, page * limit))
    const start = url.searchParams.get("start_at"), end = url.searchParams.get("end_at")
    const all = history.filter((e) => (start === null || e.watched_at >= start) && (end === null || e.watched_at <= end)).toSorted((a, b) => b.watched_at.localeCompare(a.watched_at))
    return Response.json(all.slice((page - 1) * limit, page * limit))
  }
}

const entry = (id: number, day: number): Entry => ({ id, watched_at: new Date(Date.UTC(2020, 0, day)).toISOString(), action: "watch", type: "movie", movie: { title: `M${id}`, year: 2000, ids: { trakt: id } } })
const rating = (id: number, value: number): Rating => ({ rated_at: "2020-01-01T00:00:00.000Z", rating: value, type: "movie", movie: { title: `M${id}`, ids: { trakt: id } } })

test("Trakt: the backfill walks back over runs, new entries come in, and a rating taken off goes", async () => {
  const { db, sqlite } = database("watching")
  const history = Array.from({ length: 23 }, (_, i) => entry(i + 1, i + 1))
  const options = (fetch: ReturnType<typeof trakt>) => ({ user: "u", clientId: "c", fetch, now: Date.UTC(2021, 0, 1) / 1000, pageSize: 5, backfillPages: 2 })
  await syncTrakt(db, options(trakt(history, [rating(1, 8), rating(2, 5)])))
  assert.equal(count(sqlite, "watches"), 9)
  for (let run = 0; run < 3; run++) await syncTrakt(db, options(trakt(history, [rating(1, 9)])))
  assert.equal(count(sqlite, "watches"), 23)
  assert.equal((sqlite.prepare("SELECT value FROM state WHERE key = 'history_done'").get() as { value: string }).value, "1")
  history.push(entry(100, 25))
  await syncTrakt(db, options(trakt(history, [rating(1, 9)])))
  assert.equal(count(sqlite, "watches"), 24)
  assert.deepEqual(sqlite.prepare("SELECT trakt_id, rating FROM ratings").all().map((r) => ({ ...r })), [{ trakt_id: 1, rating: 9 }])
})

/** A fake Last.fm: loves newest first, paged. */
function lastfm(loves: { artist: string; track: string; at: number }[]) {
  return async (input: string) => {
    const url = new URL(input)
    const limit = Number(url.searchParams.get("limit")), page = Number(url.searchParams.get("page"))
    const sorted = [...loves].toSorted((a, b) => b.at - a.at)
    const track = sorted.slice((page - 1) * limit, page * limit).map((l) => ({ name: l.track, artist: { name: l.artist }, date: { uts: String(l.at) } }))
    return Response.json({ lovedtracks: { track, "@attr": { totalPages: String(Math.ceil(sorted.length / limit)) } } })
  }
}

test("loves: the backfill finishes over runs, with new loves on top and none twice", async () => {
  const { db, sqlite } = database("music")
  const loves = Array.from({ length: 30 }, (_, i) => ({ artist: "A", track: `t${i}`, at: 1000 + i }))
  const options = () => ({ user: "u", key: "k", fetch: lastfm(loves), pageSize: 4, maxPages: 2, backfillPages: 2 })
  await syncLoves(db, options())
  loves.push({ artist: "A", track: "new", at: 5000 }, { artist: "a", track: "T0", at: 6000 })
  for (let run = 0; run < 5; run++) await syncLoves(db, options())
  assert.equal(count(sqlite, "loves"), 31)
  assert.equal((sqlite.prepare("SELECT value FROM state WHERE key = 'loves_backfill_page'").get() as { value: string }).value, "0")
})

const feed = (stars: string, review: string) => `<rss><channel>
<item> <title>Small Talk, 2026 - ★½</title> <link>https://letterboxd.com/lmfaole/film/small-talk-2026-2/</link> <guid isPermaLink="false">letterboxd-review-1596459972</guid> <pubDate>Sun, 22 Nov 2026 07:21:45 +1300</pubDate> <letterboxd:watchedDate>2026-11-21</letterboxd:watchedDate> <letterboxd:rewatch>No</letterboxd:rewatch> <letterboxd:filmTitle>Small Talk &amp; Co</letterboxd:filmTitle> <letterboxd:filmYear>2026</letterboxd:filmYear> <letterboxd:memberRating>${stars}</letterboxd:memberRating> <letterboxd:memberLike>Yes</letterboxd:memberLike> <tmdb:movieId>1751226</tmdb:movieId> <description><![CDATA[ <p><img src="https://a.ltrbxd.com/p.jpg"/></p> <p>${review}</p> ]]></description> </item>
<item> <title>Heat, 1995</title> <link>https://letterboxd.com/lmfaole/film/heat-1995/</link> <guid isPermaLink="false">letterboxd-watch-1</guid> <pubDate>Fri, 13 Nov 2026 08:02:36 +1300</pubDate> <letterboxd:watchedDate>2026-11-12</letterboxd:watchedDate> <letterboxd:rewatch>Yes</letterboxd:rewatch> <letterboxd:filmTitle>Heat</letterboxd:filmTitle> <letterboxd:filmYear>1995</letterboxd:filmYear> <tmdb:movieId>949</tmdb:movieId> <description><![CDATA[ <p><img src="https://a.ltrbxd.com/h.jpg"/></p> <p>Watched on Thursday November 12, 2026.</p> ]]></description> </item>
<item> <title>A list</title> <link>https://letterboxd.com/lmfaole/list/x/</link> <guid isPermaLink="false">letterboxd-list-9</guid> <description><![CDATA[ <p>films</p> ]]></description> </item>
</channel></rss>`

test("Letterboxd: diary entries are kept by id, a list is left out, and a changed rating or review replaces the stored", async () => {
  const { db, sqlite } = database("watching")
  const fetch = (xml: string) => async () => new Response(xml)
  await syncLetterboxd(db, { user: "u", fetch: fetch(feed("1.5", "Too real")) })
  const rows = () => sqlite.prepare("SELECT id, title, rating, rewatch, liked, tmdb_id, review, poster FROM letterboxd ORDER BY watched_on DESC").all().map((r) => ({ ...r }))
  assert.deepEqual(rows(), [
    { id: "letterboxd-review-1596459972", title: "Small Talk & Co", rating: 1.5, rewatch: 0, liked: 1, tmdb_id: 1751226, review: "Too real", poster: "https://a.ltrbxd.com/p.jpg" },
    { id: "letterboxd-watch-1", title: "Heat", rating: null, rewatch: 1, liked: 0, tmdb_id: 949, review: null, poster: "https://a.ltrbxd.com/h.jpg" },
  ])
  await syncLetterboxd(db, { user: "u", fetch: fetch(feed("2.0", "Better the second time")) })
  assert.equal(count(sqlite, "letterboxd"), 2)
  assert.deepEqual(rows()[0], { ...rows()[0], rating: 2, review: "Better the second time" })
  assert.equal(parseFeed(feed("1.5", "x"))[0]?.publishedAt, Date.parse("2026-11-21T18:21:45Z") / 1000)
})
