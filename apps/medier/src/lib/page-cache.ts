/**
 * The edge's copy of a page (`src/middleware.ts`, with `pageCache` of `@lmfaole/web/middleware`): every page is the same for every visitor (the owner's data, `users.ts`; no cookie is read), so a
 * page drawn once is kept for a minute in the Worker's cache (`caches.default`) and the next visitor in that minute gets it without a single source being asked. Only a whole page that went well
 * (`cacheablePage`): never an error, a redirect, an answer that sets a cookie or says it is not to be kept, and never the API (what plays now is to be live). Pure, with a test.
 */

/** For how many seconds a page is kept at the edge, and may be kept by a shared cache (the browser asks again each time; the service worker keeps its own copy, `public/sw.js`). */
export const PAGE_TTL = 60

/** An answer that is not kept anywhere without being asked again, where it says nothing of its own. */
export const UNCACHED_CACHE_CONTROL = "no-cache"

/** Whether a request may be answered from (and its answer kept in) the edge's copy: a GET of a page or a server island under the site's `base`; never the API, a built file or another path. */
export function cacheableRequest(method: string, pathname: string, base = "/"): boolean {
  if (method !== "GET" || !pathname.startsWith(base)) return false
  if (pathname.startsWith(`${base}api/`) || pathname.startsWith(`${base}_astro/`)) return false
  return !/\.[a-z0-9]+$/i.test(pathname)
}
