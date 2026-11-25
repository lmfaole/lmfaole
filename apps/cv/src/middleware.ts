import { defineMiddleware } from 'astro:middleware'

import { secure } from './lib/headers'

/** What the Worker answers itself (the 404) gets the security headers; a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  const response = await next()
  try {
    secure(response.headers)
    return response
  } catch {
    const copy = new Response(response.body, response)
    secure(copy.headers)
    return copy
  }
})
