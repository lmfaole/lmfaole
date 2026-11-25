import assert from "node:assert/strict"
import { test } from "node:test"

import { sign } from "./lastfm.ts"
import { CURSOR, cursorAfter, REFRESH_TOKEN, sync, type Env, type Options, type Store } from "./sync.ts"

const ENV: Env = { SPOTIFY_CLIENT_ID: "id", SPOTIFY_CLIENT_SECRET: "secret", SPOTIFY_REFRESH_TOKEN: "refresh", LASTFM_API_KEY: "key", LASTFM_API_SECRET: "lfsecret", LASTFM_SESSION_KEY: "sk" }

const memory = (start: Record<string, string> = {}): Store & { data: Map<string, string> } => {
  const data = new Map(Object.entries(start))
  return { data, get: async (key) => data.get(key) ?? null, put: async (key, value) => void data.set(key, value) }
}

const song = (addedAt: string, track: string) => ({ added_at: addedAt, track: { name: track, is_local: false, artists: [{ name: "a-ha" }, { name: "Other" }] } })

/** Spotify's liked songs (newest first) and Last.fm's answers, and the tracks that were loved, in order. */
function fake(liked: unknown[], options: { token?: Record<string, unknown>; lastfm?: (track: string) => { status: number; body: unknown } } = {}) {
  const loved: { artist: string; track: string; sig: string }[] = []
  const fetchFake = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input))
    if (url.hostname === "accounts.spotify.com") return Response.json(options.token ?? { access_token: "t" })
    if (url.hostname === "api.spotify.com") {
      const offset = Number(url.searchParams.get("offset"))
      const limit = Number(url.searchParams.get("limit"))
      const items = liked.slice(offset, offset + limit)
      return Response.json({ items, next: offset + limit < liked.length ? "more" : null })
    }
    const body = new URLSearchParams(String(init?.body))
    const track = body.get("track") ?? ""
    const answer = options.lastfm?.(track) ?? { status: 200, body: {} }
    if (answer.status === 200 && !("error" in (answer.body as object))) loved.push({ artist: body.get("artist") ?? "", track, sig: body.get("api_sig") ?? "" })
    return Response.json(answer.body, { status: answer.status })
  }) as typeof fetch
  return { loved, fetch: fetchFake }
}

const options = (fetchFake: typeof fetch, rest: Partial<Options> = {}): Options => ({ limit: 40, noCursor: "start", maxPages: 5, pause: 0, fetch: fetchFake, log: () => {}, ...rest })

test("the first run only sets the cursor to the newest liked song, so the Worker does not love the whole library", async () => {
  const store = memory()
  const { loved, fetch } = fake([song("2026-11-20T10:00:00Z", "Take On Me"), song("2026-01-01T10:00:00Z", "Hunting High and Low")])
  await sync(ENV, store, options(fetch))
  assert.equal(store.data.get(CURSOR), "2026-11-20T10:00:00Z")
  assert.deepEqual(loved, [])
})

test("songs liked since the cursor are loved oldest first, by the first artist, across pages, and the cursor moves to the newest", async () => {
  const time = (at: number): string => new Date(Date.UTC(2026, 10, 30) - at * 60_000).toISOString()
  const liked = Array.from({ length: 60 }, (_, at) => song(time(at), `Song ${at}`))
  const store = memory({ [CURSOR]: time(57) })
  const { loved, fetch } = fake(liked)
  const result = await sync(ENV, store, options(fetch, { limit: 100 }))
  assert.equal(loved.length, 57)
  assert.equal(loved[0]?.track, "Song 56")
  assert.equal(loved.at(-1)?.track, "Song 0")
  assert.ok(loved.every((entry) => entry.artist === "a-ha"))
  assert.equal(store.data.get(CURSOR), time(0))
  assert.equal(result.left, 0)
})

test("local files and removed songs are passed over", async () => {
  const store = memory({ [CURSOR]: "2026-01-01T00:00:00Z" })
  const { loved, fetch } = fake([{ added_at: "2026-11-03T00:00:00Z", track: { name: "Demo", is_local: true, artists: [{ name: "Me" }] } }, { added_at: "2026-11-02T00:00:00Z", track: null }, song("2026-11-01T00:00:00Z", "Stay On These Roads")])
  await sync(ENV, store, options(fetch))
  assert.deepEqual(loved.map((entry) => entry.track), ["Stay On These Roads"])
})

test("a run that reaches its limit leaves the rest for the next run, and never stops the cursor inside songs liked in the same second", async () => {
  const liked = [song("2026-11-03T00:00:00Z", "C2"), song("2026-11-03T00:00:00Z", "C1"), song("2026-11-02T00:00:00Z", "B"), song("2026-11-01T00:00:00Z", "A")]
  const store = memory({ [CURSOR]: "2026-10-01T00:00:00Z" })
  const first = fake(liked)
  const result = await sync(ENV, store, options(first.fetch, { limit: 3 }))
  assert.deepEqual(first.loved.map((entry) => entry.track), ["A", "B", "C1"])
  assert.equal(store.data.get(CURSOR), "2026-11-02T00:00:00Z")
  assert.equal(result.left, 2)
  const second = fake(liked)
  await sync(ENV, store, options(second.fetch, { limit: 3 }))
  assert.deepEqual(second.loved.map((entry) => entry.track), ["C1", "C2"])
  assert.equal(store.data.get(CURSOR), "2026-11-03T00:00:00Z")
})

test("a group of same-second songs bigger than a whole run moves the cursor past it instead of holding it for ever", () => {
  const group = [{ addedAt: "x", track: "1", artist: "a" }, { addedAt: "x", track: "2", artist: "a" }, { addedAt: "x", track: "3", artist: "a" }]
  assert.equal(cursorAfter(group, 2, "w", true), "x")
  assert.equal(cursorAfter(group, 2, "w", false), "w")
})

test("Last.fm's rate limit stops the run with the cursor after the last song loved; a song it will not love is passed over", async () => {
  const liked = [song("2026-11-04T00:00:00Z", "D"), song("2026-11-03T00:00:00Z", "C"), song("2026-11-02T00:00:00Z", "B"), song("2026-11-01T00:00:00Z", "A")]
  const store = memory({ [CURSOR]: "2026-10-01T00:00:00Z" })
  const { loved, fetch } = fake(liked, {
    lastfm: (track) => (track === "B" ? { status: 400, body: { error: 6, message: "Track not found" } } : track === "C" ? { status: 429, body: { error: 29 } } : { status: 200, body: {} }),
  })
  const result = await sync(ENV, store, options(fetch))
  assert.deepEqual(loved.map((entry) => entry.track), ["A"])
  assert.equal(result.failed, 1)
  assert.equal(store.data.get(CURSOR), "2026-11-02T00:00:00Z")
})

test("a refresh token Spotify rotates is kept and used from then on", async () => {
  const store = memory({ [CURSOR]: "2026-12-01T00:00:00Z" })
  await sync(ENV, store, options(fake([], { token: { access_token: "t", refresh_token: "new" } }).fetch))
  assert.equal(store.data.get(REFRESH_TOKEN), "new")
})

test("Last.fm's signature leaves out format, sorts by name, and is UTF-8 MD5 with the secret last", () => {
  // md5("api_keykeyartistÆtrackxsecret")
  assert.equal(sign({ track: "x", api_key: "key", format: "json", artist: "Æ" }, "secret"), "b189764f47798fdf9681dfa255e6d121")
})
