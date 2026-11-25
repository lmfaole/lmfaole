/**
 * The edge's copy of a page (`pageCache` in `middleware.ts`): a page that is the same for every visitor (no cookie is read) is kept in the Worker's
 * cache (`caches.default`) for a while, so the next visitor gets it without D1 or a source being asked. Only an answer that went well. Pure.
 */

/** For how many seconds a page is kept at the edge, unless the app says otherwise: a few minutes. */
export const PAGE_TTL = 300

/** What a page tells the browser and any cache in between: a shared cache may keep it for `ttl`, the browser asks again each time. */
export const pageCacheControl = (ttl: number): string => `public, max-age=0, s-maxage=${ttl}`

/** What the edge's own copy is kept under: the Workers cache keeps an answer for its `max-age`. */
export const keptCacheControl = (ttl: number): string => `public, max-age=${ttl}`

/** Whether a request may be answered from (and its answer kept in) the edge's copy. */
export type Cacheable = (method: string, pathname: string) => boolean

/** A GET of one of these paths, nothing else (the rest is built, moved or a 404). */
export function cacheablePaths(paths: Iterable<string>): Cacheable {
  const kept: ReadonlySet<string> = new Set(paths)
  return (method, pathname) => method === 'GET' && kept.has(pathname)
}

/** Whether an answer may be kept: one that went well, sets no cookie and does not say it is private or not to be kept. */
export function cacheableResponse(status: number, headers: Headers): boolean {
  if (status !== 200 || headers.has('Set-Cookie')) return false
  return !/\b(no-store|private)\b/i.test(headers.get('Cache-Control') ?? '')
}

/** As `cacheableResponse`, and HTML: a page, never an API's JSON or a file drawn by the Worker. */
export const cacheablePage = (status: number, headers: Headers): boolean =>
  cacheableResponse(status, headers) && (headers.get('Content-Type') ?? '').includes('text/html')
