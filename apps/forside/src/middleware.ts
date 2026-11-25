import { defineMiddleware } from 'astro:middleware'

import { pageCache, secured } from '@lmfaole/web/middleware'
import { cacheablePaths } from '@lmfaole/web/page-cache'

import { canonicalUrl, movedTo } from './lib/moved-paths'

/** The pages drawn with what D1 says (the front page, `/ordliste`) are kept at the edge for a few minutes; they read no query, so one copy serves every address of each. */
const cached = pageCache({ cacheable: cacheablePaths(['/', '/ordliste']) })

/** What the Worker answers itself (the pages drawn from D1, an old address, the 404) gets the security headers; a built page has them from `public/_headers`. */
const page = secured(async (context, next) => {
  const moved = movedTo(context.url.pathname)
  if (moved !== null) return new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
  return cached(context, next)
})

/** The site's one address first (`www.` to the bare name), for a built page too. */
export const onRequest = defineMiddleware((context, next) => {
  const canonical = canonicalUrl(context.url)
  if (canonical !== null) return new Response(null, { status: 301, headers: { Location: canonical, 'Cache-Control': 'public, max-age=86400' } })
  return page(context, next)
})
