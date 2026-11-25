# forside

Forsiden på [lmfaole.party](https://lmfaole.party): navn, rolle, én setning og noen lenker (CV, GitHub, LinkedIn, e-post), og
[`/kilder`](https://lmfaole.party/kilder), som viser hvor dataene på [`/medier/`](https://lmfaole.party/medier/) kommer fra og når de hentes neste gang.

- Astro på Cloudflare Workers, Workeren `forside` på ruten `lmfaole.party/*` (`wrangler.jsonc`). De andre appene har mer spesifikke ruter på samme
  domene (`/medier*`, `/cv`, `/cv/*`, `/start`, `/design/`), og de vinner.
- `/kilder` bygges på forhånd. `/` lages når den blir spurt etter, fordi navnet og rollen leses fra D1 (se Data), og legges i Workerens cache
  (`caches.default`) i fem minutter (`src/lib/page-cache.ts`, `src/middleware.ts`). Svaret sier `s-maxage=300`. Workeren svarer også på gamle adresser
  (`src/lib/moved-paths.ts`, 301 til `/medier/…`) og 404.
- Ingen informasjonskapsler og ingen service worker, så siden rører aldri de andre appenes.
- Sikkerhetshodene står i `src/lib/headers.ts` (Workerens svar) og `public/_headers` (de bygde filene). En test passer på at de er like.
- `/kilder` leser `src/lib/sources.ts`. Tidene er cron-uttrykkene i `workers/scheduler/src/jobs.ts`, som er i UTC, og vises i norsk tid.

## Data

Navnet og rollen på forsiden leses fra D1-basen `site` (bindingen `SITE` i `wrangler.jsonc`, samme id som `packages/db/wrangler.jsonc`), den samme
CV-en som `apps/cv` viser. Appen bare leser, med én batch `SELECT`-er, og migrerer aldri basen. Migrasjonen er `packages/db/site/migrations`.

- Navnet er `cv_person.navn`. Rollen er tittelen på den nyeste stillingen som ikke er avsluttet (`cv_position.til` er tom), og arbeidsgiveren
  (`cv_employer.navn`): «Senior frontend-utvikler hos Fremtind». `scripts/import-dump.ts` fyller tabellene. Radene gjøres om i `src/lib/stored.ts`,
  og testen (`stored.test.ts`) kjører spørringene mot den ekte migrasjonen i `node:sqlite`.
- Det basen ikke har (tabellene mangler, de er tomme, eller D1 feiler), er sidens egne ord i `src/lib/profile.ts` (`src/lib/runtime.ts`), så siden ser ut
  som før. Setningen om jobben, lenkene og `/kilder` står i koden.

Lokalt er D1-basen tom, så siden viser ordene i `profile.ts`. `npx wrangler d1 migrations apply site --local` og et par rader i `cv_person`, `cv_employer`
og `cv_position` (`npx wrangler d1 execute site --local --command "…"`) viser dem fra D1.

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
