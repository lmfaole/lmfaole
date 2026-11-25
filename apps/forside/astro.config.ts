import { appConfig } from '@lmfaole/web/config'

// The front page of https://lmfaole.party/ on Cloudflare Workers (the route `lmfaole.party/*` in wrangler.jsonc). The origin is shared with the other apps
// (`/medier/`, `/cv/`, `/start`, `/design/`), whose routes are more specific and win; this site has no cookies and no service worker, so it never touches theirs.
// `/kilder` is built ahead of time; `/` is drawn when asked (the name and role from the D1 database `site`) and kept at the edge for a few minutes. The Worker also answers
// the rest (old addresses, a 404).
export default appConfig({
  // `/kilder` is `kilder.html`, so the address has no trailing slash and no redirect to one.
  build: { format: 'file' },
  trailingSlash: 'never',
})
