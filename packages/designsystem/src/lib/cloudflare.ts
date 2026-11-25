/**
 * Cloudflare's own services as the apps use them, pure so a test pins them: Image Transformations (`/cdn-cgi/image/…` on the app's own zone)
 * and Web Analytics (the beacon, and what the app's Content-Security-Policy must allow for it).
 */

export type ImageFit = "scale-down" | "contain" | "cover" | "crop" | "pad"

export type ImageTransform = {
  /** Width in CSS pixels; with `dpr`, the picture is `width × dpr` wide. */
  width: number
  height?: number
  fit?: ImageFit
  /** 1–100. Cloudflare's default (85) when left out. */
  quality?: number
  dpr?: number
}

const MAX_SIDE = 4096

const side = (value: number): number => Math.max(1, Math.min(MAX_SIDE, Math.round(value)))

/** Whether Cloudflare can transform the picture: an `http(s)` address or a path on the site, not `data:`, `blob:`, an SVG or one already transformed. */
export function canTransform(src: string): boolean {
  if (src.startsWith("/cdn-cgi/") || src.includes("/cdn-cgi/image/")) return false
  if (!src.startsWith("/") && !/^https?:\/\//i.test(src)) return false
  const path = src.split(/[?#]/, 1)[0] ?? ""
  return !/\.svg$/i.test(path)
}

/**
 * The address of a picture through the zone's Image Transformations: `format=auto` (AVIF or WebP where the browser takes it), the size asked
 * for and `fit` (`cover` by default). An address Cloudflare cannot transform comes back as it was. Turned on per zone in the dashboard
 * (Images › Transformations); a picture from another site also needs that site allowed there, or «any origin».
 */
export function transformedImage(src: string, transform: ImageTransform): string {
  if (!canTransform(src)) return src
  const options = [`width=${side(transform.width)}`]
  if (transform.height !== undefined) options.push(`height=${side(transform.height)}`)
  options.push(`fit=${transform.fit ?? "cover"}`)
  if (transform.quality !== undefined) options.push(`quality=${Math.max(1, Math.min(100, Math.round(transform.quality)))}`)
  if (transform.dpr !== undefined && transform.dpr !== 1) options.push(`dpr=${Math.max(1, Math.min(3, transform.dpr))}`)
  options.push("format=auto")
  return `/cdn-cgi/image/${options.join(",")}/${src.startsWith("/") ? src.slice(1) : src}`
}

/** A `srcSet` of the picture at 1× and 2× the width (and height). Empty where Cloudflare cannot transform it. */
export function transformedSrcSet(src: string, transform: ImageTransform): string {
  if (!canTransform(src)) return ""
  return [1, 2].map((dpr) => `${transformedImage(src, { ...transform, dpr })} ${dpr}x`).join(", ")
}

/** Where the Web Analytics beacon comes from and reports to: add `script` to `script-src` and `connect` to `connect-src`. */
export const WEB_ANALYTICS_CSP = { script: "https://static.cloudflareinsights.com", connect: "https://cloudflareinsights.com" } as const

/** The beacon's `data-cf-beacon`: the site's token, counting page changes in a single-page app too. `null` without a token. */
export function webAnalyticsBeacon(token: string | undefined): string | null {
  const clean = token?.trim() ?? ""
  if (!/^[a-f0-9]{32}$/i.test(clean)) return null
  return JSON.stringify({ token: clean, spa: true })
}
