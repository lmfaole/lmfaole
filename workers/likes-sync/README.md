# likes-sync

En Cloudflare Worker som hver mandag kl. 05:00 UTC tar sangene du har likt på Spotify siden forrige kjøring, og markerer dem som elsket («loved») på Last.fm.

- Synken går bare én vei, fra Spotify til Last.fm.
- Sanger du fjerner fra likte på Spotify, blir ikke fjernet på Last.fm.
- Workeren har ingen nettadresse og ingen egen cron: `workers/scheduler` kaller `scheduled` mandager kl. 05:00 UTC.

## Slik fungerer det

- En markør («cursor») i KV husker tidspunktet for den nyeste likte sangen som er sendt til Last.fm.
- Hver kjøring leser «Liked Songs» fra den nyeste og bakover til markøren. Så elsker den sangene på Last.fm, eldste først, og flytter markøren til den siste som ble elsket.
- Sangen sendes med navnet og den første artisten, akkurat slik Spotify scrobbler den.
- Det er trygt å elske en sang som allerede er elsket, så en kjøring som gjentas gjør ingen skade.
- Gratisplanen har 50 eksterne kall («subrequests») per kjøring. Derfor elsker én kjøring høyst 40 sanger, og resten venter til neste uke.
- Den aller første kjøringen setter bare markøren. Sanger du likte før det, tar `npm run backfill` fra din egen maskin, uten grensen.
- Hvis Spotify bytter ut refresh-tokenet, lagres det nye i KV.
- Lokale filer og sanger som er borte fra Spotify, hoppes over.

## Sette opp én gang

1. **Nøkler.** Disse verdiene må ligge i en eller flere env-filer:
   - `SPOTIFY_CLIENT_ID` og `SPOTIFY_CLIENT_SECRET` (https://developer.spotify.com/dashboard).
   - `SPOTIFY_REDIRECT_URI`: en loopback-adresse som er registrert i Spotify-appen, for eksempel `http://127.0.0.1:8888/callback`. Spotify godtar ikke `localhost`.
   - `LASTFM_API_KEY` og `LASTFM_API_SECRET` (https://www.last.fm/api/accounts).
2. **Logg inn én gang.**

   ```sh
   npm run auth -- <env-filene>
   ```

   - Skriptet viser to adresser som du godkjenner i nettleseren.
   - Det skriver `SPOTIFY_REFRESH_TOKEN` og `LASTFM_SESSION_KEY` til `.sync.env`. Fila blir ikke committet og får rettigheter 600.
   - Sesjonsnøkkelen fra Last.fm utløper ikke. Spotify-tokenet varer i omtrent seks måneder. Kjør `npm run auth -- <filer> --only spotify` på nytt når det har gått ut.
3. **Deploy** med `npm run deploy`. Første gang lages KV-navnerommet automatisk.
4. **Hemmeligheter.**

   ```sh
   npm run secrets -- <env-filene> .sync.env
   ```

   Verdiene sendes til `wrangler secret bulk` via stdin og skrives aldri ut. Legg til `--dry-run` for å bare se hvilke navn som ville blitt satt.
5. **Gamle likes**, én gang:

   ```sh
   npm run backfill -- <env-filene> .sync.env
   ```

   Dette elsker alle sangene du har likt, med fire kall i sekundet. Til slutt lagres markøren i workerens KV, og de ukentlige kjøringene fortsetter derfra.

## Utvikling

- `npm test` og `npm run typecheck`.
- `npm run dev` starter workeren lokalt. Med en `.dev.vars` som har de seks hemmelighetene, kjører `curl "http://localhost:8787/__scheduled?cron=0+5+*+*+1"` én synk.
