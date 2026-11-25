# startside

A personal start page: what to do and look at during the working day, fetched from outside services and rendered on the
server on every request. Next.js (App Router, SSR) on Cloudflare Workers through OpenNext, built from the components of
[`lmfaole/designsystem`](https://github.com/lmfaole/designsystem). The project writes no styling of its own.

## Pages

Built after the design system's «Pages and navigation» rules (5.3): three levels, internal links first.

| Page | Is |
| --- | --- |
| `/start` | The **digest** (with active **farevarsler** at the top whatever the time of day, and in the weather card rain on the way, a high UV, poor air and the price of power now): the few things that need you most from each source, each section a card whose foot leads on to its page («Se alle pull requests», with how many there are; `PageSection continues`), each GitHub section with its own counts (`SummaryBar`, each a link to its group) under its title. Follows the time of day (`lib/plan.ts`). |
| `/start/pull-requests`, `/issues`, `/discussions` | The **lists**: everything, in groups by what needs you most. Discussions are under Issues (the bar holds five places) |
| `/start/github` | GitHub in one place: a card for each part (varsler, pull requests, issues, discussions) with its counts, its foot the link to its page («Se alle issues»), which have GitHub as their first breadcrumb |
| `/start/transport` | The stations nearest to the device (Entur, within a kilometre, nearest first), each with a departure board (`DepartureBoard`) with a small OpenStreetMap map of the stop and the reader on it across its top: line, destination, platform, delays and cancellations. Above them **Bysykkel**: Oslo Bysykkel's stations within 500 m with bikes and free docks now, each with a small map in front (`MapThumb`) (none, and no section, outside Oslo). Only from the device's position («Bruk min posisjon»); without it the page says so. `/start/avganger` redirects here (`next.config.ts`). Each board ends in a link under its rows to the stop's page («Se alle avganger fra …», `continues`), and each row's line links to the line's page from the stop |
| `/start/transport/{stopp}` | One **stop**: every departure of the next three hours in the order they leave, by the hour (`DepartureList`), each line a chip and a link to its own page from the stop, with a map of the stop. The address is the national register's number (`58366` for `NSR:StopPlace:58366`), any other id encoded (`stopPath`, checked by `stopIdOf`) |
| `/start/transport/{stopp}/{linje}` | One **line from a stop** (`/start/transport/58366/31`): a section for each way it goes with every stop of the next trip from there (`StopSequence`: the stops before folded, ride minutes and real-time times, each stop a link to its page) and the times of the departures after it; the stop's other lines as chips and its map. Without a trip from Entur the section lists the departures. The line is checked by `lineOf`, the trip by `isJourneyId` |
| `/start/varsler` | What wants a look: **feilende CI** (a default branch whose last commit is red, in the user's public repositories and the watched ones), **nytt fra andre** (replies and reviews on what the user is in, last three days, where somebody else wrote last) and **Dependabot** (its open pull requests in the user's public repositories, with their checks). Only when the username is the token's owner (see below) |
| `/start/innstillinger` | **Innstillinger** (last in the menu): an overview (`SubPages` with what is chosen now) of the subpages `konto` (GitHub username, the only place it is shown; and where `/start/brukernavn` redirects), `repoer`, `forside` (sections and their order), `tid` (time of day: the switch and greeting, with its own subpages `tid/deler`, `tid/helg`, `tid/innhold` and one per part, `tid/morgen` … `tid/natt`), `posisjon`, `utseende` (theme, effects with «Vibrasjon», tilt) and `app` (install, «Vis introen igjen»), each with its own small form; «Vis introen igjen» also at the bottom of the overview |
| `/start/vaer` | The whole forecast, in figures and charts more than words: the next 24 hours as a meteogram, the coming days as lowest to highest. Around it: **farevarsler** in force (MET and Varsom, `HazardList`), **nedbør neste 90 minutter** (the radar) as a chart, the sun as figures with the **UV** and the daylight through the year as charts, the northern lights as figures (with the **moon**) above their chart, and **luftkvalitet** hour by hour. Each coming day links to its page, and «Neste døgn» to tomorrow's |
| `/start/vaer/{dato}` | One **day** of the forecast (`2026-11-24`, today to as far as the forecast reaches): lowest and highest, the rain, the strongest wind, the UV and the sun as figures, and the day as a meteogram (by the hour, or every sixth hour further out), the other days as chips |
| `/start/strom` | The spot price of power in the price area (chosen under Posisjon, or guessed from the position): now, the cheapest three hours and the day's mean as figures, today by the hour and tomorrow once it is set, and the mean of each of the last seven days. Each day links to its page |
| `/start/strom/{dato}` | One **day**'s spot price (from the first prices, December 2021, up to tomorrow): the mean and the cheapest and dearest hour as figures, the day by the hour, the five price areas' means side by side, and the day before and after |
| `/start/pull-requests/{owner}/{repo}/{n}`, `/issues/…`, `/discussions/…` | The **detail** of one thing: status, description, facts, checks, last comments, and **«Åpne på GitHub» last** |

The navigation between the places is the design system's `NavBar` (a bar at the foot on a phone, a rail at the left from tablet width), not
tabs. A description or a comment is Markdown, shown with `Markdown` and cut at a paragraph.

A row links to the app's own page for the thing (`lib/links.ts`), never straight out to GitHub: leaving is the last action on
the detail page. The detail pages read one item from GitHub's GraphQL (`lib/detail.ts`); the address is checked before it is
used (`parseRef`). The service worker keeps the last copy of each page by its address, so the pages open offline.

## Whose data: the GitHub username

Every GitHub list is fetched for a GitHub username the visitor gives, never for the token's owner (`@me`, `viewer`). Without one, the GitHub
pages (`/github`, `/pull-requests`, `/issues`, `/discussions`, `/varsler`) and the GitHub sections of the front page show a form asking for it
instead of data; Vær, Transport and the detail pages (public anyway) work as before. The form is a plain HTML form (no JavaScript) posted to
`/start/api/brukernavn` (`app/api/brukernavn/route.ts`) with the field `github` and a hidden `back`: the endpoint asks GitHub (`GET /users/<u>`,
with the server's token) whether the user exists, keeps the name in the cookie `github_user` (path `/start`, a year, `SameSite=Lax`, `Secure`,
`HttpOnly`) and answers 303 to `back` (which must start with `/start` and have no `//`; else the front page). An unknown name goes back with
`?brukernavn-feil=github&brukernavn-verdi=<what was written>`, which the page's form shows as the error; an empty field removes the cookie.
Whose data it is shows only under Innstillinger › Konto, not on every page. With `MOCK_DATA=1` any name is taken and the
lists come from the mock data as before. `lib/username.ts` (pure, tested) checks the name, the way back and the cookie.

The token is the owner's and could read private repositories, so **every search has `is:public`** and uses the name (`author:<u>`,
`review-requested:<u>`, `assignee:<u>`, `involves:<u>`, Dependabot's `user:<u>`; `userQueries` and `repliesQuery` in `lib/github-query.ts`, tested), the
user's own repositories for CI are `user(login:)` with `privacy: PUBLIC`, and the watched repositories are read only when they are public. The
alerts (`/varsler` and «Følg opp») are shown only when the name is the token's login (any case); for anyone else they say so instead.

No answer is shared between names: the edge cache in `lib/upstream.ts` is keyed by the address and the body, which hold the name; the pages are
rendered per request (`force-dynamic`, `Cache-Control: private, no-store`); and the service worker empties the pages it keeps when the username form
or the settings are sent. The page shows no Spotify data (Spilles nå and Ny musikk are gone; `/musikk` goes to the front page), so the Spotify secrets and the code that read them are gone.

## Alerts

`lib/alerts.ts` (pure, tested): `ciFailures` and `fromOthers`; `lib/github.ts`: `getCiFailures`, `getReplies`, `getDependabot`. GitHub's own
notifications are **not** used: the API does not accept a fine-grained token (403), so «nytt fra andre» is read from the conversations of what
you are involved in (the last comment or review, kept when it is not yours). It sits on the front page as «Følg opp» (red first) and as counts in
the summary, in the morning, the workday, the evening and the weekend, but not at night.

## Sources

| Source | What | Config |
| --- | --- | --- |
| Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct-fp8`, the `AI` binding) | A short Norwegian summary at the top of a pull request, an issue, a discussion and the alerts. Cheap by design: a small model, the text cut to a few thousand characters, ~200 tokens out, one call per version of the text (kept a week in the edge cache under a fingerprint), made while the page streams, and left out on any failure. Through **AI Gateway** `AI_GATEWAY` (logs, caching, rate limits in the dashboard, tagged `app: startside` and the kind), and without it when the gateway call throws (`lib/ai-gateway.ts`). The gateway `default` is created by Cloudflare on its first call (authentication and logs on, caching off); any other name must be created first under AI › AI Gateway | `ai` and `AI_GATEWAY` in `wrangler.jsonc` |
| Design system 8.13 (`EmptyState`, `Time`, `Freshness`, `ConnectionBanner`, `StreamedSection`) | Empty states and every time (rows, comments, «opprettet», «sist endret») use them: relative when recent, a date later, the exact time in `title` | none |
| github.com (`<login>.png`, fetched by the browser) | The picture of each person next to their name on the detail pages (`Person` from the design system, `lib/avatar.ts`): reviewers, assignees, who answered, who commented. No token, nothing through the relay. With `IMAGE_TRANSFORMS=1` through the zone's **Image Transformations** (`/cdn-cgi/image/width=20,height=20,fit=cover,dpr=2,format=auto/…`, `transformedImage` from the design system's `lib/cloudflare`, `components/person.tsx`): AVIF or WebP. `/cdn-cgi/` is outside the Access application (`/start*`) and same origin, so `img-src 'self'` covers it. The maps' tiles are not transformed (OpenStreetMap's tile policy asks for the visitor's own request with its Referer), nor the pictures in GitHub texts (the design system's `Markdown` draws them and has no hook for it) | `IMAGE_TRANSFORMS` in `wrangler.jsonc` |
| Entur (Journey Planner v3, through the relay) | Departures from the stations nearest to the device, and where each stop is (`latitude`, `longitude`), for its map | none |
| OpenStreetMap tiles (`tile.openstreetmap.org`, fetched by the browser) | The small still maps on Transport (`MapThumb` from the design system): the map across the top of each departure board, and one in front of each city bike station. Only the few tiles each map covers, lazily, with the page's Referer as the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/) asks; nothing through the relay. «© OpenStreetMap» (linked to its copyright page) is in the corner of each board's map and under the bike list (ODbL). There is no Content-Security-Policy to widen; one added later must let `img-src` have `https://tile.openstreetmap.org` | none |
| Yr (MET Norway `locationforecast`) | The forecast for the rest of the day. Per MET's terms the same forecast is asked for at most every 30 minutes, not before its `Expires`, and again with `If-Modified-Since` (`lib/upstream.ts`, `lib/cache-policy.ts`) | `WEATHER_PLACE`, `WEATHER_LAT`, `WEATHER_LON` in `wrangler.jsonc` |
| NOAA SWPC (`noaa-planetary-k-index-forecast.json`) | The Kp index for the northern lights (through the relay; no key) | none |
| MET MetAlerts 2.0 (`metalerts/2.0/current.json?lat&lon`) | **Farevarsler** for the position: land only, yellow or worse, not yet over, each linked to the full warning (`lib/warnings.ts`). At most every 10 minutes | none |
| MET Locationforecast `complete` | The same forecast as above (the complete one, same 30-minute rule), for its `ultraviolet_index_clear_sky`: the day's highest UV, shown from 3 (`uvPeak`, `uvLevel` in `lib/forecast.ts`) | none |
| MET Nowcast 2.0 (`nowcast/2.0/complete`) | Precipitation the next 90 minutes from the radar: «Nedbør om 25 min» (`lib/nowcast.ts`). Every 5 minutes; nothing without radar coverage (it says so on Vær), and nothing outside the Nordic area (422) | none |
| MET Air quality forecast 0.1 (`airqualityforecast/0.1/`) | The worst air of the rest of today as a level and its cause (`lib/air.ts`): on the front page from moderate, on Vær always. Every 30 minutes; Norway only | none |
| MET Sunrise 3.0 (`sunrise/3.0/moon`) | The moon's phase, how much is lit, and moonrise and moonset, beside the northern lights (`lib/moon.ts`). Every 6 hours | none |
| NVE / Varsom (`api01.nve.no`: flood, landslide by municipality; avalanche by coordinates) | **Flom-, jordskred- og snøskredvarsler** at level 2 (yellow) or more, with MET's, each linked to Varsom (`lib/warnings.ts`). Every 30 minutes. NVE asks for the credit and that the full warning is reachable: both are under the list | none |
| Kartverket (`ws.geonorge.no/kommuneinfo/v1/punkt`) | The municipality number at the position, for NVE's warnings by municipality. Kept a week | none |
| Hva koster strømmen.no (`/api/v1/prices/YYYY/MM-DD_NOx.json`) | Today's spot price by the hour (quarter hours averaged), the price now and the cheapest three hours left (`lib/power.ts`), without VAT and grid rent, as the page says. The price area is guessed from the position (an estimate, borders follow the grid) until chosen under Innstillinger › Posisjon (cookie `startside_strom`, `NO1`–`NO5`, path `/start`, a year). Every hour. Credited «Strømpriser levert av Hva koster strømmen.no» wherever a price is shown | none |
| Oslo Bysykkel (GBFS, `gbfs.urbansharing.com/oslobysykkel.no/…`) | Stations within 500 m with bikes and free docks (`lib/bikes.ts`): status every minute, stations every hour; not asked more than 25 km from Oslo. The relay sends the `Client-Identifier` it asks for. NLOD, credited under the list | none |
| GitHub | For the visitor's username (above), public repositories only: pull requests awaiting their review, their open pull requests, issues assigned to them | secret `GITHUB_TOKEN` on `startside-upstream` |

**The sun and the northern lights.** The sunrise, the sunset, the polar night and the midnight sun are worked out here (`lib/sun.ts`, NOAA's
solar formulas), with no request: the meteogram on Vær shades the dark hours and marks the sunrise and sunset (`Meteogram dark`), «Sola i dag»
gives the times, the length of the day and its change from yesterday, and the front page puts a sunrise or sunset among the hours at its time.
The northern lights (`lib/aurora.ts`) are an estimate for the coming night, three hours at a time: NOAA's Kp index against the Kp the
latitude needs (about 0 in Tromsø, 5 in Oslo), only when the sun is more than 6° under the horizon, and taken down by Yr's cloud cover. Vær
has the night in a section «Nordlys», with an `AuroraChart` of the last half day and the next days; the front page puts the best time
(«22–01 Nordlys i kveld: mulig») first in the weather whenever there is a chance tonight, also when the card shows tomorrow.

Where the data comes from (GitHub, Entur, Yr, NOAA, OpenStreetMap via Nominatim and its map tiles) is said once, under «Kilder» at the foot of Innstillinger (`components/credits.tsx`), not on each page.

GitHub is limited to public repositories, and can leave out organisations with `GITHUB_EXCLUDE_ORGS` (comma-separated, in
`wrangler.jsonc`; none now): `lib/github-query.ts`.

Pull requests are in sections by what needs you most (`lib/pulls.ts`), empty ones left out: **Blokkert, krever deg** (yours:
red checks, conflicts, changes asked for, open conversations), **Klar til merge** (approved and green), **Venter på din
review** (oldest first, with how long it has waited and how big it is), **Venter på andre**, **Ikke klar for review**
(drafts and red ones waiting for you), **Dine utkast**, and **Dine åpne** (the ones GitHub gave no status for). Pull requests
also show their status (draft, checks, review decision, conflicts, open conversations; `lib/pr-status.ts`).
The list comes from the search and the status from GitHub's GraphQL (one call for all of them, through the relay, which
allows POST only to `api.github.com/graphql`). An organisation can allow the one and block the other (SpareBank 1 blocks
GraphQL for fine-grained tokens that live longer than 366 days), so the list never depends on it: what GraphQL could not
read is shown without a status.

