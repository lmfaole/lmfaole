import type { APIContext, MiddlewareNext } from 'astro'
import { defineMiddleware } from 'astro:middleware'

import { WEB_ANALYTICS_CSP } from '@lmfaole/designsystem/lib/cloudflare'

import { asRateLimit, limitersFor, secure, tooMany } from './lib/guard'
import { oldAddress } from './lib/media'
import { cloudflareImages } from './lib/cloudflare-images'
import { transformImages } from './lib/image-sources'
import { cacheableRequest, cacheableResponse, KEPT_CACHE_CONTROL, PAGE_CACHE_CONTROL, UNCACHED_CACHE_CONTROL } from './lib/page-cache'
import { binding, imageTransforms } from './lib/runtime'

/** Whether the visitor (by address) is over a limit the request counts against (`lib/guard`); where a binding is missing (`astro dev`), it is not. */
async function overLimit(request: Request, pathname: string): Promise<boolean> {
  const key = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  for (const name of limitersFor(pathname, import.meta.env.BASE_URL)) {
    const limiter = asRateLimit(binding(name))
    if (limiter !== null && !(await limiter.limit({ key })).success) return true
  }
  return false
}

/** The headers of an answer, where they can be changed in place (the answer the page made), or of a copy (one that came from a cache, whose headers are fixed). */
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

/** Every answer of the Worker has the security headers (`lib/guard`); a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  // The same for every request (a variable of the Worker's): the pictures of the page are drawn through Image Transformations or not.
  transformImages(cloudflareImages(imageTransforms()))
  return withHeaders(await answer(context, next), (headers) => secure(headers, WEB_ANALYTICS_CSP))
})

/** The Workers cache, and a way to finish keeping an answer after it is sent (`waitUntil`); none in `astro dev`, where a page is always drawn anew. */
function edge(context: APIContext): { cache: Cache; waitUntil: (promise: Promise<unknown>) => void } | null {
  if (import.meta.env.DEV || typeof caches === 'undefined' || !('default' in caches)) return null
  const cf = (context.locals as { cfContext?: { waitUntil?: (promise: Promise<unknown>) => void } }).cfContext
  const waitUntil = typeof cf?.waitUntil === 'function' ? cf.waitUntil.bind(cf) : (promise: Promise<unknown>) => void promise
  return { cache: caches.default, waitUntil }
}

/**
 * The answer, unless the visitor is over a limit: an old address moved, or the page. Every page is the same for every visitor (`users.ts`), so a page that went well is kept at the edge for a minute
 * (`lib/page-cache`) and may be kept by any shared cache; anything else is asked for anew. `X-Medier-Cache` says whether the page came from the edge's copy.
 */
const answer = async (context: APIContext, next: MiddlewareNext): Promise<Response> => {
  if (await overLimit(context.request, context.url.pathname)) return tooMany()
  // Old addresses, in one step: the shared history and wrapped are the music's now, and film and TV together (/film-og-tv/) is Film and TV apart.
  const moved = oldAddress(import.meta.env.BASE_URL, context.url.pathname, context.url.search)
  if (moved !== null) return new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
  const kept = cacheableRequest(context.request.method, context.url.pathname, import.meta.env.BASE_URL) ? edge(context) : null
  const key = new Request(context.url.toString())
  const hit = kept === null ? undefined : await kept.cache.match(key).catch(() => undefined)
  if (hit !== undefined) {
    return withHeaders(new Response(hit.body, hit), (headers) => {
      headers.set('Cache-Control', PAGE_CACHE_CONTROL)
      headers.set('X-Medier-Cache', 'hit')
    })
  }
  const response = await next()
  if (cacheableResponse(response.status, response.headers)) {
    const page = withHeaders(response, (headers) => headers.set('Cache-Control', PAGE_CACHE_CONTROL))
    if (kept === null) return page
    const copy = new Response(page.clone().body, page)
    copy.headers.set('Cache-Control', KEPT_CACHE_CONTROL)
    kept.waitUntil(kept.cache.put(key, copy).catch(() => undefined))
    return withHeaders(page, (headers) => headers.set('X-Medier-Cache', 'miss'))
  }
  return withHeaders(response, (headers) => {
    if (!headers.has('Cache-Control')) headers.set('Cache-Control', UNCACHED_CACHE_CONTROL)
  })
}
