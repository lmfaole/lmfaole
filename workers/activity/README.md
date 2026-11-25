# activity

Det jeg hører på, spiller og ser, lagret i Cloudflare D1, slik at det kan brukes til hva som helst senere. Én worker som `workers/scheduler` kjører hver 3. time.

## Musikk (D1 `music`)

- **Kilde:** ListenBrainz (`lmfaole`). Den har hele historikken:
  - Spotify-eksporten 2018–2021
  - to gamle Last.fm-kontoer fra 2012
  - alt som scrobbles i dag
- **Ingen duplikater:** primærnøkkelen er `(listened_at, artist, track)`, der store og små bokstaver regnes som like.
  - Når alt er hentet, begynner hver kjøring 3 døgn før den nyeste avspillingen som er lagret, slik at sene scrobbles og MusicBrainz-treff også kommer med. Så lenge historikken fortsatt fylles på, begynner den der den slapp (travle døgn har flere avspillinger enn én kjøring henter).
  - Uendrede rader skrives ikke på nytt: upserten sammenligner kolonnene.
  - ListenBrainz' egen JSON lagres ikke i D1. Den kan hentes på nytt, og kopien fra da `listens` ble erstattet ligger i R2.
- **Backfill:** `npm run backfill` fyller opp raskere fra Mac-en.
  - Den stopper etter `--max` rader, 80 000 som standard. D1 tillater 100 000 skrevne rader i døgnet gratis.
  - Kjør den igjen dagen etter, så fortsetter den der den slapp.
- **`loves`:** alt jeg har elsket på Last.fm. Spotify-likes kommer dit via likes-sync.
  - Nøkkelen er (artist, låt), så hver låt kan bare være der én gang.
  - Nye loves hentes hver kjøring, og de eldre fylles på 1000 om gangen til alle er med.
  - Hvis jeg fjerner en love, blir den ikke fjernet her.
- **`undated_listens`:** scrobbles uten ekte tidspunkt (1266 fra `ojbakken`).
  - Legg inn flere slike med `npm run undated -- <kilde> <sider.json…>`.

## Spill (D1 `gameplay`)

- **`games`:** alle spill på Steam og RetroAchievements, med minutter, sist spilt og achievements.
- **`play_events`:** ingen av tjenestene lagrer økter, så de lages her.
  - Steam: når totaltiden for et spill har økt, lagres økningen. Første rad er totaltiden før sporingen begynte (`baseline`).
  - RetroAchievements: hver ny «sist spilt», med rich presence.
- **`sessions`:** et view som slår sammen hendelser med under 3 t 10 min mellomrom til én økt.
- **`achievements`:** alle opplåste achievements med tidspunkt, også de fra før sporingen begynte.
  - Steam spørres bare om spill som er spilt siden sist, maks 10 per kjøring.

## Film og TV (D1 `watching`)

- **Kilde:** den offentlige Trakt-profilen (`lmfaole`). Bare client-ID trengs.
- **`watches`:** hele historikken. Nøkkelen er Trakts egen id, så ingenting kan bli dobbelt.
  - Nye innslag hentes fra en uke før det nyeste som er lagret.
  - Eldre innslag fylles på 500 per kjøring til starten er nådd.
- **`ratings`:** det som er ratet nå. Ratinger som er fjernet på Trakt, blir også fjernet her.
- **`letterboxd`:** Letterboxd-dagboka (`lmfaole`) fra den offentlige RSS-feeden. Feeden viser bare de siste føringene, så hver kjøring tar vare på det den ser. Nøkkelen er Letterboxds egen id, og endret vurdering eller anmeldelse oppdaterer raden. Lister tas ikke med.

## Backup

Søndager kl. 03:00 UTC tar D1s eget eksport-API en kopi av alle tre basene (`music`, `gameplay`, `watching`). Kopien strømmes rett til R2 under `backup/<base>/<dato>.sql`, og de 4 nyeste av hver beholdes. Dette krever secret-en `BACKUP_TOKEN`: et API-token med *Account → D1 → Edit*. Uten den hoppes backupen over. D1 Time Travel gir uansett 7 dager tilbake.

## Gratiskvoter

- Én kjøring bruker maks 34 av 50 tillatte subrequests. En D1-batch teller som én.
- Skrivinger skjer bare når noe er endret: noen titalls i døgnet utenom backfill.
- API-svarene caches i 15 minutter.

## API

`https://activity.olejorgenbakken.workers.dev` er skrivebeskyttet.

| Sti | Hva |
| --- | --- |
| `/music/stats` | totalt, første og siste avspilling, per år |
| `/music/recent?limit=50` | de nyeste avspillingene |
| `/music/top?by=artist\|track\|album&from=2020&to=2020-06&limit=25` | mest spilt i en periode |
| `/music/listens?from=…&to=…&limit=1000` | alle avspillinger, eldst først; `next` er neste sides `from` |
| `/music/loves?from=…&to=…` | elskede låter, nyeste først |
| `/watching/stats` | antall per år og type |
| `/watching/history?type=movie\|episode&from=…&to=…` | sett, nyeste først |
| `/watching/ratings` | alt som er ratet |
| `/watching/letterboxd?from=…&to=…&limit=100` | Letterboxd-dagboka, nyeste dag først |
| `/games/stats` | alle spill |
| `/games/sessions?from=…&to=…` | økter, nyeste først |
| `/games/achievements?from=…&to=…` | opplåsinger, nyeste først |

`from` og `to` tar `2020`, `2020-05`, `2020-05-17` eller sekunder siden 1970.

## R2 (`listens-archive/raw/`)

Rådata ligger urørt her:

- Spotify Extended Streaming History
- JSON fra Last.fm-kontoene `ojbakken` og `e0hjay`
- `raw/listenbrainz/<år>.ndjson.gz` og `raw/lastfm-undated/ojbakken.ndjson.gz`: JSON-en som lå i `raw`-kolonnene i den gamle D1-basen `listens` (slettet 2026-11-25). Hele den basen ligger i `backup/listens/2026-11-25-final.sql.gz`.

## Bruk

```sh
npm test
npm run deploy      # migrasjoner for alle tre databasene + deploy
npm run backfill    # musikk-backfill, maks 80 000 rader
npx wrangler d1 export music --remote --output music.sql
npx wrangler d1 execute gameplay --remote --command "SELECT * FROM sessions"
```

Secrets:

- `STEAM_API_KEY`, `STEAM_ID`, `RA_USER`, `RA_API_KEY` (fra `games-sync.env`)
- `LASTFM_API_KEY` (fra `music-sync.env`)
- `TRAKT_CLIENT_ID` (fra `tv-sync.env`)
- `BACKUP_TOKEN`

Alle env-filene ligger i `monorepo/secrets/`.