A source that fails shows its own error and does not take the page down.

## Time of day

The page follows the time of day in Oslo (`lib/day.ts`, the plan in `lib/plan.ts`). By default (the visitor can change all of it, below):

| | Greeting | Shown | Forecast |
| --- | --- | --- | --- |
| Morning 05–09 | God morgen | weather, pull requests (reviews and own), assigned issues | rest of today |
| Workday 09–16 | God dag | pull requests (reviews and own), assigned issues, weather | rest of today |
| Evening 16–22 | God kveld | own pull requests, weather | tomorrow |
| Night 22–05 | God natt | weather | tomorrow |
| Weekend | as above | as above without issues and discussions, own pull requests only | today by day, tomorrow in the evening |

Before the morning starts (05:00) it is still the day before, so the night after Friday is a weekday and the night after Sunday a weekend.
The time of day only decides which sections show; their order is one order, the visitor's (`order` in `prefs`, the design system's `orderSections`;
by default alerts, pull requests, issues, discussions, weather).

The visitor's settings are the cookie `startside_day` (`lib/day-settings.ts`, path `/start`, a year, `SameSite=Lax`, `Secure`; a query
string, only what differs from the default, removed when all is default): `mode=auto|off` (off: the same page all day, every chosen
section, today's weather, all pull requests), `greeting=on|off` (off: the title is «Startside»), `starts=HH:MM,HH:MM,HH:MM,HH:MM` (morgen,
arbeidsdag, kveld, natt; quarter hours, in order around the clock), `weekend=on|off` (the weekend rule above), `weekenddays=6,0` (0 is
Sunday), `show.<part>=ids`, `weather.<part>=today|tomorrow` and `pulls.<part>=all|mine`. Anything not understood is that field's default.
What is not shown is not fetched. In `next dev`, `NOW=2026-11-18T07:00:00+01:00 npm run dev` stands in for the clock;
it is never read in production. `npm test` covers the parts of the day, their edges, the clocks changing and the forecast windows.

