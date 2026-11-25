# @lmfaole/web

What every Astro app on lmfaole.party shares: the Astro config, the security headers, the edge's page cache, reading D1, the document
(`<head>`) and the 404 page, the tsconfig and the stylesheet. **Shipped as source** (TypeScript and `.astro`, no build step), like
`packages/designsystem`, and used as a workspace (`"@lmfaole/web": "*"`) by `apps/cv`, `apps/forside`, `apps/medier` and
`apps/presentasjoner`.

## What is in it

| Import | What |
| --- | --- |
| `@lmfaole/web/config` | `appConfig({ base?, imageService?, trailingSlash?, build? })`: the whole `astro.config.ts` (Workers adapter, React, Tailwind, `site`, no sessions). `imageService` is `passthrough` (default) or `compile`; `trailingSlash` is `always` (default) or `never`. `SITE`. |
| `@lmfaole/web/headers` | `SECURITY_HEADERS` and `secure(headers, rules?)`: the security headers of the Worker's answers. `headersFile(pattern, comment)` writes the rule of `public/_headers`, `headersFileRules(text, pattern)` reads it. |
| `@lmfaole/web/middleware` | `secured(answer, headers?)`: the middleware that gives every answer of the Worker the security headers (built pages have them from `public/_headers`). `pageCache({ cacheable, ttl?, keep?, byQuery?, everyPage?, marker?, uncached?, edge? })`: the page from the edge's copy (`caches.default`), or drawn and kept there. `withHeaders`, `edge`, the type `Answer`. |
| `@lmfaole/web/page-cache` | `PAGE_TTL` (300 s), `pageCacheControl(ttl)` (`public, max-age=0, s-maxage=…`), `keptCacheControl(ttl)`, `cacheablePaths(paths)` (GET on those paths), `cacheableResponse` (200 without `no-store`/`private`/`Set-Cookie`), `cacheablePage` (the same, HTML only). |
| `@lmfaole/web/d1` | `asDatabase(binding)`, `readAll(db, queries)` (one batch), `readOr(binding, what, ask, fallback)` (the fallback when the binding or a table is missing or D1 fails), `optional(rows)`, `isMissingTable`, `num`, `str`, the types `Row`, `Param`, `Query`, `Database`. |
| `@lmfaole/web/testing` | For the apps' `node --test`: `testHeadersFile(url, pattern)` (`public/_headers` says what `secure` does), `migratedSqlite(migrations, migrated?)` and `sqliteD1(db)` (the real migration in `node:sqlite` behind the D1 interface). |
| `@lmfaole/web/conventions` | `ZONE`, `COMPATIBILITY_DATE`, `parseJsonc`, `allowedRoutes(base)` and `wranglerProblems(config, base)`: what an app's `wrangler.jsonc` must say. |
| `@lmfaole/web/Document.astro` | The document around a page: `<head>` (title, description, canonical address, Open Graph, favicon, JSON-LD) and the design system's `PageLayout`. Props: `title`, `description?`, `url?`, `width?` (`reading`/`pane`), `image?` (`{ file, width, height }` in the app's `public/`), `appleTouchIcon?`, `jsonLd?`. |
| `@lmfaole/web/NotFound.astro` | The 404 page. Props: `app` (the name of the link back), `appleTouchIcon?`. |
| `@lmfaole/web/styles.css` | The stylesheet: the design system's theme. |
| `@lmfaole/web/env` | The types of `src/env.d.ts` (`/// <reference types="@lmfaole/web/env" />`): Astro's, `cloudflare:workers` and `caches.default`. |
| `@lmfaole/web/tsconfig.app.json` | The tsconfig an app extends: `strictest`, React JSX, its `src`, `astro.config.ts` and `.astro/types.d.ts`. |

## Use

```ts
// astro.config.ts
import { appConfig } from '@lmfaole/web/config'
export default appConfig({ base: '/cv' })
```

```ts
// src/middleware.ts: the page and /api/cv.json are kept at the edge for five minutes, every answer has the security headers
import { pageCache, secured } from '@lmfaole/web/middleware'
import { cacheablePaths } from '@lmfaole/web/page-cache'

const base = import.meta.env.BASE_URL
export const onRequest = secured(pageCache({ cacheable: cacheablePaths([base, `${base}api/cv.json`]) }))
```

```ts
// src/headers.test.ts: public/_headers says what the Worker does
import { testHeadersFile } from '@lmfaole/web/testing'
testHeadersFile(new URL('../public/_headers', import.meta.url), '/cv/*')
```

## A new app

```sh
npm run new-app -- <name> --description "What it is"   # at the root, then npm install
```

`scripts/new-app.ts` makes `apps/<name>` from all of the above (the Worker `<name>` on `lmfaole.party/<name>`), with the design system's
skills, the workflow `.github/workflows/<name>.yml` and a row in the root README. The name is `[a-z][a-z0-9-]*` and free: no app, workflow,
Worker or route has it.

## Work on it

```sh
npm test             # node --test, including that every app keeps to the conventions (src/apps.test.ts)
npm run typecheck
```

CI is `.github/workflows/web.yml`.
