import assert from "node:assert/strict"
import type { DatabaseSync } from "node:sqlite"
import { test } from "node:test"
import { handle, time } from "./api.ts"
import type { Listen } from "./listenbrainz.ts"
import { sync } from "./music.ts"
import { database as open } from "./testing.ts"

const database = () => open("music")

const listen = (at: number, track = `t${at}`, extra: Partial<Listen["track_metadata"]> = {}): Listen => ({ listened_at: at, track_metadata: { artist_name: "A", track_name: track, ...extra } })

/** A fake ListenBrainz: the `count` oldest after min_ts, newest first. */
function lb(listens: Listen[]) {
  const calls: number[] = []
  const fetch = async (input: string) => {
    const url = new URL(input)
    const min = Number(url.searchParams.get("min_ts")), count = Number(url.searchParams.get("count"))
    calls.push(min)
    const page = listens.filter((l) => l.listened_at > min).toSorted((a, b) => a.listened_at - b.listened_at).slice(0, count).toReversed()
    return Response.json({ payload: { listens: page } })
  }
  return { fetch, calls }
}

// Long after every test play, unless a test says otherwise: the cursor is behind, so no overlap.
const NOW = 2 ** 31

const count = (sqlite: DatabaseSync) => (sqlite.prepare("SELECT COUNT(*) AS n FROM listens").get() as { n: number }).n

test("pages forward and stops at the run's limit, then carries on", async () => {
  const { db, sqlite } = database()
  const all = Array.from({ length: 25 }, (_, i) => listen(1000 + i))
  const { fetch } = lb(all)
  const first = await sync(db, { user: "u", fetch, pageSize: 5, maxPages: 2, overlap: 0, now: NOW })
  assert.equal(count(sqlite), 9)
  assert.equal(first.cursor, 1008)
  await sync(db, { user: "u", fetch, pageSize: 5, maxPages: 10, overlap: 0, now: NOW })
  assert.equal(count(sqlite), 25)
})

test("listens sharing a second across a page break are all kept", async () => {
  const { db, sqlite } = database()
  const all = [listen(1, "a"), listen(2, "b"), listen(3, "c"), listen(3, "d"), listen(3, "e"), listen(4, "f")]
  await sync(db, { user: "u", fetch: lb(all).fetch, pageSize: 4, maxPages: 5, overlap: 0, now: NOW })
  assert.equal(count(sqlite), 6)
})

test("the same play twice, or in other case, is one row", async () => {
  const { db, sqlite } = database()
  const { fetch } = lb([listen(5, "Song"), listen(5, "SONG")])
  await sync(db, { user: "u", fetch, pageSize: 10, maxPages: 1, overlap: 0, now: NOW })
  await sync(db, { user: "u", fetch, pageSize: 10, maxPages: 1, overlap: 100, now: NOW })
  assert.equal(count(sqlite), 1)
})

test("a late MusicBrainz match updates the stored play", async () => {
  const { db, sqlite } = database()
  await sync(db, { user: "u", fetch: lb([listen(50)]).fetch, pageSize: 10, maxPages: 1, overlap: 0, now: NOW })
  await sync(db, { user: "u", fetch: lb([listen(50, "t50", { mbid_mapping: { recording_mbid: "r" } }), listen(60)]).fetch, pageSize: 10, maxPages: 1, overlap: 100, now: 100 })
  assert.equal((sqlite.prepare("SELECT recording_mbid FROM listens WHERE listened_at = 50").get() as { recording_mbid: string }).recording_mbid, "r")
})

test("behind, a run gets past days busier than it fetches instead of fetching them again", async () => {
  const { db, sqlite } = database()
  const all = Array.from({ length: 30 }, (_, i) => listen(1000 + i))
  const { fetch } = lb(all)
  for (let run = 0; run < 4; run++) await sync(db, { user: "u", fetch, pageSize: 5, maxPages: 2, overlap: 1000, now: 10_000 })
  assert.equal(count(sqlite), 30)
})

test("an unchanged play is not written again", async () => {
  const { db, sqlite } = database()
  sqlite.exec("CREATE TABLE updates (n INTEGER); CREATE TRIGGER counted AFTER UPDATE ON listens BEGIN INSERT INTO updates VALUES (1); END")
  const updates = () => (sqlite.prepare("SELECT COUNT(*) AS n FROM updates").get() as { n: number }).n
  const play = (duration: number) => lb([listen(50, "t50", { additional_info: { duration_ms: duration } })]).fetch
  for (let run = 0; run < 2; run++) await sync(db, { user: "u", fetch: play(1000), pageSize: 10, maxPages: 1, overlap: 100, now: NOW })
  assert.equal(updates(), 0)
  await sync(db, { user: "u", fetch: play(2000), pageSize: 10, maxPages: 1, overlap: 100, now: NOW })
  assert.equal(updates(), 1)
})

test("times: periods, ends and raw seconds", () => {
  assert.equal(time("2020"), Date.UTC(2020, 0, 1) / 1000)
  assert.equal(time("2020", true), Date.UTC(2021, 0, 1) / 1000)
  assert.equal(time("2020-12", true), Date.UTC(2021, 0, 1) / 1000)
  assert.equal(time("2020-02-29", true), Date.UTC(2020, 2, 1) / 1000)
  assert.equal(time("1600000000"), 1600000000)
  assert.throws(() => time("yesterday"))
})

test("top counts plays in the period", async () => {
  const { db } = database()
  const at = Date.UTC(2020, 5, 1) / 1000
  await sync(db, { user: "u", fetch: lb([listen(at, "x"), listen(at + 1, "x"), listen(at + 2, "y"), listen(Date.UTC(2021, 0, 2) / 1000, "y")]).fetch, pageSize: 10, maxPages: 1, overlap: 0, now: NOW })
  const response = await handle(new Request("https://x/music/top?by=track&from=2020&to=2020"), { music: db, games: open("gameplay").db, watching: open("watching").db })
  assert.deepEqual(await response.json(), [{ artist: "A", track: "x", plays: 2 }, { artist: "A", track: "y", plays: 1 }])
})
