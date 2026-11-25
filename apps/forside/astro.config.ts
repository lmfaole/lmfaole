import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// The front page of https://lmfaole.party/ on Cloudflare Workers (the route `lmfaole.party/*` in wrangler.jsonc). The origin is shared with the other apps
// (`/medier/`, `/cv/`, `/start`, `/design/`), whose routes are more specific and win; this site has no cookies and no service worker, so it never touches theirs.
// Every page is built ahead of time; the Worker answers the rest (old addresses, a 404).
export default defineConfig({
  site: 'https://lmfaole.party',
  output: 'server',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  // `/kilder` is `kilder.html`, so the address has no trailing slash and no redirect to one.
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
