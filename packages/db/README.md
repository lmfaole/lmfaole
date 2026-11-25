# db

The schemas of the D1 databases that no worker owns yet. Not a workspace (no `package.json`): just migrations and a `wrangler.jsonc` to apply them with.

- **`library`:** books and board games, the log and the collection.
- **`site`:** what lmfaole.party and lmfaole.party/cv show: the CV, the glossary, page previews and GitHub activity.

Both were filled once from the old monorepo's data dump by `scripts/import-dump.ts` (see its header). The `music`, `watching` and `gameplay` databases belong to `workers/activity`, and their migrations are there.

```sh
npx wrangler d1 create library   # then put the id in wrangler.jsonc; the same for site
npx wrangler d1 migrations apply library --remote -c packages/db/wrangler.jsonc
```