## Issues

Issues are a `SectionGroup` too (`lib/issues.ts`), in the order of what is for you: **Tildelt deg** (any public repository),
**Du er involvert i** (the watched repositories), **Nye uten eier** (made in the last week, nobody on it) and **Nylig aktive**
(what moved lately). An issue is in the first group it belongs to, at most ten each. The watched repositories are
the visitor's, in the cookie `github_repos` (see «First visits and settings»); `GITHUB_WATCH_REPOS` in `wrangler.jsonc` (comma-separated
`owner/name`; `fremtind/jokul` now) is only the suggestion the wizard and the settings page start from. Without the cookie no repository is watched. Shown in the morning and
the workday, not in the evening or the weekend. 

**Discussions** (`lib/discussions.ts`, GraphQL only) in the watched repositories, morning and workday: **Du er med i** and
**Ubesvarte**, at most ten each; nothing is shown where there are none.

Searching on `repo:` or `org:` is blocked for the token by SpareBank 1's SAML single sign-on, while reading the repository
itself is not. So «Du er involvert i» searches by the username (`involves:<u> is:public`) and is filtered to the watched repositories, and
the repositories' own issues (for «Nye uten eier» and «Nylig aktive») and discussions are read straight from them
(`/repos/{repo}/issues`, GraphQL `repository(...)`). `GITHUB_TOKEN` must live 366 days or less (SpareBank 1 blocks GraphQL
and direct reads for longer ones).

