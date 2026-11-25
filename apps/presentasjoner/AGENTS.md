# AGENTS.md

The talks at <https://lmfaole.party/presentasjoner/>, Astro on Cloudflare Workers. Read `README.md` first.

- UI follows the design system's skills in `.claude/skills/` (`npm run skills`, checked in CI): components and tokens only, no `className`, `style` or
  stylesheet of our own, Norwegian bokmål on screen.
- The Worker is named `presentasjoner` and has the routes `lmfaole.party/presentasjoner` and `lmfaole.party/presentasjoner/*` only: never a custom domain.
- Everything of the site is under the base `/presentasjoner/` (`import.meta.env.BASE_URL`, never a hard-coded `/…`), on an origin shared with other apps
  (`/`, `/cv/`, `/medier/`, `/start`, `/design/`): no cookies, no service worker.
- Content is `content/<slug>/presentasjon.json` (made by `scripts/pptx_to_json.py`, never edited by hand except the top-level `summary`, `event`, `date`
  and `duration`), read at build time (`src/lib/content.ts`); the pages are prerendered. `scripts/check.py` (stdlib only) checks it against
  `presentasjon.schema.json`. The .pptx and the employer's template never go in the repo: it is public.
- The PDF is in the R2 bucket `presentasjoner` (binding `PDF`, read only) at `<slug>/<pptx name>.pdf`, put there by `scripts/export_pdf.sh`; the endpoint
  serves only keys of talks in `content/` (`pdfKey`).
- Security headers: `src/lib/headers.ts` and `public/_headers` say the same (`node --test` checks it).
- Check before saying done: `npm test` (node tests and `check.py`), `npm run typecheck`, `npm run build`, and `npm run preview` to see the Worker as it runs.

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
