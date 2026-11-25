/**
 * The relay for the site: a Worker off the zone that asks the sources on the site's behalf, because a Worker on the lmfaole.party zone gets 525 on every
 * fetch to an origin outside Cloudflare while this one does not. The site asks it through a service binding (`UPSTREAM`), Worker to Worker; the key is asked for
 * all the same, so the relay stays shut to anyone but the site whatever way it is reached. Only the hosts below (MusicBrainz wants the User-Agent to name the site, and this one does), only GET (and the one POST that swaps Spotify's refresh token),
 * and only with the key the site and the relay share (`UPSTREAM_KEY`). It holds no key of its own: what a source needs comes with the ask.
 */

interface RelayEnv {
  UPSTREAM_KEY?: string
}

const GET_HOSTS = new Set(["ws.audioscrobbler.com", "api.trakt.tv", "api.themoviedb.org", "api.spotify.com", "musicbrainz.org", "www.wikidata.org", "api.setlist.fm", "api.steampowered.com", "store.steampowered.com", "retroachievements.org", "api.listenbrainz.org"])
const FORWARDED = ["authorization", "content-type", "accept", "trakt-api-version", "trakt-api-key", "x-api-key"]
const USER_AGENT = "lmfaole-medier (https://github.com/lmfaole/lmfaole)"

export default {
  async fetch(request: Request, env: RelayEnv): Promise<Response> {
    if (env.UPSTREAM_KEY === undefined || env.UPSTREAM_KEY === "" || request.headers.get("X-Upstream-Key") !== env.UPSTREAM_KEY) return new Response("Forbidden", { status: 403 })

    const url = new URL(request.url)
    const [, host = "", ...rest] = url.pathname.split("/")
    const path = rest.join("/")
    const token = request.method === "POST" && host === "accounts.spotify.com" && path === "api/token"
    if (!GET_HOSTS.has(host) && !token) return new Response("Unknown host", { status: 404 })
    if (request.method !== "GET" && !token) return new Response("Method not allowed", { status: 405 })

    const headers = new Headers({ "User-Agent": USER_AGENT })
    for (const name of FORWARDED) {
      const value = request.headers.get(name)
      if (value !== null) headers.set(name, value)
    }
    const response = await fetch(`https://${host}/${path}${url.search}`, token ? { method: "POST", headers, body: request.body } : { headers })
    // 204 has no body, and a Response may not be given one.
    return new Response(response.status === 204 ? null : response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" } })
  },
}
