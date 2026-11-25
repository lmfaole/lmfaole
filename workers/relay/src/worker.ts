/**
 * The relay of medier and startside: a Worker off the lmfaole.party zone that asks the sources on the apps' behalf, because a Worker on the zone gets 525 on a
 * fetch to an origin outside Cloudflare (GitHub, Spotify, Last.fm …) during a page request, while this one does not. The apps ask it through their service
 * binding `UPSTREAM`, Worker to Worker, and startside over its workers.dev address where the binding answers 520–530; whichever way, nothing is asked
 * without the key (`X-Upstream-Key`, compared in constant time: `guard.ts`). An ask is `/<host>/<path>?<query>`: only the hosts of `routes.ts`, only GET
 * (and the few POSTs a source lists there), and only the headers a source needs.
 */

import { knownKey, keysOf, readOnlyQuery, smallBody } from "./guard.ts"
import { ROUTES } from "./routes.ts"
import type { Env } from "./source.ts"

/** Marks what the relay passes on from a source, so an app can tell a source's 52x from one of the binding's (startside's `lib/relay.ts`). */
export const RELAY = "lmfaole-relay"

/** What the relay passes back of a source's headers besides its `Content-Type`: when it may be asked again, and the time to ask about (MET asks for it). */
const PASSED_BACK = ["Expires", "Last-Modified"]

const refuse = (text: string, status: number): Response => new Response(text, { status })

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (!(await knownKey(request.headers.get("X-Upstream-Key"), keysOf(env)))) return refuse("Forbidden", 403)

    const url = new URL(request.url)
    const [, host = "", ...rest] = url.pathname.split("/")
    const path = rest.join("/")
    const source = ROUTES.get(host)
    const post = request.method === "POST" ? source?.post?.[path] : undefined
    if (source === undefined || (source.postOnly === true && post === undefined)) return refuse("Unknown host", 404)
    if (request.method !== "GET" && post === undefined) return refuse("Method not allowed", 405)

    const body = post === undefined ? null : await smallBody(request)
    if (post !== undefined && body === null) return refuse("Payload too large", 413)
    if (post === "graphql") {
      let query: unknown
      try {
        query = (JSON.parse(body ?? "") as { query?: unknown } | null)?.query
      } catch {
        return refuse("Bad request", 400)
      }
      if (!readOnlyQuery(query)) return refuse("Only queries", 400)
    }

    const headers = new Headers({ "User-Agent": source.agent, Accept: request.headers.get("Accept") ?? "application/json" })
    // A conditional ask, so a source with nothing new can answer 304.
    const since = request.headers.get("If-Modified-Since")
    if (since !== null) headers.set("If-Modified-Since", since)
    for (const name of source.forward ?? []) {
      const value = request.headers.get(name)
      if (value !== null) headers.set(name, value)
    }
    for (const [name, value] of Object.entries(source.set ?? {})) headers.set(name, value)
    if (post === "graphql") headers.set("Content-Type", "application/json")
    const unsigned = source.sign?.(headers, env)
    if (unsigned !== undefined) return unsigned

    const response = await fetch(`https://${host}/${path}${url.search}`, post === undefined ? { headers } : { method: "POST", headers, body })
    const out = new Headers({ "Content-Type": response.headers.get("Content-Type") ?? "application/json", "X-Relay": RELAY })
    for (const name of PASSED_BACK) {
      const value = response.headers.get(name)
      if (value !== null) out.set(name, value)
    }
    // 204 (nothing is playing), 205 and 304 have no body, and a Response may not be given one.
    const empty = response.status === 204 || response.status === 205 || response.status === 304
    return new Response(empty ? null : response.body, { status: response.status, headers: out })
  },
}
