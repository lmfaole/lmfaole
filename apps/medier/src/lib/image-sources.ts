/**
 * The widths an image service offers for one picture, from the address the API gave: TMDB serves `/t/p/<size>/…` (w92, w185, w342) and Last.fm
 * `/i/u/<size>/…` (64s, 174s, 300x300). The design system's `Picture` takes them as `sources` and the browser picks the smallest that is sharp,
 * so a 2.5rem thumbnail does not fetch an image 300 wide. An address from anywhere else is the one source there is.
 *
 * With the zone's Image Transformations on (`IMAGE_TRANSFORMS` "1", `transformImages` with `cloudflareImages`), every picture is the largest the source gives, made by Cloudflare at a ladder of
 * widths up to its own (`/cdn-cgi/image/…,format=auto`, AVIF or WebP), from this site's own address: the same `Picture` takes the width it draws at, a thumbnail in a list
 * a small one and a page's head a large one, and a picture drawn into WebGL (`loadCorsImage`) is the site's own, so no CORS is asked of the source.
 */
import type { PictureSource } from "@lmfaole/designsystem/lib/picture-sources"

const TMDB = /^(https:\/\/image\.tmdb\.org\/t\/p\/)[^/]+(\/.+)$/
const LASTFM = /^(https:\/\/[^/]*lastfm[^/]*\/i\/u\/)[^/]+(\/.+)$/

/** A picture's address at a width through Image Transformations, `null` where it cannot be transformed (`cloudflareImages` in `cloudflare-images.ts`). */
export type Transform = (src: string, width: number) => string | null

let transforming: Transform | null = null

/** Whether, and how, the pictures are transformed: the Worker's `IMAGE_TRANSFORMS`, set by `src/middleware.ts` for the server and by an island for itself. */
export function transformImages(transform: Transform | null): void {
  transforming = transform
}

/** The widths Cloudflare is asked for: a row's thumbnail (2.5–4rem, at 2×) up to a large head at 2×; never wider than the source. */
const LADDER = [64, 128, 256, 384, 512, 768] as const

/** The pictures through Image Transformations, from the largest of them, where they are on and it can be transformed; as they are otherwise. */
export function transformed(sources: readonly PictureSource[], transform: Transform | null = transforming): PictureSource[] {
  const largest = [...sources].sort((a, b) => b.width - a.width)[0]
  if (transform === null || largest === undefined || transform(largest.src, largest.width) === null) return [...sources]
  return [...LADDER.filter((width) => width < largest.width), largest.width].map((width) => ({ src: transform(largest.src, width) ?? largest.src, width }))
}

export function sourcesOf(url: string | null, transform: Transform | null = transforming): PictureSource[] {
  if (url === null || url === "") return []
  // TMDB's w500 for Cloudflare to make the widths of: a head at 2× is wider than w342.
  const large = transform === null ? null : TMDB.exec(url)
  return transformed(large === null ? nativeSourcesOf(url) : [{ src: `${large[1]}w500${large[2]}`, width: 500 }], transform)
}

function nativeSourcesOf(url: string): PictureSource[] {
  const tmdb = TMDB.exec(url)
  if (tmdb !== null) return [92, 185, 342].map((width) => ({ src: `${tmdb[1]}w${width}${tmdb[2]}`, width }))
  const lastfm = LASTFM.exec(url)
  if (lastfm !== null) return [["64s", 64], ["174s", 174], ["300x300", 300]].map(([size, width]) => ({ src: `${lastfm[1]}${size}${lastfm[2]}`, width: Number(width) }))
  return [{ src: url, width: 300 }]
}
