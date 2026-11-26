// The endpoints that send a talk's file from the R2 bucket `presentasjoner` (binding `FILES`): the PDF and the PowerPoint are the same
// answer with another format, so they are the same code, each endpoint naming only the format it is for.
import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

import { TALKS } from './content'
import { downloadHeaders, fileKey, type DownloadFormat } from './deck'

/** As much of an R2 bucket as these endpoints use. */
interface FileBucket {
  get(key: string, options: { onlyIf: Headers }): Promise<{ body?: ReadableStream; httpEtag: string; size: number } | null>
}

/**
 * `GET` and `HEAD` for `/<slug>/<file>.<format>`: the talk's own file in that one format, as a download. Only a talk in `content/` and its
 * own name can be asked for (`fileKey`), never another key of the bucket; one that is not in the bucket is the site's 404 page.
 */
export function bucketRoutes(format: DownloadFormat): { GET: APIRoute; HEAD: APIRoute } {
  const answer =
    (head: boolean): APIRoute =>
    async ({ params, request, rewrite }) => {
      const missing = (): Promise<Response> => rewrite(`${import.meta.env.BASE_URL}404/`)
      const key = fileKey(TALKS, params.slug, params.file, format)
      const bucket = env.FILES as FileBucket | undefined
      if (key === null || bucket === undefined) return missing()
      const object = await bucket.get(key, { onlyIf: request.headers })
      if (object === null) return missing()
      const headers = downloadHeaders(key.slice(key.indexOf('/') + 1), format, object)
      // A body is left out where the file the browser has is still the one in the bucket (`If-None-Match`).
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
  return { GET: answer(false), HEAD: answer(true) }
}
