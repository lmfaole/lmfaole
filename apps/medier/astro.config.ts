import { appConfig } from '@lmfaole/web/config'

// Server-rendered on Cloudflare Workers, at https://lmfaole.party/medier/ (the Worker's route `lmfaole.party/medier*` in wrangler.jsonc): each page asks Last.fm, Trakt, TMDB and
// Spotify when it is asked for, with the answers kept for a while (`src/lib/sources.ts`), so what is playing is nearly what is playing. The origin is shared with the other apps
// (`/`, `/start`, `/cv`, `/design/`), so everything of the site (its addresses, built files, cookies, service worker) is under the base `/medier/` and nothing outside it.
// No sessions (there is no login) and no image binding (`passthrough`, the pictures are other sites' own): so the Worker has no KV namespace or Images binding to be made in the account.
export default appConfig({ base: '/medier' })
