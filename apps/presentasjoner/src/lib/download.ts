// The endpoints that send a talk's file: the PDF and the PowerPoint are the same answer with another format, so they are the same code, each
// endpoint naming only the format it is for. The file is first looked for among the site's own static files (`public/_nedlasting/`, copied from
// `content/<slug>/nedlasting/` by `scripts/downloads.mjs` at every build), and then in the R2 bucket `presentasjoner` (binding `FILES`).
import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

import { TALKS } from './content'
import { downloadHeaders, fileKey, type DownloadFormat } from './deck'

/** A file to send: no body where the browser's copy is still the current one (`If-None-Match`). */
interface Found {
  body?: ReadableStream | ArrayBuffer
  httpEtag: string
  size: number
}

/** As much of an R2 bucket as these endpoints use. */
interface FileBucket {
  get(key: string, options: { onlyIf: Headers }): Promise<Found | null>
}

/** As much of the static files binding as these endpoints use. */
interface Assets {
  fetch(request: Request): Promise<Response>
}

/** The file among the site's static files, or `null` where it is not there. */
async function fromAssets(assets: Assets | undefined, key: string, request: Request): Promise<Found | null> {
  if (assets === undefined) return null
  const path = key.split('/').map(encodeURIComponent).join('/')
  const headers = new Headers()
  for (const name of ['If-None-Match', 'If-Modified-Since']) {
    const value = request.headers.get(name)
    if (value !== null) headers.set(name, value)
  }
  const response = await assets.fetch(new Request(new URL(`${import.meta.env.BASE_URL}_nedlasting/${path}`, request.url), { headers }))
  const httpEtag = response.headers.get('ETag') ?? ''
  if (response.status === 304) return { httpEtag, size: 0 }
  if (!response.ok) return null
  const body = await response.arrayBuffer()
  return { body, httpEtag, size: body.byteLength }
}

/**
 * `GET` and `HEAD` for `/<slug>/<file>.<format>`: the talk's own file in that one format, as a download. Only a talk in `content/` and its
 * own name can be asked for (`fileKey`), never another key of the bucket; one that is in neither place is the site's 404 page.
 */
export function bucketRoutes(format: DownloadFormat): { GET: APIRoute; HEAD: APIRoute } {
  const answer =
    (head: boolean): APIRoute =>
    async ({ params, request, rewrite }) => {
      const missing = (): Promise<Response> => rewrite(`${import.meta.env.BASE_URL}404/`)
      const key = fileKey(TALKS, params.slug, params.file, format)
      if (key === null) return missing()
      const bucket = env.FILES as FileBucket | undefined
      const object = (await fromAssets(env.ASSETS as Assets | undefined, key, request)) ?? (await bucket?.get(key, { onlyIf: request.headers })) ?? null
      if (object === null) return missing()
      const headers = downloadHeaders(key.slice(key.indexOf('/') + 1), format, object)
      // A body is left out where the file the browser has is still the one it asked about (`If-None-Match`).
      if (object.body === undefined) {
        headers.delete('Content-Length')
        return new Response(null, { status: 304, headers })
      }
      if (head) {
        if (object.body instanceof ReadableStream) await object.body.cancel()
        return new Response(null, { headers })
      }
      return new Response(object.body, { headers })
    }
  return { GET: answer(false), HEAD: answer(true) }
}
