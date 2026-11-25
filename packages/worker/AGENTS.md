# AGENTS.md

`@lmfaole/worker`: what every Worker on lmfaole.party shares (`workers/*`, and through `@lmfaole/web` the apps' conventions and D1 stand-in).
Read `README.md` first.

- **A change here is a change to every Worker.** Before saying done: `npm test` and `npm run typecheck` here, then in each Worker
  `npm test`, `npm run typecheck` and `npx wrangler deploy --dry-run`, and `npm test` in `packages/web` and at the root (`npm run test:scripts`).
- Only what two Workers (or a Worker and an app) would otherwise each have goes here; what one Worker does stays in it. A helper keeps the
  behaviour of the code it replaced: an option, off by default, for anything more (`workerFetch()` with no options is `fetch`).
- Shipped as source (TypeScript, no build); imports keep their `.ts` ending, so node runs the tests and the scripts without a build. Nothing at
  run time but the platform's own: no dependencies.
- `src/conventions.ts` is the one source of what a `wrangler.jsonc` says; a newer `compatibility_date` is set there and in every `wrangler.jsonc`
  at once (`packages/web/src/apps.test.ts` and `scripts/conventions.test.ts` check them).
- `tsconfig.base.json` is the strictness of the whole repository: never looser.
- Code comments in English and say why.
- CI: every Worker's workflow (`worker.yml`) runs on a change here; this package's own tests and typecheck run in `check.yml` (and `npm run check`).

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
