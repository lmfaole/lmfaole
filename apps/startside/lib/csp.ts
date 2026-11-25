// The Content-Security-Policy of every answer (worker.mjs). Pure, so a test pins it.

/** The hosts the page shows pictures from: GitHub's avatars and the pictures in its texts, and OpenStreetMap's tiles. A picture in a GitHub text from anywhere else (a tracking pixel) is not fetched. */
const IMAGE_HOSTS = [
  "https://github.com",
  "https://avatars.githubusercontent.com",
  "https://user-images.githubusercontent.com",
  "https://private-user-images.githubusercontent.com",
  "https://camo.githubusercontent.com",
  "https://raw.githubusercontent.com",
  "https://objects.githubusercontent.com",
  "https://tile.openstreetmap.org",
]

/**
 * No framing, no `<object>`, forms only to the page, pictures only from the
 * page (Image Transformations' `/cdn-cgi/image/…` included) and `IMAGE_HOSTS`, scripts only the page's own (Next's inline ones included) and Web Analytics'
 * beacon, and connections only to the page and the beacon's endpoint (`analytics`, `WEB_ANALYTICS_CSP` from the design system's `lib/cloudflare`).
 */
export function contentSecurityPolicy({ analytics }: { analytics: { script: string; connect: string } }): string {
  return [
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    `img-src 'self' data: blob: ${IMAGE_HOSTS.join(" ")}`,
    `script-src 'self' 'unsafe-inline' ${analytics.script}`,
    `connect-src 'self' ${analytics.connect}`,
  ].join("; ")
}
