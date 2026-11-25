# AGENTS.md

The front page of <https://lmfaole.party/> (`/`, `/ordliste` and `/kilder`), Astro on Cloudflare Workers. Read `README.md` first.

- UI follows the design system's skills in `.claude/skills/` (`npm run skills`, checked in CI): components and tokens only, no `className`, `style` or
  stylesheet of our own, Norwegian bokmål on screen.
- The route is `lmfaole.party/*`, an origin shared with other apps (`/medier/`, `/cv/`, `/start`, `/design/`): no cookies, no service worker, nothing that
  reaches into their paths. An old address is a 301 in `src/lib/moved-paths.ts` (with its test), never a page.
- The front page's name and role (the CV's), its GitHub section (`github_days`, `github_items`) and `/ordliste` (`glossary_term`) come from the D1 database
  `site` (binding `SITE`), read only (`SELECT`, never a migration or a write) in `src/lib/stored.ts`, mapped by pure functions with a `node:sqlite` test against
  the real migration. Where D1 has none, or fails, the name and role are `src/lib/profile.ts`'s (`src/lib/runtime.ts`), the GitHub section and the link to
  `/ordliste` are not drawn, and `/ordliste` is a 404.
- Security headers: `src/lib/headers.ts` and `public/_headers` say the same (`node --test` checks it).
- Check before saying done: `npm test`, `npm run typecheck`, `npm run build`, and `npm run preview` to see the Worker as it runs.

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
