# cv

CV-en på [lmfaole.party/cv/](https://lmfaole.party/cv/): erfaring med prosjektene under rollene de ble gjort i (med siste commit på GitHub), utdanning
og lenker. Den samme CV-en som data ligger på [`/cv/api/cv.json`](https://lmfaole.party/cv/api/cv.json).

- Astro på Cloudflare Workers. Workeren heter fortsatt `work` (navnet fra den gamle monorepoen), slik at en deploy erstatter den og beholder rutene
  `lmfaole.party/cv` og `lmfaole.party/cv/*` (`wrangler.jsonc`). Ingen custom domain: `jobb.lmfaole.party` er borte og skal ikke tilbake.
- Alt under Astros `base` `/cv`. `forside` eier `lmfaole.party/*`, men rutene her er mer spesifikke og vinner. `/cv` sendes videre til `/cv/`.
- Siden og JSON-en lages når de blir spurt etter, fra D1 (se Data), og legges i Workerens cache (`caches.default`) i fem minutter (`src/middleware.ts`,
  med `pageCache` fra `@lmfaole/web/middleware`). Svaret sier `s-maxage=300`. Workeren svarer også på resten (404).
- Ingen informasjonskapsler og ingen service worker.
- Sikkerhetshodene står i `@lmfaole/web/headers` (Workerens svar) og `public/_headers` (de bygde filene). En test (`src/headers.test.ts`) passer på at de er like.
- Astro-oppsettet, middlewarens sidecache, D1-lesingen, dokumentet, 404-siden, stilarket og tsconfig er felles for Astro-appene, i `packages/web` (`@lmfaole/web`).

## Data

CV-en leses fra D1-basen `site` (bindingen `SITE` i `wrangler.jsonc`, samme id som `packages/db/wrangler.jsonc`). Appen bare leser, med én batch
`SELECT`-er, og migrerer aldri basen. Migrasjonen er `packages/db/site/migrations`.

- `cv_person`, `cv_employer`, `cv_position`, `cv_education`, `cv_project` og `cv_link` fylles av `scripts/import-dump.ts` fra den gamle monorepoens
  `data-dump/cv`. Siste commit i prosjektenes offentlige repoer er `github_project_commits`, som `workers/catalog` holder oppdatert.
- `src/lib/stored.ts` gjør radene om til samme form som før (`src/lib/cv.ts`), som den gamle lasteren (`apps/work/web/src/server/cv.ts` i monorepoens historikk) gjorde.
  Kolonnene leses ved navn, så kilde og tidspunkt for personen sendes aldri ut. Grunnskolen er ikke med. Arbeidsgiverne sorteres etter nyeste rolle.
  Testen (`stored.test.ts`) kjører spørringene mot den ekte migrasjonen i `node:sqlite`.
- Så lenge basen ikke har noen CV (ingen person eller ingen arbeidsgiver med rolle), tabellene mangler, eller D1 feiler, viser siden og JSON-en
  `src/data/cv.json` (`src/lib/runtime.ts`). Det er det samme øyeblikksbildet som før, laget fra `data-dump/cv` og `data-dump/github`, uten noe privat
  (ingen e-post, penger, helse eller bosted). Filen kan slettes når D1 har dataene.

## Utvikle

```sh
npm run dev          # astro dev, på http://localhost:4321/cv/
npm test             # node --test
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt med wrangler dev
```

Lokalt er D1-basen tom, så siden viser `src/data/cv.json`. For å se den med rader fra D1:

```sh
npx wrangler d1 migrations apply site --local
npx wrangler d1 execute site --local --command "INSERT INTO cv_person (id, navn) VALUES (1, 'Ole Jørgen Bakken')"   # og resten av cv_*-tabellene
```

Deploy skjer fra `.github/workflows/cv.yml` ved push til `main`.
