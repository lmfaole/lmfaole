/**
 * The edge's copy of the front page (`src/middleware.ts`): it is the same for every visitor (no cookie is read) and changes seldom, so the page, drawn with what D1
 * says once, is kept in the Worker's cache (`caches.default`) for a few minutes. Only a page that went well. Pure, with a test.
 */

/** For how many seconds the page is kept at the edge. */
export const PAGE_TTL = 300

/** What the page tells the browser and any cache in between: a shared cache may keep it for `PAGE_TTL`, the browser asks again each time. */
export const PAGE_CACHE_CONTROL = `public, max-age=0, s-maxage=${PAGE_TTL}`
/** What the edge's own copy is kept under: the Workers cache keeps an answer for its `max-age`. */
export const KEPT_CACHE_CONTROL = `public, max-age=${PAGE_TTL}`

/** Whether a request may be answered from (and its answer kept in) the edge's copy: a GET of the front page, nothing else (the rest is built, moved or a 404). */
export function cacheableRequest(method: string, pathname: string): boolean {
  return method === 'GET' && pathname === '/'
}

/** Whether an answer may be kept: a page that went well, sets no cookie and does not say it is private or not to be kept. */
export function cacheableResponse(status: number, headers: Headers): boolean {
  if (status !== 200 || headers.has('Set-Cookie')) return false
  return !/\b(no-store|private)\b/i.test(headers.get('Cache-Control') ?? '')
}
