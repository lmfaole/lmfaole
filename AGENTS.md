# lmfaole

- An npm workspace (`packages/*`, `apps/*`, `workers/*`) with one lockfile at the root; run a workspace's scripts with
  `npm run <script> -w <path>`. Each workspace's own `AGENTS.md`/`CLAUDE.md` holds its rules.
- The Astro apps share their setup (config, security headers, page cache, D1 reading, document, 404, tsconfig) through `packages/web`
  (`@lmfaole/web`): change it there, not in a copy in an app. A new one is `npm run new-app -- <name>`.
- The Workers share theirs through `packages/worker` (`@lmfaole/worker`: the conventions of every `wrangler.jsonc`, D1 types and test stand-in,
  fetch, the cron's helpers, the tsconfig); the same rule. One strictness (`@lmfaole/worker/tsconfig.base.json`), one lint (`oxlintrc.json`), one
  format (`.oxfmtrc.json`) for every workspace, and one range per dependency; `scripts/conventions.test.ts` holds them to it.
- Data lives in Cloudflare: D1 for records (narrow tables, only the columns that are read), R2 for raw originals and backups, KV for small
  state. Nothing a source can give again (registry data, pictures) and nothing that can be computed is stored.
- The owner's npm has `min-release-age=7`: never require a version younger than seven days.
- Work on `main`; before a push, `npm run check` (lint, typecheck, tests, skills) and the build of what changed pass.
