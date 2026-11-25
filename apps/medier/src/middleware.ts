import { WEB_ANALYTICS_CSP } from '@lmfaole/designsystem/lib/cloudflare'
import { pageCache, secured } from '@lmfaole/web/middleware'
import { cacheablePage } from '@lmfaole/web/page-cache'

import { asRateLimit, limitersFor, secure, tooMany } from './lib/guard'
import { oldAddress } from './lib/media'
import { cloudflareImages } from './lib/cloudflare-images'
import { transformImages } from './lib/image-sources'
import { cacheableRequest, PAGE_TTL, UNCACHED_CACHE_CONTROL } from './lib/page-cache'
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

/**
 * Every page is the same for every visitor (`users.ts`), so a page that went well is kept at the edge for a minute (`lib/page-cache`), one copy for each address with its query (a server
 * island's props are in it), and may be kept by any shared cache; anything else is asked for anew. `X-Medier-Cache` says whether the page came from the edge's copy.
 */
const cached = pageCache({
  cacheable: (method, pathname) => cacheableRequest(method, pathname, import.meta.env.BASE_URL),
  ttl: PAGE_TTL,
  keep: cacheablePage,
  byQuery: true,
  everyPage: true,
  marker: 'X-Medier-Cache',
  uncached: UNCACHED_CACHE_CONTROL,
})

/** Every answer of the Worker has the security headers (`lib/guard`); a built page has them from `public/_headers`. The answer, unless the visitor is over a limit: an old address moved, or the page. */
export const onRequest = secured(
  async (context, next) => {
    // The same for every request (a variable of the Worker's): the pictures of the page are drawn through Image Transformations or not.
    transformImages(cloudflareImages(imageTransforms()))
    if (await overLimit(context.request, context.url.pathname)) return tooMany()
    // Old addresses, in one step: the shared history and wrapped are the music's now, and film and TV together (/film-og-tv/) is Film and TV apart.
    const moved = oldAddress(import.meta.env.BASE_URL, context.url.pathname, context.url.search)
    if (moved !== null) return new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
    return cached(context, next)
  },
  (headers) => secure(headers, WEB_ANALYTICS_CSP),
)
