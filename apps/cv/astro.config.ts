import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// The CV at https://lmfaole.party/cv/ on Cloudflare Workers (the routes `lmfaole.party/cv` and `lmfaole.party/cv/*` in wrangler.jsonc). The origin is shared
// with the other apps (`/`, `/medier/`, `/start`, `/design/`), so everything of the site is under the base `/cv/`; it has no cookies and no service worker.
// The page and its JSON are built ahead of time from `src/data/cv.json`; the Worker answers the rest (a 404).
export default defineConfig({
  site: 'https://lmfaole.party',
  base: '/cv',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  trailingSlash: 'always',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
