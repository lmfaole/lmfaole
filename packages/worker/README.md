# @lmfaole/worker

What every Worker on lmfaole.party shares: the conventions of a `wrangler.jsonc` (apps' too), D1's interface and its SQLite stand-in for the
tests, fetch, the scheduled run's helpers, `.env` files, and the tsconfig with the strictness of the whole repository. **Shipped as source**
(TypeScript, no build step), like `packages/web`, and used as a workspace (`"@lmfaole/worker": "*"`) by `workers/activity`, `workers/catalog`,
`workers/likes-sync`, `workers/relay` and `workers/scheduler`, by `packages/web` (which hands the conventions and the D1 stand-in on to the apps)
and by the root's `scripts/`.

## What is in it

| Import | What |
| --- | --- |
| `@lmfaole/worker/conventions` | `ZONE`, `COMPATIBILITY_DATE`, `CRON_WORKER`, `parseJsonc`, `allowedRoutes(base)`, `wranglerProblems(config, base)` (an app's `wrangler.jsonc`) and `workerProblems(config, name)` (a Worker's without pages: named `name`, no route, `workers_dev` said, `"crons": []` except in `CRON_WORKER`). Both also check the compatibility date, no preview address and observability. |
| `@lmfaole/worker/d1` | The part of D1 a Worker uses, as types: `Database` (`prepare`, `batch`), `Statement` (`bind`, `first`, `all`, `run`), `Row`, and `rowsWritten(results)`. |
| `@lmfaole/worker/fetch` | The type `Fetch` (what a sync is given) and `workerFetch({ userAgent?, timeout?, retries?, backoff?, fetch?, sleep? })`: `fetch` with a User-Agent when the request has none, a timeout, and retries of a GET or HEAD on a network error, 429 or 5xx (doubling `backoff`, 500 ms; `Retry-After` under a minute wins). With no options it is `fetch` itself. |
| `@lmfaole/worker/scheduled` | `settle(jobs, message?)`: every job of a `scheduled` run goes to the end; each failure is logged and the run fails with all of them (`AggregateError`). `counted(fetch, databases)`: the fetch and the D1 bindings, counting the subrequests a run makes (`count()`; the free plan allows 50). |
| `@lmfaole/worker/cron` | `matches(cron, date)`: whether a five-field cron expression is due at a minute (UTC). |
| `@lmfaole/worker/env` | For a Worker's own scripts: `parseEnvFile(text)` (a `Map`; quotes and ` #` comments as dotenv), `readEnvFiles(files)` (a later file wins), `need(values, names)` (the named values, or the script ends saying which are missing). |
| `@lmfaole/worker/testing` | For `node --test`: `migratedSqlite(migrations, migrated?)` (a `node:sqlite` database with every `.sql` of a directory applied), `sqliteD1(db)` (it behind D1's interface; `batch` is one transaction, as in D1) and `fakeFetch(routes)` (answers from a table of tests and answers, and records its `Call`s). |
| `@lmfaole/worker/tsconfig.worker.json` | The tsconfig a Worker extends: ES2024, `nodenext`, Node's types, its `src` and `scripts`. |
| `@lmfaole/worker/tsconfig.base.json` | The strictness every TypeScript project here shares (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, …): `tsconfig.worker.json`, `@lmfaole/web/tsconfig.app.json` and the root's `tsconfig.base.json` extend it. It is here, not at the root, so a shared tsconfig can name it by package: Vite reads a tsconfig through the `node_modules` link, where `../../` is not the root. |

## A new Worker

`workers/<name>` with a `package.json` (`test`, `typecheck`, `deploy`; `"@lmfaole/worker": "*"`), a `tsconfig.json` that is only
`{ "extends": "@lmfaole/worker/tsconfig.worker.json" }`, a `wrangler.jsonc` that `workerProblems` passes (named after its directory; a name kept
from before goes into `NAMES` in `scripts/conventions.test.ts`), its job in `workers/scheduler/src/jobs.ts` and a service binding there, and
`.github/workflows/<name>.yml` calling `worker.yml` (copy `catalog.yml`). `scripts/conventions.test.ts` checks all of it but the job.

## Work on it

```sh
npm test             # node --test
npm run typecheck
```

A change here is checked by every Worker's workflow (`packages/worker/**` in their paths), `web.yml` and the apps'.
