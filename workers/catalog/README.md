# catalog

Mine egne data fra eksterne kontoer, holdt oppdatert i D1. Erstatter GitHub-synken (`apps/work/sync-rust`) og Hardcover-steget i boksynken (`apps/books/sync-rust`) i den gamle monorepoen. Én worker uten adresse og uten egen cron: `workers/scheduler` kaller `scheduled` hver 6. time, kl. 00:15, 06:15, 12:15 og 18:15 UTC.

## GitHub (D1 `site`)

Bare det som er offentlig, siden nettstedet er offentlig. Brukeren er `GITHUB_USER` (`lmfaole`).

- **`github_repos`:** alle offentlige repoer jeg eier eller er med i (`/users/lmfaole/repos?type=all`). Private repoer hoppes over. Repoer som ikke lenger er i lista, slettes, men bare når hele lista kom.
- **`github_items`:** PR-er og issues jeg har opprettet, fra søket `author:lmfaole is:public`.
  - Hver kjøring henter det som er endret siste uke, maks 200.
  - Hver kjøring henter også ett helt år på nytt, på omgang fra `GITHUB_FIRST_YEAR` (2018) til i år. Med 9 år er hvert år innom hver 54. time. Det som ikke lenger finnes det året (slettet eller gjort privat), slettes, men bare når søket var komplett.
- **`github_days`:** bidragskalenderen, dager med minst ett bidrag. Den viser det samme som den offentlige profilen. Hver kjøring henter i år og året på omgang, og dager som har mistet bidragene sine, slettes. Krever `GITHUB_TOKEN`, fordi den kommer fra GraphQL.
- **`github_project_commits`:** min siste commit i repoet til hvert CV-prosjekt (`cv_project.repo`, maks 10).
  - Med token: én GraphQL-spørring for alle. Den sier om repoet er privat, og finner også commits langt bak i historikken som REST-lista ikke ser (som i `navikt/aksel`).
  - Uten token: REST, der 404 betyr privat eller borte.
  - Private repoer, repoer uten commits fra meg og repoer som ikke lenger står i CV-en, mister raden. Et repo som ikke svarte, beholder sin.

### Token og rate limits

`GITHUB_TOKEN` er valgfri, men anbefalt. Bruk et fine-grained token med *Repository access → Public repositories (read-only)* og ingen andre tillatelser. Det kan ikke se noe som ikke alt er offentlig.

- Uten token er grensen 60 kall i timen (10 søk i minuttet) per IP-adresse. Workers deler utgående adresser med andre, så kvoten er ofte brukt opp før vi kommer (lokalt: «rate limited» før første kall). Med token er grensen 5 000 i timen for meg alene.
- Uten token hoppes kalenderen over, og prosjekt-commits hentes over REST.
- ETag og betingede kall er ikke brukt. De krever at svarene fra forrige kjøring lagres (skrivinger i D1 eller KV), og de hjelper ikke når kvoten på adressen er brukt opp av andre. En kjøring bruker 12–19 kall, så med token er det god margin.
- Ved rate limit stopper steget og logger når grensen nullstilles. Neste kjøring prøver igjen.

## Hardcover (D1 `library`)

Hyllene mine på Hardcover (`HARDCOVER_TOKEN`), lagt over `books` slik boksynken gjorde: **Hardcover vinner**. Bare i kjøringen kl. 06:15 UTC, én gang i døgnet holder.

- Kobles på `source` = `hardcover:<bok-id>`, som allerede står i radene fra datadumpen. Ingen ny migrasjon.
- Hylle → status: 1 → `want`, 2 og 4 (pause) → `reading`, 3 → `done`, 5 → `dropped`. 6 (ignorert) tas ikke med.
- Vurderinger rundes til nærmeste halve (0,5–5). 0 betyr ingen vurdering.
- Dato er fra siste lesing: ferdig-dato for `done` og `dropped`, startdato for `reading`, ellers dagen boka ble lagt til.
- `want` er en rad i `collection`. Den forsvinner derfra når boka startes, og blir en rad i `log`.
- En bok som alt står i loggen, får Hardcovers status, vurdering og dato. Tittel, år og format beholdes. Nye bøker får neste linjenummer i lista.
- Bøker som fjernes fra Hardcover, slettes ikke her.
- Tokenet utløper etter ett år. Lag et nytt på hardcover.app/account/api. Når det har utløpt, feiler kjøringen med «has the token expired?».

Open Library, BGG, IGDB og TMDB hentes ikke: appene slår opp der når de trenger det. Ingen side legger til egne føringer.

## Gratiskvoter

- **Subrequests:** maks 25 av 50 per kjøring med token, 30 uten. En D1-batch teller som én, og loggen viser antallet (`catalog: N subrequests`).
  - GitHub: repoer 1–3 + 1 batch, PR-er/issues 2–7 + 1, kalender 2 + 1, prosjekt-commits 1 + 2 + 1 (uten token 1 + maks 10 + 1).
  - Hardcover: 1–4 sider + 1 + 1.
  - Lokalt med token: 15 med Hardcover, 14 uten.
- **Skrevne rader:** bare det som er endret skrives. Upsertene sammenligner kolonnene (`… IS NOT …`).
  - En vanlig kjøring skriver 0–30 rader: dagens bidrag, nye eller endrede PR-er, `pushed_at`, en ny commit. Det blir maks noen hundre i døgnet av 100 000.
  - De første ~54 timene skrives hvert år i kalenderen én gang på nytt, i alt noen tusen rader, fordi tallene i dumpen er eldre.
  - Den første Hardcover-kjøringen skriver det som er endret siden dumpen. Deretter er det 0–5 rader i døgnet.

## Bruk

```sh
npm test
npm run typecheck
npm run deploy      # migrasjoner for site og library + deploy
npx wrangler tail catalog
```

Lokalt, mot lokal D1 og ekte API-er:

```sh
npx wrangler d1 migrations apply site --local
npx wrangler d1 migrations apply library --local
npm run dev -- --var FORCE_HARDCOVER:1          # med GITHUB_TOKEN og HARDCOVER_TOKEN i .dev.vars
curl "http://localhost:8787/__scheduled?cron=15+*/6+*+*+*"
```

Databasene deles med andre (skjemaene ligger i `packages/db`). Id-ene i `wrangler.jsonc` må være de samme som i `packages/db/wrangler.jsonc`.

Deploy denne før `workers/scheduler`: en service binding til en worker som ikke finnes, stopper deployen.

Secrets:

- `GITHUB_TOKEN`: fine-grained, *Public repositories (read-only)*, ingen tillatelser. Lages på github.com/settings/personal-access-tokens.
- `HARDCOVER_TOKEN` (fra `books-sync.env` i `monorepo/secrets/`).
