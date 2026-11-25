---
name: designsystem-components
description: Use when choosing which design system component to use for something, or when adding, changing, deprecating or removing a component, a prop, an icon meaning, a story or a release in the design system repository. Covers the catalogue by purpose, API design (data or children, closed props, server first), tests, stories, visual references, semver and releasing on main.
---

# Components: choose, and extend

## Look a component up

- **The catalogue as data:** <https://lmfaole.github.io/designsystem/manifests/components.json> (every component: its description, props with
  types and JSDoc, and the code of each story) and `…/manifests/docs.json` (the guides). Read it before guessing a prop.
- **In this repository**, with `npm run storybook` running, the `storybook` MCP server (`.mcp.json`, `@storybook/addon-mcp`) lists
  components and docs, previews stories and runs their tests (`test-run`).

## Decide by use case (10.0.0)

One component per use case; an app passes data (what a thing is, its role, what failed), never appearance. What is not in this
table is internal or removed. The table is generated from `src/lib/use-cases.ts` (`npm run use-cases`); change it there.
«Choose by purpose» below adds the props, helpers and smaller parts the table leaves out; where the two disagree, the table wins (and
fix «Choose by purpose» in the same commit).

<!-- use-cases:start (generated from src/lib/use-cases.ts: npm run use-cases) -->

