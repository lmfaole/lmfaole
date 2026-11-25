# AGENTS.md

`@lmfaole/web`: what every Astro app on lmfaole.party shares (`apps/cv`, `apps/forside`, `apps/medier`, `apps/presentasjoner`, and every app
`npm run new-app` makes). Read `README.md` first.

- **A change here is a change to every app.** Before saying done: `npm test` and `npm run typecheck` here, then in each app that uses it
  `npm test`, `npm run typecheck` and `npm run build`. A change to the headers, the page cache or the document is also checked with `npm run preview`
  in each app (status, `Cache-Control` and the security headers of a few pages, before and after).
- Only what is the same in every app goes here; what one app does differently is an option, a prop or a slot when another app could use it, and stays in
  the app otherwise (forside's canonical address, medier's analytics and rate limit). Never a branch on an app's name.
- Shipped as source (TypeScript and `.astro`, no build), like `packages/designsystem`; imports keep their `.ts` ending, so node runs the tests and the
  scripts without a build. Dependencies are the apps' own, at the same versions (`src/apps.test.ts` checks it); never a version younger than seven days.
- `src/headers.ts` is the one source of the security headers: each app's `public/_headers` says the same for its base, and its `src/headers.test.ts`
  (`testHeadersFile`) checks it. A new header goes into `SECURITY_HEADERS` and every app's `public/_headers` in the same commit.
- The conventions of an app's Worker (`src/conventions.ts`: zone, routes, `compatibility_date`, no workers.dev or preview address, observability) are checked
  for every app by `src/apps.test.ts`; a newer `compatibility_date` is set here and in every app's `wrangler.jsonc` at once.
- Code comments in English and say why; anything on screen (`NotFound.astro`) is Norwegian bokmål and built from the design system's components.
- CI: `.github/workflows/web.yml`. The apps' own workflows run on a change here too (`packages/web/**` in their paths), except `medier.yml`.

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
