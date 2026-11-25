import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

// Server-rendered on Cloudflare Workers, on its own domain (medier.lmfaole.party, the Worker's route in wrangler.jsonc): each page asks Last.fm, Trakt, TMDB and Spotify when
// it is asked for, with the answers kept for a while (`src/lib/sources.ts`), so what is playing is nearly what is playing. On its own domain the site is at the root: no base.
export default defineConfig({
  site: 'https://medier.lmfaole.party',
  output: 'server',
  // No sessions (there is no login) and no image binding (the pictures are other sites' own): so the Worker has no KV namespace or Images binding to be made in the account.
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  trailingSlash: 'always',
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
