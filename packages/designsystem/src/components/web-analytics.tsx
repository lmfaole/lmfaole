import { webAnalyticsBeacon } from "../lib/cloudflare"

/**
 * Cloudflare Web Analytics: the beacon, without cookies, counting page changes in a single-page app too. Renders nothing without a valid site
 * token, so an app can always place it (in the root layout) and turn it on with the token. The app's CSP must allow `WEB_ANALYTICS_CSP`
 * (`lib/cloudflare`).
 */
export function WebAnalytics({
  token,
  nonce,
}: {
  /** The site's token from the dashboard (Web Analytics › the site › «Manage site»). */
  token: string | undefined
  /** The page's CSP nonce, where the CSP allows scripts by nonce (`'strict-dynamic'`). */
  nonce?: string
}) {
  const beacon = webAnalyticsBeacon(token)
  if (beacon === null) return null
  return <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={beacon} {...(nonce === undefined ? {} : { nonce })} />
}
