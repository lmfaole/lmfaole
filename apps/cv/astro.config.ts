import { appConfig } from '@lmfaole/web/config'

// The CV at https://lmfaole.party/cv/ on Cloudflare Workers (the routes `lmfaole.party/cv` and `lmfaole.party/cv/*` in wrangler.jsonc). The origin is shared
// with the other apps (`/`, `/medier/`, `/start`, `/design/`), so everything of the site is under the base `/cv/`; it has no cookies and no service worker.
// The page and its JSON are drawn when asked, from the D1 database `site` (or the snapshot `src/data/cv.json` while it has no CV), and kept at the edge for a few minutes.
export default appConfig({ base: '/cv' })
