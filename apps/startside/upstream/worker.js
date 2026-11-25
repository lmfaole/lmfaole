// A small relay on workers.dev for the start page. Workers on the lmfaole.party zone cannot reach origins outside
// Cloudflare (every such fetch ends in 525), while a fetch to workers.dev works, so the page fetches its sources here.
// Only GET (and POST to the GraphQL of GitHub and Entur, which is how they are asked, queries only), only the hosts below, and only with the key the page and this Worker share (UPSTREAM_KEY).
// GITHUB_TOKEN lives here, so the page never holds it.

import { readOnlyQuery, sameKey } from "./guard.js"

// The first is Cloudflare Access's signing keys (public), for the page's check of its token where it cannot fetch them itself.
const HOSTS = new Set(["party-7ry-pages.cloudflareaccess.com", "api.met.no", "api.github.com", "nominatim.openstreetmap.org", "api.entur.io", "api.spotify.com", "services.swpc.noaa.gov", "www.hvakosterstrommen.no", "api01.nve.no", "gbfs.urbansharing.com", "ws.geonorge.no"])
const USER_AGENT = "startside github.com/lmfaole/lmfaole"
/** The largest body a POST may have (a GraphQL query, Spotify's token form). */
const BODY_MAX = 64 * 1024

/** The body of a POST as text, or `null` where it is larger than `BODY_MAX`. */
async function smallBody(request) {
  if (Number(request.headers.get("content-length") ?? 0) > BODY_MAX) return null
  const text = await request.text()
  return new TextEncoder().encode(text).length > BODY_MAX ? null : text
}

export default {
  async fetch(request, env) {
    if (!(await sameKey(request.headers.get("X-Upstream-Key"), env.UPSTREAM_KEY))) return new Response("Forbidden", { status: 403 })

    const url = new URL(request.url)
    const [, host, ...rest] = url.pathname.split("/")
    const path = rest.join("/")
    if (!HOSTS.has(host) && !(host === "accounts.spotify.com" && path === "api/token")) return new Response("Unknown host", { status: 404 })
    // Spotify: the one POST is the token (`accounts.spotify.com/api/token`, a form), and what is asked of Spotify carries its own `Authorization` (an access token, or the client's sign-in): the relay holds no key of Spotify's.
    const spotifyToken = request.method === "POST" && host === "accounts.spotify.com" && path === "api/token"
    const graphql = request.method === "POST" && ((host === "api.github.com" && path === "graphql") || (host === "api.entur.io" && path === "journey-planner/v3/graphql"))
    if (host === "accounts.spotify.com" && !spotifyToken) return new Response("Unknown host", { status: 404 })
    if (request.method !== "GET" && !graphql && !spotifyToken) return new Response("Method not allowed", { status: 405 })
    const body = graphql || spotifyToken ? await smallBody(request) : null
    if ((graphql || spotifyToken) && body === null) return new Response("Payload too large", { status: 413 })
    if (graphql) {
      let query
      try {
        query = JSON.parse(body)?.query
      } catch {
        return new Response("Bad request", { status: 400 })
      }
      if (!readOnlyQuery(query)) return new Response("Only queries", { status: 400 })
    }

    const headers = new Headers({ "User-Agent": USER_AGENT, Accept: request.headers.get("Accept") ?? "application/json" })
    if (host === "api.github.com") {
      if (!env.GITHUB_TOKEN) return new Response("GITHUB_TOKEN er ikke satt", { status: 500 })
      headers.set("Authorization", `Bearer ${env.GITHUB_TOKEN}`)
      headers.set("X-GitHub-Api-Version", "2022-11-28")
    }
    if (host === "api.entur.io") headers.set("ET-Client-Name", "lmfaole-startside")
    // Oslo Bysykkel's open data asks every client to say who it is.
    if (host === "gbfs.urbansharing.com") headers.set("Client-Identifier", "lmfaole-startside")
    // A conditional ask, so a source with nothing new can answer 304 (MET asks for it).
    if (request.headers.has("if-modified-since")) headers.set("If-Modified-Since", request.headers.get("if-modified-since"))
    if (graphql) headers.set("Content-Type", "application/json")
    if (host === "api.spotify.com" || spotifyToken) {
      for (const name of ["authorization", "content-type"]) if (request.headers.has(name)) headers.set(name, request.headers.get(name))
    }
    const response = await fetch(`https://${host}/${rest.join("/")}${url.search}`, graphql || spotifyToken ? { method: "POST", headers, body } : { headers })
    const out = new Headers({ "Content-Type": response.headers.get("Content-Type") ?? "application/json" })
    // When the answer may be asked for again, and the time to ask about.
    for (const name of ["Expires", "Last-Modified"]) if (response.headers.has(name)) out.set(name, response.headers.get(name))
    return new Response(response.status === 304 ? null : response.body, { status: response.status, headers: out })
  },
}
