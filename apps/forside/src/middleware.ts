import { defineMiddleware } from 'astro:middleware'

import { secure } from './lib/headers'
import { movedTo } from './lib/moved-paths'

/** What the Worker answers itself (an old address, the 404) gets the security headers; a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  const moved = movedTo(context.url.pathname)
  const response = moved === null ? await next() : new Response(null, { status: 301, headers: { Location: moved, 'Cache-Control': 'public, max-age=3600' } })
  try {
    secure(response.headers)
    return response
  } catch {
    const copy = new Response(response.body, response)
    secure(copy.headers)
    return copy
  }
})
