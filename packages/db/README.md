# db

The schemas of the D1 databases that more than one worker uses. Not a workspace (no `package.json`): just migrations and a `wrangler.jsonc` to apply them with.

- **`library`:** books and board games, the log and the collection.
- **`site`:** what lmfaole.party and lmfaole.party/cv show: the CV, the glossary, page previews and GitHub activity.

Both were filled once from the old monorepo's data dump by `scripts/import-dump.ts` (see its header). Since then `workers/catalog` keeps the owner's own data from other accounts up to date: `github_repos`, `github_items`, `github_days` and `github_project_commits` in `site`, and the Hardcover books in `books` in `library`. It binds both databases with the same ids and `migrations_dir` pointing here. The `music`, `watching` and `gameplay` databases belong to `workers/activity`, and their migrations are there.

```sh
npx wrangler d1 create library   # then put the id in wrangler.jsonc and workers/catalog/wrangler.jsonc; the same for site
npx wrangler d1 migrations apply library --remote -c packages/db/wrangler.jsonc
```
