/**
 * The Astro config of an app on lmfaole.party: server-rendered on Cloudflare Workers (pages may still be prerendered), React for the design system's
 * components, Tailwind for its classes, no sessions (there is no login, so no KV namespace to be made in the account). The origin is shared by every app,
 * each under its own `base`; the Worker's routes in its `wrangler.jsonc` say the same.
 */

import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import type { AstroUserConfig } from 'astro'
import { defineConfig } from 'astro/config'

export const SITE = 'https://lmfaole.party'

export interface AppOptions {
  /** The app's path on the origin (`/cv`); none for the origin's root (forside). */
  base?: string
  /** `compile`: pictures of prerendered pages made smaller with sharp at build time; `passthrough` (the default): none are changed. */
  imageService?: 'passthrough' | 'compile'
  /** `always` by default: every page is a directory. */
  trailingSlash?: 'always' | 'never'
  build?: AstroUserConfig['build']
}

export function appConfig({ base, imageService = 'passthrough', trailingSlash = 'always', build }: AppOptions = {}): AstroUserConfig {
  return defineConfig({
    site: SITE,
    ...(base === undefined ? {} : { base }),
    output: 'server',
    adapter: cloudflare({ imageService }),
    session: false,
    ...(build === undefined ? {} : { build }),
    trailingSlash,
    integrations: [react()],
    vite: { plugins: [tailwindcss()] },
  })
}
