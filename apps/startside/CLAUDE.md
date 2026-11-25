# startside

An open, read-only start page (Next.js SSR on Cloudflare Workers) built from the design system `@lmfaole/designsystem`. See README.md for what
it is, where it runs and how it is deployed.

## UI work follows the design system's skills

Before building or changing anything a person sees, use the skills in `.claude/skills/` (installed from the design system with
`npm run skills`, checked in CI with `npm run skills:check`; never edit them here, change them in the design system):

- `designsystem-ux`: the structure (front page as a digest, lists, detail pages, links, navigation, states)
- `designsystem-ui`: the look (components and tokens only, no className, icons by meaning)
- `designsystem-accessibility`: WCAG 2.2 AA
- `designsystem-content`: the words (Norwegian bokmål)
- `designsystem-components`: which component for what
- `designsystem-brand`: the brand (teal, the glyph `sunrise`, «lmfaole», and its motion accent; only where the components put it, see README «Brand»)
- `designsystem-haptics`: vibration (`<Haptics />` in the layout, `data-haptic` sparingly; see README «Motion and haptics»)
- `designsystem-pwa`: the installed app (manifest and icons, service worker and offline, updates, downloads, push and badges, sharing)
- `designsystem-review`: run before calling UI work done

## Rules of this project

- The page is **open and the same for everyone**: no login, no settings, no forms that add or change anything, no POST/PUT/DELETE
  handlers, and the server reads **no cookie**. What a visitor brings is only in the address (`?pos=`, `?omrade=`), and only parameters
  the page reads are in the edge cache's key (`lib/page-cache.ts`).
- **Public GitHub data only**, for the fixed user `GITHUB_USER`: every search goes through `publicSearch` (`is:public`), every node is
  checked with `isPublicRepository`, detail pages 404 on anything not public, and GitHub's notifications API is never used.
- **Nothing a request can trigger may run the AI model**: summaries are made by the cron only (`lib/summaries.ts`) and read from KV.

- The project writes **no styling of its own**: no `className`, `style` or stylesheet. When nothing fits, add a component to the design
  system (a minor version), then use it here.
- Pages are in `app/`, data in `lib/`, shared parts in `components/`. Logic that can be pure is pure, in `lib/`, with a test
  (`npm test`, node's runner; a module that imports `env`, `upstream` or the design system's components cannot be imported by a test).
- Plain `<a>` links in the design system's components do not get the base path: write `/start/...` (`withBase` in `lib/links.ts`).
- A row links to the app's own page for the thing; a link out to GitHub is the last action on the detail page.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
- Cloudflare (README «How it runs», «Deploy»): sources go through the relay, by the service binding `UPSTREAM` and its workers.dev address `UPSTREAM_URL`
  where the binding answers 52x (`askSource` in `lib/relay.ts`, the only place a source is fetched; a test fails on any other `fetch(` on the server); the cron fills the KV snapshot `SNAPSHOT` with what every visitor shares (`lib/snapshot.ts`,
  at most three bodies a run, plus the index and the summaries; never anything per visitor); summaries are made by the cron through AI Gateway `AI_GATEWAY`
  (`lib/summaries.ts`, `lib/ai-gateway.ts`); a visitor is held to `LIMITER` (rate limit) and pages are kept a minute at the edge (`worker.mjs`); avatars through
  Image Transformations when `IMAGE_TRANSFORMS=1`; Web Analytics with `CF_BEACON_TOKEN`. The CSP is `lib/csp.ts`: widen it only for a real need.

## Git: work on main

- **Everything is committed straight to `main` and pushed.** There are no other branches: no feature branch, no release branch, no pull
  request of our own, not for a large change or a major version either. A change too big for one commit is several commits on `main`, each
  one that builds and passes the tests.
- Start with `git switch main && git pull --rebase`. Before a push, the checks this file names pass (typecheck, tests, build). Push with
  `git push origin main`; when it is refused, `git pull --rebase` and push again. Never `--force`, never rewrite what is pushed.
- A branch that turns up anyway (from a tool, an agent or a bot) is merged into `main` (fast-forward or rebase) and deleted, here and on
  GitHub (`git push origin --delete <branch>`), in the same session.
