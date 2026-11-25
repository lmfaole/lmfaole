import { defineMiddleware } from 'astro:middleware'

import { secure } from './lib/headers'

/** The headers of an answer, where they can be changed in place, or of a copy (one whose headers are fixed, as a stream from R2 may have). */
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

/** Every answer of the Worker (a PDF, the 404) gets the security headers; a built page has them from `public/_headers`. */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next()
  return withHeaders(await next(), secure)
})