**Discussions** (`lib/discussions.ts`, GraphQL only) in the watched repositories, morning and workday: **Du er med i**,
**Ubesvarte spørsmål** (only categories with answers can be unanswered) and **Nylig aktive**, at most ten each.

## Icons

The page asks the design system (5.2) for icons by what they mean (`<Icon name="failure" />`, `icon` on sections and rows,
`StatusLine`): section titles, the kind of each row (pull request, draft, issue, discussion, the weather), every status
(`lib/pr-status.ts` gives each label its icon) and the position button. The weather's icon is chosen from Yr's symbol code
(`weatherIcon` in `lib/forecast.ts`).

## Live updates

An open page keeps itself fresh (`components/refresh.tsx`): every 60 seconds, and at once when the window comes back into view
after more than half that, it asks the server for the page again (`router.refresh()`), so the lists, the weather and the
time of day change without a reload and without losing the page's state. Nothing runs while the window is hidden or the
device is offline. «oppdatert 19:27» under the title is when the server last built the page. If the Access session has
run out, the refresh ends at the login, as a reload would.

**Why a page does not wait for GitHub.** Next's own `revalidate` keeps nothing on Workers without an incremental cache, so every source (`lib/upstream.ts`) is kept in the edge cache
instead: good for its `revalidate` (60 s for GitHub), then shown at once for ten minutes more, as it was, while it is asked for anew in the background (`lib/cache-policy.ts`).
A renewal or a click on GitHub therefore never waits for GitHub unless the answer is older than that; what is shown can be up to a renewal behind. On the GitHub pages the frame, the
navigation and the pages under it are sent first and the lists and counts follow (`StreamedSection`), so the click answers at once. The pull requests are one `SectionGroup` of the design system
(5.1), so the grid places them as one part.

