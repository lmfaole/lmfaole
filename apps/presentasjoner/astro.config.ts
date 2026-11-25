import { appConfig } from '@lmfaole/web/config'

// The talks at https://lmfaole.party/presentasjoner/ on Cloudflare Workers (the routes `lmfaole.party/presentasjoner` and `lmfaole.party/presentasjoner/*`
// in wrangler.jsonc). The origin is shared with the other apps (`/`, `/cv/`, `/medier/`, `/start`, `/design/`), so everything of the site is under the
// base `/presentasjoner/`; it has no cookies and no service worker. The pages are built from `content/` (prerendered); only a talk's PDF, from the R2
// bucket `presentasjoner`, and the 404 are answered by the Worker.
export default appConfig({
  base: '/presentasjoner',
  // `compile`: the pictures of the prerendered pages are made smaller (WebP, `lib/content.ts`) with sharp when the site is built; nothing at run time.
  imageService: 'compile',
})
