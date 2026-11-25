/**
 * The edge's copy of a page (`src/middleware.ts`): every page is the same for every visitor (the owner's data, `users.ts`; no cookie is read), so a page drawn once is kept for a minute in the
 * Worker's cache (`caches.default`) and the next visitor in that minute gets it without a single source being asked. Only a whole page that went well: never an error, a redirect, an answer
 * that sets a cookie or says it is not to be kept, and never the API (what plays now is to be live). Pure, with a test.
 */

/** For how many seconds a page is kept at the edge. */
export const PAGE_TTL = 60

/** What a page tells the browser and any cache in between: a shared cache may keep it for `PAGE_TTL`, the browser asks again each time (the service worker keeps its own copy, `public/sw.js`). */
export const PAGE_CACHE_CONTROL = `public, max-age=0, s-maxage=${PAGE_TTL}`
/** What the edge's own copy is kept under: the Workers cache keeps an answer for its `max-age`. */
export const KEPT_CACHE_CONTROL = `public, max-age=${PAGE_TTL}`
/** An answer that is not kept anywhere without being asked again, where it says nothing of its own. */
export const UNCACHED_CACHE_CONTROL = "no-cache"

/** Whether a request may be answered from (and its answer kept in) the edge's copy: a GET of a page or a server island under the site's `base`; never the API, a built file or another path. */
export function cacheableRequest(method: string, pathname: string, base = "/"): boolean {
  if (method !== "GET" || !pathname.startsWith(base)) return false
  if (pathname.startsWith(`${base}api/`) || pathname.startsWith(`${base}_astro/`)) return false
  return !/\.[a-z0-9]+$/i.test(pathname)
}

/** Whether an answer may be kept: a page that went well (200, HTML), that sets no cookie and does not say it is private or not to be kept. */
export function cacheableResponse(status: number, headers: Headers): boolean {
  if (status !== 200 || headers.has("Set-Cookie")) return false
  if (!(headers.get("Content-Type") ?? "").includes("text/html")) return false
  return !/\b(no-store|private)\b/i.test(headers.get("Cache-Control") ?? "")
}
