/// <reference types="astro/client" />

// What an app's `src/env.d.ts` references (`/// <reference types="@lmfaole/web/env" />`). `cloudflare:workers` is the Workers runtime's own module (the
// Worker's bindings as one object); it is declared here, as far as the apps use it, so their types stay the browser's and Node's and nothing of
// Workers' types has to be added.
declare module 'cloudflare:workers' {
  export const env: Readonly<Record<string, unknown>>
}

// The cache every Worker has next to its own requests (Workers' `caches.default`), which the DOM's `CacheStorage` does not know of.
interface CacheStorage {
  readonly default: Cache
}