## Position

Without a position, Transport and Vær show a card (`PositionPermission` in `components/position.tsx`, the design system's `PermissionCard`)
that says what the position is for and how the browser stands: «Bruk min posisjon» while it can be asked, waiting while it asks, the way to
allow it in the browser's settings when it said no, and what the page shows without it (Vær: the place in the settings; Transport: nothing).
With a position and the browser still allowing it, the card is gone and the compact control next to the title is left. «Bruk min posisjon» asks the browser for the device's position, on a tap and never on load. The position
is kept in the cookie `startside-pos` (`lat,lon`, three decimals, about a hundred metres, path `/start`, a year) and read by the
server, which finds the nearest stations for it (Transport) and fetches the forecast for it to two decimals (about a kilometre, so
the cache keeps one per square kilometre) and names the place (OpenStreetMap's Nominatim, through the relay, cached for a
day). Once the browser has allowed it, the page follows the device and refreshes when it has moved about two hundred metres.
«Bruk standardsted» removes the cookie and goes back to `WEATHER_*` (and Transport has nothing to show). The position is used for
the stations, the forecast and what goes with it (warnings, radar, air, moon, the price area, the city bikes) only; GitHub and the rest do not see it. `lib/position.ts` is tested.

Who would rather not share the device's position searches for a place under Innstillinger › Posisjon (`?sted=`, a GET form; the card on Transport and Vær links there):
OpenStreetMap's Nominatim, through the relay, on a submitted search only (never as one types, as its terms ask), cached for a day (`searchPlaces` in
`lib/place.ts`, the answer read by `placesFrom` in `lib/place-search.ts`, tested). The chosen place (`sted=lat,lon|name` to `/start/api/innstillinger`) is kept as the
position in `startside-pos` and its name in `startside-sted` (a year); while that is there, the forecast is named after it and the page does not follow the device.
«Bruk min posisjon» or «Bruk standardsted» removes it.

## First visits

