import { strict as assert } from "node:assert"
import { afterEach, test } from "node:test"

import relay, { RELAY } from "./worker.ts"

const ENV = { UPSTREAM_KEY: "shared", GITHUB_TOKEN: "gh-secret" }
const real = globalThis.fetch
afterEach(() => {
  globalThis.fetch = real
})

/** Replaces `fetch` with one that records what the relay asked for and answers `status`. */
function spy(status = 200, headers: Record<string, string> = { "Content-Type": "application/json" }): { url: string; init: RequestInit | undefined }[] {
  const calls: { url: string; init: RequestInit | undefined }[] = []
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init })
    return new Response(status === 204 || status === 304 ? null : "{}", { status, headers })
  }) as typeof fetch
  return calls
}

const ask = (path: string, init: RequestInit & { key?: string | null } = {}, env: Record<string, string> = ENV) => {
  const { key = "shared", ...rest } = init
  const headers = new Headers(rest.headers)
  if (key !== null) headers.set("X-Upstream-Key", key)
  return relay.fetch(new Request(`https://relay.example${path}`, { ...rest, headers }), env)
}
const sent = (call: { init: RequestInit | undefined } | undefined): Headers => new Headers(call?.init?.headers)

test("without the key, a wrong one or only part of it, nothing is asked", async () => {
  const calls = spy()
  assert.equal((await ask("/api.trakt.tv/users/me/history/movies", { key: null })).status, 403)
  for (const key of ["guess", "shard", "share", "shared2", ""]) assert.equal((await ask("/api.met.no/x", { key })).status, 403, key)
  assert.equal((await ask("/api.met.no/x", { key: "" }, { UPSTREAM_KEY: "" })).status, 403)
  assert.equal((await ask("/api.met.no/x", {}, {})).status, 403)
  assert.equal(calls.length, 0)
})

test("while a new key is handed out, both the key and the next one are taken, and only those", async () => {
  const calls = spy()
  const env = { UPSTREAM_KEY: "old", UPSTREAM_KEY_NEXT: "new" }
  assert.equal((await ask("/api.met.no/x", { key: "old" }, env)).status, 200)
  assert.equal((await ask("/api.met.no/x", { key: "new" }, env)).status, 200)
  assert.equal((await ask("/api.met.no/x", { key: "other" }, env)).status, 403)
  assert.equal((await ask("/api.met.no/x", { key: "new" }, { UPSTREAM_KEY_NEXT: "new" })).status, 200)
  assert.equal(calls.length, 3)
})

test("only the hosts of the sources are asked, and only with GET", async () => {
  const calls = spy()
  assert.equal((await ask("/example.com/secrets")).status, 404)
  assert.equal((await ask("/constructor/x")).status, 404)
  assert.equal((await ask("/accounts.spotify.com/authorize")).status, 404)
  assert.equal((await ask("/api.trakt.tv/users/me", { method: "POST", body: "x" })).status, 405)
  assert.equal((await ask("/api.met.no/x", { method: "DELETE" })).status, 405)
  assert.equal(calls.length, 0)
  assert.equal((await ask("/api.trakt.tv/users/me/history/movies?limit=50", { headers: { "trakt-api-version": "2", "trakt-api-key": "id" } })).status, 200)
  assert.equal(calls[0]?.url, "https://api.trakt.tv/users/me/history/movies?limit=50")
  assert.equal(sent(calls[0]).get("trakt-api-key"), "id")
})

