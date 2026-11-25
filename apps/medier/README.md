# medier

Musikk, film, TV og spill: en side på Cloudflare Workers, <https://lmfaole.party/medier/>, laget med designsystemet
[`@lmfaole/designsystem`](https://github.com/lmfaole/designsystem).

## How it works

- **Whose data.** The owner's, the same for every visitor: the usernames are fixed, public `vars` in `wrangler.jsonc` (`LASTFM_USER`, `TRAKT_USER`, `LISTENBRAINZ_USER`, `STEAM_USER`, a SteamID or custom name,
  and `RETROACHIEVEMENTS_USER`), read by `src/lib/users.ts` (`usersFrom`) and `owner()` in `src/lib/runtime.ts`, and threaded through every loader (`forUsers`). There is no form and no setting of a visitor's.
  A service whose username is empty has no part of the site: its pages answer 404 and its place in the bar and its sections on the front page are left out. Musikk and its pages need Last.fm (Musikk, its Historikk,
  the front page and what plays now take ListenBrainz's plays where there is no Last.fm username; the rest of the music's pages stay Last.fm's), Film and TV and theirs Trakt, Spill Steam or RetroAchievements (each only where the site has its key).
- **One setup.** The front page shows its sections in one fixed order (what plays now, Musikk, Film, TV, Artister, Spill), each where its username is set, in the default look (the design system's theme,
  effects and tilt as they come); there are no settings, no first-run wizard and no page intros. The only thing kept in the browser is whether the install offer (`InstallPrompt`, at the foot of the
  front page, `src/components/install-offer.tsx`) was dismissed: the design system's `seen` cookie (`Path=/medier/`), read by the island in the browser and never by the server.
  An empty list says why (`EmptyState`). Only public data is shown: the site's keys are used, never a sign-in.
- **Limits and caching.** Each visitor (by address) gets 60 pages and API calls and 120 server islands a minute (Workers' rate limits in `wrangler.jsonc`, `src/lib/guard.ts`), then «429 For mange forespørsler»; every answer has the security headers
  (`frame-ancestors 'none'` and the rest, `src/lib/guard.ts`, `public/_headers`). A «not found» from a source is kept ten minutes like an answer, so it is not asked again on every page (`src/lib/negative-cache.ts`).
  As every page is the same for everyone, a page (and a server island) that went well is kept for a minute in the Worker's edge cache (`caches.default`) and answered from it with `X-Medier-Cache: hit`
  (`src/middleware.ts`; what is kept is decided by `src/lib/page-cache.ts`, with a test: only a GET of a page, never `/api/…`, a built file, an error, a redirect or an answer with a cookie). A page is
  `Cache-Control: public, max-age=0, s-maxage=60`; `/api/now/` is `no-store`. The edge cache is off under `astro dev`.
- A page asks its sources when it is asked for: Last.fm (plays and what plays now), Trakt (viewings), TMDB (posters), Spotify (artists' pictures and links, found by name) and MusicBrainz (which of an artist's releases are albums, its newest release and its links; Wikidata for its Wikipedia article in Norwegian). Each answer is kept in the Worker's cache for a short while
  (`TTL` in `src/lib/sources.ts`: 15 s for what plays now, a minute for the plays, five minutes for the viewings, a month for a poster), so a page is quick and the sources are asked little.
  A source that is down, or not set up, leaves its part out; the rest of the page shows.
- **Pictures and a little more.** An artist's page has its picture and a link to it from Spotify (found by searching the name, and only used where an artist is named exactly the same: a wrong
  picture is worse than none), the tags, the listeners and the start of the text from Last.fm, and its albums, and the top-artist lists have the pictures too. Last.fm's `artist.gettopalbums` ranks every
  release (singles, EPs, live albums, compilations, and each deluxe edition apart), so MusicBrainz says which are albums (a release group of primary type Album with no secondary type, searched for by the
  MusicBrainz id Last.fm gives, else by name; kept for a week, `src/lib/musicbrainz.ts`), and `src/lib/albums.ts` keeps those, each edition of one as one row with the plays of them all. Where MusicBrainz
  does not answer (it allows one ask a second) or does not know the artist, the titles that say they are something else (« - Single», «EP», «Live at», «Greatest Hits», «Remixes», «Soundtrack»…) are left out instead.
  Two server islands of the artist's page ask MusicBrainz more, each kept for a week (`src/lib/musicbrainz-artist.ts`): «Siste utgivelse» (or «Neste utgivelse»), the newest album, single or EP (no remix, live or compilation) from the last two
  years or coming, said as what it is and when («Ny singel · 9. oktober 2026», «Album · Kommer 14. mars»), linked to its album page where there is one; and the links on (its own site, Wikipedia, Bandcamp, YouTube, Instagram,
  Discogs) by the artist's MusicBrainz id, with the Wikipedia article in bokmål (else nynorsk, else English) from Wikidata. A film's or a show's page has the plot (in
  Norwegian where TMDB has it), genres, length or seasons and TMDB's vote, from the same answer as the poster. An album and a track have pages too, `/musikk/album/<artist>--<album>/` and `/musikk/spor/<artist>--<track>/`, for what is among the recent plays (like an artist): the artist, the album or the track, how long it is, the tags,
  how many listen and how many times it has been played in all (Last.fm), the tracks of an album in order (those that have been played link to their page), and from Spotify, found by name and artist, the day it came out, the
  number of tracks and the link. An album's head is large, like an artist's, its sleeve as large (a CD in its jewel case when the first medium of its first release is a CD of any kind, read only from the MusicBrainz answer already kept, else a record, `discOf` in `src/lib/musicbrainz-release.ts`), with the owner's plays, about how long it has been listened to and its share of the plays of the artist as its figures; each thing is said once on the page (the facts leave out the artist, the number of tracks and the plays, the recent plays name only the song and when), and the tracks come right after the text about it. An album's page adds, each in a server island: the plays of it over time (one shared weekly album chart a stretch, as an artist's), the days they played it in the last six months (a calendar from every play of those months, the pages the history's month pages keep: whole months only, newest first, at most 40 pages an ask), their plays of each track (from the top thousand songs the artist's page asks for); and from MusicBrainz (up to three asks a second apart, kept for a month) the label and country of its first release, its other editions, its credits (produced, written, sung and played by) and its place among the artist's studio albums, as a chart of the plays of each (their thousand most played albums of all time, one shared answer) with this one picked out, and the ones before and after. Every song in a list links to its page and its album to the album's. A title's page also names who played in it (the first twelve, each with the part) and who made it (directing, writing, music, photography, and for a show who created it), from the same TMDB answer
  (`append_to_response=credits`); each person has a page of their own, `/personer/<TMDB id>-<name>/`, with their picture, dates and life story from TMDB (in Norwegian where TMDB has it) and the films and
  shows seen that they are named in. A person has a page only while a title seen names them. Spotify content links back to Spotify; its mark (small, one colour), what each source gives and
  TMDB's statement are under «Kilder» at the foot of the front page, not on every page (a page only says it when a source did not answer). Everything is kept for a day at most (a poster and a title's facts for a month) and nothing is stored.
