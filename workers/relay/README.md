# relay

Reléet til medier og startside. En worker på lmfaole.party-sonen får HTTP 525 når den henter fra en origin utenfor Cloudflare (GitHub, Spotify, Last.fm …) midt i en sideforespørsel. Denne workeren ligger utenfor sonen, så appene ber den hente i stedet.

- **medier** kaller den gjennom service bindingen `UPSTREAM` (`apps/medier/wrangler.jsonc`).
- **startside** kaller den gjennom bindingen `UPSTREAM`, og over workers.dev-adressen (`UPSTREAM_URL`) når bindingen svarer 520–530 (`apps/startside/lib/relay.ts`).

Workeren heter **`medier-upstream`**, navnet til medier sitt gamle relé. Slik beholdt den hemmelighetene og medier sin binding da denne koden erstattet den gamle. Se «Nytt navn» for å endre det.

## Kontrakten

En forespørsel er `/<host>/<sti>?<query>` med headeren `X-Upstream-Key`. Reléet henter `https://<host>/<sti>?<query>` og sender svaret tilbake.

| Svar | Når |
| --- | --- |
| 403 `Forbidden` | Nøkkelen mangler eller er feil. Den sammenlignes i konstant tid (`src/guard.ts`). |
| 404 `Unknown host` | Verten står ikke i `src/routes.ts` (eller en GET til `accounts.spotify.com`). |
| 405 `Method not allowed` | Alt annet enn GET, unntatt POST-ene en kilde lister. |
| 413 `Payload too large` | En POST over 64 KiB. |
| 400 `Bad request` / `Only queries` | En GraphQL-POST som ikke er JSON, eller som har `mutation`/`subscription`. |
| 500 `GITHUB_TOKEN er ikke satt` | Et kall til `api.github.com` uten hemmeligheten `GITHUB_TOKEN`. |
| Kildens eget svar | Med `Content-Type` (standard `application/json`), `Expires`, `Last-Modified` og `X-Relay: lmfaole-relay`. Uten kropp for 204, 205 og 304. |

Kilden får `User-Agent` (appens navn), `Accept` (standard `application/json`) og `If-Modified-Since`. Den får i tillegg bare de headerne den trenger, og ingenting annet fra forespørselen.

## Kildene (`src/routes.ts`)

| Vert | For | Headere videre | POST |
| --- | --- | --- | --- |
| `ws.audioscrobbler.com` (Last.fm) | medier | – (nøkkel i adressen) | – |
| `api.trakt.tv` | medier | `trakt-api-version`, `trakt-api-key` | – |
| `api.themoviedb.org` | medier | `Authorization` | – |
| `musicbrainz.org`, `www.wikidata.org`, `api.listenbrainz.org` | medier | – | – |
| `api.setlist.fm` | medier | `x-api-key` | – |
| `api.steampowered.com`, `store.steampowered.com`, `retroachievements.org` | medier | – (nøkkel i adressen) | – |
| `api.spotify.com` | begge | `Authorization`, `Content-Type` | – |
| `accounts.spotify.com` | begge | `Authorization`, `Content-Type` | bare `api/token` (skjema) |
| `api.github.com` | startside | – (reléets egen `GITHUB_TOKEN`) | `graphql` (bare spørringer) |
| `api.entur.io` | startside | setter `ET-Client-Name` | `journey-planner/v3/graphql` (bare spørringer) |
| `gbfs.urbansharing.com` (Oslo Bysykkel) | startside | setter `Client-Identifier` | – |
| `api.met.no`, `nominatim.openstreetmap.org`, `services.swpc.noaa.gov`, `www.hvakosterstrommen.no`, `api01.nve.no`, `ws.geonorge.no` | startside | – | – |

Nøkkelen gir tilgang til alle kildene uansett app. Det er tabellen som avgrenser hva som kan hentes.

### Ny kilde

1. Legg verten i `src/routes.ts` (og en egen modul i `src/sources/` hvis den trenger mer enn headere), med en test i `src/worker.test.ts`.
2. Reléet må være ute før appen bruker verten. Legg verten til i en tidligere commit enn appen som bruker den, eller kjør `npm run deploy` her først.
3. Fjern aldri en vert som en app som er ute fortsatt bruker. Reléet skal bare få flere verter, så rekkefølgen på deploy av relé og apper i samme push spiller ingen rolle.

## Hemmeligheter

| Navn | Hva |
| --- | --- |
| `UPSTREAM_KEY` | Nøkkelen appene spør med. Den samme verdien står som `UPSTREAM_KEY` på workerne `medier` og `startside`. |
| `UPSTREAM_KEY_NEXT` | Bare mens en ny nøkkel deles ut (se «Nøkkelen»). Ellers er den ikke satt. |
| `GITHUB_TOKEN` | Fine-grained token med «Public repositories (read-only)» og ingenting annet, for startside sine GitHub-deler. Uten den svarer GitHub-kallene 500. |

```sh
npx wrangler secret put GITHUB_TOKEN    # i workers/relay; verdien limes inn, vises ikke
npx wrangler secret list
```

## Nøkkelen

Reléet godtar både `UPSTREAM_KEY` og `UPSTREAM_KEY_NEXT`. Dermed kan nøkkelen byttes uten at noen forespørsel avvises, og uten at den gamle verdien må leses (Cloudflare viser aldri en hemmelighet igjen).

```sh
npm run rotate-key -w workers/relay -- --dry-run    # viser stegene
npm run rotate-key -w workers/relay                 # gjør dem
npm run rotate-key -w workers/relay -- --also startside-upstream    # gir nøkkelen til én worker til
```

Skriptet (`scripts/rotate-key.ts`, rekkefølgen i `src/rotation.ts`) lager en tilfeldig nøkkel på 32 byte og sender den til `wrangler secret put` på stdin. Den skrives aldri ut, aldri til fil og aldri på en kommandolinje. Stegene, med 20 sekunder mellom hvert:

1. Reléet får `UPSTREAM_KEY_NEXT` = ny nøkkel. Nå godtar det både den gamle og den nye.
2. `medier` og `startside` (og hver `--also`) får `UPSTREAM_KEY` = ny nøkkel.
3. Reléet får `UPSTREAM_KEY` = ny nøkkel, og `UPSTREAM_KEY_NEXT` slettes.

Hvis et steg feiler, stopper skriptet. Da kan du kjøre det på nytt: hvert steg trenger bare den nye nøkkelen. `wrangler` må være logget inn (`npx wrangler login` eller `CLOUDFLARE_API_TOKEN`).

## Nytt navn

Navnet `medier-upstream` kan endres i dashboardet (Workers → medier-upstream → Settings). Hemmelighetene følger med. Endre så i samme commit:

- `name` i `wrangler.jsonc` her
- `service` i bindingen `UPSTREAM` i `apps/medier/wrangler.jsonc` og `apps/startside/wrangler.jsonc`
- `UPSTREAM_URL` i `apps/startside/wrangler.jsonc`
- `KNOWN` i `scripts/conventions.test.ts`

## Bruk

```sh
npm test
npm run typecheck
npm run deploy                              # CI gjør det ved push til main (.github/workflows/relay.yml)
npx wrangler tail medier-upstream
```