test("medier's sources are asked with medier's name as the User-Agent (MusicBrainz wants it), and only with GET", async () => {
  const calls = spy()
  for (const path of [
    "/musicbrainz.org/ws/2/release-group?fmt=json&query=arid%3Ax",
    "/www.wikidata.org/w/api.php?action=wbgetentities&ids=Q1",
    "/api.listenbrainz.org/1/user/ola/listens?count=50",
    "/api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/?key=k&steamid=1",
    "/store.steampowered.com/api/appdetails?appids=620,10&filters=price_overview&cc=no",
    "/retroachievements.org/API/API_GetUserRecentlyPlayedGames.php?y=k&u=x",
    "/ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&api_key=k&format=json",
  ]) {
    assert.equal((await ask(path)).status, 200, path)
    assert.equal(calls.at(-1)?.url, `https:/${path}`)
    assert.match(sent(calls.at(-1)).get("user-agent") ?? "", /^lmfaole-medier \(https:\/\//)
  }
  assert.equal((await ask("/musicbrainz.org/ws/2/release-group", { method: "POST", body: "x" })).status, 405)
  assert.equal((await ask("/www.wikidata.org/w/api.php", { method: "POST", body: "x" })).status, 405)
})

test("a source gets only the headers it needs: setlist.fm its key, TMDB its token, and nothing of the page's", async () => {
  const calls = spy()
  await ask("/api.setlist.fm/rest/1.0/artist/x/setlists?p=1", { headers: { "x-api-key": "k", Accept: "application/json", Cookie: "a=1", Authorization: "Bearer t" } })
  assert.equal(calls[0]?.url, "https://api.setlist.fm/rest/1.0/artist/x/setlists?p=1")
  assert.equal(sent(calls[0]).get("x-api-key"), "k")
  assert.equal(sent(calls[0]).get("authorization"), null)
  assert.equal(sent(calls[0]).get("cookie"), null)
  assert.equal(sent(calls[0]).get("x-upstream-key"), null)
  await ask("/api.themoviedb.org/3/movie/1", { headers: { Authorization: "Bearer read", "x-api-key": "k" } })
  assert.equal(sent(calls[1]).get("authorization"), "Bearer read")
  assert.equal(sent(calls[1]).get("x-api-key"), null)
  assert.equal(sent(calls[1]).get("accept"), "application/json")
})

test("Spotify, for both: what is asked carries its own sign-in, and the one POST is the token, with the form and nothing else of the page's", async () => {
  const calls = spy()
  await ask("/api.spotify.com/v1/me/player/currently-playing", { headers: { Authorization: "Bearer abc" } })
  assert.equal(calls[0]?.url, "https://api.spotify.com/v1/me/player/currently-playing")
  assert.equal(sent(calls[0]).get("authorization"), "Bearer abc")
  await ask("/accounts.spotify.com/api/token", { method: "POST", body: "grant_type=refresh_token", headers: { Authorization: "Basic xyz", "Content-Type": "application/x-www-form-urlencoded", Cookie: "session=1" } })
  assert.equal(calls[1]?.url, "https://accounts.spotify.com/api/token")
  assert.equal(calls[1]?.init?.method, "POST")
  assert.equal(calls[1]?.init?.body, "grant_type=refresh_token")
  assert.equal(sent(calls[1]).get("authorization"), "Basic xyz")
  assert.equal(sent(calls[1]).get("content-type"), "application/x-www-form-urlencoded")
  assert.equal(sent(calls[1]).get("cookie"), null)
  assert.equal(sent(calls[1]).get("x-upstream-key"), null)
  assert.equal((await ask("/accounts.spotify.com/api/token")).status, 404)
  assert.equal((await ask("/accounts.spotify.com/authorize", { method: "POST", body: "x" })).status, 404)
  assert.equal((await ask("/api.spotify.com/v1/me", { method: "POST", body: "x" })).status, 405)
  assert.equal(calls.length, 2)
})

test("GitHub gets the relay's token and never the caller's; without one it is not asked", async () => {
  const calls = spy()
  await ask("/api.github.com/user", { headers: { Authorization: "Bearer from-the-page" } })
  assert.equal(sent(calls[0]).get("authorization"), "Bearer gh-secret")
  assert.equal(sent(calls[0]).get("x-github-api-version"), "2022-11-28")
  assert.match(sent(calls[0]).get("user-agent") ?? "", /^startside /)
  const without = await ask("/api.github.com/user", {}, { UPSTREAM_KEY: "shared" })
  assert.equal(without.status, 500)
  assert.equal(await without.text(), "GITHUB_TOKEN er ikke satt")
  assert.equal(calls.length, 1)
})

test("a source's answer, also a 525 of its own, is marked as passed on by the relay, with when to ask again", async () => {
  spy(525, { "Content-Type": "text/html", Expires: "Wed, 25 Nov 2026 20:00:00 GMT", "Last-Modified": "Wed, 25 Nov 2026 19:00:00 GMT", "Set-Cookie": "a=1" })
  const response = await ask("/api.github.com/search/issues?q=is%3Apublic")
  assert.equal(response.status, 525)
  assert.equal(response.headers.get("X-Relay"), RELAY)
  assert.equal(response.headers.get("Content-Type"), "text/html")
  assert.equal(response.headers.get("Expires"), "Wed, 25 Nov 2026 20:00:00 GMT")
  assert.equal(response.headers.get("Last-Modified"), "Wed, 25 Nov 2026 19:00:00 GMT")
  assert.equal(response.headers.get("Set-Cookie"), null)
})

test("answers with no body (204, nothing is playing; 304, nothing new) pass through as that, and If-Modified-Since goes on", async () => {
  spy(204)
  assert.equal((await ask("/api.spotify.com/v1/me/player/currently-playing")).status, 204)
  const calls = spy(304)
  const response = await ask("/api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.9&lon=10.7", { headers: { "If-Modified-Since": "Wed, 25 Nov 2026 19:00:00 GMT" } })
  assert.equal(response.status, 304)
  assert.equal(response.body, null)
  assert.equal(sent(calls[0]).get("if-modified-since"), "Wed, 25 Nov 2026 19:00:00 GMT")
})

test("Entur and Oslo Bysykkel are told who asks; the other open sources are let through without it", async () => {
  const calls = spy()
  await ask("/gbfs.urbansharing.com/oslobysykkel.no/station_status.json")
  assert.equal(sent(calls[0]).get("client-identifier"), "lmfaole-startside")
  await ask("/www.hvakosterstrommen.no/api/v1/prices/2026/11-21_NO1.json")
  assert.equal(sent(calls[1]).get("client-identifier"), null)
  await ask("/api.entur.io/journey-planner/v3/graphql", { method: "POST", body: JSON.stringify({ query: "{ stopPlace(id: \"x\") { name } }" }) })
  assert.equal(sent(calls[2]).get("et-client-name"), "lmfaole-startside")
  assert.equal(sent(calls[2]).get("content-type"), "application/json")
  for (const path of ["/api01.nve.no/hydrology/forecast/flood/v1.0.10/api/x", "/ws.geonorge.no/kommuneinfo/v1/punkt", "/nominatim.openstreetmap.org/reverse?lat=1", "/services.swpc.noaa.gov/x.json"]) {
    assert.equal((await ask(path)).status, 200, path)
  }
})

test("GraphQL: queries go through, also with the words in strings and comments; mutations, subscriptions, bad and large bodies do not", async () => {
  const calls = spy()
  const post = (body: unknown, path = "/api.github.com/graphql") => ask(path, { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })
  assert.equal((await post({ query: "query ($q: String!) { search(query: $q) { nodes { id } } } # no mutation here", variables: { q: "mutation" } })).status, 200)
  assert.equal((await post({ query: '{ search(query: "mutation subscription") { issueCount } viewer { login } }' })).status, 200)
  assert.equal((JSON.parse(String(calls[0]?.init?.body)) as { variables: { q: string } }).variables.q, "mutation")
  assert.equal(calls.length, 2)
  for (const query of ['mutation { addStar(input: {starrableId: "x"}) { clientMutationId } }', "mutation($id: ID!){deleteIssue(input:{issueId:$id}){clientMutationId}}", "query { a } mutation B { c }", "subscription { x }", '{ a(s: "\\"") } mutation { b }']) {
    assert.equal((await post({ query })).status, 400, query)
  }
  assert.equal((await post({ query: "mutation { x }" }, "/api.entur.io/journey-planner/v3/graphql")).status, 400)
  assert.equal((await post("not json")).status, 400)
  assert.equal((await post("null")).status, 400)
  assert.equal((await post({ variables: {} })).status, 400)
  assert.equal((await post({ query: `{ a } #${"x".repeat(70_000)}` })).status, 413)
  assert.equal((await post({ query: "{ a }" }, "/api.github.com/user")).status, 405)
  assert.equal(calls.length, 2)
})
