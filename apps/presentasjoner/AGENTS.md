# AGENTS.md

The talks at <https://lmfaole.party/presentasjoner/>, Astro on Cloudflare Workers. Read `README.md` first.

- UI follows the design system's skills in `.claude/skills/` (`npm run skills`, checked in CI): components and tokens only, no `className`, `style` or
  stylesheet of our own, Norwegian bokmål on screen.
- The Worker is named `presentasjoner` and has the routes `lmfaole.party/presentasjoner` and `lmfaole.party/presentasjoner/*` only: never a custom domain.
- Everything of the site is under the base `/presentasjoner/` (`import.meta.env.BASE_URL`, never a hard-coded `/…`), on an origin shared with other apps
  (`/`, `/cv/`, `/medier/`, `/start`, `/design/`): no cookies, no service worker.
- Content is `content/<slug>/presentasjon.json` (made by `scripts/pptx_to_json.py`, never edited by hand except the top-level `summary`, `event`, `date`
  and `duration`), read at build time (`src/lib/content.ts`); the pages are prerendered. `scripts/check.py` (stdlib only) checks it against
  `presentasjon.schema.json`. The .pptx the talk was given from and the employer's template never go in the repo: it is public. The generic deck and its PDF do, in `content/<slug>/nedlasting/` (`scripts/export.sh` writes them).
- A talk is downloaded in three formats (`DOWNLOADS` in `src/lib/deck.ts`): the `.pdf` and the `.pptx` are in the repository, in
  `content/<slug>/nedlasting/`, and `scripts/downloads.mjs` (run by `dev`, `build`, `preview` and `deploy`) copies them into the gitignored
  `public/_nedlasting/<slug>/`, so they ship with the site as static files that the Worker reads through the `ASSETS` binding and sends as
  downloads. The R2 bucket `presentasjoner` (binding `FILES`, read only, `<slug>/<pptx name>.<ending>`, put there by `scripts/export.sh`) is only
  the fallback where a file is not among the static ones. The `.html` is made as the answer is written from the the `.html` is made as the answer is written from the
  page's own components and stylesheet. Each endpoint names its own format, and serves only keys of talks in `content/` (`fileKey`).
  `?vis` on the `.html` sends that same file `inline` instead of `attachment` (`SHOW`, `talkView`), so it can be read without being kept: one
  word of a header, never a second rendering of the talk.
- What is downloaded is not the deck that was given: `scripts/export.sh <slug>` builds a generic one from `presentasjon.json` and our own
  `maler/lmfaole-mal.pptx` (the one `.pptx` that belongs here; the rule is about the talk's deck and the **employer's** template) and exports the
  PDF from that. The key is the deck's own name, so a wrong file would publish the employer's template: the script builds in a directory it makes
  itself and uploads exactly that, and `scripts/deck_guard.py` (stdlib) refuses a `.pptx` whose theme, master, layouts or document properties name
  the employer, or that has a layout our template does not. Never give the script a path, and never skip the guard.
- A chart is the numbers, never a picture of them: `charts` in `presentasjon.json`, the form from `src/lib/chart.ts` (the design system's own
  limits: ten categories, five series; too few numbers to draw are `KeyFigures`; past the limits nothing is drawn and the slide keeps its
  picture) and the drawing from `src/views/SlideCharts.tsx`. The decision is tested, never nudged in the view.
- Security headers: `@lmfaole/web/headers` (the Worker's answers, `src/middleware.ts`) and `public/_headers` (the built files) say the same (`src/headers.test.ts` checks it).
- The Astro config, the middleware's page cache, D1 reading, the document, the 404 page, the stylesheet and the tsconfig are `packages/web` (`@lmfaole/web`),
  shared by every Astro app: a change there is made there, not here (its `AGENTS.md`).
- Check before saying done: `npm test` (node tests and `check.py`), `npm run typecheck`, `npm run build`, and `npm run preview` to see the Worker as it runs.

## Git: work on main

- Everything is committed straight to `main` and pushed. Before a push, the checks above pass. Never `--force`.
- The design system is the workspace `packages/designsystem` of this repository (`"@lmfaole/designsystem": "*"`); after a change to its skills, `npm run skills` brings them in step.