What a reader has seen is kept in the cookie `seen` (the design system's `lib/onboarding`, path `/start`), read on the server so nothing flashes:
a short intro on the front page (left out while the username form is shown: the form is the introduction then), Transport, Vær and the pages of a
pull request, an issue or a discussion (`intro-front`, `intro-transport`, `intro-weather`, `intro-detail`), each gone for good once dismissed; «Nytt»
on Transport in the navigation until `TRANSPORT_NEW_UNTIL` (`lib/visitor.ts`) or until Transport has been opened (`new-transport`; the time is the
server's); and the offer to install the app on the front page (`install`). An empty list says what would be in it and offers one way on.

## First visits and settings

On a first visit any page (not Innstillinger, the API or the offline page) opens over it the design system's **first-run wizard** (`FirstRun` +
`FirstRunEnhancer`, `components/first-run.tsx`), drawn open by the server until `first-run@1` is in `seen`, so nothing flashes; the intros and the
install offer wait until it is done. One question per step, nine steps: welcome · GitHub username · watched repositories (prefilled with
`GITHUB_WATCH_REPOS`, at most 20) · position · the front page's sections · theme · effects · tilt (the light follows the phone) · install. **Innstillinger** (`app/innstillinger/`) has the same fields
(`components/settings-fields.tsx`) on subpages, one small form each (`components/settings-subpage.tsx`, `?lagret=1` shows «Lagret»), plus the order
(`ReorderList`) and the time of day; links to the old long page's anchors (`#tider`, `#rekkefolge`, …) are sent on to the subpage in the browser.

Both post to `/start/api/innstillinger` (`app/api/innstillinger/route.ts`; pure parts in `lib/settings.ts`, tested), a plain form that works without
JavaScript:

- `validate=<step>` (the wizard with JavaScript, before «Neste») answers `{ "errors": { "<field>": "<melding>" } }` and keeps nothing.
- Otherwise it keeps what is valid: `prefs` (the design system's `lib/preferences`: `theme`, `effects`, `tilt`, `sections`; not `HttpOnly`, the
  page's scripts read it), `github_user` (checked as for `/api/brukernavn`) and `github_repos` (each `owner/name` must be a public repository,
  `GET /repos/{repo}` with `private: false`; `HttpOnly`). It marks the wizard seen and answers 303 to `back` (the wizard sends none, so the page it
  was opened on, from the referrer), with `?lagret=1` for a settings subpage.
- What GitHub did not have goes back at its step: `?forste-gang=<step>#first-run-<step>` from the wizard (it opens there again), `#github` (or `#repos`, `#tider`) on the
  settings subpage, with the errors and what was written in the short-lived cookie `innstillinger-feil` (two minutes, `HttpOnly`). The wizard is not
  marked seen then.
- `skip=1` («Hopp over») only marks it seen; `rerun=1` («Vis introen igjen») removes it from `seen` and goes back.
- `order=<id>,<id>` keeps the front page's order in `prefs` (`order=`). `move=<id>:up|down` (the reorder buttons without JavaScript) moves
  one section in the submitted `order` (or the saved one), keeps only that, and goes back to `back` (`/start/innstillinger/forside`) at `#rekkefolge`.
- With `day=1` (`/start/innstillinger/tid` and its subpages, each sending only its own fields; the wizard never sends it) it keeps `startside_day` (`readDayForm`): `mode`,
  `greeting`, `weekend`, `weather.<part>`, `pulls.<part>` (absent: unchanged), `weekenddays` and `show.<part>` (checkboxes, several values; read only when
  the form says it has them, `has=weekenddays` / `has=show`, and then none ticked is none, so never disable them), and `starts.morgen`, `starts.arbeidsdag`, `starts.kveld`, `starts.natt` (`HH:MM`). Starts that are
  not quarter hours or not in order are not kept: the error goes back as `starts` in `innstillinger-feil`, to `tid/deler#tider`.

`<html>` gets `htmlAttributes(prefs)` in `app/layout.tsx` (`data-theme`, `data-effects`, `data-tilt`), and the front page shows only the chosen
sections (`chosenSections` in `lib/plan.ts`; all ticked is stored as none chosen, so new sections show up). With `MOCK_DATA=1` any username and
repository is taken.

## How it runs

- **`startside`** (`worker.mjs`, `wrangler.jsonc`): the page, on the route `lmfaole.party/start*`. The static files are
  embedded in the script (`scripts/embed-assets.mjs`), so a deploy is one upload.
- **`startside-upstream`** (`upstream/`): a relay. A Worker on the `lmfaole.party` zone gets 525 on every
  fetch to an origin outside Cloudflare, so the page fetches Yr and GitHub through it: through the **service binding** `UPSTREAM`
  (`services` in `wrangler.jsonc`, a call inside Cloudflare, `lib/relay.ts`). It has no public address (`workers_dev: false`); `lib/relay.ts`
  still takes an address `UPSTREAM_URL` for `next dev` against a relay, but the Worker sets none. The deploy puts the relay up first, so the binding always has a Worker to point to. It takes
  only GET, only those hosts (MET, GitHub, Nominatim, Entur, Spotify, NOAA, hvakosterstrommen.no, NVE, Kartverket, Oslo Bysykkel's GBFS, which it gives the `Client-Identifier` `lmfaole-startside`), and only with the shared secret `UPSTREAM_KEY` (set on both Workers). It holds `GITHUB_TOKEN`. It passes `If-Modified-Since` on and `Expires`, `Last-Modified` and a 304 back, so a source with nothing new need not send it again.

In `next dev` there is no `UPSTREAM_URL`, so the page fetches the sources directly.

The relay still checks the shared key on every call, though only the binding reaches it now: a second lock should it ever get an address again.
Nothing else uses it (the other lmfaole apps have relays of their own).

### Snapshot (scheduled job and KV)

Every 15 minutes (called by `workers/scheduler`, the account's one Cron Trigger, through a service binding) the `scheduled` handler in `worker.mjs` fetches what every visitor shares into Workers KV
(binding `SNAPSHOT`, `lib/snapshot.ts`): MET's forecast for `WEATHER_LAT`/`WEATHER_LON`, NOAA's Kp index, and for the first two of
`GITHUB_WATCH_REPOS` the repository and its open issues (only while the repository says it is public; a private one is never kept). Each source is asked no more often than its `revalidate`, with a 10 s limit. A body
is written only when its hash changed (or every third day, to renew its week-long expiry), at most four a run, plus one small index of when
each was checked: at most 96 × 5 = 480 writes a day, far under the free 1000. A source that fails keeps what the snapshot had.

A page (`upstream()` in `lib/upstream.ts`) looks in the edge cache first, then in the snapshot (an entry checked within its `revalidate`, at
least the 15 minutes to the next run, is used at once and put in the edge cache, and asked anew behind it when older than its `revalidate`), then asks the source; when the source fails, a snapshot
up to a day old stands in. What depends on the visitor (their position, their GitHub name) is never in the snapshot. The handler has no
address: Cloudflare calls it on the schedule, and no request reaches it (`npm run preview` can, with `wrangler dev --test-scheduled` and `/__scheduled`).

The AI summaries are not made by the cron: each is made from one pull request's, issue's or discussion's own page (`lib/detail.ts`), which
the cron cannot guess, and the edge cache they are kept in is per data centre, so the cron's would not reach the visitor's. They already
stream in after the page and are made once per version of the text.

Served at `lmfaole.party/start` through a Cloudflare route (`wrangler.jsonc`), with `basePath: "/start"` in `next.config.ts`.

## Brand

Startside is one app in the lmfaole family (design system, «Foundations / Brand», skill `designsystem-brand`), endorsed: its own name, hue
and glyph, with «lmfaole» quietly after the name. The hue is **teal** (`brandAttributes("teal")` on `<html>` in `app/layout.tsx`), the
glyph **sunrise**: the `NavBar` opens its rail with the `Wordmark` («Startside · lmfaole», `components/shell.tsx`), the first run shows the
`AppMark` (`components/first-run.tsx`; how it moves under «Motion and haptics» below), and the icons are drawn from the same glyph (`npm run icons`). The hue goes only where the design
system's components put it: the current place in the menu, the focus ring, the one primary button and a ticked checkbox or radio. Never in
the content, the charts, the departure boards, the weather or a GitHub state, and never with a `className`.

The brand platform (approved):

- **Purpose:** the morning in one look: what to do, what the weather is, when to leave.
- **Position:** for a developer starting the day, instead of five tabs: calm, brisk and useful before coffee.
- **Personality:** calm, not sleepy; brisk, not curt; practical, not bare.
- **Voice:** plain bokmål, «du», short sentences, no exclamation marks. Welcome «God morgen. Her er dagen din.»; empty «Ingen pull requests
  venter på deg.»; error «Fikk ikke hentet avgangene. Viser de siste vi hadde.»; success «Lagret.»
- **Distinctive assets:** the hue `teal` (morning and clear; `amber` is the late departure and the warning, `blue` the tram and the cold), the
  glyph `sunrise` on the family's rounded tile, the name «Startside», the greeting at the top of the morning.
- **Signature moments:** the first run; the greeting and the weather stage at the top of the morning.
- **Do:** keep transit, weather and GitHub states in their own colours. **Don't:** use teal for a line, a temperature or a check.

### Motion and haptics

The hue also sets the motion accent (design system, «Foundations / Motion» §9): calm and rising, the sun clearing its horizon with no
overshoot. It plays only in the signature moments, each once, through the design system's components, never an animation of our own:

- **The first run:** `FirstRun glyph="sunrise"` reveals the mark on the first step, and «Ferdig» shows `FirstRunFinish`, a drawn check and
  «Klar for dagen» (`finishLabel`), while the next page loads.
- **The empty front page:** «Ingenting å vise nå» is `EmptyState glyph="sunrise"`, the mark rising once. The other empty lists keep their icon.
- **A change of page:** `transitionAttributes()` on `<html>` (`app/layout.tsx`) names the `NavBar`'s current place and `<main>`, so the
  current place glides to the new one and the page rises in. The menu's links are plain `<a>`, so the browser's cross-document transition
  does it; `components/page-transition.tsx` wraps the page in React's `<ViewTransition>`, keyed by the path, for a change of page inside
  Next. A refresh of the same page (every minute, a new position) is an update, which does not animate (`update="none"`), so the departure
  board and the weather are redrawn in place.
- No `AppMark loading`: Startside has no wait of its own over a second (a source that is slow streams into its section).

Without view transitions the page just changes, and under reduced motion nothing of it moves.

Haptics (design system, «Foundations / Haptics»): `<Haptics />` once in `app/layout.tsx` plays the controls marked `data-haptic`, and the
first run buzzes its steps, a failed step and «Ferdig» (the sunrise signature). The reader turns it off with «Vibrasjon» (`HapticsSetting`)
under Innstillinger › Utseende › Effekter, kept in this browser. Startside has no destructive confirm, so nothing is marked `warning` yet;
one that deletes gets `data-haptic="warning"`. Vibration works where the browser can (Chrome on Android); Safari, iOS and Firefox feel nothing.

## App

The page installs as an app (PWA): `app/manifest.ts`, the icons (`public/icons`, `app/icon.svg`, `app/icon.png`, `app/apple-icon.png`,
drawn by the design system with `npm run icons` (`designsystem-app-icons --hue teal --glyph sunrise`; Playwright is not a dependency, so
it uses a global one or `PLAYWRIGHT=<path to playwright>`); the brand's teal is the manifest's colours, since Android colours the system bars from the manifest, which has one colour, and the
`theme-color` in light and dark, `viewport.themeColor` in `app/layout.tsx`), and a service worker (`app/sw.js/route.ts`) that keeps the built files and the last copy
of the page, so it opens without network (registered by `components/service-worker.tsx`). Installing is the browser's own
(the install icon in the address bar, «Legg til på Hjem-skjerm»). The manifest and icons are outside Cloudflare Access (the application «Startside –
app-filer», a bypass policy), since browsers fetch them without the login cookie.

## Deploy

`.github/workflows/startside.yml` (at the repository's root) builds and type-checks every push. On the default branch it also deploys both Workers, the relay first
(the page's service binding points to it), once the repository has the secrets `CLOUDFLARE_API_TOKEN` (Workers Scripts: Edit, Workers
Routes: Edit on `lmfaole.party`, **Workers KV Storage: Edit**, for the snapshot's namespace, which `wrangler deploy` creates the first time
since `kv_namespaces` has no id) and `CLOUDFLARE_ACCOUNT_ID`; without them the run only builds. `npm run deploy` deploys the page from a machine.

Bindings and settings of `startside` (`wrangler.jsonc`): `AI` (Workers AI), `UPSTREAM` (the relay), `SNAPSHOT` (KV), the cron
`*/15 * * * *`, and the vars `AI_GATEWAY` (`default`), `IMAGE_TRANSFORMS` (`0`) and `CF_BEACON_TOKEN` (empty). For the owner, in the dashboard:

- **AI Gateway:** nothing for `default` (created on the first call); for another name, create it and set `AI_GATEWAY`.
- **Image Transformations:** turn it on for `lmfaole.party` (Images › Transformations), allow the origins `github.com` and
  `avatars.githubusercontent.com` (GitHub's `<login>.png` sends the picture from there), then set `IMAGE_TRANSFORMS` to `1`.
- **Web Analytics:** add the site and set its 32-character token as `CF_BEACON_TOKEN`. The beacon (`WebAnalytics` from the design system, in
  `app/layout.tsx`) counts without cookies; with the whole page behind Access, it counts only the owner, so it says little more than that the page is used.

Secrets on the Workers, set with `wrangler secret put` or in the dashboard as **Secret** (not as text):

| Worker | Secret |
| --- | --- |
| `startside` | `UPSTREAM_KEY` |
| `startside-upstream` | `UPSTREAM_KEY` (the same), `GITHUB_TOKEN` (read access to pull requests and issues) |

## Develop

```sh
cp .dev.vars.example .dev.vars   # add GITHUB_TOKEN (or export it)
npm run dev
npm run preview                  # the Worker build, locally
npm run deploy
wrangler secret put GITHUB_TOKEN
```

### Mock data (no keys, no network)

`MOCK_DATA=1` makes every upstream (GitHub, Entur, Yr, Nominatim, and the rest made up in `lib/mock.ts`: a yellow MET wind warning and a yellow NVE landslide warning for Oslo, rain from the radar in 25 minutes, moderate air in the afternoon, the moon's real phase, a UV index peaking at 4, a day of prices, and Oslo Bysykkel stations near Grünerløkka and the centre) answer from `lib/mock.ts`, at the one seam `fetchSource()` in `lib/upstream.ts`
(the AI summary is a canned text); the edge cache is skipped, so mock answers never reach a real run. The answers are real, public ones captured by
`node scripts/fetch-mock-data.mjs` (public data only; `fremtind/jokul` and `navikt/aksel` on GitHub with the timelines of their pull requests and issues, a merged
pull request, a closed issue and an answered discussion, Yr for Grünerløkka, Entur's nearest stations for Grünerløkka and the centre (the mock answers any position with the closer of the two, Grünerløkka dressed with a delay, a cancellation and trains), and Nominatim) into `lib/mock-data/*.json`, committed (small, and needed to run offline). Their timestamps are moved to
now when served. Rerun the script to refresh them; `github` needs about 100 requests and the threads of discussions need GraphQL, so give it a token for that run only:
`GITHUB_TOKEN=$(gh auth token) node scripts/fetch-mock-data.mjs github` (it is sent, never saved). Put it in `.env.local` (read by `next dev`; gitignored)
and/or `.dev.vars`, with `GITHUB_WATCH_REPOS=fremtind/jokul,navikt/aksel` for the watched-repository parts. Unset, nothing changes. Never set it in production.
The app is served under the base path, so the start page is <http://localhost:3000/start> (`/` is 404 by design). Give any GitHub username in the form (or `curl -b github_user=octocat`); the mock's own login (`lmfaole`) also shows the alerts.

The page shows personal data, so `lmfaole.party/start` is behind Cloudflare Access (the application «Startside»): only the owner's address gets in, with a login code by e-mail.

The Worker does not rely on Access alone: `worker.mjs` checks the token Access signs for every request (`Cf-Access-Jwt-Assertion`, RS256, with Access's keys from
`<team>/cdn-cgi/access/certs`, kept for an hour and fetched through the relay if need be; `iss` and `aud` from `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` in `wrangler.jsonc`; `lib/access.ts`)
and answers 403 without a good one. Only what Access lets through without a login is open: `/start/manifest.webmanifest`, `/start/icon.png`, `/start/apple-icon.png`,
`/start/icons/*` and the built files under `/start/_next/static/` (no personal data). `npm run preview` has no Access in front: put `ACCESS_SKIP=1` in `.dev.vars`
(never in `wrangler.jsonc` or as a secret). The detail pages also refuse a pull request, issue or discussion in a private repository, whatever the token can read.
Every answer has a Content-Security-Policy (`lib/csp.ts`: no framing, no `<object>`, forms only to the page and Access, pictures only from the page, GitHub and OpenStreetMap's tiles,
so a tracking pixel in a GitHub text is not fetched; scripts only the page's own and Web Analytics' beacon, connections only to the page and the beacon's endpoint, `WEB_ANALYTICS_CSP`), `X-Frame-Options: DENY`, `nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The relay compares its key in constant time,
passes GraphQL queries only (no `mutation` or `subscription`) and takes bodies up to 64 KB.

## Add a source

One file in `lib/` that fetches and shapes the data, one async server component in `app/page.tsx` that renders it with
the design system's components, wrapped so a failure stays in its own section.
