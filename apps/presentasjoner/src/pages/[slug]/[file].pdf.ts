// `/presentasjoner/<slug>/<file>.pdf`: a talk's PDF, from the R2 bucket `presentasjoner` (binding `PDF`, key `<slug>/<file>.pdf`), as a download.
// Only a talk in `content/` and the name of its own .pptx can be asked for (`pdfKey`), never another key; one that is not in the bucket is the 404.
import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

import { TALKS } from '../../lib/content'
import { pdfHeaders, pdfKey } from '../../lib/deck'

export const prerender = false

/** As much of an R2 bucket as this endpoint uses. */
interface PdfBucket {
  get(key: string, options: { onlyIf: Headers }): Promise<{ body?: ReadableStream; httpEtag: string; size: number } | null>
}

const answer = (head: boolean): APIRoute =>
  async ({ params, request, rewrite }) => {
    // The site's own 404 page (`pages/404.astro`), with its status, for a PDF that is not there.
    const missing = (): Promise<Response> => rewrite(`${import.meta.env.BASE_URL}404/`)
    const key = pdfKey(TALKS, params.slug, params.file === undefined ? undefined : `${params.file}.pdf`)
    const bucket = env.PDF as PdfBucket | undefined
    if (key === null || bucket === undefined) return missing()
    const object = await bucket.get(key, { onlyIf: request.headers })
    if (object === null) return missing()
    const headers = pdfHeaders(key.slice(key.indexOf('/') + 1), object)
    // A body is left out where the PDF the browser has is still the one in the bucket (`If-None-Match`).
    if (object.body === undefined) {
      headers.delete('Content-Length')
      return new Response(null, { status: 304, headers })
    }
    if (head) {
      await object.body.cancel()
      return new Response(null, { headers })
    }
    return new Response(object.body, { headers })
  }

export const GET = answer(false)
export const HEAD = answer(true)
