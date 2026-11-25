/**
 * What an app's `src/middleware.ts` is made of: `secured` gives every answer of the Worker the security headers (a built file has them from
 * `public/_headers`), and `pageCache` answers the pages that are the same for every visitor from the edge's copy (`page-cache.ts`). What is the
 * app's own (an old address moved, a rate limit) comes before them, in the app.
 */

import type { APIContext, MiddlewareHandler, MiddlewareNext } from 'astro'

import { secure } from './headers.ts'
import { type Cacheable, cacheableResponse, keptCacheControl, PAGE_TTL, pageCacheControl } from './page-cache.ts'

/** An answer of the Worker, from a middleware's arguments. */
export type Answer = (context: APIContext, next: MiddlewareNext) => Promise<Response>

/** The headers of an answer, where they can be changed in place (the answer the page made), or of a copy (one from a cache, or a stream from R2, whose headers are fixed). */
export function withHeaders(response: Response, change: (headers: Headers) => void): Response {
  try {
    change(response.headers)
    return response
  } catch {
    const copy = new Response(response.body, response)
    change(copy.headers)
    return copy
  }
}

/** The Workers cache, and a way to finish keeping an answer after it is sent. */
export interface Edge {
  cache: Cache
  waitUntil: (promise: Promise<unknown>) => void
}

/** The Workers cache and `waitUntil`; none in `astro dev`, where a page is always drawn anew. */
export function edge(context: APIContext): Edge | null {
  if (import.meta.env.DEV || typeof caches === 'undefined' || !('default' in caches)) return null
  const cf = (context.locals as { cfContext?: { waitUntil?: (promise: Promise<unknown>) => void } }).cfContext
  const waitUntil = typeof cf?.waitUntil === 'function' ? cf.waitUntil.bind(cf) : (promise: Promise<unknown>) => void promise
  return { cache: caches.default, waitUntil }
}

export interface PageCacheOptions {
  /** Whether a request may be answered from (and its answer kept in) the edge's copy (`cacheablePaths`, or the app's own). */
  cacheable: Cacheable
  /** For how many seconds a page is kept at the edge and may be kept by a shared cache; `PAGE_TTL` by default. */
  ttl?: number
  /** Whether an answer may be kept; `cacheableResponse` by default, `cacheablePage` for HTML only. */
  keep?: (status: number, headers: Headers) => boolean
  /** One copy for each query too; by default one for each path, for pages that read no query. */
  byQuery?: boolean
  /** Every answer that may be kept says so (`s-maxage`), kept at the edge or not; by default only the pages that are kept. */
  everyPage?: boolean
  /** A header that says whether the page came from the edge's copy (`hit`) or was just kept (`miss`). */
  marker?: string
  /** What an answer that is not kept says, where it says nothing of its own; by default nothing. */
  uncached?: string
  /** The edge; the Workers cache by default (a test hands in its own). */
  edge?: (context: APIContext) => Edge | null
}

/** The page from the edge's copy, or drawn (`next`) and kept there after it is sent; anything else is drawn anew. */
export function pageCache(options: PageCacheOptions): Answer {
  const { cacheable, ttl = PAGE_TTL, keep = cacheableResponse, byQuery = false, everyPage = false, marker, uncached } = options
  const page = pageCacheControl(ttl)
  return async (context, next) => {
    const kept = cacheable(context.request.method, context.url.pathname) ? (options.edge ?? edge)(context) : null
    const key = new Request(byQuery ? context.url.toString() : new URL(context.url.pathname, context.url.origin).toString())
    const hit = kept === null ? undefined : await kept.cache.match(key).catch(() => undefined)
    if (hit !== undefined) {
      return withHeaders(new Response(hit.body, hit), (headers) => {
        headers.set('Cache-Control', page)
        if (marker !== undefined) headers.set(marker, 'hit')
      })
    }
    const response = await next()
    if ((kept !== null || everyPage) && keep(response.status, response.headers)) {
      const drawn = withHeaders(response, (headers) => headers.set('Cache-Control', page))
      if (kept === null) return drawn
      const copy = new Response(drawn.clone().body, drawn)
      copy.headers.set('Cache-Control', keptCacheControl(ttl))
      kept.waitUntil(kept.cache.put(key, copy).catch(() => undefined))
      return marker === undefined ? drawn : withHeaders(drawn, (headers) => headers.set(marker, 'miss'))
    }
    if (uncached === undefined) return response
    return withHeaders(response, (headers) => {
      if (!headers.has('Cache-Control')) headers.set('Cache-Control', uncached)
    })
  }
}

/** The middleware: every answer of the Worker gets the security headers (`secure`, or the app's own); a built page is left alone, it has them from `public/_headers`. */
export function secured(answer: Answer, headers: (headers: Headers) => void = secure): MiddlewareHandler {
  return async (context, next) => (context.isPrerendered ? next() : withHeaders(await answer(context, next), headers))
}
