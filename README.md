# lmfaole

lmfaole's apps, workers and design system in one repository. Everything runs on Cloudflare: the data lives in D1 (records), R2 (raw
originals, backups) and KV (small state), never on a machine at home.

| Path | What | Address |
| --- | --- | --- |
| `packages/designsystem` | The design system: theme, building blocks, components (React 19, Tailwind 4, shipped as source) and Storybook | lmfaole.party/design |
| `packages/web` | What every Astro app shares (`@lmfaole/web`): Astro config, security headers, edge page cache, D1 reading, document, 404, tsconfig | – |
| `packages/worker` | What every Worker shares (`@lmfaole/worker`): the conventions of a `wrangler.jsonc`, the D1 types, fetch, the cron's helpers, the strict tsconfig, the D1 stand-in for tests | – |
| `apps/cv` | The CV, from a checked-in snapshot (Astro on Workers, the Worker `work`) | lmfaole.party/cv |
| `apps/forside` | The front page and `/kilder` (Astro on Workers) | lmfaole.party |
| `apps/medier` | What I listen to and watch (Astro on Workers) | lmfaole.party/medier |
| `apps/presentasjoner` | My talks, slide by slide with notes, and each as PDF from R2 (Astro on Workers; the content is `content/*/presentasjon.json`) | lmfaole.party/presentasjoner |
| `apps/startside` | The start page of the working day: open, read-only, public data only (Next.js on Workers, KV) | lmfaole.party/start |
| `workers/activity` | Listens, plays and viewings from ListenBrainz, Last.fm, Trakt, Letterboxd, Steam and RetroAchievements into D1, weekly backup to R2 | cron |
| `workers/catalog` | Public GitHub (repos, PRs, issues, contribution calendar) into D1 `site`, Hardcover shelves into D1 `library` | cron |
| `workers/likes-sync` | Spotify likes → Last.fm loves | cron |
| `workers/relay` | The relay medier and startside fetch their sources through (a Worker on the zone gets 525 from origins outside Cloudflare); the Worker `medier-upstream`, guarded by a shared key | service binding, workers.dev (key only) |
| `workers/scheduler` | The account's one Cron Trigger (every quarter hour): calls `scheduled` on the Workers above whose job is due (`src/jobs.ts`) | cron |

Each was a repository of its own (`lmfaole/designsystem`, `lmfaole.party`, `medier`, `podkast`, `startside`, `services`); those are archived,
and their history stays there. This repository starts from their state on 2026-11-25 (without the podcast player `podkast`, which was dropped).
`apps/forside` and `apps/cv` came later from the old private monorepo (its `apps/forside` and `apps/work`).

## Work on it

```sh
npm install                          # every workspace, one lockfile
npm run check                        # what CI checks, for every workspace: lint, typecheck, test, skills:check
npm run typecheck && npm test        # every workspace that has them (and the root's scripts/)
npm run lint                         # oxlint over everything, one config (oxlintrc.json)
npm run format:check                 # oxfmt, one config (.oxfmtrc.json); `npm run format` writes it
npm run hooks                        # once per clone: the design system's visual test before a push
npm run build -w apps/medier         # one workspace: -w <path>
npm run cf:audit                     # every Cloudflare resource has a wrangler.jsonc here, or is in scripts/cf-audit.allow.json (--json)
npm run new-app -- <name> --description "…"   # a new Astro app at lmfaole.party/<name>, with its Worker, workflow and row above
npm run rollout -- --list            # the rollout (D1, import, R2, catalog, scheduler) step by step, skipping what is done (--dry-run, --from, --only, --yes)
```

The apps use the design system as a workspace (`"@lmfaole/designsystem": "*"`), so a change to it is checked against the apps in the
same commit. The Astro apps share their setup through `packages/web` (`"@lmfaole/web": "*"`) the same way; `npm run new-app` makes one
from it. Each app and worker keeps its own `package.json`, `wrangler.jsonc` and README.

## Shared setup

What every workspace shares lives in one place, and `scripts/conventions.test.ts` (in `npm test`) fails when one leaves it:

- **TypeScript:** one strictness, `packages/worker/tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, …;
  `tsconfig.base.json` here is the same). A Worker extends `@lmfaole/worker/tsconfig.worker.json`, an Astro app `@lmfaole/web/tsconfig.app.json`;
  both extend it. A workspace may be stricter, never looser.
- **Lint:** oxlint, `oxlintrc.json` here, for every workspace (the design system's extends it with its house rules). `apps/medier` and
  `apps/startside` are left out until their errors are fixed (TODO in the config).
- **Format:** oxfmt, `.oxfmtrc.json` here: the code as it is mostly written (no semicolons, double quotes, single in `packages/web` and the
  Astro apps, width 160). Not run over the repository yet; `npm run format` is one commit of its own. `.editorconfig` says the same to an editor.
- **Packages:** `@lmfaole/designsystem` (what a page is made of), `@lmfaole/web` (an Astro app's setup), `@lmfaole/worker` (a Worker's: the
  conventions of every `wrangler.jsonc`, apps' too, are there, and `@lmfaole/web` hands them on).
- **Versions:** a dependency used by more than one workspace has the same range in each.
- **CI:** an app is built and deployed by `astro-app.yml`, a Worker by `worker.yml` (below).

## CI

One workflow per app in `.github/workflows/`, run only when its path (or the design system, or the lockfile) changes. The apps' are
callers of `astro-app.yml` (test, typecheck, skills, build, deploy; startside, the Next.js app, with its own build `build:worker`, and medier with the keys it uploads,
`WORKER_SECRETS`), and run on a change to `packages/web` too;
`web.yml` checks the package itself. The workers' (`activity.yml`, `catalog.yml`, `likes-sync.yml`, `relay.yml`, `scheduler.yml`) are callers of
`worker.yml` (test, typecheck, lint, bundle, deploy with the worker's own `npm run deploy`: its D1 migrations, then the Worker), and run on a change
to `packages/worker` too. A push to `main` deploys what changed when the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (the
token also needs D1 edit for the migrations); a Worker's secrets stay on it. `check.yml` runs on every push: `npm run lint`, and the root scripts'
types and tests (with the conventions). `cf-audit.yml` runs `npm run cf:audit` every Monday (and on demand) with the API token, which
also reads DNS, Access and AI Gateway; a failing run is GitHub's e-mail to the owner.

## The relay

medier and startside fetch every source through one Worker, `workers/relay` (README there): a Worker on the lmfaole.party zone gets 525
when it fetches an origin outside Cloudflare during a page request. It keeps the name of medier's old relay, `medier-upstream`, so its secrets
stayed. `relay.yml` deploys it on a push to `main`; it only ever gains hosts (a new host goes out in an earlier commit than the app that asks it),
so the order of the relay and the apps in one push does not matter. The apps ask it with a shared key, `UPSTREAM_KEY` on the relay, `medier` and
`startside`. The relay also takes `UPSTREAM_KEY_NEXT`, so `npm run rotate-key -w workers/relay` hands out a new key with no call refused: the
relay takes the new key beside the old one, then each app gets it, then the relay keeps only it. The key is never printed or written to a file.
