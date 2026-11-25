/**
 * What keeps strangers from spending the site's keys (`src/middleware.ts`): Workers' rate limits (`ratelimits` in `wrangler.jsonc`), by the visitor's address, and the security headers every
 * answer of the Worker has (this site's rules, given to `@lmfaole/web/headers`' `secure`). Without the bindings (`astro dev`, the tests) nothing is limited. Pure, with a test.
 */

import { secure as secureWith } from "@lmfaole/web/headers"

/** A rate-limiting binding of Workers, as far as it is used here. */
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

/** The bindings (`wrangler.jsonc`): pages and the API; the server islands (a page has up to five). */
export type LimiterName = "LIMITER" | "ISLAND_LIMITER"

export const asRateLimit = (value: unknown): RateLimit | null =>
  typeof value === "object" && value !== null && typeof (value as { limit?: unknown }).limit === "function" ? (value as RateLimit) : null

/** The limits a request counts against: none for a built file, the islands' for an island, the pages' for the rest; the paths under the site's `base`. */
export function limitersFor(pathname: string, base = "/"): LimiterName[] {
  if (pathname.startsWith(`${base}_astro/`) || /\.[a-z0-9]+$/i.test(pathname)) return []
  return pathname.startsWith(`${base}_server-islands/`) ? ["ISLAND_LIMITER"] : ["LIMITER"]
}

export const RETRY_AFTER = 60

/** The answer to a visitor over the limit. */
export const tooMany = (): Response =>
  new Response("For mange forespørsler på kort tid. Vent et minutt og prøv igjen.\n", { status: 429, headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": String(RETRY_AFTER), "Cache-Control": "no-store" } })

/** The origins a third party's script comes from and reports to, as the design system's `WEB_ANALYTICS_CSP` (`lib/cloudflare`) says them. */
export interface ScriptOrigins {
  script: string
  connect: string
}

/**
 * No framing (clickjacking), no `<base>` or plugin of another site's, forms to this site only; scripts only of this site (Astro's are inline and under `/_astro/`) and Web Analytics' beacon,
 * and the page connects only to this site and to where the beacon reports. Pictures are not limited: the pictures are many sites' (or this site's own, through Image Transformations).
 */
export function contentSecurityPolicy(analytics: ScriptOrigins): string {
  return `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'; script-src 'self' 'unsafe-inline' ${analytics.script}; connect-src 'self' ${analytics.connect}`
}

export const securityHeaders = (analytics: ScriptOrigins): Readonly<Record<string, string>> => ({
  "Content-Security-Policy": contentSecurityPolicy(analytics),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
})

/** The security headers, where the answer has none of its own. */
export const secure = (headers: Headers, analytics: ScriptOrigins): void => secureWith(headers, securityHeaders(analytics))
