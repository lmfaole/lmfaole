# forside

Forsiden på [lmfaole.party](https://lmfaole.party): navn, rolle, én setning og noen lenker (CV, GitHub, LinkedIn, e-post), og
[`/kilder`](https://lmfaole.party/kilder), som viser hvor dataene på [`/medier/`](https://lmfaole.party/medier/) kommer fra og når de hentes neste gang.

- Astro på Cloudflare Workers, Workeren `forside` på ruten `lmfaole.party/*` (`wrangler.jsonc`). De andre appene har mer spesifikke ruter på samme
  domene (`/medier*`, `/cv`, `/cv/*`, `/start`, `/design/`), og de vinner.
- Alle sidene bygges på forhånd. Workeren svarer bare på resten: gamle adresser (`src/lib/moved-paths.ts`, 301 til `/medier/…`) og 404.
- Ingen informasjonskapsler og ingen service worker, så siden rører aldri de andre appenes.
- Sikkerhetshodene står i `src/lib/headers.ts` (Workerens svar) og `public/_headers` (de bygde filene). En test passer på at de er like.
- `/kilder` leser `src/lib/sources.ts`. Tidene er cron-uttrykkene i `workers/scheduler/src/jobs.ts`, som er i UTC, og vises i norsk tid.

## Data

Siden har ingen data utenfor koden. Fase 4 flytter dataene til D1 (`site` og de andre basene), og da leser appene D1.

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