| When you show … | Use | Fixed look / note |
| --- | --- | --- |
| A page and its title | `PageLayout` + `PageHeader` (via the app Shell) | Section gap is fixed; no `Stack` around sections |
| One thing with a picture (album, film, artist, podcast, episode, game) | `DetailHeader` + `DetailLayout` | Picture shape comes from `kind` |
| One thing without a picture (PR, issue, stop, line, station) | `PageHeader` + `DetailLayout` | Same rail anatomy as above |
| A titled part of a page | `PageSection` (`icon` **required**) | `more` = a «see all» link in the header; `continues` = an excerpt of a subpage; `source` = «Tekst fra …»; `what` + `error` = it could not be fetched |
| A part of a page that arrives late | `StreamedSection` (`title`, `icon`) | Draws the section's skeleton at its place |
| Any list of things that link somewhere | `List` (one row shape, data rows) | `kind` gives the lead picture; `icon` for non-media, `map` for a place; `ranked` for top lists; `meta` is the line under the title, `action` a button of its own |
| Episodes of a podcast | `List kind="episode"` (row `episode: { season, number, type }`) | «S2 E14» first in the meta, «Trailer» / «Bonus» as the badge; on the episode's page `DetailHeader episode` |
| The people of a podcast or an episode (hosts, guests) | `List kind="person"` (row `role`; `personRole()` reads `podcast:person`) | Grouped by role in a fixed order under «Verter», «Gjester» …; round pictures |
| Recommendations (a podroll, «Anbefalt for deg», «Mer fra samme utgiver») | `List kind="podcast"` (row `reason`: `by`, `follows`, `with`) | The reason is a line of its own in fixed words: «Anbefalt av …», «Fordi du følger …», «Med …» |
| A game's page (Steam) | `DetailHeader kind="game" backdrop` + `DetailLayout facts={gameFacts(…)}` (`components/game-facts`) | The hero art across the top, decorative, nothing on it; the rail's facts in a fixed order: «Anmeldelser» (Steam's words, icon by sentiment), «Spiller nå», «Steam Deck», «Spillere», «Kontroller», «Utvikler», «Utgiver», «Utgitt», «Pris» |
| A game's screenshots and trailers | `MediaGallery` (`items`: `picture` or `video` with `poster`) | 16:9 thumbnails, the first six and «Se alle N»; a dialog with «Forrige» / «Neste», arrow keys and «3 av 24»; a video never plays by itself |
| Things with a price (a wishlist, DLC) | `List` (row `price`: `final`, `initial`, `newSale`) | The value column: «−40 %», the price, and the price before struck through; `newSale` is «Nytt tilbud» beside the title (`newSales()` in `lib/games`) |
| A game's news and patch notes | `List` (row `news`: `patch-notes` or `event`; `external`) | «Oppdatering» / «Hendelse» as the badge; the date in `meta` as a `Time` |
| Where a person is now (in a game, online) | `DetailHeader presence` (`presenceOf()` in `lib/games`) | A live dot and «Spiller Hades II» (a link to the game), «På nett», «Borte», «Frakoblet · sist på nett …» under the name |
| A level and how far to the next | `Progress` (`levelProgress()` in `lib/games`) | «312 av 500 XP til nivå 43» in words |
| New things waiting in a place of the app (sales since the last visit) | `NavBar` item `count: { value, label }` | A number in a pill, its words to a screen reader; 0 draws nothing |
| An episode's transcript | `Transcript` (`cues` or `text`; `currentTime` + `onSeek`, or `episode`) | Marks and follows the line said now, a tap seeks, speakers in turns, search; `EmptyState` / `ErrorMessage` by itself |
| A gallery of pictures (cast, albums of an artist) | `Tiles` (`kind`) | Only when the picture *is* the content |
| A picture of a thing | `Picture` (`kind`, `context`) | Shape and size come from `kind` and `context` |
| Terms and values about one thing | `FactList` | In the `DetailLayout` rail, or as section content for stats; a podcast's are `podcastFacts()` (`lib/podcast-facts`), a game's stats `statFacts()` (`lib/games`) |
| 2–4 headline numbers for a section | `KeyFigures` | First in the section, above its chart |
| A count that links to a filtered list | `SummaryBar` | — |
| The state of one thing under its title | `StatusLine` (detail) / `Badge` (in a row, via `List` `badge`) | — |
| Data could not be fetched | `ErrorMessage` (`what`, `error`), or `PageSection` `what` + `error` | Always «Kunne ikke hente {what}» + «Prøv igjen» |
| Nothing to show (a page or a section) | `EmptyState` (`reason`: `first-run`, `nothing-yet`, `no-results`, `all-done`; `what`) | Full height with a picture and at most one central action; words are fixed by `reason`. Never used for errors |
| Something was done (saved, deleted) or a page-wide notice | `Banner` (`success` or `info` only) | Never used for a failed fetch |
| Offline or reconnecting | `ConnectionBanner` | — |
| Running text | `Text` (`role`: `body`, `quiet`, `note`, `figure`), `Heading` | Size, weight and colour follow from the role |
| Small text under content | `Text role="note"` | A credit, «Sist endret»; usually via `PageSection` `source` or the `DetailLayout` rail instead |
| Things under each other inside a section; things in a line | `Stack` (`default` or `tight`), `Inline` (`items` + `label` for a list) | The gaps are fixed |
| Things looked at in columns | `Grid` (`tiles` or `charts`) | Never for text, lists or sections |
| A link inside running text | `TextLink` (`external` for other sites) | `ExternalLink` is gone |
| An action that goes to a page or to another site | `LinkButton` (`external` for out) | Always outline; no variant |
| An action that submits a form | `PendingButton` | Primary; the only filled button |
| A secondary form action (reset, re-run) | `Button` (DS wrapper) | Always outline; no variant or size |
| Switching between views of the same page (Day, Line, Period) | `FilterChips` | More than 6 options becomes a navigating `NativeSelect` automatically |
| One of N in settings | `ChoiceCards` | Words only; theme, effects and tilt are `ThemeChoice` / `EffectsChoice` / `TiltChoice` |
| Several of N | `CheckboxList`; a grid of groups × options: `ToggleMatrix` | — |
| Free text, a time, a typed list, a search | `TextField`, `TimeField`, `ListField`, `SearchField` | — |
| Appearance settings (theme, effects, tilt, haptics) | `AppearanceSettings` | Identical in all apps; the first run uses `ThemeChoice` / `EffectsChoice` / `TiltChoice` |
| Re-running the intro / showing sources / installing | `IntroSettings` / `SourcesSettings` / `InstallSettings` | Identical in all apps |
| The settings overview | `SubPages` | `appearancePage` + `appPage` first, app-specific after; `IntroSettings` + `SourcesSettings` under the list |
| A chart | `ChartCard` + one of `ColumnChart`, `AreaChart`, `DumbbellChart`, `CalendarHeatmap`, `AuroraChart` | One height and colour; table always on; `empty` names what is missing |
| A number's shape in a row | `Sparkline` | — |
| Domain screens | `DepartureBoard`, `DepartureList`, `StopSequence`, `HazardList`, `Meteogram`, `DurationBars`, `WeatherStage`, `PodcastPlayer`, `ChapterList`, `Timeline`, `StateSteps` | Unchanged; they are the only fit |

<!-- use-cases:end -->

## Choose by purpose

| You need | Use |
| --- | --- |
| Things under each other inside a section | `Stack` (`default`, or `tight` for lines that belong together); short things in a line `Inline` (`items` + `label` for a list of tags or links). The sections of a page go straight in `PageLayout`, which spaces them |
| Things that are LOOKED AT in columns | `Grid` (`tiles` or `charts`), `Tiles` |
| The page frame, its title | `PageLayout`, `PageColumn`, `PageHeader` |
| A titled part of a page | `PageSection` with its `icon` (required); where its words come from: `source` («Tekst fra Last.fm»); its source failed: `what` + `error`; a link to all of it: `more`; an excerpt of a subpage (the five latest plays of «Historikk»): `continues`, a card with one full-width link to the subpage at its foot («Se hele historikken»), instead of `more` |
| Text, a heading, a link | `Text` by its role (`body`, `quiet`, `note`, `figure`), `Heading`, `TextLink`; out to another site `TextLink external`, `LinkButton external` |
| Text written in Markdown (a description, a comment) | `Markdown`, never HTML inserted; `size="sm"` for a comment |
| Several short facts about one thing, each on its own line (a year and a maker, a name and its original name) | `Lines`, never run together with « · » by hand |
| A link to a service the reader knows by its mark (GitHub, Steam, Last.fm …) | `BrandIcon` beside the link's words; not an `Icon` (a mark is not a meaning); a service outside its closed set gets no mark |
| A list of things | `List`: data rows (`title`, `href`, `meta`, `value`, `action`); `kind` gives the picture in front (`podcast`, `album`, `film`, `game`, `achievement` …), else a row's `map` or `icon`; `ranked` for a top list (place, `change`, a bar from `amount`); `badge`, `isNew`, `live`, `status`, `progress` per row. Pictures looked at in a gallery: `Tiles` (`kind`) |
| Terms and their values (facts about one thing) | `FactList`: one value or several stacked under one term; on a detail page through `DetailLayout facts` (untitled, in the rail); a podcast's facts from `podcastFacts()` (`lib/podcast-facts`), a game's from `gameFacts()` (`components/game-facts`), never assembled by hand; services side by side under one term (where a film streams) `LogoList` |
| A podcast's episodes, people and recommendations | `List kind="episode"` with the row's `episode` (`episodeNumberWords` writes «S2 E14»); `List kind="person"` with the row's `role` (`personRole` reads `podcast:person`, the list groups by `groupByRole`); `List kind="podcast"` with the row's `reason` (`reasonWords`); on the episode's page `DetailHeader episode`; its transcript `Transcript` (`cues` or `text`, `currentTime` + `onSeek` or `episode`) |
| A game (Steam) | `DetailHeader kind="game"` with `backdrop` (the hero art, decorative) and, on a person, `presence` (`presenceOf()`); `DetailLayout facts={gameFacts(…)}`; screenshots and trailers `MediaGallery`; a wishlist or DLC a `List` with the row's `price`; news a `List` with the row's `news`; a level `Progress` with `levelProgress()`; new sales on a `NavBar` item's `count`. The words live in `lib/games` |
| The page of one thing | `DetailHeader` (`kind` gives the picture's shape, `label` the words; large for an artist or a `sleeve`) and `DetailLayout` under it: the sections as children, and a rail of `map`, `status`, `steps`, `actions`, `facts`, `links` (out to other sites) and `updated`, always in that order |
| A status | `StatusLine` (under a title), `Badge` (next to a name in a row); a count that links `SummaryBar` |
| A message about a page or section | `Banner` (`success` or `info`: something was done, a page-wide notice); a failed fetch `ErrorMessage` (`what`, `error`, `retry`) or `PageSection what` + `error`; nothing to show `EmptyState` with the `reason` that says why: `first-run` (requires `description` and `action`), `nothing-yet`, `no-results` (`query`), `all-done` (no action). Never an `EmptyState` for an error, never a `Banner` for a failed fetch |
| Fresh data, offline, streamed parts | `Freshness` (when it was made, and when it is old), `ConnectionBanner`, `StreamedSection` (with the section's `title` and `icon`; it draws the `SectionSkeleton`, which is never placed by hand) |
| Something that changes by itself (what plays now, a count fetched again) | `LiveRegion`, on the page before its content changes; a live row is `List` `live` (it draws the `LiveDot` with «Spilles nå» in words) |
| Once in the app's root layout | `Haptics` (turns on `data-haptic`), `WebAnalytics` (renders nothing without a token), `PendingForms`, `PodcastPlayer` (Podkast); never on a page |
| A time | `Time` (relative when recent, a date later, the exact time always at hand) |
| Forms sent to a slow server, content out of the way | a native form sent to a slow server `PendingButton` (with `listenForPendingForms` in the layout); long content out of the way `Disclosure` |
| The first visit (onboarding) | whose data `UsernameForm` and `UserChip`; a word about a page `IntroCallout`; a permission `PermissionCard` with `usePermissionState`; what is new `NewBadge` with `MarkSeen`; installing `InstallPrompt` (when it may show, and why there is no other install button: **designsystem-pwa**); what was seen in the `seen` cookie (`parseSeen`, `isSeen`); the first-run wizard `FirstRun` with `FirstRunEnhancer`, one question per step (`stepQuestions`); the choices about looks as picture cards, `ThemeChoice`, `EffectsChoice` and `TiltChoice`; a settings page of `SettingsSection`s, with the overview's shared rows `appearancePage` and `appPage` in `SubPages` and the shared screens `AppearanceSettings`, `InstallSettings`, `IntroSettings`, `SourcesSettings`; the visitor's theme, effects and tilt in the `prefs` cookie (`parsePrefs`, `serializePrefs`, `htmlAttributes`) |
| A form (rare) | `TextField`, `SearchField`, `FormErrorSummary`; a choice from a list `NativeSelect`; one of a few, as cards `ChoiceCards`; any of a few `CheckboxList`; a typed list `ListField` (read with `parseListField`); some of a list in each of a few groups `ToggleMatrix` (`namePrefix.<column>`); the order of a list `ReorderList` (drag and buttons; `orderSections`, `applyMove`); a time of day `TimeField`. A field draws its own error (`FieldError`, tied by `aria-describedby`); the page gives the message, never a second error line |
| The two to four numbers that say most about a section, large, in place of a sentence | `KeyFigures`, first in the section, above its chart |
| A number's shape over time | `Sparkline` beside the number; a chart `AreaChart`, `ColumnChart` in a `ChartCard`; a ranking a `List` that is `ranked` |
| A rhythm or a change | `CalendarHeatmap` (days), `DumbbellChart` (two moments), in a `ChartCard` |
| The weather hour by hour | `Meteogram`: temperature, rain and the sky on one time axis; the weather now as a scene `WeatherStage` (it draws `WeatherParticles`); warnings `HazardList` (the most serious first, the level by `HazardLevelBadge`) |
| Departures from a stop (Entur) | `DepartureBoard`: a card per stop, a row per line with the next times, a time strip, the walk, delays and cancellations; a line alone `LineBadge`; with `at` a map of the stop across the top; `continues` ends the card in a link under the rows to the stop's page, `lineHref` links each row to its line's page |
| Every departure from one stop, on the stop's own page | `DepartureList`: by hour, in the order they leave; a filter by line is `FilterChips`; `lineHref` links each departure to its line's page |
| Every stop on one trip of a line, on the line's page | `StopSequence`: the rail in the line's colour, the stop seen from marked «Herfra» (`current`), the stops before folded, ride minutes after; `href` makes a whole row a link to the stop |
| Where a place is (a stop, a bike station) | a still OpenStreetMap map with a pin, given as data: a `List` row's `map` (the list credits it once), `DetailLayout map`, `DepartureBoard at` |
| A history of a thing (a pull request, an issue, a discussion, what was played) | `Timeline`: comments in full and events as one line on a rail, noisy runs folded, a heading per day; the steps it went through at the top `StateSteps`; how long each state lasted `DurationBars` |
| A value against a goal | `Progress` |
| The way between pages | top-level pages `NavBar` (bar at the foot on a phone, scrolling sideways when there are more than fit, rail from tablet width; given to `PageLayout` as `nav`; «Innstillinger» last); where you are and the way back `Breadcrumbs`; the pages under a page that is nothing but its subpages (a settings overview) `SubPages`, and one subpage that continues a section `PageSection continues`; narrowing a list `FilterChips` |
| Podcasts: sound that plays on between pages | `PodcastPlayer` once in the root layout (docked above the `NavBar` bar on a phone, beside the rail from tablet width; or `PageLayout` `player`; the page leaves room by itself), `onProgress` to save where the reader is; a tap on its bar opens «Spilles nå», the player over the whole screen (`NowPlaying`, drawn by `PodcastPlayer`; `defaultOpen`); an episode's button `PlayButton` («Spill av», «Fortsett» with `position`, «Pause»); its chapters `ChapterList`; the store `player` and `usePlayer` (`components/podcast-player`), the types and pure helpers in `lib/podcast-player` |
| An icon | `Icon` (a meaning from `ICONS` in `src/lib/icons.ts`) |
| The app's own name and mark | `Wordmark` (glyph tile, name, «· lmfaole»), `AppMark` (the tile alone); in the rail by `NavBar` `glyph` and `family`, in onboarding by `FirstRun` `glyph`; the colour from `data-brand` on `<html>` (**designsystem-brand**) |
| A picture | `Picture`, `ImageLightbox`, `Logo`, `Logos`; `Picture` takes what the thing is (`kind`: `album`, `track`, `artist`, `person`, `film`, `show`, `game`, `podcast`, `episode`, `place`, `achievement`) and where it stands (`context`: `row`, `hero`, `tile`); the shape follows from them (`lib/picture-kinds`), one shape for each kind, everywhere that kind shows |
| A person named (reviewers, authors, who wrote last) | `Person`: the name with their round picture beside it |
| A card | Drawn by the components that are one: `ChartCard` for a chart, `PageSection` `continues`; `Card` itself is internal |
| A chart | `AreaChart`, `ColumnChart`, `DumbbellChart`, `CalendarHeatmap`, `AuroraChart`, in a `ChartCard`; the weather hour by hour `Meteogram`. The card and its chart draw the summary (`ChartSummary`), the table and the empty state (`ChartEmpty`, from `ChartCard empty`); never place those yourself |
| An error, not found | `ErrorMessage`, `ErrorPage`, `NotFoundPage`, `ServerErrorPage` |
| A dialog, a sheet, a popover | `Overlay` (opened by the design system's own parts, `ImageLightbox`) |
| A choice from a list | `NativeSelect`, never a drawn menu; switching period or view `FilterChips` (a navigating select beyond six) |
| Motion | `Reveal`, `Stagger` (tokens only) |

If the thing is not here, **add a component**; do not style in the project.

## Rules every component keeps

1. **Closed props.** A choice is a named variant (`gap: "sm"`, `tone: "muted"`), never a class or a style. No `className`, `style` or
   `ComponentProps<…>` props (`src/strict.test.ts` fails on them).
2. **Data decides.** What a kind of data implies is derived from the data, not passed.
3. **Tokens only** for colour, radius, font, motion. English in code, Norwegian on screen.
   **No px, ever:** a length is rem, em, ch, %, vw/dvh, cqi, lh, `clamp()` or a Tailwind step (`w-0.5`, not `w-[2px]`); a hairline is `border`; a length from script is rem (`toRem`, `lib/units`). `src/units.test.ts` fails on `<number>px`.
4. **Server-renderable** unless it needs state: no hook, no `"use client"` in a component that can be plain.
5. **Icons** come from `src/lib/icons.ts` by meaning; no `lucide-react` import outside it and `ui/`.
6. **Accessible** (see **designsystem-accessibility**) and **content-checked** (see **designsystem-content**).
7. **One reading direction: down.** Text, lists and sections stand under each other in the reading column; columns only for what is looked at. `src/desktop.test.ts` pins this (see **designsystem-hierarchy**).

## Design the API before the code

1. **Look before adding.** Search the table, the manifest and `src/lib/use-cases.ts`. The same use with new data is a new prop or row
   field on the component that has it (`price` and `news` went on `List` rows, not into a list of their own); a new component only for a new
   use. Two components for one use is the failure 10.0.0 removed. Add its row to `src/lib/use-cases.ts` and run `npm run use-cases`.
2. **Data or children.** Take data (`rows`, `items`, `facts`, `cues`) when the component owns the structure, order, words or semantics of
   what is inside (a list, facts, a gallery); take `children` only for a container that does not care what is in it (`PageSection`,
   `DetailLayout`'s sections). Never a render prop or a slot that lets an app draw its own row.
3. **Name props for what the data is** (`kind`, `role`, `reason`, `what`), never for how it looks. Make impossible states impossible in the
   type (a union of shapes, as `EmptyState` requires an `action` for `first-run` and forbids one for `all-done`), so `npm run typecheck` in
   an app catches misuse instead of a review.
4. **The words are the system's.** Fixed Norwegian strings live in the component or its `src/lib/<name>.ts` (with a test); the app passes
   nouns and data (`what="avspillinger"`), never a finished sentence.
5. **Server first, client at the leaf.** Keep the component a server component and move state into a small `"use client"` part inside it
   (as `NavBarScroll` in `NavBar`). Props that cross into a client part must be serialisable (strings, numbers, plain objects, arrays,
   dates; no functions except a server action), or the Astro island and the server component break.
6. **Write the accessibility contract first:** its role and name, keyboard (which keys, where focus goes and comes back), what a screen
   reader hears when it changes, and what the page must still do. That is the story's **Accessibility** section and its `play` test.

## Add or change a component

1. Make it in `src/components/<name>.tsx`; export it (`exports` in `package.json` already maps `./components/*`).
2. Add a story in `stories/components/<group>/<name>.stories.tsx`, titled `Components/<Group>/<Name>`, in the group of what it is FOR
   (Layout, Text, Links, Actions, Navigation, Lists, Tables, Charts, Media, Forms, Status, States, Overlays, Motion), never a group of how
   it is made. Give it its place in `storySort` in `.storybook/preview.tsx` (most used first in its group) and its line in
   `stories/components/Overview.mdx` (`src/stories.test.ts` fails on either missing). If it is a new idea, mention it in the right guide
   (**Foundations**, **Patterns** or **Engineering**). A story file:
   - CSF 3 with `satisfies Meta<typeof X>`, `args` on the meta for the default, the story Default first, then **one story per variant and per state**
     a page meets (Empty, Loading, Error, a long text, ShowTable), named for what it shows;
   - the description in the template: **Use it when**, **Do not use it when** (each case names the component to use instead, so the
     reader is never left without one), **Accessibility**, **Content**, **Related**;
   - `args` for what a page passes, `render` only where a story needs state or other components, never a styling of its own;
   - a **`play` test** for anything that reacts (a toggle, an overlay, a fold): it does what a reader does (`userEvent`, by role and name)
     and checks the result and the state a screen reader hears (`aria-pressed`, `open`, focus back). A browser's own key handling (Esc in
     a dialog, Enter on a summary) is not simulated: click, and check focus with Tab;
   - **each story says why it exists** in a JSDoc line above it (the docs page and the manifest show it): what a reader sees here that the
     others do not show;
   - a rule that is easy to break gets a **do and a don't as stories**: `Dont…` (its JSDoc starts with «**Ikke:**», says what goes wrong and
     names the right way; tagged `!manifest`, so no agent copies it) and `Do…` right after it («**Gjør:**»);
   - the **Accessibility** section says what the component handles and then what the page must still check («You check»), each point with
     its WCAG 2.2 criterion where there is one;
   - the component's JSDoc is its description in the docs and the manifest: say what it is for in the first sentence; give each prop a
     JSDoc line. A component on its way in or out is tagged `experimental` or `deprecated` (hidden in the sidebar by default) and `!manifest`;
   - every story is a test: `npm run test:stories` renders each in Chromium in the light and the dark theme, runs its `play` and fails
     on an axe violation (`a11y: { test: "error" }`). Fix the component, never turn the check off for a story.
3. Add a test if it carries a rule (`src/*.test.ts` reads the source and pins it).
4. Update the README (the table of what is here, the rules if it adds one) and the migration notes.
5. `npm run verify`, `npm run test:stories` and `npm run build-storybook` must pass. Every story's picture is compared with the
   reference in `__screenshots__` (CI's `.github/workflows/designsystem-visual.yml`). A change that is meant to look different brings its new references
   in the same commit: `npm run test:visual:docker -- --update` (CI's Linux and Chromium; never `test:visual --update` on a Mac, its fonts
   draw other pixels); the pre-push hook (`npm run hooks` at the repository's root, once per clone) compares before every push. Look at the new pictures before you
   commit them: an accepted reference is a promise. Look at the story with the toolbar's **Tema** «Begge» (light
   and dark side by side), **Skjermlesertekst** «Synlig» (what a screen reader hears, drawn dashed) and **Viewport** (the five width classes
   of the guide «Wide screens»).

## Deprecate and remove

1. **Deprecate in a minor:** `@deprecated Use X instead.` in the JSDoc of the component or the prop (editors strike it through), the story
   tagged `deprecated` with a line at the top naming the replacement and a before/after, and a README line. It keeps working.
2. **Remove in the next major**, never sooner: the export, its story and its row go, and «Migrating to N» in the README gets a
   before/after for it and the search that finds every use (`grep -rn "<OldName" src`). A rename everyone must make is the same edit in each app.
3. No console warnings for deprecation: the type and the story say it, and `npm run typecheck` in the app finds the call.

## Release

All work and every release is on `main`: no branch, no release branch, no pull request (`CLAUDE.md`). A large change is several commits on
`main`, each building and passing the tests.

| Change | Version |
| --- | --- |
| A fix that changes no prop, word or picture an app relies on | patch (`9.3.1`) |
| A component, prop, row field, `kind`, `reason` or icon meaning added; a prop's type widened; something deprecated; fixed words improved | minor (`9.4.0`) |
| A component, prop or union member removed or renamed; a prop newly required or its type narrowed; a landmark or heading level added or removed; a peer dependency's major raised | major, with «Migrating to N» |

1. Bump `version` in `package.json` and add its `## X.Y.Z` section to the README's release notes (in bokmål, what a page has to change
   first); a major adds «Migrating to N».
2. Push to `main`. CI checks it and publishes Storybook.
3. The apps (`apps/medier`, `apps/podkast`, `apps/startside`) use the design system from the same repository (an npm workspace), so they
   follow every commit: `npm run skills` in each reinstalls the skills; then the app's typecheck, tests and build. A breaking change is
   not done until the three apps build on it, in the same commit.

## Add an icon meaning

The set is **complete on purpose**: a read-mostly dashboard's meanings (work, state, people and time, place and weather, getting around, content, home and devices, money, data, actions, direction) are all there, so a page never waits for an icon. Look in the Catalogue first.
If a meaning really is missing, **add it at once**, without waiting for a second use: put it in its group in `scripts/icon-set.mjs` (named for the meaning, one Lucide glyph for it) and run `npm run icons`; the Catalogue, the types and the tests follow. Two meanings may not share a glyph, and a glyph with no meaning is decoration and does not belong.

## Server and client

A component renders on the server by default. One that uses a hook or a handler starts with `"use client"` (a test checks this) and its first render matches the server: no clock, random number or `window` in render, and time is passed in (`now`). Client components: `ChartFrame`, `FormErrorSummary`, `Freshness`, `ConnectionBanner`, `Overlay`, `LightSource`, `TiltButton`, `AlbumSleeve`, `IntroCallout`, `InstallPrompt`, `MarkSeen`, `FirstRunEnhancer`, `PendingForms`, `ReorderList` (plain props, an island in Astro), `NavBarScroll` (inside `NavBar`), the previews and «Vibrasjon» (inside `AppearanceSettings`, which renders on the server around them), `AmbientBackdrop` (inside `Stage`, which `DetailHeader` and `NowPlayingCard` stand on), `Disc` (inside `Picture disc`), `MediaGallery`, `Transcript`, `Haptics`, `WeatherParticles` (inside `WeatherStage`), `PodcastPlayer`, `NowPlaying`, `PlayButton`, `ChapterList` (they share one store, `player`). Every component that draws with WebGL checks `effectsEnabled` first: under `data-effects="off"` it draws its still version and creates no context. Guide: **Server rendering**.

## Sources

- Primer, versioning and deprecation: <https://github.com/primer/react/blob/main/contributor-docs/versioning.md>,
  <https://github.com/primer/react/blob/main/contributor-docs/deprecating-components.md>
- Primer, contents as data or children: <https://github.com/primer/react/blob/main/contributor-docs/component-contents-api-patterns.md>
- GOV.UK, contribution criteria and «When not to use»: <https://design-system.service.gov.uk/community/contribution-criteria/>
- Designsystemet, «Bruk når / Unngå når» and a page for accessibility per component: <https://designsystemet.no/no/components/docs/button/overview>
- React, `'use client'` and serialisable props: <https://react.dev/reference/rsc/use-client>
