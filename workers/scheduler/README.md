# scheduler

Kontoens eneste cron. Gratisplanen tillater fem cron-triggere per konto, så alle planlagte jobber går gjennom denne.

- Hvert kvarter sjekker den hvilke jobber i `src/jobs.ts` som skal kjøre nå (UTC), og kaller `scheduled` på de workerne via service bindings. Alle kalles samtidig.
- Hvert kall er en egen kjøring av den workeren, med sine egne 50 subrequests og sin egen CPU-tid. Dette er testet: både kalleren og den kalte kom gjennom 45 hver.
- Workeren som kalles får jobbens cron og tidspunktet for tikket, akkurat som fra en vanlig Cron Trigger.
- Feiler én jobb, kjøres de andre likevel, men kjøringen markeres som feilet. Da vises den i loggene.

| Jobb | Worker | Når (UTC) |
| --- | --- | --- |
| `ACTIVITY` | activity | hver 3. time, på hel time |
| `LIKES_SYNC` | likes-sync | mandager kl. 05:00 |
| `STARTSIDE` | startside | hvert 15. minutt |
| `CATALOG` | catalog | hver 6. time, kl. :15 (Hardcover bare kl. 06:15) |

## Ny jobb

1. Gi workeren en `scheduled(controller, env, ctx)`, og sett `"triggers": { "crons": [] }` i dens `wrangler.jsonc`.
2. Legg til en service binding i `wrangler.jsonc` her, og en linje i `src/jobs.ts`. Cronen må treffe et helt kvarter (:00, :15, :30, :45). Trenger en jobb oftere, endre cronen i `wrangler.jsonc` til `*/5`.
3. Deploy den nye workeren først, så denne: en service binding til en worker som ikke finnes, stopper deployen. Kjør så `npm run deploy`.

## Bruk

```sh
npm test
npm run deploy
npx wrangler tail scheduler    # ser hvert tikk: {"ran":[…],"failed":[…]}
```
