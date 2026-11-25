# lmfaole

- An npm workspace (`packages/*`, `apps/*`, `workers/*`) with one lockfile at the root; run a workspace's scripts with
  `npm run <script> -w <path>`. Each workspace's own `AGENTS.md`/`CLAUDE.md` holds its rules.
- Data lives in Cloudflare: D1 for records (narrow tables, only the columns that are read), R2 for raw originals and backups, KV for small
  state. Nothing a source can give again (registry data, pictures) and nothing that can be computed is stored.
- The owner's npm has `min-release-age=7`: never require a version younger than seven days.
- Work on `main`; before a push, the typecheck, tests and build of what changed pass.
