# lmfaole

lmfaole's apps, workers and design system in one repository. Everything runs on Cloudflare: the data lives in D1 (records), R2 (raw
originals, backups) and KV (small state), never on a machine at home.

| Path | What | Address |
| --- | --- | --- |
| `packages/designsystem` | The design system: theme, building blocks, components (React 19, Tailwind 4, shipped as source) and Storybook | lmfaole.party/design |
| `apps/cv` | The CV, from a checked-in snapshot (Astro on Workers, the Worker `work`) | lmfaole.party/cv |
| `apps/forside` | The front page and `/kilder` (Astro on Workers) | lmfaole.party |
| `apps/medier` | What I listen to and watch (Astro on Workers) | lmfaole.party/medier |
| `apps/presentasjoner` | My talks, slide by slide with notes, and each as PDF from R2 (Astro on Workers; the content is `content/*/presentasjon.json`) | lmfaole.party/presentasjoner |
| `apps/startside` | The start page of the working day: open, read-only, public data only (Next.js on Workers, KV) | lmfaole.party/start |
| `workers/activity` | Listens, plays and viewings from ListenBrainz, Last.fm, Trakt, Letterboxd, Steam and RetroAchievements into D1, weekly backup to R2 | cron |
| `workers/catalog` | Public GitHub (repos, PRs, issues, contribution calendar) into D1 `site`, Hardcover shelves into D1 `library` | cron |
| `workers/likes-sync` | Spotify likes → Last.fm loves | cron |
| `workers/scheduler` | The account's one Cron Trigger (every quarter hour): calls `scheduled` on the Workers above whose job is due (`src/jobs.ts`) | cron |

Each was a repository of its own (`lmfaole/designsystem`, `lmfaole.party`, `medier`, `podkast`, `startside`, `services`); those are archived,
and their history stays there. This repository starts from their state on 2026-11-25 (without the podcast player `podkast`, which was dropped).
`apps/forside` and `apps/cv` came later from the old private monorepo (its `apps/forside` and `apps/work`).

## Work on it

```sh
npm install                          # every workspace, one lockfile
npm run typecheck && npm test        # every workspace that has them
npm run hooks                        # once per clone: the design system's visual test before a push
npm run build -w apps/medier         # one workspace: -w <path>
npm run cf:audit                     # every Cloudflare resource has a wrangler.jsonc here, or is in scripts/cf-audit.allow.json (--json)
npm run rollout -- --list            # the rollout (D1, import, R2, catalog, scheduler) step by step, skipping what is done (--dry-run, --from, --only, --yes)
```

The apps use the design system as a workspace (`"@lmfaole/designsystem": "*"`), so a change to it is checked against the apps in the
same commit. Each app and worker keeps its own `package.json`, `wrangler.jsonc` and README.

## CI

One workflow per app in `.github/workflows/`, run only when its path (or the design system, or the lockfile) changes. A push to `main`
deploys the app when the repository has `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`; the workers are only checked and deployed
by hand (`npx wrangler deploy` in each). `cf-audit.yml` runs `npm run cf:audit` every Monday (and on demand) with the API token, which
also reads DNS, Access and AI Gateway; a failing run is GitHub's e-mail to the owner.
