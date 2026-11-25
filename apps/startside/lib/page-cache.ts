/**
 * The edge's copy of a page (worker.mjs): every page is the same for every visitor (one fixed GitHub user and configuration, no cookie
 * is read; the only thing of the visitor's is the position in the address), so a page drawn once is kept a short while in the Worker's
 * cache (`caches.default`) and the next visitor in that while gets it without a source being asked. Only a whole HTML page that went
 * well: never an error, a redirect, an answer that sets a cookie, Next's own data requests (RSC, used by the minute's refresh, so that
 * stays live) or a built file. Pure, with a test.
 */

import { formatPosition, parsePosition, POSITION_PARAM } from "./position.ts"
import { AREA_PARAM, parsePriceArea } from "./power.ts"

/** For how many seconds a page is kept at the edge. */
export const PAGE_TTL = 60
/** The departure boards are real time: kept a quarter of a minute, and the page asks for itself again every minute anyway. */
export const TRANSPORT_TTL = 15

/**
 * The query parameters a page reads, each as the page reads it (the position rounded to three decimals, the price area checked); any other,
 * or one the page would not take, is left out of the key, so a made-up one or more decimals cannot get round the cache.
 */
const KEPT_PARAMS: ReadonlyArray<[string, (value: string) => string | null]> = [
  [POSITION_PARAM, (value) => {
    const position = parsePosition(value)
    return position === null ? null : formatPosition(position)
  }],
  [AREA_PARAM, (value) => parsePriceArea(value)],
]

/** For how long a page at this path is kept. */
export const ttlFor = (pathname: string): number => (pathname === "/start/transport" || pathname.startsWith("/start/transport/") ? TRANSPORT_TTL : PAGE_TTL)

/** What a page tells the browser and any cache in between: a shared cache may keep it for its time, the browser asks again each time (the service worker keeps its own copy for offline). */
export const pageCacheControl = (ttl: number): string => `public, max-age=0, s-maxage=${ttl}`
/** What the edge's own copy is kept under: the Workers cache keeps an answer for its `max-age`. */
export const keptCacheControl = (ttl: number): string => `public, max-age=${ttl}`

/**
 * Whether a request may be answered from (and its answer kept in) the edge's copy: a GET of a page under `/start`, not Next's data
 * request for it (`RSC` header or `_rsc` parameter), not a built file, the service worker or anything else with a file extension.
 */
export function cacheableRequest(method: string, url: URL, headers: Headers): boolean {
  if (method !== "GET") return false
  const { pathname } = url
  if (pathname !== "/start" && !pathname.startsWith("/start/")) return false
  if (pathname.startsWith("/start/_next/") || pathname.startsWith("/start/api/")) return false
  if (headers.has("RSC") || headers.has("Next-Router-Prefetch") || url.searchParams.has("_rsc")) return false
  return !/\.[a-z0-9]+$/i.test(pathname)
}

/** The key a page is kept under: its address with only the parameters a page reads, as it reads them, in a fixed order. */
export function cacheKey(url: URL): string {
  const key = new URL(url.origin + url.pathname)
  for (const [name, normal] of KEPT_PARAMS) {
    const value = url.searchParams.get(name)
    const kept = value === null ? null : normal(value)
    if (kept !== null) key.searchParams.set(name, kept)
  }
  return key.toString()
}

/**
 * Whether an answer may be kept: a page that went well (200, HTML) and sets no cookie. Next marks every page it renders per request
 * `private, no-store`, which is not so here (nothing in it is the visitor's), so that is not asked.
 */
export function cacheableResponse(status: number, headers: Headers): boolean {
  if (status !== 200 || headers.has("Set-Cookie")) return false
  return (headers.get("Content-Type") ?? "").includes("text/html")
}
