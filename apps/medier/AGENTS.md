# AGENTS.md

A public site on Cloudflare Workers: never commit a key or a token. Every setting is listed once in `src/lib/settings.ts` (a secret of the Worker, or of the repository for the
deploy; `npm run settings:push` sets them). Kept small on purpose; read `README.md` first.

- UI follows the design system's skills in `.claude/skills/` (`npm run skills`, checked in CI): components and tokens only, no `className`,
  `style` or stylesheet of our own, Norwegian bokmål on screen, run `designsystem-review` before calling UI work done. Motion and haptics too: brand motion only through the design system's
  signature parts (`EmptyState glyph` on an app's first, empty start, one on a page), page changes by `transitionAttributes()` on `<html>`, buzzes by `data-haptic` or the components
  (README, «Brand»); no animation, duration or vibration of our own.
- Data: the site writes nothing. The owner's history is read (only `SELECT`, never a write or a migration) from the activity Worker's D1 databases (`MUSIC`, `WATCHING`, `GAMES`; `src/lib/stored.ts`,
  `src/lib/d1.ts`; a missing table reads as empty, and what D1 cannot answer falls back to the source). What D1 does not have, a page asks its sources for when it is asked for (`src/lib/sources.ts`, pure, with a test; `src/lib/runtime.ts` is the Worker's end), and the answers are kept in
  the Worker's cache for as long as each source's `TTL` says. Reading an API's answer is a pure function in `src/lib/` with a test next to it (`node --test`).
- A Worker on the lmfaole.party zone cannot reach Last.fm, Trakt, TMDB, Spotify or MusicBrainz (525): everything goes through the relay in `upstream/`, which allows only those hosts and only with the key the
  two share. A new source is: a parser and its test in `src/lib/`, a loader in `src/lib/sources.ts`, its host in `upstream/worker.ts` (and its test), its setting in `src/lib/settings.ts`, and a section.
- The site is <https://lmfaole.party/medier/>: Astro's `base` `/medier` and the zone route `lmfaole.party/medier*` (`wrangler.jsonc`), on an origin shared with other apps (`/`, `/start`, `/cv`, `/design/`). Nothing of the site leaves
  `/medier/`: every address of its own through `import.meta.env.BASE_URL` (never a hard-coded `/…`), every cookie with `Path=/medier/` (the install offer's `seen`, `src/components/install-offer.tsx`), the service worker's scope and caches
  (`public/sw.js`, only its own `medier-…` caches), the manifest and `public/_headers`.
- The site reaches the relay through the `UPSTREAM` service binding (`UPSTREAM_URL` only without it); which way a request goes is `src/lib/route.ts`.
  `IMAGE_TRANSFORMS` and `CF_BEACON_TOKEN` are `vars` in `wrangler.jsonc`: a new picture goes through `sourcesOf`/`transformed` in `src/lib/image-sources.ts`, and the CSP is built in `src/lib/guard.ts`
  (never loosen it beyond the site and the beacon). See the README's «Cloudflare» for what is deliberately not used (Cron, KV, Workers AI).
- The main picture of a page, and only it, is lit (design system, «Light and shadow»): its `DetailHeader` (`kind` and `label`), and the front page's record on its surface; a page of a detail component has its head as an island, `<Head client:idle … />` with the page `bare` (`src/pages/head.test.ts`): the picture and the name together on a WebGL backdrop of the picture's colours, in the full text colour. Nothing is painted over a Spotify picture; the disc is made of Last.fm's cover.
- The site is public and shows only the owner's data, the same for every visitor: the usernames are fixed `vars` in `wrangler.jsonc` (`LASTFM_USER`, `TRAKT_USER`, `LISTENBRAINZ_USER`, `STEAM_USER`, `RETROACHIEVEMENTS_USER`), read by `owner()` (`src/lib/runtime.ts`, `src/lib/users.ts`) and threaded through every loader (`forUsers`); an empty one means no section and a 404 for its pages. No forms, no settings, and the server never reads a cookie, so a page may be kept in a shared cache (`src/middleware.ts`, `src/lib/page-cache.ts`). Text on screen is neutral bokmål: no «du»/«din», no first person, not the owner's name. Only public data, with the site's keys. A source is never given more permission than it needs.
- Check before saying done: `npm test`, `npm run typecheck`, `npm run build`, and look at the page in a browser (`npm run dev`, or `npm run preview` for the Worker as it runs), phone width too.

## Git: work on main

- **Everything is committed straight to `main` and pushed.** There are no other branches: no feature branch, no release branch, no pull
  request of our own, not for a large change or a major version either. A change too big for one commit is several commits on `main`, each
  one that builds and passes the tests.
- Start with `git switch main && git pull --rebase`. Before a push, the checks this file names pass (typecheck, tests, build). Push with
  `git push origin main`; when it is refused, `git pull --rebase` and push again. Never `--force`, never rewrite what is pushed.
- A branch that turns up anyway (from a tool, an agent or a bot) is merged into `main` (fast-forward or rebase) and deleted, here and on
  GitHub (`git push origin --delete <branch>`), in the same session.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
