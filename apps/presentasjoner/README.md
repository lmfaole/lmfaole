# presentasjoner

Presentasjonene mine på [lmfaole.party/presentasjoner/](https://lmfaole.party/presentasjoner/): en liste over foredragene, og for hvert av dem
innholdet slide for slide (tekst, bilder, lenker og notater) og presentasjonen til nedlasting som PDF, PowerPoint eller HTML. Selve
`.pptx`-filene fra foredragene og arbeidsgiver-malen er ikke med her, bare den generiske utgaven i `nedlasting/`. Alle lages i PowerPoint (`.pptx`).

- Astro på Cloudflare Workers. Workeren heter `presentasjoner` og har rutene `lmfaole.party/presentasjoner` og `lmfaole.party/presentasjoner/*`
  (`wrangler.jsonc`). `forside` eier `lmfaole.party/*`, men rutene her er mer spesifikke og vinner. Alt ligger under Astros `base` `/presentasjoner`.
- Sidene bygges fra `content/` (forhåndsrendret): `/presentasjoner/` og `/presentasjoner/<mappe>/`. Bildene i `bilder/` blir med i bygget.
- Diagrammene tegnes av designsystemet fra tallene i `presentasjon.json`, ikke lagret som bilder. `src/lib/chart.ts` velger formen etter
  designsystemets egne grenser, og `src/views/SlideCharts.tsx` tegner den: tre til ti kategorier blir søyler (område der presentasjonen har
  en linje), tall for få til et diagram leses som nøkkeltall, og et diagram over grensene (mer enn fem serier eller ti kategorier) tegnes
  ikke — da beholder sliden bildet sitt. Reserveslidene får ingen diagrammer på siden: de står alt inne i en utvidelse, og diagrammet har
  sin egen («Vis tallene»). I den nedlastede fila, som ikke har den utvidelsen, er de med.
- Hver presentasjon kan lastes ned i tre formater, alle under `/presentasjoner/<mappe>/<navnet på .pptx>` med formatets endelse
  (`src/lib/deck.ts`, `DOWNLOADS`). Bare presentasjoner som finnes i `content/` kan hentes, og hvert endepunkt sender bare sitt eget format.
  - `.pdf` og `.pptx` ligger i repoet, i `content/<mappe>/nedlasting/`. `scripts/downloads.mjs` (kjørt av `dev`, `build`, `preview` og `deploy`)
    kopierer dem til `public/_nedlasting/<mappe>/` (git ignorerer kopien), så de følger med nettstedet som statiske filer. Workeren leser dem
    gjennom `ASSETS` og sender dem som nedlasting (`src/lib/download.ts`). R2-bøtta `presentasjoner` (bindingen `FILES`) er bare reserve: det som
    ikke finnes blant de statiske filene, hentes derfra, og det som mangler begge steder, får 404-siden.
  - `.html` lages i det svaret skrives (`src/pages/[slug]/[file].html.ts`): samme komponenter som siden (`src/views/TalkDocument.tsx`) og
    samme stilark, lagt inline, i én fil uten script. Bildene står som alt-tekst, slik videoene gjør, og diagrammene er tegnet ferdig.
    Skriftene hentes fra nettstedet, så åpnet fra disk brukes leserens egen skrift.
  - `?vis` på samme adresse (`SHOW` og `talkView` i `src/lib/deck.ts`) åpner presentasjonen som slideshow i nettleseren, sendt `inline`:
    én slide om gangen, med piltaster, mellomrom, sveip og knapper, `F` for fullskjerm, `N` for notater og `O` for oversikt (en `dialog`), og `#<n>` i adressen går til en
    slide. Slidene fyller skjermen, byttet glir inn med View Transitions (slås av med `prefers-reduced-motion`, og der nettleseren mangler det),
    en linje øverst viser framdriften, og i fullskjerm skjules knappelinja når musa hviler. Diagrammene er designsystemets egne, tegnet fra tallene
    i innebygde PowerPoint-diagrammer. Reserveslidene kommer sist. Den er laget i det svaret skrives (`src/lib/slideshow.ts`, `src/views/Slideshow.tsx`): samme
    komponenter og stilark som siden, og bildene vises i full størrelse. Designsystemet har ikke noe slideshow, så dette er det ene stedet
    appen har egen CSS og eget script (i fila, ikke på sidene). Uten script står alle slidene under hverandre.
    Knappen «Se som slideshow» står sist blant de fire i rail-en, og er den eneste som ikke er en nedlasting.
- Ingen informasjonskapsler og ingen service worker.
- Sikkerhetshodene står i `@lmfaole/web/headers` (Workerens svar) og `public/_headers` (de bygde filene). En test (`src/headers.test.ts`) passer på at de er like.
- Astro-oppsettet, middlewarens sidecache, D1-lesingen, dokumentet, 404-siden, stilarket og tsconfig er felles for Astro-appene, i `packages/web` (`@lmfaole/web`).

## Struktur

```
content/<år>-<måned>-<tittel>/
  presentasjon.json   # innholdet i .pptx-filen (påkrevd, se under)
  README.md           # fakta, tidsplan, kilder, kreditering (se maler/README-mal.md)
  bilder/             # bildene som brukes, og KREDITERING.md
maler/                # README-mal.md, lmfaole-mal.pptx
scripts/              # pptx_to_json.py, check.py, deck_outline.py, build_deck.py, deck_guard.py, export.sh
skills/               # skills for å lage presentasjoner
presentasjon.schema.json
src/                  # nettstedet
```

Presentasjonen slik den ble holdt, og arbeidsgiver-malen, ligger utenfor repoet: det er offentlig. `maler/lmfaole-mal.pptx` er unntaket
(`.gitignore` ignorerer `*.pptx`, men ikke den) — den er vår egen mal, og uten den kan ingen bygge decket som lastes ned.

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
- diagrammer, med tallene de er tegnet av (kategorier og én serie per rad);
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
- alle bilder og videoer har alt-tekst eller er merket som dekorative;
- hver serie i et diagram har én verdi per kategori.

## PowerPoint og PDF til nedlasting

Det som lastes ned er ikke presentasjonen slik den ble holdt, men en generisk utgave bygd av `presentasjon.json` og `maler/lmfaole-mal.pptx`,
vår egen mal. Da ser nedlastingen ut som nettstedet, og ingenting av arbeidsgiverens merkevare publiseres. PDF-en eksporteres fra den samme
fila, så alle tre formatene er samme utgave.

```bash
python3 -m venv /tmp/pptxvenv && /tmp/pptxvenv/bin/pip install python-pptx pillow
scripts/export.sh <mappe>              # begge; eller --pptx / --pdf
```

Skriptet (macOS, PowerPoint og `npx wrangler login`) lager et outline med `deck_outline.py`, bygger `.pptx`-en med `build_deck.py`, lagrer den
som PDF gjennom PowerPoint (programmet er sandkasset og skriver bare i sin egen mappe), laster opp til `presentasjoner/<mappe>/` og rydder
opp. Sett `PPTX_PYTHON` om python-pptx ligger et annet sted. Kjør det på nytt etter hver endring — til du har gjort det, gir knappene 404.
Samme filer legges også i `content/<mappe>/nedlasting/` og tas med i git, så du kan åpne dem lokalt og se historikken. Der er `.pptx`-en vår generiske utgave, aldri den som ble holdt.

Den generiske utgaven og presentasjonen som ble holdt har samme filnavn, og R2-nøkkelen *er* det navnet, så en feil fil ville lagt
arbeidsgiverens mal på en offentlig adresse. To vakter hindrer det: skriptet bygger i en mappe det lager selv og laster opp nøyaktig de
filene (det tar ingen sti), og `scripts/deck_guard.py` nekter en `.pptx` der temaet, malen, layoutene eller dokumentegenskapene nevner
arbeidsgiveren, eller der en layout ikke finnes i vår egen mal. Den kan kjøres alene: `python3 scripts/deck_guard.py <fil> --template
maler/lmfaole-mal.pptx`.

Malen lages for hånd i PowerPoints utformingsvisning — python-pptx kan fylle maler, ikke lage dem. 16:9, Atkinson Hyperlegible, fargene fra
`theme.css`, og fire layouter som `deck_outline.py` bruker: `Forside`, `Skilleark`, `Innhold` og `Bilde`. Innholdslayouten bør krympe tekst
som flyter over, siden slidene her kan ha mange linjer.

## Utvikle

```sh
npm run dev          # astro dev, på http://localhost:4321/presentasjoner/
npm test             # node --test og scripts/check.py
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt med wrangler dev
```

Lokalt er R2-bøtta tom, så PDF- og PowerPoint-lenkene gir 404 (HTML-lenken virker, den lages av Workeren). For å prøve dem:
`npx wrangler r2 object put presentasjoner/<mappe>/<tittel>.pdf --file <en pdf> --local` (og det samme med `.pptx`).

Deploy skjer fra `.github/workflows/presentasjoner.yml` ved push til `main`.
