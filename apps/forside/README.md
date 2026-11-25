# forside

Forsiden på [lmfaole.party](https://lmfaole.party): navn, rolle, én setning, noen lenker (CV, GitHub, LinkedIn, e-post) og hva jeg har gjort på GitHub
det siste året, [`/ordliste`](https://lmfaole.party/ordliste), navnene som går igjen i tekstene mine og hvor de hører hjemme, og
[`/kilder`](https://lmfaole.party/kilder), som viser hvor dataene på [`/medier/`](https://lmfaole.party/medier/) kommer fra og når de hentes neste gang.

- Astro på Cloudflare Workers, Workeren `forside` på ruten `lmfaole.party/*` (`wrangler.jsonc`). De andre appene har mer spesifikke ruter på samme
  domene (`/medier*`, `/cv`, `/cv/*`, `/start`, `/design/`), og de vinner.
- `/kilder` bygges på forhånd. `/` og `/ordliste` lages når de blir spurt etter, fordi de leses fra D1 (se Data), og legges i Workerens cache
  (`caches.default`) i fem minutter (`src/lib/page-cache.ts`, `src/middleware.ts`). Svaret sier `s-maxage=300`. Workeren svarer også på gamle adresser
  (`src/lib/moved-paths.ts`, 301 til `/medier/…`) og 404.
- Ingen informasjonskapsler og ingen service worker, så siden rører aldri de andre appenes.
- Sikkerhetshodene står i `src/lib/headers.ts` (Workerens svar) og `public/_headers` (de bygde filene). En test passer på at de er like.
- `/kilder` leser `src/lib/sources.ts`. Tidene er cron-uttrykkene i `workers/scheduler/src/jobs.ts`, som er i UTC, og vises i norsk tid.

## Data

Navnet, rollen og GitHub-delen på forsiden og ordlisten leses fra D1-basen `site` (bindingen `SITE` i `wrangler.jsonc`, samme id som `packages/db/wrangler.jsonc`), den samme
CV-en som `apps/cv` viser. Appen bare leser, med én batch `SELECT`-er, og migrerer aldri basen. Migrasjonen er `packages/db/site/migrations`.

- Navnet er `cv_person.navn`. Rollen er tittelen på den nyeste stillingen som ikke er avsluttet (`cv_position.til` er tom), og arbeidsgiveren
  (`cv_employer.navn`): «Senior frontend-utvikler hos Fremtind». `scripts/import-dump.ts` fyller tabellene. Radene gjøres om i `src/lib/stored.ts`,
  og testen (`stored.test.ts`) kjører spørringene mot den ekte migrasjonen i `node:sqlite`.
- GitHub-delen er bidragene det siste året (summen av `github_days.contributions`) og pull requestene som er flettet det siste året (`github_items`
  med `kind = 'pr'`, `merged = 1` og `closed_at`), med de fem siste (`repo`, `number`, `title`). `workers/catalog` skriver tabellene hver sjette time
  (`github_days` bare med token), og `scripts/import-dump.ts` fyller dem fra det gamle uttrekket. Et tall som er 0 vises ikke, og uten noe av det vises
  ikke delen. `github_repos` og `github_project_commits` brukes ikke her.
- Ordlisten er `glossary_term` (`term`, `url`, bare `http(s)`), sortert på navn. `scripts/import-dump.ts` fyller den. Er den tom, er `/ordliste` 404
  og forsiden lenker ikke dit.
- Det basen ikke har (tabellene mangler, de er tomme, eller D1 feiler), er sidens egne ord i `src/lib/profile.ts` (`src/lib/runtime.ts`), så siden ser ut
  som før, uten GitHub-delen og lenken til ordlisten. Setningen om jobben, de andre lenkene og `/kilder` står i koden.

Lokalt er D1-basen tom, så siden viser ordene i `profile.ts` og `/ordliste` er 404. `npx wrangler d1 migrations apply site --local` og et par rader i
`cv_person`, `cv_employer`, `cv_position`, `github_days`, `github_items` og `glossary_term` (`npx wrangler d1 execute site --local --command "…"`)
viser dem fra D1. Workerens cache lagres også lokalt, så en endret side kan trenge fem minutter eller en ny `--persist-to`.

## Utvikle

```sh
npm run dev          # astro dev
npm test             # node --test
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt med wrangler dev
```

Deploy skjer fra `.github/workflows/forside.yml` ved push til `main`.

## Profilbildet

`public/profilbilde.jpg` er originalen (og bildet i lenkeforhåndsvisningen). `favicon.ico` og `apple-touch-icon.png` lages av den med ImageMagick:

```sh
magick profilbilde.jpg -strip -resize 16x16 -colors 32 f16.png
magick profilbilde.jpg -strip -resize 32x32 -colors 64 f32.png
magick profilbilde.jpg -strip -resize 48x48 -colors 128 f48.png
magick f48.png f32.png f16.png favicon.ico && rm f16.png f32.png f48.png
magick profilbilde.jpg -strip -resize 180x180 -colors 256 apple-touch-icon.png
```
