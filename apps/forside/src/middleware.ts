import type { APIContext, MiddlewareNext } from 'astro'
import { defineMiddleware } from 'astro:middleware'

import { secure } from './lib/headers'
import { canonicalUrl, movedTo } from './lib/moved-paths'
import { cacheableRequest, cacheableResponse, KEPT_CACHE_CONTROL, PAGE_CACHE_CONTROL } from './lib/page-cache'

/** The headers of an answer, where they can be changed in place (the answer the page made), or of a copy (one from the cache, whose headers are fixed). */
function withHeaders(response: Response, change: (headers: Headers) => void): Response {
  try {
    change(response.headers)
    return response
  } catch {
    const copy = new Response(response.body, response)
    change(copy.headers)
    return copy
  }
}

/** The Workers cache, and a way to finish keeping an answer after it is sent (`waitUntil`); none in `astro dev`, where a page is always drawn anew. */
function edge(context: APIContext): { cache: Cache; waitUntil: (promise: Promise<unknown>) => void } | null {
  if (import.meta.env.DEV || typeof caches === 'undefined' || !('default' in caches)) return null
  const cf = (context.locals as { cfContext?: { waitUntil?: (promise: Promise<unknown>) => void } }).cfContext
  const waitUntil = typeof cf?.waitUntil === 'function' ? cf.waitUntil.bind(cf) : (promise: Promise<unknown>) => void promise
  return { cache: caches.default, waitUntil }
}

/** An old address moved (301), or the page: the pages drawn with what D1 says (the front page, `/ordliste`) are kept at the edge for a few minutes (`lib/page-cache`); the rest is drawn anew. */
async function answer(context: APIContext, next: MiddlewareNext): Promise<Response> {
  const moved = movedTo(context.url.pathname)
  if (moved !== null) return new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
  const kept = cacheableRequest(context.request.method, context.url.pathname) ? edge(context) : null
  // Those pages read no query, so one copy serves every address of each.
  const key = new Request(new URL(context.url.pathname, context.url.origin).toString())
  const hit = kept === null ? undefined : await kept.cache.match(key).catch(() => undefined)
  if (hit !== undefined) return withHeaders(new Response(hit.body, hit), (headers) => headers.set('Cache-Control', PAGE_CACHE_CONTROL))
  const response = await next()
  if (kept === null || !cacheableResponse(response.status, response.headers)) return response
  const page = withHeaders(response, (headers) => headers.set('Cache-Control', PAGE_CACHE_CONTROL))
  const copy = new Response(page.clone().body, page)
  copy.headers.set('Cache-Control', KEPT_CACHE_CONTROL)
  kept.waitUntil(kept.cache.put(key, copy).catch(() => undefined))
  return page
}

/** What the Worker answers itself (the pages drawn from D1, an old address, the 404) gets the security headers; a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  const canonical = canonicalUrl(context.url)
  if (canonical !== null) return new Response(null, { status: 301, headers: { Location: canonical, 'Cache-Control': 'public, max-age=86400' } })
  if (context.isPrerendered) return next()
  return withHeaders(await answer(context, next), secure)
})