- There is no database and nothing is committed as data. `src/lib/` reads the APIs' answers (pure, with tests); `src/components/` and `src/pages/` show them.
- A Worker on the lmfaole.party zone cannot reach origins outside Cloudflare (every such fetch ends in 525), so the site asks through a small relay, `upstream/` (the Worker `medier-upstream`):
  only those hosts (and Wikidata; MusicBrainz's with the site's name as the User-Agent, as it asks), only GET (and Spotify's token), only with a key the site and the relay share. The site reaches it through a
  **service binding** (`UPSTREAM` in `wrangler.jsonc`), Worker to Worker and not over the internet; the key is still asked for. The relay has no public address (`workers_dev` is off); `UPSTREAM_URL` is only the way where there is no binding (a relay run elsewhere)
  (`src/lib/route.ts`, with a test).

## Cloudflare

What the site uses of Cloudflare besides the Worker, its cache and its rate limits:

- **Service bindings.** `UPSTREAM` → `medier-upstream` (the relay, deployed before the site by the workflow and by `npm run deploy`, so the binding always has a Worker to go to).
- **Image Transformations** (`IMAGE_TRANSFORMS` in `wrangler.jsonc`'s `vars`, `"0"` until it is turned on). With `"1"`, every cover, poster, portrait and game picture is the largest the source gives, made by
  the zone at image widths from 64 to the source's own (`/cdn-cgi/image/width=…,fit=scale-down,format=auto/<address>`, the design system's `lib/cloudflare`; `src/lib/image-sources.ts`), and each `Picture`
  takes the width it is drawn at, so a thumbnail in a list is a small AVIF or WebP and a page's head a large one. The pictures drawn in WebGL (the backdrop of a head, the sleeves, the disc) are then this site's
  own addresses, so they need no CORS from the source. The Content-Security-Policy does not limit pictures (`img-src` is not set), so nothing there changes. Achievement icons and streaming services' logos
  are small already and are left as they are.
- **Web Analytics** (`CF_BEACON_TOKEN` in `vars`, empty until set; the token is public, it is in every page). The root layout draws the design system's `WebAnalytics` on the server, as a plain script tag
  with no island; nothing is drawn without a token, or on the page made ahead of time (`/offline/`). The Content-Security-Policy (`src/lib/guard.ts`) allows scripts only from the site itself (Astro's
  are inline or under `/_astro/`) and the beacon, and connections only to the site and to where the beacon reports (`WEB_ANALYTICS_CSP`).
- **Not used, on purpose.** No Cron Trigger or KV: a page is kept a minute at the edge when it is asked for, and the rest is asked for by a page about one thing (an artist, a film), so there is no
  set worth refreshing on a schedule, and warming `caches.default` from a cron only warms the one data centre it runs in. No Workers AI: the texts shown (Last.fm's, TMDB's, Wikipedia's) are
  short already, and a summary of them would be a feature of its own, slower pages and one more thing to keep right.
- What plays now is Last.fm's «now playing» (a scrobble of whatever plays) for the owner's username; Spotify's «currently playing» is not used.

## Sources

Each is asked through the relay (its host is in `GET_HOSTS` in `upstream/worker.ts`) and kept for its `TTL` (`src/lib/sources.ts`); one that is not set up, or has no username, leaves its part out. What each gives and the attribution it asks for are also under «Kilder» at the foot of the front page (`src/components/credits.tsx`).

| Source | What | Key or username | Kept | Code |
| --- | --- | --- | --- | --- |
| Last.fm | Plays, what plays now, top artists, artist, album and track facts | `LASTFM_API_KEY`; `LASTFM_USER` | 15 s – a day | `lastfm.ts` |
| ListenBrainz | Where there is no Last.fm username: the last 50 listens, what plays now and the month's top artists, read into Last.fm's shape (covers from the Cover Art Archive), asked one after another a second apart with the site's User-Agent, as it asks. Not from it: the pages of an artist, an album or a song, the weeks and months (Wrapped) and the trend, which stay Last.fm's | `LISTENBRAINZ_USER` | 15 s – an hour | `listenbrainz.ts` |
| Trakt | Films and episodes seen | `TRAKT_CLIENT_ID`; `TRAKT_USER` | 5 min | `trakt.ts` |
| TMDB | Posters, facts, credits, people | `TMDB_API_KEY` | a month | `tmdb.ts` |
| TMDB (JustWatch's data) | «Hvor den kan ses» on a film's or a show's page: in Norway (`NO`) to stream (`flatrate`), rent and buy, with the services' logos and the link to TMDB's page of them; «Strømmedata fra JustWatch» stands under it, as TMDB asks | `TMDB_API_KEY` | a day | `watch-providers.ts` |
| Spotify | Artists' pictures, links | `SPOTIFY_*` | a day | `spotify.ts` |
| MusicBrainz, Wikidata | Albums, releases, credits, links | none | a week – a month | `musicbrainz*.ts` |
| Steam | «Spill» (`/spill/`, and a row on the front page), one list with RetroAchievements' (`played-games.ts`): «Nylig spilt», the games of both played the last two weeks, the last played first, and «Mest spilt», both by the hours, each row with where it was played (Steam's machine, or the console), its wide picture and a link to its page. A game's page is the same whichever service (`GameDetail`, `GameView`): the box in its case, the time in all (and the last two weeks), the achievements, the platform, maker, publisher and day out beside, when it was last played; in the main column the owner's own first (the last five achievements unlocked, the three rarest with the share of players who have them where the five do not show them already, their numbers in the game, the time on each machine), then its text, pictures, news and DLC, and a link to the service. A Steam game's achievements are all on `/spill/<app id>-<name>/prestasjoner/` (`achievement-view.ts`): the unlocked, the last first, and the ones still to get, the most common first. Steam's (`/spill/<app id>-<name>/`): the library picture in a DVD case, or a handheld game card's case where it is played most on a Steam Deck, and the store's genres, text, Metacritic and price in Norway; in the bar where the site has the key and a username | `STEAM_API_KEY` (a GitHub secret, uploaded with the deploy); `STEAM_USER`, the custom name in the profile's address or its SteamID, with public game details | 10 min – a month (the store's page a day, the achievements ten minutes) | `steam.ts` |
| Steam (more) | Loaders in `runtime.ts`, used by `/spill/` (playing now, wishlist on sale), `/spill/profil/` (level, badges), `/spill/onskeliste/` (on sale, whole wishlist), and the game pages (reviews, players, Deck, news, DLC, own numbers, media): `steamPresence` (online, what is played now), `steamBadges` (level, experience, badges with games' and community badges' names), `gameStats` (the user's own numbers in a game, labelled by its schema or by the achievement it counts towards, one with no name left out; most games have none), `wishlist` (the wishlist with names and Norwegian prices, and what is on sale), and `gameExtras` (reviews, players now, news with patch notes apart, the Steam Deck report and the DLC). `game()`'s store page (`StoreApp`) also has the screenshots, trailers (HLS/DASH), hero and logo, platforms, categories and controller support, from the one `appdetails` answer | as Steam's; the wishlist, `GetItems` and the store's prices, reviews and Deck report need no key | a minute (presence) – a week (names, Deck); prices and wishlist an hour, players two minutes | `steam-profile.ts`, `steam-store.ts`, `steam-wishlist.ts` |
| RetroAchievements | The old console games played on emulators, in «Spill»'s lists beside Steam's, with their title screens and their time played (only a game's own answer says it: asked for the twelve played last, kept ten minutes). A game's page (`/spill/retro/<game id>-<name>/`) is Steam's kind: the box in its console's own case where it has one (a cardboard box with the NES's, the Super Nintendo's, the Nintendo 64's, the Game Boy's or the Game Boy Advance's cartridge, a black clamshell with the Mega Drive's, a jewel case with the first PlayStation's black disc), else a game card's case, or a DVD case for a disc console's; and the points, the award and how many have played it | `RETROACHIEVEMENTS_API_KEY` (a GitHub secret, uploaded with the deploy); `RETROACHIEVEMENTS_USER` | 10 min – a day | `retroachievements.ts` |
| setlist.fm | An artist's last concerts (date, venue, city) and the newest setlist, found by the artist's MusicBrainz id (from Last.fm); shown as setlist.fm writes it, each linked to its page there, as its terms ask | `SETLISTFM_API_KEY` (a GitHub secret, uploaded with the deploy) | a day | `setlistfm.ts` |

## Music and film, apart

Music (Last.fm), films and TV (both Trakt: the films, and the shows' episodes) are kept apart: each has its overview, its own Historikk and its own Wrapped, under its own address (`src/lib/media.ts`), reached from the foot of the section each continues (`PageSection continues`: «Siste avspillinger» is a card ending in «Se hele lyttehistorikken», «Mest spilt siste måned» in «Se månedens Wrapped», and on Film a «Denne måneden» card of the month's numbers leads to its Wrapped), never from the bar. The front page's sections lead on to each history, and «Mest spilt» to the music's Wrapped.

| | Musikk | Film | TV |
| --- | --- | --- | --- |
| Overview | `/musikk/` | `/film/` | `/tv/` |
| A page of one | `/musikk/<artist>/` (and `album/`, `spor/`) | `/film/<slug>/` | `/tv/<slug>/` (a show) |
| History | `/musikk/historikk/` | `/film/historikk/` | `/tv/historikk/` |
| Week | `/musikk/uke/<year>-<week>/` | `/film/uke/<year>-<week>/` | `/tv/uke/<year>-<week>/` |
| Month | `/musikk/maned/<year>-<month>/` | `/film/maned/<year>-<month>/` | `/tv/maned/<year>-<month>/` |

`/<medium>/uke/` and `/<medium>/maned/` open the last week or month that is over. Old addresses are moved for good (301) in one step, with the week or month and the query kept: `/historikk/`, `/uke/…` and `/maned/…` to the music's, and `/film-og-tv/` with its `historikk/`, `uke/…` and `maned/…` to the film's (`oldAddress`, by `src/middleware.ts`). An old page of a title, `/film-og-tv/<slug>/`, goes to `/film/<slug>/` or `/tv/<slug>/` by whether the history has it as a film or a show (a «-film» or «-serie» after the slug, from when the two shared a place, is read too), else to the film's (`src/pages/film-og-tv/[slug].astro`).
A page of music needs only the Last.fm username and asks only Last.fm; one of film or TV only the Trakt username, and a wrapped asks Trakt only for the films or only for the episodes (`loadPeriod(…, medium)`). A person's page (`/personer/…`) is under Film or TV by what they were in first.
The front page has a section for each (`film`, `tv`).

## History

The Historikk of each medium has its plays, its films or its episodes on a timeline (the design system's `Timeline`), newest first under a heading for each day, with a run of one album's songs or one show's episodes folded away («Vis 9 spor til»), and, for music, the song playing now first, marked as going on. A song links to its page here, a viewing to the film's or the show's. Above it are the **sessions** of the last two days (`DurationBars`): plays or viewings less than 30 minutes apart are one session, a song counted at a typical 3½ minutes and a viewing at its film's runtime (or 45 minutes for an episode, 110 for a film TMDB has none for), up to when Trakt marked it seen. It is made of what the front page already asks for (the last 50 plays or viewings), by `src/lib/timeline.ts`. The front page's Musikk, Film and TV link to their own.

## The sleeve of an album

On the page of an album the cover is a **sleeve in 3D** (`Head` with `sleeve`, the design system's `AlbumSleeve`): the cover whole on a slab of plastic with a record half out of it, the label in the cover's most vivid colour, tilting toward the page's light (the pointer, a phone's tilt) and catching it. It adds a record and a gleam to the cover, so it is only for **Last.fm's** covers: the album pages use Last.fm's, and a Spotify cover is never made a sleeve or a disc. Before WebGL is ready, where it is not there and under reduced motion it is the cover alone, as a sharp square, in the same place.

## The albums of an artist

The page of an artist lists its most played albums (`artist.gettopalbums`, one call kept a day, `loadArtist`): ranked by Last.fm's plays in the design system's `Tiles`, with Last.fm's covers, nameless and repeated albums left out, up to eight. An album the owner has played lately links to its page here and says so.

## The listening to an artist

The page of an artist also says what the owner's listening to it is (`loadArtistListening` in `src/lib/sources.ts`, read by `src/lib/artist-listening.ts`), each part left out on its own when Last.fm does not answer, and each fact said once:
the head (`DetailHeader kind="artist"`, large by its kind) is the artist's face, its Spotify picture large and lit, with its place among all the artists played in words («Fjerde mest spilte artist»), three figures large beside it (their plays, share of all and plays the last month) and its tags as badges;
**Om artisten** comes first, Last.fm's text (its listeners are a fact beside); **Lytting** is an area chart of their plays over time since they started on Last.fm (`user.getinfo`, then one `user.getweeklyartistchart` a period: the finest of months, quarters, half years and years that gives at most 24 points, so a first visit asks at most 24; a period that is over is kept for a month, the current one for an hour, and the charts are the same for every artist, so they are shared by all artists' pages): where the line leaves zero is when they first heard it, and its summary says it in words;
**Mest spilte** are the most played songs by it (`user.gettoptracks` of all time, a thousand, one answer for every artist's page; each links to its page where it has one); and **Lignende artister som også er spilt**, a section near the end, are those of
Last.fm's 50 like it (`artist.getsimilar`) that are among their thousand most played artists of all time (`user.gettopartists`, shared too), at most six, with Spotify's pictures.

## Weekly and monthly wrapped

The head of a week's or a month's page is the same composed head as a detail page's (`Head`, the page `bare`): the most played album of the stretch leads it, its cover as the picture and its colours as the stage (WebGL, moving with the light), with the stretch and the album named under the title. The front page's card of what plays now stands on a stage of the cover's colours too, and when the song changes the colours go over to the new cover's in one move.

**Wrapped** (`/musikk/uke/`, and the month's `/musikk/maned/`, which the overviews' cards open on this month so far) opens the last week that is over, `/musikk/uke/<year>-<week>/` (ISO weeks, Monday to Sunday in Oslo time, `src/lib/weeks.ts`); this week so far and the twelve before it are listed on the page.
Only numbers and lists: **Tall** (plays, how many different artists and songs, listening time, the busiest day and hour, the shape of the days), **top artists, albums and songs** in the shapes of what they are, with how each artist's place
moved since the week before, and **new artists** (those among the ten most played that had no plays at all before the week).
**The Wrapped of film** (`/film/uke/…`, `/film/maned/…`, `FilmPeriod` in `src/components/wrapped.tsx`) has the same head (the latest film's poster), the films, the time watched (a guess: the runtime, 110 minutes where TMDB has none), the busiest day and the shape of the week (a month: films per day), the films, and the genres and directors most watched (TMDB's, where it has been asked for the film).
**The Wrapped of TV** (`/tv/uke/…`, `/tv/maned/…`, `TvPeriod`) has the most watched show's poster as its head, the episodes, different shows, days of binges, the time watched (45 minutes an episode), the busiest day and the shape of the week (a month: episodes per day), the shows most watched, and runs of three episodes or more of one show on a day.

**The month** is the same, `/musikk/maned/<year>-<month>/` (calendar months in Oslo time, `src/lib/months.ts`), reached from the wrapped of a week by the chips Uke and Måned, with this month so far and the twelve before it listed on its page. It has the same numbers and
lists, the change is from the month before, up to 2 800 plays are read (14 pages) and Trakt's history up to three pages of a hundred for films and for episodes. Both are made by one loader (`loadPeriod` in `week-source.ts`) over any range of time.
**Charts of change over time** (`src/components/trend.tsx`, the trend as a server island that asks for its own page, so it has a budget of questions of its own, the design system's column chart, drawn in the browser): the page of a week shows plays per week for the twelve weeks up to it, and the page of a month shows plays per month for the twelve months up to it and plays per day in the month.
The totals cost one small question to Last.fm each (a page of one play, whose `total` is the count, `loadTrend`), kept a day once the period is over; a period that could not be told is a gap, never a zero. The days come from plays already read.
**The light** follows the rules of the design system's «Foundations / Light and shadow»: the main picture of a page, and only it, is lit. On a page of a thing (artist, album, song, film or show, person) that is its `Picture size="hero"`, lit on its **frame** (a shadow away from the light and a rim towards it, outside the picture, so nothing is painted over Spotify's artist pictures); the page's head is the design system's `DetailHeader` as an island (`<Head client:idle … />`, `src/components/head.tsx`; the detail components are not hydrated, so the backdrop and the light need it): the picture and the name together, the picture beside the name on a phone, on four colours taken from the picture (never the picture) drawn in WebGL, moving with the light and drawn only when it changes. It is the page's `<h1>`, so the page is `bare` (`Page.astro`), and `src/pages/head.test.ts` fails on a page of a detail component without it. The head's text is the full text colour, never muted: the ground is tinted. The record on the front page is the one thing lit on its **surface**, and only with Last.fm's cover. A reader is asked to let the light follow the phone once, and the answer is kept in the browser.

What is playing now is the card at the top of the front page (`NowPlayingSection`, the design system's `NowPlayingCard`): a disc drawn in WebGL, a real 3D object (a thickness with an edge and a deep hole, a studio reflected in its lacquer, the grooves' spectrum in bands that move with the light and the angle), that turns slowly under the page's one light, which follows the pointer and, on a phone, how it is held (the design system's `LightSource`; iOS asks first), with «● Spilles nå»; a tap on the disc pauses it. The disc is made of Last.fm's cover (`Playing.disc`).
The card **keeps up**: while the front page is open and visible it asks `/api/now/` (`src/pages/api/now.ts`, Last.fm's song for the owner's username, kept fifteen seconds in the Worker's cache, `no-store` to the browser) every fifteen seconds, and a new song changes it; nothing is asked while the tab is hidden, and the card goes only after two empty answers in a row. It sits in the design system's `LiveRegion`, so a screen reader is told of a new song. The disc's reflections are shaped by the cover (its hue, vividness and lightness), so no two covers shine alike.
There are no notifications: the site is public, so there is nobody to notify but whoever happens to open it.

Nothing is stored: every week is made when it is asked for, from Last.fm (`user.getrecenttracks` with the week's range, read page by page up to 1 600 plays; the week before's `getweeklyartistchart`; the chart of everything before the
week, from the beginning of time to its start, for who is new; `track.getinfo` for the length of a sample of the most played songs) and Trakt (the history in the range), and kept for a day when the week is over and for five minutes when
it is not. A page may ask a Worker's limit of questions, so the lengths of songs come in turns (at most 10 new questions on a page, the most played first; what is kept is free) and fill in over the next visits, a few at a time because
Last.fm answers a rate limit as an error. An artist is new when it is not on the chart of everything before the week; Last.fm cuts that chart at a thousand artists, and then what is not on it is asked about by the owner's total for it,
less the plays in the week and after it (`user.getartisttracks`, which would say it directly, is gone from Last.fm). The listening time is an **estimate**: the known lengths, and the plays whose length is not known counted at their average
(a typical 3½ minutes where none is known), with how many of the plays the length is known of. No Spotify data is in it except the pictures of the artists. `src/lib/wrapped.ts` makes the numbers, `src/lib/week-source.ts` fetches what they
are made of; both are tested.

**Last.fm's errors are never kept.** Last.fm answers an error («Rate Limit Exceeded», «Deprecated») with HTTP 200, so a cache that trusts the status kept them for as long as it kept an answer, and a song's length stayed unknown for a week.
`lastfmError` (`sources.ts`) names them; `runtime.ts` refuses to keep one and asks again where one was kept before.

## Installed app (PWA)

The site installs on a phone or a computer and opens without the browser around it: «Legg til på Hjem-skjerm» on iOS, the install offer in the address bar on Android and desktop Chrome (there is no install button
of our own). `public/manifest.webmanifest` is the identity (`id`, `start_url` and scope `/medier/`, never changed once installed; the brand's amber as `theme_color` and the dark page as `background_color`, `any` and `maskable` icons at 192 and 512), and
`public/sw.js` the service worker: a page from the network first with the last copy of each page when there is no network (the forty last, kept by address with the query; every page is the same for everyone), the front page and then `/medier/offline/` when there
is none; the built files and icons from the cache. It is registered at `/medier/sw.js` with the scope `/medier/` and touches nothing outside it (the origin's other paths are other apps'), and of the origin's caches it only ever deletes its own (`medier-…`). Nothing from another site is kept (the covers are Spotify's, Last.fm's and TMDB's own), a redirect or an error is never kept as a page, and a new version waits until the
app is closed (no `skipWaiting`) and then deletes the old caches: change `VERSION` in `sw.js` to make it. A bar at the foot on a phone, a rail from tablet width, goes between Forside, Musikk, Film, TV, and Spill (with Steam's or RetroAchievements' key and a username; each place only where its username is set; on a phone it scrolls sideways, the current place brought into view; the bar is an island for that);
`ConnectionBanner` says so when the device is offline and the page is the last one fetched. `src/pwa.test.ts` pins the manifest and runs the worker against a cache and a network of its own.

## Brand

Medier is one of the lmfaole family (design system, «Foundations / Brand», and the skill `designsystem-brand`), endorsed: «Medier · lmfaole». Its hue is **amber**
(`data-brand="amber"` on `<html>`, in `src/layouts/Page.astro` and `src/pages/404.astro`) and its glyph **`play`**: the `NavBar` opens with its `Wordmark`, and the hue is only where the design system's components put it (the current place in the menu, the focus ring, the primary button, a
ticked box). Never in the content, a chart, a state or around a cover. The icons (`public/favicon.svg`, `public/favicon.png`, `public/apple-touch-icon.png`,
`public/icons/amber/`, a new folder so the year-long `immutable` cache of `/icons/*` gives the new ones) are drawn from the same data by `npm run icons` (`designsystem-app-icons --hue amber --glyph play --out public/icons/amber`; Playwright from `$PLAYWRIGHT` or a global
one). The bar's colour follows the brand: `theme-color` is the amber of each scheme (`#9c640d` light, `#c6811c` dark, as the script's `brandColours`), the
manifest's `theme_color` the light one; its `background_color` stays the dark page, which the splash screen is.

Motion and haptics are the design system's («Foundations / Motion» §9, «Foundations / Haptics»), nothing of our own: amber's accent is rhythmic, the mark beating twice. Rare is loud, frequent is
quiet, so the mark moves only in a signature moment, once: the empty «Ingen avspillinger ennå» on the front page and Musikk (`PlayRows start`, the app's
first, empty start; never more than one on a page). A change of page is the browser's own view transition (`transitionAttributes()` on `<html>` beside `brandAttributes`, no `ClientRouter`): the
menu's current place slides to the new one and `<main>` rises in. `listenForHaptics()` runs once in the layout. Under reduced motion
everything stands still. No `AppMark loading` (no wait of over a second for the app itself: the islands have their skeletons) and no `data-haptic="warning"` (nothing is deleted).

- **Purpose:** show what has been listened to, watched and played, and find the way back to it.
- **Position:** for one person who scrobbles and logs, instead of four services' own pages: one calm place where the covers lead.
- **Personality:** warm, not cute; curious, not nosy; quiet, not cold.
- **Voice:** plain bokmål, neutral (no «du», no «jeg», not the owner's name), short sentences, no exclamation marks. A lead «Sist sette filmer, fra Trakt.»; empty «Ingenting spilt ennå i dag.»; error
  «Fikk ikke kontakt med Last.fm. Prøver igjen om litt.»
- **Distinctive assets:** amber, the `play` glyph on the family's rounded tile, the name «Medier» the same in the title, the manifest and the `Wordmark`.
- **Signature moments:** the app's first, empty start (the mark's beat); the album page's sleeve in the light; a look back at the week or the year.
- **Do:** let the cover's colour lead; keep the mark in the rail. **Don't:** tint covers, charts or a source's logo amber; write a brand colour of our own.

## Shape language

A picture's shape tells what kind of thing it is of, the same in a list and on the thing's own page (the design system's `kind` on `List`, `Tiles`, `Picture` and `DetailHeader`, its `lib/picture-kinds`): **a circle** is a person or a band (artists, cast and crew), **a
tall frame** is a film or a show, **a square with sharp corners** is a record (an album's cover), **a square tile with soft corners** is a single song. Spotify's own covers keep the small corners its guidelines ask of cover art, whatever the
row. The artists' pictures are Spotify's and are cropped to the circle, which its terms probably do not allow: that is the design system's shape for `kind="artist"`, so changing it is a change there.

## Set up once

1. **Cloudflare.** A Cloudflare API token that may edit Workers, and the account id, as GitHub Actions secrets of this repository: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
   (Settings → Secrets and variables → Actions). A push to `main` then deploys the relay and the site (`.github/workflows/medier.yml` at the repository's root).
2. **The address.** The site is <https://lmfaole.party/medier/>: Astro's `base` is `/medier` (`astro.config.ts`) and the Worker has the zone route `lmfaole.party/medier*` (`wrangler.jsonc`), on the
   origin it shares with the front page (`/`), the start page (`/start`), the CV (`/cv`) and Storybook (`/design/`). Everything of the site is under `/medier/`: its pages, the built files
   (`dist/client/medier/…`, served by the Worker's static assets before the Worker), the one cookie (`seen`, `Path=/medier/`), the service worker and the manifest. The route needs the zone's DNS record for
   `lmfaole.party` (proxied), which the front page already has.
3. **Spotify, once.** The redirect address must be a loopback one registered in the Spotify dashboard (the monorepo's `SPOTIFY_REDIRECT_URI` is); the site's own address is never one, so the move to
   `/medier/` changed nothing there:

   ```sh
   npm run spotify:auth -- ~/Applikasjoner/Documents/monorepo/secrets/music-sync.env   # approve in the browser; writes .spotify.env (not committed)
   ```

   The token it makes lasts six months; run it again then (the page just shows no song when it has run out).
4. **The Worker's settings**, from the env files the private monorepo already has, after the first deploy (a Worker has secrets only once it exists). Only the names in `src/lib/settings.ts` are taken;
   each value goes to `wrangler` or `gh` on stdin and is never printed. The key the site and the relay share is made if it is not in the files (the site reaches the relay through its binding;
   `UPSTREAM_URL`, a relay's address, is only needed where there is no binding):

   ```sh
   npm run settings:push -- ~/Applikasjoner/Documents/monorepo/secrets/music-sync.env ~/Applikasjoner/Documents/monorepo/secrets/film-sync.env .spotify.env
   ```

   `-- … --dry-run` says what it would set. Signed in to Cloudflare with `CLOUDFLARE_API_TOKEN` in the environment, or `npx wrangler login`.
5. **Keys uploaded with the deploy.** `SETLISTFM_API_KEY` (https://www.setlist.fm/settings/api), `STEAM_API_KEY` (https://steamcommunity.com/dev/apikey), and `RETROACHIEVEMENTS_API_KEY` (https://retroachievements.org/settings) are GitHub Actions secrets of this
   repository; the deploy step hands them to `wrangler deploy --secrets-file`, so they become the Worker's secrets with each deploy. Each is optional: without it, its part is left out.
6. **Image Transformations** (optional). In the dashboard, zone lmfaole.party › Images › Transformations: enable it for the zone, and allow the pictures' hosts as sources (or «any origin»):
   `image.tmdb.org`, `lastfm.freetls.fastly.net`, `i.scdn.co`, `cdn.cloudflare.steamstatic.com`, `media.retroachievements.org`,
   `coverartarchive.org` and `archive.org` (ListenBrainz's covers). Then set `IMAGE_TRANSFORMS` to `"1"` in `wrangler.jsonc` and push. Check a page with pictures after: if the zone cannot fetch a host
   (the same 525 the Worker gets), set it back to `"0"`.
7. **Web Analytics** (optional). In the dashboard, Web Analytics › Add a site › `lmfaole.party`, without the automatic setup (the site draws the beacon itself), and put the site's token in
   `CF_BEACON_TOKEN` in `wrangler.jsonc` (it is public) and push.

## Made-up data (no keys, no network)

`MOCK_DATA=1` in `.dev.vars` (see `.dev.vars.example`; it is a local setting, never one of `settings.ts`'s and never pushed) answers every source from `src/lib/mock.ts` instead of fetching: Last.fm, Trakt, TMDB, Spotify, MusicBrainz, setlist.fm, Steam, RetroAchievements and ListenBrainz (its listens have no covers: the made-up albums have no release ids),
shaped as the real ones are (any username is taken: the `vars`' usernames, or «demo» where one is not set), from **real metadata**: albums, tracklists, films, shows and people in `src/lib/mock-data.json` (committed), with plays and viewings laid out relative to now, so every recent week and month has some and a couple of artists are new.
It sits in `ask()` in `runtime.ts`, so the loaders and parsers run as they do for real; made-up answers are cached under their own keys. Unset, nothing changes. Restart `npm run dev` after changing `.dev.vars`.

The JSON and the pictures in `public/mock/` were fetched once by `node scripts/fetch-mock-data.mjs` from Deezer (albums, covers, artist pictures) and Wikipedia and Wikidata (texts, posters, portraits, dates); the texts are Wikipedia's (CC BY-SA).
**The pictures are third-party artwork for local development only**: `public/mock/` is in `.gitignore`, so they are not committed (or deployed from a clean checkout), and `node scripts/fetch-mock-data.mjs --images` fetches the missing ones again from the addresses in the JSON. The same script without `--images` rewrites the JSON.

## Work on it

```sh
npm install
npm test && npm run typecheck   # the parsers', the loaders' and the relay's tests, and the types
npm run dev                      # http://localhost:4321/medier/ (keys in a .dev.vars file, not committed: LASTFM_API_KEY=… and so on; a source without its key is left out)
npm run preview                  # the built Worker as it runs on Cloudflare (without MOCK_DATA it asks the relay through its binding: run `npx wrangler dev -c upstream/wrangler.jsonc` beside it)
npm run deploy                   # from here, instead of from the workflow
npm run skills                   # the design system's skills, after a change to them
```
