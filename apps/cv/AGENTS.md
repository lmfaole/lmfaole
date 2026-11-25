# AGENTS.md

The CV at <https://lmfaole.party/cv/>, Astro on Cloudflare Workers. Read `README.md` first.

- UI follows the design system's skills in `.claude/skills/` (`npm run skills`, checked in CI): components and tokens only, no `className`, `style` or
  stylesheet of our own, Norwegian bokmål on screen.
- The Worker is named `work` and has the routes `lmfaole.party/cv` and `lmfaole.party/cv/*` only: never a custom domain (`jobb.lmfaole.party` is gone).
- Everything of the site is under the base `/cv/` (`import.meta.env.BASE_URL`, never a hard-coded `/…`), on an origin shared with other apps
  (`/`, `/medier/`, `/start`, `/design/`): no cookies, no service worker.
- Data is the D1 database `site` (binding `SITE`), read only (`SELECT`, never a migration or a write) in `src/lib/stored.ts`, mapped by pure functions with a
  `node:sqlite` test against the real migration. While it has no CV, or fails, the page and the JSON are the snapshot `src/data/cv.json` (`src/lib/runtime.ts`).
  Public CV material only: never an e-mail address, money, health or a home address.
- Security headers: `src/lib/headers.ts` and `public/_headers` say the same (`node --test` checks it).
- Check before saying done: `npm test`, `npm run typecheck`, `npm run build`, and `npm run preview` to see the Worker as it runs.

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
