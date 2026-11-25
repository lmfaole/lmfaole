/// <reference types="astro/client" />

// What the Worker's runtime gives a page. `cloudflare:workers` is the Workers runtime's own module (its settings, secrets and variables as one object); it
// is declared here, as far as this site uses it, so the site's types stay the browser's and Node's and nothing of Workers' types has to be added.
declare module "cloudflare:workers" {
  export const env: Readonly<Record<string, unknown>>
}

// The cache every Worker has next to its own requests (Workers' `caches.default`), which the DOM's `CacheStorage` does not know of.
interface CacheStorage {
  readonly default: Cache
}
