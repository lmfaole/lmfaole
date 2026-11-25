import type { APIContext, MiddlewareNext } from 'astro'
import { defineMiddleware } from 'astro:middleware'

import { WEB_ANALYTICS_CSP } from '@lmfaole/designsystem/lib/cloudflare'
import { parsePrefs, PREFS_COOKIE, serializePrefs } from '@lmfaole/designsystem/lib/preferences'

import { asRateLimit, limitersFor, secure, tooMany } from './lib/guard'
import { oldAddress } from './lib/media'
import { cloudflareImages } from './lib/cloudflare-images'
import { transformImages } from './lib/image-sources'
import { binding, imageTransforms, usersOf, verifyUsers } from './lib/runtime'
import { firstRunOpen } from './lib/visitor-cookies'
import { WHO_HEADER, whoOf } from './lib/users'

/**
 * Every page (and server island) is made for the visitor's usernames, so none may be kept by a shared cache: `private`, and `Vary: Cookie` for a cache that keeps it anyway. `X-Medier-Who` says whose
 * page it is, so the service worker keeps the pages of one visitor at a time (`public/sw.js`). The built files are served before the Worker and keep their own headers.
 */
const mark = (headers: Headers, who: string): void => {
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'private, no-cache')
  const vary = headers.get('Vary')
  if (vary === null || !/\bcookie\b/i.test(vary)) headers.set('Vary', vary === null ? 'Cookie' : `${vary}, Cookie`)
  if ((headers.get('Content-Type') ?? '').includes('text/html')) headers.set(WHO_HEADER, who)
}

/** Whether the visitor (by address) is over a limit the request counts against (`lib/guard`); where a binding is missing (`astro dev`), it is not. */
async function overLimit(request: Request, pathname: string): Promise<boolean> {
  const key = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  for (const name of limitersFor(request.method, pathname, import.meta.env.BASE_URL)) {
    const limiter = asRateLimit(binding(name))
    if (limiter !== null && !(await limiter.limit({ key })).success) return true
  }
  return false
}

/** Every answer of the Worker has the security headers (`lib/guard`); a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  // The same for every request (a variable of the Worker's): the pictures of the page are drawn through Image Transformations or not.
  transformImages(cloudflareImages(imageTransforms()))
  const response = await answer(context, next)
  try {
    secure(response.headers, WEB_ANALYTICS_CSP)
    return response
  } catch {
    const copy = new Response(response.body, response)
    secure(copy.headers, WEB_ANALYTICS_CSP)
    return copy
  }
})

/** The answer, unless the visitor is over a limit: an old address moved, or the page with whose it is marked. */
const answer = async (context: APIContext, next: MiddlewareNext): Promise<Response> => {
  if (await overLimit(context.request, context.url.pathname)) return tooMany()
  // Old addresses, in one step: the shared history and wrapped are the music's now, and film and TV together (/film-og-tv/) is Film and TV apart.
  const moved = oldAddress(import.meta.env.BASE_URL, context.url.pathname, context.url.search)
  if (moved !== null) return new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
  await verifyUsers(context.cookies)
  const response = await next()
  // Whose page, and as what it was drawn (the theme, the effects, the sections, the wizard open or not): a change of any of them and the service worker lets go of the pages it kept.
  const drawn = `${serializePrefs(parsePrefs(context.cookies.get(PREFS_COOKIE)?.value))}|${firstRunOpen(context.cookies, context.url) ? 'first-run' : ''}`
  const who = encodeURIComponent(`${whoOf(usersOf(context.cookies))}|${drawn}`)
  try {
    // In place: the response carries the cookies the page set, which a copy would lose.
    mark(response.headers, who)
    return response
  } catch {
    const copy = new Response(response.body, response)
    mark(copy.headers, who)
    return copy
  }
}
