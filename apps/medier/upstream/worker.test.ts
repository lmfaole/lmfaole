import { strict as assert } from "node:assert"
import { afterEach, test } from "node:test"

import relay from "./worker.ts"

const ENV = { UPSTREAM_KEY: "shared" }
const real = globalThis.fetch
afterEach(() => {
  globalThis.fetch = real
})

/** Replaces `fetch` with one that records what the relay asked for and answers 200. */
function spy(): { url: string; init: RequestInit | undefined }[] {
  const calls: { url: string; init: RequestInit | undefined }[] = []
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init })
    return new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } })
  }) as typeof fetch
  return calls
}

const ask = (path: string, init: RequestInit & { key?: string | null } = {}) => {
  const { key = "shared", ...rest } = init
  const headers = new Headers(rest.headers)
  if (key !== null) headers.set("X-Upstream-Key", key)
  return relay.fetch(new Request(`https://relay.example${path}`, { ...rest, headers }), ENV)
}

test("without the shared key the relay asks nothing", async () => {
  const calls = spy()
  assert.equal((await ask("/api.trakt.tv/users/me/history/movies", { key: null })).status, 403)
  assert.equal((await ask("/api.trakt.tv/users/me/history/movies", { key: "guess" })).status, 403)
  assert.equal((await relay.fetch(new Request("https://relay.example/api.trakt.tv/x", { headers: { "X-Upstream-Key": "" } }), {})).status, 403)
  assert.equal(calls.length, 0)
})

test("only the hosts of the sources are asked, and only with GET", async () => {
  const calls = spy()
  assert.equal((await ask("/example.com/secrets")).status, 404)
  assert.equal((await ask("/accounts.spotify.com/authorize")).status, 404)
  assert.equal((await ask("/api.trakt.tv/users/me", { method: "POST", body: "x" })).status, 405)
  assert.equal(calls.length, 0)
  assert.equal((await ask("/api.trakt.tv/users/me/history/movies?limit=50")).status, 200)
  assert.equal(calls[0]?.url, "https://api.trakt.tv/users/me/history/movies?limit=50")
})

test("MusicBrainz is one of the hosts, asked with the site's name as its User-Agent, as it wants", async () => {
  const calls = spy()
  assert.equal((await ask("/musicbrainz.org/ws/2/release-group?fmt=json&query=arid%3Ax")).status, 200)
  assert.equal(calls[0]?.url, "https://musicbrainz.org/ws/2/release-group?fmt=json&query=arid%3Ax")
  assert.match(new Headers(calls[0]?.init?.headers).get("user-agent") ?? "", /^lmfaole-medier \(https:\/\//)
  assert.equal((await ask("/musicbrainz.org/ws/2/release-group", { method: "POST", body: "x" })).status, 405)
})

test("Wikidata is one of the hosts, for an artist's Wikipedia article in Norwegian, and only with GET", async () => {
  const calls = spy()
  assert.equal((await ask("/www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1")).status, 200)
  assert.equal(calls[0]?.url, "https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1")
  assert.equal((await ask("/www.wikidata.org/w/api.php", { method: "POST", body: "x" })).status, 405)
})

test("the one POST is Spotify's token, with the sign-in that came with the ask forwarded and nothing else of the page's", async () => {
  const calls = spy()
  await ask("/accounts.spotify.com/api/token", { method: "POST", body: "grant_type=refresh_token", headers: { Authorization: "Basic abc", "Content-Type": "application/x-www-form-urlencoded", Cookie: "session=1" } })
  const headers = new Headers(calls[0]?.init?.headers)
  assert.equal(calls[0]?.url, "https://accounts.spotify.com/api/token")
  assert.equal(headers.get("authorization"), "Basic abc")
  assert.equal(headers.get("cookie"), null)
  assert.equal(headers.get("x-upstream-key"), null)
})

test("an answer with no body (204, nothing is playing) passes through as that", async () => {
  globalThis.fetch = (async () => new Response(null, { status: 204 })) as typeof fetch
  const response = await ask("/api.spotify.com/v1/me/player/currently-playing")
  assert.equal(response.status, 204)
})

test("setlist.fm is one of the hosts, and its key is passed on in its own header", async () => {
  const calls = spy()
  assert.equal((await ask("/api.setlist.fm/rest/1.0/artist/x/setlists?p=1", { headers: { "x-api-key": "k", Accept: "application/json" } })).status, 200)
  assert.equal(calls[0]?.url, "https://api.setlist.fm/rest/1.0/artist/x/setlists?p=1")
  assert.equal(new Headers(calls[0]?.init?.headers).get("x-api-key"), "k")
})

test("Steam is one of the hosts, its key in the address as Steam wants it", async () => {
  const calls = spy()
  assert.equal((await ask("/api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=k&steamid=1")).status, 200)
  assert.equal(calls[0]?.url, "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=k&steamid=1")
})

test("Steam's store is one of the hosts: a game's page, its reviews and its Steam Deck report", async () => {
  const calls = spy()
  assert.equal((await ask("/store.steampowered.com/api/appdetails?appids=620,10&filters=price_overview&cc=no")).status, 200)
  assert.equal(calls[0]?.url, "https://store.steampowered.com/api/appdetails?appids=620,10&filters=price_overview&cc=no")
})

test("ListenBrainz is one of the hosts, asked with the site's name as its User-Agent", async () => {
  const calls = spy()
  assert.equal((await ask("/api.listenbrainz.org/1/user/ola/listens?count=50")).status, 200)
  assert.equal(calls[0]?.url, "https://api.listenbrainz.org/1/user/ola/listens?count=50")
  assert.match(new Headers(calls[0]?.init?.headers).get("user-agent") ?? "", /^lmfaole-medier \(https:\/\//)
})
