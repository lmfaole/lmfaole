# presentasjoner

Presentasjonene mine på [lmfaole.party/presentasjoner/](https://lmfaole.party/presentasjoner/): en liste over foredragene, og for hvert av dem
innholdet slide for slide (tekst, bilder, lenker og notater) og presentasjonen som PDF. Selve `.pptx`-filene og arbeidsgiver-malen er ikke med her.
Alle lages i PowerPoint (`.pptx`).

- Astro på Cloudflare Workers. Workeren heter `presentasjoner` og har rutene `lmfaole.party/presentasjoner` og `lmfaole.party/presentasjoner/*`
  (`wrangler.jsonc`). `forside` eier `lmfaole.party/*`, men rutene her er mer spesifikke og vinner. Alt ligger under Astros `base` `/presentasjoner`.
- Sidene bygges fra `content/` (forhåndsrendret): `/presentasjoner/` og `/presentasjoner/<mappe>/`. Bildene i `bilder/` blir med i bygget.
- PDF-en ligger i R2-bøtta `presentasjoner` (bindingen `PDF`) som `<mappe>/<navnet på .pptx>.pdf`, og Workeren sender den på
  `/presentasjoner/<mappe>/<navnet på .pptx>.pdf` (`src/pages/[slug]/[file].pdf.ts`). Bare presentasjoner som finnes i `content/` kan hentes. Det
  som mangler i bøtta, får 404-siden.
- Ingen informasjonskapsler og ingen service worker.
- Sikkerhetshodene står i `src/lib/headers.ts` (Workerens svar) og `public/_headers` (de bygde filene). En test passer på at de er like.

## Struktur

```
content/<år>-<måned>-<tittel>/
  presentasjon.json   # innholdet i .pptx-filen (påkrevd, se under)
  README.md           # fakta, tidsplan, kilder, kreditering (se maler/README-mal.md)
  bilder/             # bildene som brukes, og KREDITERING.md
maler/                # README-mal.md
scripts/              # pptx_to_json.py, check.py, export_pdf.sh
skills/               # skills for å lage presentasjoner
presentasjon.schema.json
src/                  # nettstedet
```

`.pptx`-filen ligger utenfor repoet.

## Konvensjoner

- Format: PowerPoint (`.pptx`)
- Én mappe per presentasjon i `content/`. Mappenavnet er adressen.
- Hver presentasjon har en `README.md` basert på `maler/README-mal.md` (retningslinjer: `skills/presentation-readme/SKILL.md`)
- Hver presentasjon har en `presentasjon.json`, siden `.pptx`-filen ikke er her

## presentasjon.json

Det repoet tar vare på av selve presentasjonen. For hver slide lagres:

- layout, tittel og tekst (etter plassholder);
- tekstbokser;
- bilder (som filer i `bilder/`, med alt-tekst);
- video og lyd;
- lenker;
- tidsstempel og foredragsnotater.

Formatet er `presentasjon.schema.json`. Øverst i filen kan du skrive inn for hånd det `.pptx`-filen ikke vet: `summary` (én setning om hva den
handler om), `event` (arrangementet), `date` (`ÅÅÅÅ-MM-DD`) og `duration` (minutter). Nettstedet viser dem, og `pptx_to_json.py` beholder dem.

Lag eller oppdater filen etter hver endring i `.pptx`-filen:

```bash
python3 -m venv /tmp/pptxvenv && /tmp/pptxvenv/bin/pip install python-pptx
/tmp/pptxvenv/bin/python scripts/pptx_to_json.py <sti til>/<tittel>.pptx content/<mappe>
python3 scripts/check.py
```

Bilder skrevet med `null` mangler i `bilder/`; legg dem dit og kjør på nytt.

`scripts/check.py` kjøres av `npm test` (og dermed i CI). Den krever at:

- hver mappe `content/<år>-…` har `README.md` og en gyldig `presentasjon.json`;
- slidene er nummerert uten hull;
- bildene finnes;
- alle bilder og videoer har alt-tekst eller er merket som dekorative.

## PDF

Eksporter med PowerPoint og last opp til R2 (macOS, PowerPoint og `npx wrangler login`):

```bash
scripts/export_pdf.sh <sti til>/<tittel>.pptx <mappe>
```

Skriptet åpner presentasjonen i PowerPoint, lagrer den som PDF i PowerPoints egen mappe (programmet er sandkasset), laster den opp til
`presentasjoner/<mappe>/<tittel>.pdf` og sletter den lokale PDF-en. Kjør det på nytt etter hver endring.

## Utvikle

```sh
npm run dev          # astro dev, på http://localhost:4321/presentasjoner/
npm test             # node --test og scripts/check.py
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt med wrangler dev
```

Lokalt er R2-bøtta tom, så PDF-lenken gir 404. For å prøve den:
`npx wrangler r2 object put presentasjoner/<mappe>/<tittel>.pdf --file <en pdf> --local`.

Deploy skjer fra `.github/workflows/presentasjoner.yml` ved push til `main`.
