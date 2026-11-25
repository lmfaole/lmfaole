# cv

CV-en på [lmfaole.party/cv/](https://lmfaole.party/cv/): erfaring med prosjektene under rollene de ble gjort i (med siste commit på GitHub), utdanning
og lenker. Den samme CV-en som data ligger på [`/cv/api/cv.json`](https://lmfaole.party/cv/api/cv.json).

- Astro på Cloudflare Workers. Workeren heter fortsatt `work` (navnet fra den gamle monorepoen), slik at en deploy erstatter den og beholder rutene
  `lmfaole.party/cv` og `lmfaole.party/cv/*` (`wrangler.jsonc`). Ingen custom domain: `jobb.lmfaole.party` er borte og skal ikke tilbake.
- Alt under Astros `base` `/cv`. `forside` eier `lmfaole.party/*`, men rutene her er mer spesifikke og vinner. `/cv` sendes videre til `/cv/`.
- Siden og JSON-en bygges på forhånd. Workeren svarer bare på resten (404).
- Ingen informasjonskapsler og ingen service worker.
- Sikkerhetshodene står i `src/lib/headers.ts` (Workerens svar) og `public/_headers` (de bygde filene). En test passer på at de er like.

## Data

`src/data/cv.json` er et øyeblikksbilde, sjekket inn: personen (navn, tittel, arbeidsgiver, sted), arbeidsgivere med roller og prosjekter,
utdanning (uten grunnskolen) og lenker, og siste commit i de offentlige repoene `fremtind/jokul`, `navikt/aksel` og `navikt/mangfold-i-mai`. Det ble laget
fra den gamle monorepoens `data-dump/cv` og `data-dump/github`, og har ingenting privat (ingen e-post, penger, helse eller bosted).

Fase 4 flytter dataene til D1, og da leser appen D1 i stedet for filen. Den gamle lasteren (`apps/work/web/src/server/cv.ts` i monorepoens historikk) viser
hvilke kolonner som leses, og at kilde og tidspunkt for personen aldri sendes ut.

## Utvikle

```sh
npm run dev          # astro dev, på http://localhost:4321/cv/
npm test             # node --test
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt med wrangler dev
```

Deploy skjer fra `.github/workflows/cv.yml` ved push til `main`.
