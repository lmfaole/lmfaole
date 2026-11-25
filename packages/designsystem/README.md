# designsystem

The design system of lmfaole's apps and pages, in a repository of its own: the theme (colours, radius, fonts, motion), the building
blocks a page is put together from, and the components built on them. React 19 and Tailwind 4, **shipped as source**
(`src/`, TypeScript and CSS): there is no build step and no published package.

It knows nothing about the projects that use it. No app registry, no routes, no data: a component takes what it shows as
props. What is specific to a project (which apps exist, their colours, their pages) lives in that project and builds on this.

## Use it

```jsonc
// package.json of an app in this repository: a workspace, linked by npm
"@lmfaole/designsystem": "*"
```

```css
/* the project's stylesheet: the tokens, fonts and base styles, and Tailwind told to read this package's classes */
@import "@lmfaole/designsystem/theme.css";
```

```tsx
import { PageColumn, Stack } from "@lmfaole/designsystem/components/layout"
import { Heading, Text } from "@lmfaole/designsystem/components/text"
```

Because it is source inside `node_modules`:

- **Next.js**: add the package to `transpilePackages`.
- **Vite / Astro** must bundle it on the server instead of leaving it external: `vite.ssr.noExternal: ["@lmfaole/designsystem"]`.
- **Tailwind** finds the classes through the `@source` lines of `theme.css`; a project needs none of its own for this package.
- **Node's test runner** does not strip types under `node_modules`, so a test cannot import a module of this package directly.
  Test what the project owns; the modules here have their tests here.

A project without a build step (plain CSS and JS) takes only the tokens: read the two `:root` blocks of `src/theme.css` and the
font files of `@fontsource-variable/atkinson-hyperlegible-next` and `@fontsource-variable/atkinson-hyperlegible-mono`, as the hjemmeserver app of the Nextcloud
repository does (`scripts/design-tokens.ts` there).

## What is here

| Path | What |
| --- | --- |
| `src/theme.css` | The tokens (`--background`, `--primary`, `--radius`, `--series-*` …), light and dark, the fonts and the base styles. Imports `motion.css`, `shell.css` and `overlay.css`. |
| `src/components/layout.tsx`, `text.tsx` | The building blocks: `Stack`, `Inline`, `Grid`, `PageColumn`; `Text`, `Heading`, `TextLink`. |
| `src/components/page-layout.tsx`, `page-header.tsx`, `page-section.tsx` | The frame and the parts of a page. |
| `src/components/ui/` | Generated shadcn/ui (button, button-group, card, native-select, separator, skeleton, table). Button, button-group, native-select, skeleton and table are exported as `components/<name>`; card and separator are internal building blocks (every card an app sees comes from a component). `components/ui/*` and `components/internal/*` cannot be imported by an app. Add one with `npx shadcn@latest add <component>`; never hand-edit one. |
| `src/components/nav-bar.tsx`, `breadcrumbs.tsx`, `sub-pages.tsx`, `summary-bar.tsx`, `link-button.tsx` | Navigation between and into pages. See «Pages and navigation» below. |
| `src/components/icon.tsx`, `status-line.tsx`, `src/lib/icons.ts` | Icons: `Icon` (a meaning from `ICONS`), `StatusLine` (statuses with a symbol), and the register of meanings; `brand-icon.tsx`, `src/lib/brand-marks.ts`: `BrandIcon`, the mark of GitHub, Spotify, Bluesky, Mastodon, Steam or PlayStation for a link there. See «Icons» below. |
| `src/components/wordmark.tsx`, `src/lib/brand.ts`, `src/lib/motion.ts`, `scripts/app-icons.mjs` | The app's brand: `Wordmark` and `AppMark` (with `reveal`, `loading`), `transitionAttributes()` for view transitions, the hues (`BRAND_HUES`, `data-brand`) and glyphs, and `npx designsystem-app-icons` for its icons. See «Brand» below. |
| `src/components/podcast-player.tsx`, `now-playing.tsx`, `play-button.tsx`, `chapter-list.tsx`, `src/lib/podcast-player.ts` | Podcasts: the app's one player, docked at the foot (`PodcastPlayer`) and over the whole screen (`NowPlaying`, `now-playing.tsx`), the button that plays an episode (`PlayButton`), its chapters (`ChapterList`), and the store they share (`player`, `usePlayer`). See «Pages and navigation» below. |
| `src/components/*-chart.tsx`, `chart-frame.tsx` | Charts on TanStack Charts, themed through `chart-frame.tsx`. |
| `src/components/*.tsx` (the rest) | Rows, lists, cards, covers, links, overlays, error pages. |
| `src/lib/` | What the components share: `cn` (`utils`), icons, the page column and the columns of a list (`page-width`), link style, small pure helpers with tests. |

## The rules

1. **A project has no styling of its own.** A page is put together from these components; it writes no `className`, `style`
   or stylesheet. When nothing fits, the markup becomes a component here, named for what it is, never for the project.
2. **Closed props.** A choice is a named variant (`gap: "sm" | "md"`, `tone: "muted"`), never a class handed in. A component
   that still takes `className` keeps it for other components of this package only.
3. **One spacing and type scale.** A gap is `none | xs | sm | md | lg | xl`; text is `Text`'s sizes and `Heading`'s looks.
4. **Motion comes from the tokens** (`--motion-*` in `motion.css`): entrances move and never fade text, and everything is off
   under `prefers-reduced-motion`.
5. **Tokens only.** No colour, radius or font outside `theme.css`.
6. **A select is a native `<select>`.** Every list of choices, short or long (a filter, a period, a month), is `NativeSelect`, so a
   phone shows its own picker and a desktop its own menu. Never a menu drawn in the page: no Radix `Select`, no listbox or
   combobox, no popover or sheet of buttons or links standing in for one. Choosing a value does what the page needs:
   a form submit, or going to an address (`select[data-navigates]`, `enableNavigatingSelects`).
7. **One reading direction: down.** What is read (titles, lists of text, the sections of a page) stands in **one column, under
   each other, in the order it matters**: first the thing that matters most, the rest by priority below it. Never a grid that
   makes the reader read across and then down (a Z-pattern): a row of equal columns puts the order in doubt, hides what comes
   first and gives the eye more to do. The page has a **reading column** (`PageLayout` `width="reading"`, the default: 48rem,
   centred); on a wide screen the rest is **margin, not more columns**. Columns are for what is **looked at and not read**:
   pictures (`Tiles`), charts (`Grid columns="charts"`), cards of equal weight, a few figures and chips, and the rail of
   *reference* of a detail page (a cover and its facts) beside the main content; such a page can be `width="wide"`. Do not bring back a list
   in columns, `Grid columns="sections"` or a group that spreads its parts: `src/desktop.test.ts` fails on it. Check a page at
   400, 1440 and 2560 px. See «Reading and hierarchy» below.
8. **Closed by default: data decides.** A component takes no `className` and no `style`, and spreads no `ComponentProps<...>`:
   the look is the component's, not the caller's. Props are closed unions (`tone: "muted"`), never a string of classes. What a
   kind of data implies is derived from the data, not passed: a poster or a square from the picture's kind, a link's look from
   being a name that has a page. A `ReactNode` slot is only for content that is truly free text or another component of this
   package. `src/strict.test.ts` fails on a new open prop; its `ALLOWED` list may only shrink.
   **Cards.** A card (`Card`, `Panel`) is only for one self-contained item that is comparable with its siblings of the same kind
   or clickable as a whole, or a frame around a chart. It needs real content of its own (a picture, figures, facts, a chart)
   and at least two of its kind on the page, or the page's one chart. Everything else is a `PageSection` (a short noun title)
   with a list, a table, a `dl` or `Text`. The one other card is a section that is an excerpt of a subpage (`PageSection` with `continues`): the card is the section, and its foot is the link to the subpage. Cards are not nested. A title is a short noun phrase, not a sentence.
9. English for code and comments; on-screen text in a component is Norwegian (bokmål).
10. **Use icons where they carry meaning, and use them freely there.** A section's title, the kind of a row, a status, an
    action on a button, a page to go to: each is found and understood faster with a symbol beside its words, and the
    components take one (`icon`, `lead="icon"`, `StatusLine`). An icon is a **meaning** from `ICONS` (`lib/icons.ts`), asked
    for with `<Icon name="…" />`; never a `lucide-react` import in a page, never decoration, and never the colour alone
    (a status has a symbol and words). See «Icons» below.
11. **A place is three levels: front page, list, detail, and the front page is a digest.** A front page shows the state in
    counts and the few things that need the reader most, with a link to all of it; a list page holds everything of one kind;
    a detail page one thing, with its own address. **Internal first:** a tap on a row opens the app's own page for it; a link
    out to another site is marked, says where it goes, and comes last. See «Pages and navigation» below.
12. **No px, ever.** Every length is relative or responsive: rem, em, ch, %, vw/dvh, cqi, lh, `clamp()` or a step of Tailwind's
    scale (`w-0.5`, not `w-[2px]`). A hairline is Tailwind's `border` (no width) or `0.0625rem`; media and container queries are in
    rem or em; a length set from script is rem (`toRem` in `lib/units` for a measured one). Pixel maths in numbers (a canvas,
    WebGL) is fine; a CSS string is not. `src/units.test.ts` fails on any `<number>px` in `src` or `stories`, and the same holds in
    the apps.
13. **One component per use case; apps pass data, never appearance.** What a thing is (`kind`), the role of a text (`role`), what
    failed (`what`, `error`): the component decides the size, the shape, the colour and the spacing. The table «Which component»
    below is the whole list; what is not in it is internal or removed.

## Which component

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

## Work on it

```sh
npm install
npm run hooks       # once per clone, at the repository's root: the visual test before every push that changes what is drawn
npm run verify      # typecheck, lint and the tests
npm run test:visual:docker               # every story's picture against its reference, in CI's Linux and Chromium
npm run test:visual:docker -- --update   # new references for a change that is meant: commit them with it
```

**Visual tests before a push.** The references in `__screenshots__` are drawn in Linux, and a Mac draws a few pixels of every font
differently, so `npm run test:visual` on a Mac always differs. `npm run test:visual:docker` runs it in Playwright's own image at the
lockfile's version, as `linux/amd64` like CI (Rosetta on Apple silicon), and draws the same pictures: a changed story is found before the
push, and a change that is meant brings its new references in the same commit, so the Visual workflow passes without a run by hand.
It needs Docker (Docker Desktop, or `colima start --vm-type vz --vz-rosetta`); the first run installs the packages into a volume
and takes a few minutes, later runs one or two. The pre-push hook (`.githooks/pre-push` at the repository's root, on with `npm run hooks`) runs it when the push
changes `src`, `stories`, `.storybook` or the lockfile, lets the push go with a warning when Docker is not running, and is skipped with
`SKIP_VISUAL=1 git push`. It tests the working tree, so commit or stash what is not to be pushed.

A change is released by bumping `version` in `package.json` and pushing to `main`: CI checks it (`tsc`, the tests), Storybook is published on **https://lmfaole.party/design/** (a Worker with only the files on the route `lmfaole.party/design*`, `wrangler.jsonc`; the workflow deploys it when the repository has the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and `npm run deploy` does the same by hand). The apps are workspaces of the same repository, so they use every commit as it is; `npm run skills` in an app installs the skills again (and `npm run skills:check` in CI fails when they are behind), so an app never follows the rules of an older version without anyone seeing it. The releases before the move, and their tags, are in the archived repository `lmfaole/designsystem`.

## Sections of a page

A page is its header and its sections, straight in `PageLayout`, under each other in the order they matter (rule 7). `PageLayout`
spaces them, the same on every page: a page never wraps them in a `Stack`. Every section has an icon:

```tsx
<PageLayout nav={nav}>
  <PageHeader title="Hjem" />
  <PageSection id="pulls" title="Pull requests" icon="pull-request" more={{ href: "/pulls", label: "Se alle 14 pull requests" }}>…</PageSection>
  <PageSection id="weather" title="Vær" icon="weather" what="været" error={weather.error}>…</PageSection>
  <PageSection id="about" title="Om Röyksopp" icon="info" source={{ label: "Last.fm", href }}>…</PageSection>
</PageLayout>
```

The section's title is an `<h2>`. A section that shows only the first of a list has `more` («Se alle 14») in its title row; one
whose source failed gets `what` and `error` and says «Kunne ikke hente …» itself; one whose words come from elsewhere gets
`source` («Tekst fra Last.fm»). A part of a part is a page of its own.

## Reading and hierarchy

The full guide, with examples, is in Storybook (**Patterns / Reading and hierarchy**). The rules:

1. **One direction: down.** Everything that is read stands under each other in one column (`width="reading"`, 48rem, centred).
   Extra width is margin. Columns only for what is *looked at*: pictures, charts, cards of equal weight, a few figures, a
   reference rail on a detail page.
2. **Order is priority.** Top to bottom is most to least important, the same on a phone and a desktop. The layout never reorders
   by convenience; if two things matter equally, one still goes first.
3. **One thing first.** The first thing the eye lands on is the one that matters most on the screen. Not two.
4. **Three levels, visibly different.** Page title, section title, item: each differs in size, weight or case. Add no fourth
   level of emphasis; `destructive` and bold are for what stops something.
5. **Space groups, lines and boxes do not.** Things that belong together are close (`xs`, `sm`); groups are further apart (`lg`,
   `xl`). The gap between sections is always greater than the gap inside one. Rules and cards are for the rare thing that must
   be set apart (see rule 8).
6. **One left edge, a short eye path.** Everything starts at the same left edge; a row's date or count is at the end of the *same
   row*, within a measure the eye can cross (48rem). Prose is 45–75 characters (`max-w-prose`).
7. **Rows are scanned down the left.** Each row starts with the same thing (the kind, then the name); the name is the strongest
   part, the rest is `muted` and small. Rows of one list have one structure.
8. **Do not make the reader choose a path.** One column is one path. Do not put two lists side by side to be compared (that is a
   table); do not hide the rest behind tabs when it fits under.
9. **Short before long.** A summary and the few that matter first; the long list after (the front page and the list page).

## Long titles

A title is the app's data, and a feed's titles can be anything: «#412 – Hvorfor vi sover dårligere enn før, og hva forskningen faktisk
sier om melatonin, skjermbruk og søvnhygiene (med professor …)», «Episode_2026_11_22_FINAL_v2», a URL. The design system handles them,
one way per context (`lib/long-titles`, Storybook **Patterns / Long titles**, checked in `rules.test.ts`). An app never sets a clamp, a
size or a `title=` tooltip.

1. **Rows, tiles, the compact player, chapters, sub-pages, departures:** the title is cut at two lines (`line-clamp-2`), the line
   under it at one, with an ellipsis. The whole text stays in the page, and a row's link is named by the whole title.
2. **Heads** (`PageHeader`, `DetailHeader`, `NowPlayingCard`, «Spilles nå»): the title is never cut. It wraps in balanced lines
   (`text-wrap: balance`), hyphenates (`hyphens: auto`; `<html lang="nb">`), breaks a word with no place to break
   (`overflow-wrap: anywhere`), and is set one step smaller past 60 characters and two steps smaller past 120 (`titleStep`).
3. **Everywhere:** what holds text in a flex or grid row has `min-w-0`, so it shrinks instead of widening the page; a word with no
   place to break breaks; a badge, a value or an action beside a title has `shrink-0` and keeps its size. The trail's middle crumbs
   are cut at 16 characters and its last at the trail's width; the page's name is whole in its heading.
4. **Nothing scrolls by itself:** no marquee, in the player or anywhere.

## Skills

The rules are also written as **Claude Code skills** (`.claude/skills/`), so a session that builds or changes a page follows them
without being reminded:

| Skill | For |
| --- | --- |
| `designsystem-ux` | The structure of pages: levels, the front page as a digest, lists and details, links, navigation, states |
| `designsystem-ui` | The look: layout, type, colour and state, cards, icons, density, motion |
| `designsystem-hierarchy` | Reading and hierarchy: one column, order is priority, one thing first, space not boxes |
| `designsystem-accessibility` | WCAG 2.2 AA: semantics, keyboard, contrast, icons, tables, live updates, how to check |
| `designsystem-content` | The words: Norwegian bokmål, titles, controls, states, dates and numbers |
| `designsystem-components` | Which component for what, and how to add or release one |
| `designsystem-brand` | The app's brand: its hue, mark, icons and brand platform, and where the brand never goes |
| `designsystem-haptics` | Vibration: which kind for what, `Haptics` and `data-haptic`, the reader's off switch, and the don'ts |
| `designsystem-pwa` | Installed apps: the manifest, the install offer, the service worker and offline, updates, downloads, push and badges, sharing, platform differences |
| `designsystem-review` | A checklist across all of them, run before work is called done |

They are used in this repository as they are. **In a project that uses the design system**, install them with
`npx designsystem-skills` (copies the `designsystem-*` folders into the project's `.claude/skills/`, never touching its own;
commit the result) and keep them current with `npx designsystem-skills --check` after upgrading the design system.
`src/skills.test.ts` fails if a skill's header is wrong or it names a component that no longer exists.

## Pages and navigation

The full guide, with live examples, is in Storybook (**Patterns / Pages and navigation**). The rules:

**Three levels, no more.** Front page → list → detail. A fourth level means the structure is wrong.

| Level | It is | It answers |
| --- | --- | --- |
| Front page | A **digest**: the state in counts, then the few things that need you most | Do I have to do something now? |
| List | **Everything** of one kind, in groups by what needs you most | What is there? |
| Detail | **One thing**, enough to decide what to do without leaving | What is this, and what do I do? |

**The front page is a digest.**
1. **Summary first:** a `SummaryBar` of counts, each a link to what it counts, before any list.
2. **A few, by need:** three to five items per section, in the order of what needs the reader (blocked before waiting), then
   `more` («Se alle 14») on the section. Never the whole list.
3. **One screen of what matters**, two at most on a phone. A section with nothing for the reader shows one quiet line, never an
   empty box.
4. **Complete at rest:** what matters is visible without a click; «Se alle» is navigation, never a «vis mer» that opens in place.
5. **State in form:** a symbol and words; `destructive` only for what stops something.

**A detail page** has an address of its own and this anatomy: `Breadcrumbs` (the parent is the way back on a phone) → `PageHeader` (title, one line of
where it is from) → `StatusLine` → what it is (an excerpt, a `FactList`) → what happened last → actions → **the link out, last**.
It is never only a dialog.

**Links.** Internal first: a row's name links to the app's own page when there is one. A link out (`TextLink external`,
`LinkButton external`) carries the external symbol, is read as external, names the place («Åpne på GitHub», never «Les mer»), and
comes last, once for each place. A credit in running text («Værdata fra Yr») is a `TextLink external`. Links open in the same window.

**Navigation.** `NavBar` between the top-level places of an app, given to `PageLayout` as `nav`: a **bar at the foot of the screen on a
phone** (an icon over a one-word label, in the reach of the thumb) and a **rail down the left side from tablet width up**. Three to
five places is best; more scroll sideways on a phone (the current one in view), with «Innstillinger» last; the same order on every page, the current one marked (`aria-current="page"`); on a detail page the list it belongs to
is the current place. It is **navigation, not tabs**: tabs switch between views of the *same content on one page* (GOV.UK: tabs
"switch views within a page", service navigation "links across a service"; Material 3: a navigation bar and a rail for top-level
places, tabs for secondary content), and the design system hides no content in tabs, so there is no tabs component.

**Where an app's pages are shown (one model for every app).** Under the hub there are three levels: the app's front page → a page →
a subpage or a detail.

| Where | What |
| --- | --- |
| An app's top-level pages (front page, Status, AdGuard …) | `NavBar` (bar at the foot on a phone, rail from tablet width); five or so, «Innstillinger» last |
| Every page that has a parent (a subpage, a detail, and a page of an app that belongs to a group) | `Breadcrumbs` at the top: the whole trail from tablet width, the parent alone as a way back on a phone. A page with nothing above it (a standalone app's front page) has none |
| A page that has subpages | `SubPages` under the title of a page that is nothing but its subpages (a settings overview): a list in ONE column (icon, name, one line of what is on it), never cards or buttons |
| A section that is an excerpt of a subpage | `PageSection` with `continues`: a card, the first few rows, and one full-width link to the subpage at its foot («Se hele historikken») |
| Moving between apps | The first crumb is the group (`Hjem`, `Medier`) and links to the page that lists its apps |

The breadcrumbs say *where*, the title says *what*: do not repeat a page's title in a second heading. There is no side menu and no
grid of cards for pages.

| Component | For |
| --- | --- |
| `SummaryBar` | The state of a place in counts that are links; first on a front page |
| `NavBar` | The way between the top-level places: a bar at the foot on a phone, a rail at the left from tablet width |
| `Breadcrumbs` | Where the page is, on every page below the top level; the parent alone as a way back on a phone |
| `SubPages` | The pages under this page, as a list (icon, name, one line) under the title of a settings overview |
| `continues` on `PageSection` | A section as a card with one link to the subpage it is an excerpt of at its foot |
| `Person` | A person's name with their round picture beside it: in a list of facts (several reviewers), a comment, a row |
| `more` on `PageSection` | «Se alle 14» in a section's title row |
| `LinkButton` | An action that goes somewhere, always outline; `external` for a link out |
| `TextLink` | A link in running text; `external` for a link out, always marked |

**A player that plays on between pages (podcasts).** An app that plays sound has one `PodcastPlayer`, in its root layout (in
Next.js, `app/layout.tsx`, outside the page's `PageLayout`; or as `PageLayout`'s `player` where the frame itself is shared), so the sound
goes on while the reader moves between pages. It draws nothing until an episode is played, then docks at the foot: **above the
`NavBar`'s bar on a phone, at the foot of the content column beside the rail from tablet width**. The page leaves room under it by
itself (`--player-room`, set by the player and read by `PageLayout`; `--nav-bar-room` and `--nav-rail-room` in `shell.css` are where it
docks). Episodes are played from a `PlayButton` («Spill av», «Fortsett», «Pause») or a `ChapterList`, or from the app's code:

```tsx
// app/layout.tsx (a server component): the player is a client component, and the one store is shared by every page.
import { PodcastPlayer } from "@lmfaole/designsystem/components/podcast-player"
<body>{children}<PodcastPlayer onProgress={save} /></body>

// A client component: play, and read the state.
import { player, usePlayer } from "@lmfaole/designsystem/components/podcast-player"
player.play(episode, 725)
const { episode, playing, position } = usePlayer()
```

`onProgress(episode, position, duration)` is where the app saves where the reader is: every `progressEvery` seconds (15) while it
plays, at a pause and at the end, when another episode takes over, and when the page is hidden or left. The types and the pure parts
(`Episode`, `Chapter`, `currentChapter`, `formatClock`, `spokenTime`, `timeLeft`, `SKIP_BACK`, `SKIP_FORWARD`) are in `lib/podcast-player`, safe on the server.

The docked bar is a media app's bar: the artwork, the title and the show or chapter, play and pause (+30 s where there is room) and a
thin line of how far it has come. A tap on it opens **«Spilles nå»** (`NowPlaying`, exported from the same module and drawn by
`PodcastPlayer`): a native modal `<dialog>` over the whole screen on a phone and a large sheet in the middle of a wide one, with the
artwork large on its own colours (`AmbientBackdrop`), a scrubber with the time gone and left, −15 s, play, +30 s, previous and next
chapter, the speed and the chapters. Esc, «Lukk», a drag down, Android's back button and a change of page close it, and focus goes back
to the bar. `defaultOpen` opens it at once.

### A game section (Steam)

Three levels, no tabs and no menu inside a page: **Spill** (a digest: «Spiller nå» when the reader is in a game, «På tilbud», «Nylig spilt»,
«Nyheter», «Mest spilt», «Profil», each a `PageSection`, the long ones `continues` to their page) → **a game's page**, **Ønskeliste**,
**Nyheter** or **Profil**, each with `Breadcrumbs` back. A game's page is `DetailHeader kind="game" backdrop` over `DetailLayout`: the rail
has `gameFacts()` and «Åpne i Steam-butikken»; the sections in a fixed order are «Om spillet», «Bilder og videoer» (`MediaGallery`),
«Prestasjoner», «Statistikk» (`FactList` of `statFacts()`), «Nyheter» (three, `continues`), «Tilleggsinnhold» (`List` with `price`). The
wishlist is one `List` with `price`, under `FilterChips` («Alle», «På tilbud»), what came on sale since the last visit first («Nye
tilbud», `newSales()`), and the menu's «Spill» carries the count (`NavItem.count`). The profile is `DetailHeader kind="person" presence`,
the level as `Progress` (`levelProgress()`) and the badges as a `List` with the `award` icon. A part that could not be fetched is its
section's `what` + `error`; one with nothing is left out, or an `EmptyState` where it is the page's whole content («Ønskelisten er tom»:
`nothing-yet`; no sales: `all-done`).

## Description lists

`FactList` is a description list (`<dl>`): a **term** and what belongs to it. A term has **one value or several**, and several things
of one kind are several values of *one* term, each on a line of its own, under the term, which is written once:

```tsx
<FactList
  facts={[
    ["Gren", "refactor/textarea-forenkling → main"],
    ["Venter på review fra", ["zenabii", "kristianulv23", "Stormoen"]], // three lines under one term
    ["Reviews", ["copilot: kommenterte", "piofinn: godkjent"]],
    ["Tildelt", []], // nothing: the term is left out
  ]}
/>
```

- **Several of a kind stack.** Reviewers, assignees, labels, branches, tags, authors: each a value of its term, under each other. Never
  `"a, b, c"` in one line: a list is scanned down, a sentence is read along, and a long name wraps in the middle of the line.
- **One term, written once.** Do not repeat the label on every line, and do not make several terms of one kind («Reviewer», «Reviewer»).
- **Terms without a value are left out**, and so is the list when none is left. Do not write «Ingen» or «–».
- **Short terms, short values.** A term is a noun (`Gren`, `Størrelse`); a value that is long text is not a fact but a section.
- **When to use it:** facts about *one thing* (a detail page's «Fakta»). Facts that compare *many things* are a table; things that are
  the content of the page are a `PageSection` with `List`.
- Semantics: `<dl>` with a `<div>` per term holding its `<dt>` and every `<dd>`; a screen reader reads «term: value, value».

## Markdown

`Markdown` (`components/markdown`) shows text written in Markdown (a pull request's description, a comment, a README) in the
design system's own forms: headings, lists, task lists, code, quotes, tables, links and pictures are drawn by the design system,
never by the text. It is the one way to show Markdown: **do not convert it to HTML and insert it.**

```tsx
<PageSection id="about" title="Beskrivelse" icon="info">
  <Markdown source={pull.body} />
</PageSection>
```

- **GitHub-flavoured and safe.** Tables, task lists, strike-through and bare links work; raw HTML in the text is *ignored*, not
  inserted, and unsafe addresses (`javascript:`) are dropped.
- **Headings are demoted** (`from="h3"`, the default; `"h4"` inside a subsection) so the text never breaks the page's outline.
- **Links out are marked** as external (as `TextLink external`); a link to an anchor or inside the app is a plain link.
- **Code scrolls in its own box**, tables in theirs: never the page.
- `size="sm"` for a comment. Not for text the app writes itself: that is `Text`.
- Cut a long text at a paragraph, not in the middle of a construct, and say where the rest is.

## Icons

**Use an icon wherever it makes something quicker to find or to understand.** The design system makes it the easy way: an
icon is a *meaning* you ask for, and the components that show titles, rows, statuses, actions and errors take one.
The set is **complete on purpose** (171 meanings in eleven groups), so a page never waits for an icon; a meaning that is missing is added at once in `scripts/icon-set.mjs` and `npm run icons` regenerates the shapes (`src/lib/icon-nodes.ts`), the types and the Catalogue. An icon is an inline `<svg>` rendered as plain HTML with its look in CSS (`src/icon.css`: a size property, `currentColor`, mirroring under `:dir(rtl)`); no icon component runs in the browser.
The full guide, with the catalogue of every meaning, is in Storybook (**Icons / Guide** and **Icons / Catalogue**).

```tsx
import { Icon } from "@lmfaole/designsystem/components/icon"
import { StatusLine } from "@lmfaole/designsystem/components/status-line"

// A section's title, and the kind of each row
<PageSection id="pulls" title="Pull requests" icon="pull-request">
  <List rows={[{ key: "1", href: "/pulls/1", icon: "pull-request", iconLabel: "Pull request", title: "…", value: "i dag" }]} />
</PageSection>

// A status: a symbol and its words, so it reads the same without colour
<StatusLine items={[{ text: "Tester feilet", icon: "failure", tone: "destructive" }, { text: "Godkjent", icon: "success" }]} />

// An action
<Button variant="outline"><Icon name="refresh" slot="start" />Oppdater</Button>
```

| Where | How |
| --- | --- |
| A section's title | `icon` on `PageSection` (required) |
| The kind of a row | `List` with `icon`, `iconLabel`, `iconTone` per row |
| A status | `StatusLine`, an `icon` per item; `destructive` is for what stops something |
| An action | `<Icon name="…" slot="start" />` (or `"end"`) inside a `Button`; an icon-only button needs an `aria-label` |
| A page to go to | `icon` on a `NavBar` item or a `SubPages` page |
| An error | `ErrorMessage` has one |

- **Meanings, not glyphs.** `ICONS` in `src/lib/icons.ts` names icons for what they *mean* (`merge`, `waiting`, `failure`,
  `place`, `weather`), so two pages that mean the same thing show the same symbol and changing a glyph is one line. Look for
  the meaning there first; add one (under its group, and to the Catalogue story, which does not compile until it is there)
  only when a page needs one that is not.
- **Where not:** decoration (an icon that means nothing), the same icon on every row of a list (use it to tell kinds and
  states apart), and an unlabelled icon where it is ambiguous. There is no green: a good status is plain, one that stops
  something is `destructive`.
- **Accessibility.** Decorative by default (`aria-hidden`); give `label` where an icon stands alone and carries the meaning.
  A status never relies on colour alone.
- **Enforced:** `src/lib/icons.test.ts` fails on a `lucide-react` import outside `lib/icons.ts` and `ui/`, on two meanings
  sharing a glyph, and on an `Icon` that is not hidden by default or that takes a class.

## States and messages (8.4)

What a page says when it has nothing, is old, is loading or has failed. Researched against the documentation of GOV.UK, Primer, Carbon and Atlassian; the rules are in the `designsystem-ux` (§5), `designsystem-content` and `designsystem-components` skills and in Storybook, **Patterns / States and messages**.

| Component | For |
| --- | --- |
| `EmptyState` | A page or section with nothing to show, full height with a picture: `reason` (`first-run`, `nothing-yet`, `no-results`, `all-done`) and `what` give the fixed words, and at most one central action. Replaces the whole empty structure |
| `ErrorMessage` | A query that failed, in the part that failed: «Kunne ikke hente {what}», the cause under «Detaljer», «Prøv igjen». Announced at once |
| `Banner` | A message about the whole page or a section: `success` (one past-tense word: «Lagret») or `info` (old data). Never a failure. Cannot be dismissed |
| `Badge` | One short word about a thing, next to its name in a row. Words and symbol, never colour alone |
| `Time` | A moment: relative under seven days, a date after, the exact time always in `title` and `datetime`; `now` is passed in |
| `Disclosure` | Longer content out of the way, a native `<details>`; never what matters |
| `Progress` | One value against a goal or a limit, as a meter with its label and value in words; never colour |
| `TextField` | One native text input with its label above, a hint and an error tied to it; `optional` marks the minority |
| `SearchField` | A search that goes to the same page with `?q=`, with its label and button in words |
| `FormErrorSummary` | The errors of a sent form at the top of the page, with focus, each a link to its field |

There is **no toast** and no tooltip: a toast disappears before it can be read, and a tooltip hides words from touch and keyboard. Say it in a `Banner` or next to what it is about, and put the words beside the icon.

## Brand

The apps are a family under lmfaole, each with its **own hue and mark** and the family after its name («Medier · lmfaole»). Brand is opt-in:
without `data-brand` every brand token is the ink, and nothing looks different. The guide is **Foundations / Brand** (research, principles,
where the brand goes and never goes, a brand platform template with a proposed draft), the skill `designsystem-brand`.

```tsx
<html lang="nb" data-brand="amber">            {/* rose, amber, teal, blue or violet (BRAND_HUES) */}
<NavBar label="Hovedmeny" title="Medier" glyph="play" family="lmfaole" items={items} />
<FirstRun glyph="play" … />
```

```sh
npx designsystem-app-icons --hue amber --glyph play    # favicon.svg, favicon.png, apple-touch-icon.png, icons/icon-192|512, maskable-192|512
```

## 10.0.0

**Én komponent per bruk, og appene sender data, aldri utseende.** Tabellen «Which component» (fra `src/lib/use-cases.ts`) er hele listen; det som ikke står der, er internt eller fjernet. Overgangen står i «Migrating to 10.0.0» nedenfor.

- **A. Grunnmur og ramme:** `Text` har roller (`body`, `quiet`, `note`, `figure`) i stedet for `size`, `tone`, `weight`, `numeric` og `as`. `Stack` har to avstander (`tight`, `default`) og ingen `width`; `Inline` og `Grid` har én fast avstand, og `Inline items` + `label` er en liste. `PageLayout` eier avstanden mellom seksjonene. `PageSection` krever `icon` og får `source` («Tekst fra …») og `what` + `error`. `StreamedSection` og `SectionSkeleton` tar `icon`. `Picture` tar `kind` og `context` i stedet for `ratio`, `corners`, `size` og `disc` (formene står i `lib/picture-kinds`). `Split`, `SectionGroup`, `SubSection`, `Code` og `CopyButton` er borte; `Card` og `Separator` er interne. Ingen px noe sted (regel 12, `units.test.ts`).
- **B. Lister:** Én `List` (`components/list`) erstatter `Rows`, `PictureRows` og `RankedRows`. Radene er data: `title` (tekst) og `href`, `meta` (linjen under, delene skilles med « · »), `value`, `action`, og per rad `badge`, `isNew`, `live`, `status`, `progress`, `map`, `icon`. Bildet foran kommer fra `kind` (som `Picture`; ny type `achievement`), en topliste er `ranked` (`change`, `amount`). `Tiles` tar `kind` og `meta` i stedet for `ratio`, `corners`, `description` og `lines`. `EntityRows`, `VirtualTbody`, `EntryList`/`EntrySection`, `HeadlineList`, `StoryList`, `FoldList`, `DatedLinkTable`, `PictureCard`, `ItemLink`/`SlugLink` og `CardLink` er borte (ingen app brukte de fleste; de andre er en rad med `href`). `@tanstack/react-virtual` er ikke lenger en avhengighet.
- **C. Lenker, handlinger og tilstander:** `EmptyState` fyller rommet den står i, med en tegning, faste ord og høyst én handling midt på (etter Apples `ContentUnavailableView`); appen sier bare hvorfor (`reason`: `first-run`, `nothing-yet`, `no-results`, `all-done`) og hva (`what`), og typene krever eller forbyr handlingen. `ErrorMessage { what, error, retry }` er den eneste feilvisningen («Kunne ikke hente {what}», årsaken i «Detaljer», «Prøv igjen») og står i samme ramme med et varseltegn; `PageSection what` + `error` bruker den. `TextLink external` erstatter `ExternalLink`; `TextLink stretched` er borte (listene eier radlenken). `LinkButton` er alltid outline. `Button` (`components/button`) er en ny, fast knapp (outline, `icon`, `onClick`); `PendingButton` er den eneste fylte og har ingen `size`. `Banner` har bare `success` og `info`. `ErrorPage actions` er `LinkTo[]`. `CommandButton` er intern; `SegmentedToggle`, `CountUp`, `DataCell`, `NumberCell`, `SortHeader`, `Pagination` og `lib/pagination` er slettet.
- **D. Detaljsider og fakta:** Ny `DetailLayout` (`components/detail-layout`) er kroppen på alle detaljsider. Seksjonene er `children`, og en skinne på sluttsiden har faste plasser for data i fast rekkefølge: `map`, `status`, `steps`, `actions`, `facts` (uten egen tittel; «Fakta» er borte), `links` (lenker ut, alltid her) og `updated` («Sist endret …»). På telefon kommer skinnen først, under hodet. `Split` og `LinkList` er fjernet. `MapThumb` og `MapCredit` er interne: et kart er data, og `List` krediterer kartene sine selv. `DetailHeader` tar `kind: PictureKind` (formen følger av typen) og `label` (ordene) i stedet for `ratio`, `corners`, `size` og ord i `kind`; hodet er stort for en artist og der det er `sleeve`. Hodet har en hårfin ramme, og et lyst bilde får mørkere bakgrunn i lyst tema, så kanten på et hvitt omslag synes.
- **E. Innstillinger og valg:** Innstillingene er like i alle appene. `AppearanceSettings` er hele «Utseende» (tema, effekter med vibrasjon, lyset og «Lagre»), `InstallSettings` er «App», `IntroSettings` er «Vis introen igjen» og `SourcesSettings` er «Kilder»; appen sender bare `prefs`, `action`, `back`, `appName`, `cookiePath` og `sources`. Oversikten starter alltid med «Utseende» og «App» (`appearancePage`, `appPage` i `lib/settings-pages`). Førstegangsveiviseren bruker `ThemeChoice`, `EffectsChoice` og `TiltChoice`. `ChoiceCards` er bare ord (ingen `preview` eller `layout`). `FilterChips` blir en navigerende `NativeSelect` over seks valg, og `PeriodPicker` er borte. `ThemeSample`, `EffectsPreview`, `TiltPreview`, `HapticsSetting` og `SourceList` er interne. Feltnavn, informasjonskapsler og serverhandlinger er uendret.
- **F. Diagrammer:** Ett høydetoken, `--chart-height` (`clamp(12.5rem, 22cqi, 20rem)`), og én farge, `--chart-accent` (temaets `primary`; `WeatherStage` setter vær-fargen). Ingen diagrammer tar `height`, `color`, `labelEvery`, `showTable` eller `emptyMessage`: tabellen «Vis tallene» er alltid med, og `ColumnChart` tynner aksen selv (`labelStep`). `ChartCard empty` er et substantiv i flertall («avspillinger» → «Ingen avspillinger å vise.»). `ColumnChart`, `AreaChart`, `DumbbellChart`, `CalendarHeatmap` og `AuroraChart` står alltid i et `ChartCard` (en test). `LineChart`, `RankedBarChart`, `StackedColumnChart`, `DonutChart`, `ScatterChart`, `BoxPlot`, `Histogram` og `Heatmap` er fjernet (ingen app brukte dem); `HeatLegend` er intern.
- **G. Podkast:** Ny `Transcript` (`components/transcript`): transkripsjonen til en episode, med tider (`cues`: `start`, `end`, `text`, `speaker`) eller uten (`text`). Linjen som sies nå (`currentTime`) markeres med `aria-current` og holdes i syne med en rolig rulling i egen boks (ingen glidning med redusert bevegelse); den stopper når leseren ruller selv, og «Følg avspillingen» tar den opp igjen. Et trykk på en linje går dit (`onSeek`), eller i designsystemets spiller med `episode`. Talere grupperes i turer, og et søk markerer treffene («Treff 2 av 5»). Uten innhold er den en `EmptyState`, med `error` en `ErrorMessage`. `List` får tre radfelt: `episode` («S2 E14» først i meta, «Trailer»/«Bonus» som merke; også `DetailHeader episode`), `reason` (anbefalinger: «Anbefalt av …», «Fordi du følger …», «Med …») og `role` (folk med `kind="person"` grupperes etter rolle under «Verter», «Gjester» … i fast rekkefølge; `personRole()` leser `podcast:person`). `podcastFacts()` (`lib/podcast-facts`) gir fakta om en podkast til `DetailLayout facts`: utgiver, kategorier på norsk, språk, hvor ofte den kommer ut, antall episoder og når den startet.
- **H. Spill (Steam):** Ny `MediaGallery` (`components/media-gallery`): skjermbilder og trailere i 16:9, de seks første og «Se alle N», en dialog med «Forrige»/«Neste», piltaster og «3 av 24»; en video spiller aldri av seg selv. `gameFacts()` (`components/game-facts`) gir fakta om et spill til `DetailLayout facts` i fast rekkefølge: anmeldelser med Steams ord («Svært positive · 94 % av 12 345», ikon etter stemning), spillere nå, Steam Deck (Verifisert/Spillbar/Ikke støttet/Ukjent), spillere (enspiller, samarbeid …), kontroller, utvikler, utgiver, utgitt og pris. `DetailHeader` får `backdrop` (spillets store bilde over hodet, til pynt) og `presence` («Spiller Hades II», «På nett», «Frakoblet · sist på nett …»). `List` får `price` (pris i verdikolonnen, på tilbud «−40 %» og gammel pris overstreket, `newSale` gir «Nytt tilbud») og `news` («Oppdatering»/«Hendelse»). `NavItem` får `count` (et tall i en pille, ord til skjermleser). `Overlay` får `variant="media"`. Ordene og logikken står i `lib/games` (`reviewSummary`, `priceWords`, `newSales`, `deckStatus`, `gameFeatures`, `presenceOf`, `levelProgress`, `statFacts`, `newsKind`).
- **Lange titler:** Designsystemet tar seg av lange titler, likt i alle appene (`lib/long-titles`, «Long titles» over). I rader, fliser, minispilleren, kapitler, undersider og avganger kuttes tittelen etter to linjer og linjen under etter én, med ellipse; hele teksten står fortsatt på siden og er lenkens navn. I hoder (`PageHeader`, `DetailHeader`, `NowPlayingCard`, «Spilles nå») kuttes tittelen aldri: den brytes i balanserte linjer, deles med bindestrek, bryter ord uten bruddsted og settes ett trinn mindre over 60 tegn og to over 120. Alt med tekst i en flex- eller grid-rad har `min-w-0`; merker, verdier og handlinger ved siden av en tittel krymper aldri. Midterste brødsmuler kuttes. Ingen rulletekst. Appene skal fjerne egne `truncate`, `line-clamp` og `title=` rundt titler de sender inn.
- **Skills, med research på moderne apper og PWA-er:** Ny `designsystem-pwa` (manifest, ikoner og installering, service worker og offline, oppdateringer, nedlastinger, varsler og merker, deling, forskjeller mellom plattformer, ytelsesbudsjett). Alle de andre er skrevet om etter kilder fra 2024–2026 (Apple HIG, Material 3, web.dev, NN/g, GOV.UK, Designsystemet, Aksel, Uutilsynet): adresse, tilbake og rulleposisjon, søk og filter, angre før bekreftelse og anbefalinger med begrunnelse i `designsystem-ux`; overflater og mørk modus, bilder og berøringsflater i `designsystem-ui`; app-ikon og oppstart i `designsystem-brand`; WCAG 2.2 i sin helhet, norsk regelverk, media og kognitiv tilgjengelighet i `designsystem-accessibility`; klarspråk, tall og datoer i nb-NO og tekst laget av KI i `designsystem-content`; API-design, avvikling og utgivelser på `main` i `designsystem-components`; sjekklisten i `designsystem-review` dekker alle ti. `npx designsystem-app-icons` lager nå også `maskable-192.png`, som `webManifest()` krever. **To adopt:** `npm run ds:bump` (henter skillsene), og legg `icons/maskable-192.png` i manifestet.

## 9.3.1

**`WebAnalytics`** tar `nonce` for apper med CSP basert på nonce.

## 9.3.0

**Cloudflare i appene.**

- **`lib/cloudflare`**: `transformedImage(src, { width, height?, fit?, quality?, dpr? })` gir adressen gjennom sonens Image Transformations (`/cdn-cgi/image/…,format=auto/<src>`), og `transformedSrcSet` gir 1x og 2x. `data:`, `blob:`, SVG og bilder som allerede er transformert kommer tilbake uendret. `WEB_ANALYTICS_CSP` er det CSP-en må tillate for Web Analytics, og `webAnalyticsBeacon(token)` lager `data-cf-beacon`.
- **`WebAnalytics`** (`components/web-analytics`): beaconet til Cloudflare Web Analytics, uten informasjonskapsler. Det rendrer ingenting uten et gyldig token.

## 9.2.0

**Heldekkende «Spilles nå» for podkast.** Spilleren nederst er forenklet, og spilleren i sin helhet åpnes over hele skjermen, som i en app for lyd:

- **`PodcastPlayer`**: linja nederst har bare bilde, tittel, podkast eller kapittel (én linje hver), spill av/pause (og +30 s der det er plass) og en tynn linje for hvor langt episoden har kommet. Et trykk på linja («Åpne avspilleren: …») åpner «Spilles nå». Ny valgfri prop `defaultOpen`. Tidslinjen, hastigheten og kapittellisten har flyttet inn i «Spilles nå».
- **`NowPlaying`** (`components/podcast-player` og `components/now-playing`): «Spilles nå» som en native modal `<dialog>` (`data-overlay="player"` i `overlay.css`): hele skjermen på mobil, et stort ark midt på fra nettbrettbredde (med kapitlene ved siden av). Stort, opplyst bilde på en bakgrunn i bildets farger (`AmbientBackdrop`, vanlig tone når bildet ikke kan leses), tittel (lenke med `href`, som lukker dialogen), kapittelet som spilles (går til kapittellisten), tidslinje med tid brukt og igjen, −15 s, stor spill av/pause, +30 s, forrige og neste kapittel, hastighet og kapitler. Viser «Henter lyden …» og feil med «Prøv igjen». Lukkes med «Lukk», Esc, et dra nedover på mobil, et trykk utenfor arket, tilbakeknappen på Android og et sidebytte; fokus går tilbake til linja. Siden bak låses. Redusert bevegelse respekteres.
- **`lib/podcast-player`**: `SKIP_BACK` (15) og `SKIP_FORWARD` (30).
- **Ikoner**: `seek`, `previous`, `next` og `chapters`.

## 9.1.0

**Podkastspiller.** Tre nye komponenter og en felles tilstand for apper som spiller lyd:

- **`PodcastPlayer`** (`components/podcast-player`): appens ene spiller, satt én gang i rot-layouten, så lyden spiller videre mellom sidene. Den tegner ingenting før en episode spilles, og legger seg så nederst: over `NavBar`-linja på mobil og nederst i innholdskolonnen ved siden av skinnen fra nettbrettbredde. Den har bilde, tittel, podkast eller kapittelet som spilles, −15 s, spill av/pause, +30 s, en tidslinje (`aria-valuetext` «12 min 5 s av 1 t 2 min»), tid brukt og igjen, hastighet (0,8×–2×, husket i nettleseren) og kapittelliste. Låseskjermen og hodetelefonknapper virker gjennom Media Session (forrige/neste er kapitler). Feil vises med «Prøv igjen». `onProgress(episode, position, duration)` lar appen lagre hvor lytteren er.
- **`PlayButton`** (`components/play-button`): «Spill av», «Fortsett» (med `position`, tid igjen i ord og en tynn fremdriftsstrek) eller «Pause». Følger spilleren, uansett hvor episoden ble startet.
- **`ChapterList`** (`components/chapter-list`): kapitlene med starttid. Et trykk går dit og spiller, og kapittelet som spilles er merket «spilles nå».
- **`lib/podcast-player`**: tilstanden uten React (`player.play`, `load`, `toggle`, `pause`, `seek`, `skip`, `setRate`, `retry`, `close`, `subscribe`), typene `Episode`, `Chapter` og `PlayerState`, og rene hjelpere (`currentChapter`, `chapterStep`, `formatClock`, `spokenTime`, `timeLeft`), trygge på serveren. `usePlayer()` (`lib/use-player`, også eksportert fra `components/podcast-player`) leser tilstanden i React.

**`PageLayout player`**: et nytt spor for spilleren der rammen selv er delt. Siden setter av plass under spilleren (`--player-room`) uansett hvor spilleren står, og `shell.css` har `--nav-bar-room` og `--nav-rail-room` for det som legger seg langs `NavBar`. Ingen endring for apper uten spiller.

## 9.0.0

**Strammere props, samme ord i alle komponenter.** Hver komponents props er gått gjennom mot hvordan medier og startside faktisk bruker dem. Det ingen app bruker er fjernet, typene er snevret inn til verdiene som brukes, og det samme heter det samme overalt. Nytt `lib/vocabulary.ts` har de felles ordene:

- **`Tone`** (`default | muted | destructive`) for alle toner: `Text`, `Badge`, `Icon` (`inherit` heter nå `default`), `StatusLine`, `DataCell`, `Rows iconTone`, `SummaryItem`.
- **`LinkTo`** (`{ href, label, icon? }`) for alle lenker: `More`, `Continuation`, `NavItem`, `SubPage`, `Crumb`, `SummaryItem`, `FilterChip`, `EmptyState action` og `IntroCallout action`.
- **`description`** for teksten under en tittel. Det erstatter `body` (`IntroCallout`, `PermissionCard`, `UsernameForm`, `FirstRun`-steg, `SettingsSection`), `lead` (`PageHeader`) og radenes `detail`/`note`/`byline`/`source`/`text`.
- **`rows`** for en listes elementer (`HeadlineList`, `StoryList`) og **`data`** for et diagrams data. Det erstatter `hours`, `slots`, `rows`, `days`, `cells`, `points`, `groups`, `values`, `series` og `spans`.
- **Rader:** `title` og `value` (`Rows` `body`/`trailing`, `EntityRows` `name`/`count`, `PictureRows` `aside`). Radens bilde heter `picture` (`Rows` `lead`).
- **Bilder:** det som *er* et bilde tar `src` (`Picture`, `AlbumSleeve`, der `src` nå er påkrevd). Det som *har* et bilde tar `picture`.
- **Skjema:** `value` (`TextField` `defaultValue`, `SearchField` `q`), `name` (`ToggleMatrix` `namePrefix`), `ariaLabel` (`Sparkline`, `DurationBars`) og `valueLabel` (`Histogram` og `BoxPlot`, tidligere `valueName`).

**Nye standarder** som de fleste kallene allerede sendte: diagramtabellen (`showTable`) er på, `TextField verbatim` er på, `NavBar` har `label` «Hovedmeny» og `family` «lmfaole», og `MapThumb href` er `osmLink(at)`. `ChartCard empty` er nå selve setningen (`empty?: string`, i stedet for `empty` pluss `emptyMessage`).

**Fjernet fordi ingen app brukte det:**

- **Knapper og lenker:**
  - `Button` `secondary`/`destructive` og størrelsene `xs`/`icon`/`icon-xs`/`icon-sm`.
  - `LinkButton` `secondary`/`ghost`, `PendingButton variant`, `ButtonGroup orientation`.
  - `ExternalLink look`, `CardLink look="block"`, `SlugLink look`.
  - `NewBadge` `seen`/`label` og `UserChip` `label`/`changeLabel`.
- **Tekst og layout:**
  - `Text` `truncate`/`dateTime`, `Text as` utenom `p`/`span`, `Heading look="item"`.
  - `Stack` `as`/`gap="none"`/`width="reading"`, `Inline align`.
  - `Grid columns` utenom `charts`/`tiles`, `PageColumn` `as`/`gap`/`width`, `Split gap`.
  - `PageSection level`, `PageLayout` `foot`/`after`.
- **Lister:**
  - `Timeline` `order`/`byDay`/`collapseAfter`/`limit`/`headingLevel`.
  - `DepartureBoard` `window`/`headingLevel` og `DepartureList headingLevel`.
  - `StopSequence` `foldLabel`/`hideLabel`, `RankedRows rankLabel` (bruk `columns`), `Time format="date"`.
- **Tilstander og skjema:**
  - `Banner tone="destructive"` (bruk `ErrorMessage`), `IntroCallout dismissLabel`.
  - `TextField type`, `TimeField` `step`/`min`/`max`, `ListField` `rows`/`verbatim`.
  - `UsernameForm` `submitLabel`/`pendingLabel`/`icon`/`placeholder`, `FirstRun`s tekstoverstyringer, `PermissionCard unsupportedText`, `HapticsSetting` `label`/`description`, `Progress target`.
  - `ErrorMessage` og `ErrorPage description` tar nå bare tekst.
- **Diagrammer:** `ChartCard level`, `formatLabel` og `color` på `ColumnChart`/`AreaChart`/`Sparkline`.
- **Media:**
  - `BrandIcon` `sm`/`xl`, `Picture ratio="wide"` med `hero`/`feature`.
  - `NowPlayingCard label`, `PictureCard level` (tittelen er alltid `<h3>`, og `title` er tekst).
  - `MapThumb` `zoom`/`credit`, `Logo` `plate`/`decorative`, `Wordmark`/`AppMark tone`, `WeatherStage as`, `ThemeSample size`.
  - `EffectsPreview`/`TiltPreview` uten `mode`.

Appene er oppdatert i samme runde.

## 8.79.0

**Dybde og spinn i WebGL.** `AlbumSleeve` (og dermed `DetailHeader` med `sleeve`) og `Disc` kan nå dras rundt med mus, penn eller finger: sidelengs spinner den hele 360 grader, glir ut og legger seg med forsiden fram igjen. Opp og ned vipper den litt. På touch ruller sida fortsatt ved loddrett dra (`touch-action: pan-y`), og et dra på en spinnende plate teller ikke som klikket som stopper den. Coverne har fått mer dybde: avrundede eller brettede kanter som fanger lyset, preget trykk, en trykt bakside med tekst og strekkode, og plate, disk eller kassett med egen kant og tykkelse. Plata har riller i relieff og avrundet kant, og `Disc` har fått bakside. `AmbientBackdrop` er et grunt brett: bunnen mørkner svakt mot kanten på lyssiden. Ny `lib/spin.ts` (`attachSpin`, `stepSpin`, `dragSpin`). Ingen endring for appene.

## 8.78.0

**De gamle konsollenes esker har ekte format.** `AlbumSleeve` og `DetailHeader` (`disc`) tegnet alle pappeskene stående 2:3, så et kvadratisk GBA-cover ble skåret til en plakat. Nå har hver eske formen til den ekte: NES 5:7, Game Boy nesten kvadratisk (0,92), GBA kvadratisk, SNES og N64 liggende (1,38:1), med kassetten i passende størrelse ved siden av. Uten WebGL og under redusert bevegelse står bildet i samme form, ikke i en kvadrat eller plakat. `sleeveFace` gir nå også `height`. Ingen endring for appene, men esken tar mer eller mindre plass i bredden enn før. Historiene `AlbumSleeve` (Nes, Snes, N64, GameBoy, Gba) har bilder i de ekte formatene, og `DetailHeader` har fått `LargeGameGba`.

## 8.77.0

**Knapper som viser at skjemaet sendes.** Ny `PendingButton` (Actions): sendeknappen i et vanlig skjema. Mens serveren svarer (et brukernavn som sjekkes, innstillinger som lagres), bytter den teksten til `pendingLabel` («Lagrer …», «Sjekker brukernavnet …») med en liten spinner. Den beholder bredden, blir `aria-busy` og `aria-disabled`, sier det samme i en høflig live-region, og et nytt trykk sender ingenting. Med tilbakeknappen (bfcache) er den vanlig igjen. Uten skript er den en vanlig sendeknapp. Det gjøres av nye `listenForPendingForms()` i `lib/pending-forms`, én gang i layouten (Astro: i et `<script>`, React: `<PendingForms />`). `UsernameForm` bruker den («Sjekker brukernavnet …», `pendingLabel`), og «Neste» i `FirstRun` viser `checkingLabel` («Sjekker …») mens et steg sjekkes. `PendingLabel` er innsiden, for en knapp som et eget skript setter opptatt. **For å ta i bruk:** legg `listenForPendingForms()` i layouten, og bruk `PendingButton` som «Lagre»-knappen i skjemaer. Mønsteret **Forms** og historiene `Components / Actions / PendingButton` og `UsernameForm/Checking`.

## 8.76.0

**Etui for de gamle konsollene.** `AlbumSleeve` og `DetailHeader` (`disc`) har fått sju nye slag spilletui:

- `nes`, `snes`, `n64`, `gameboy` og `gba` er boksbildet trykt på en pappeske med slitte kanter og hjørner. Konsollens egen kassett stikker halvt ut av esken: den høye, grå til NES, den lysegrå med runde skuldre og riller langs sidene til Super Nintendo, den mørke og brede med avskårne skuldre til Nintendo 64, den grå med avskåret hjørne til Game Boy, og den mørke, brede til Game Boy Advance.
- `genesis` er et svart plastetui med Mega Drives svarte kassett.
- `psx` er et jewel case med den første PlayStationens svarte plate, med svake regnbuer.

Hver kassett har boksbildet på etiketten, beskåret til etikettens form. Et bilde med en annen form enn flaten blir nå beskåret rundt midten, slik et omslag blir (`object-fit: cover`), i stedet for å strekkes. `DetailHeader` tegner dem for `sleeve` med `ratio="poster"` og `disc` satt til slaget.

## 8.75.0

**Et spill til en håndholdt i hodet.** `AlbumSleeve` har fått `kind="cartridge"`. Boksbildet ligger da under den klare plastlommen i et smalt, svart etui, og spillkortet stikker halvt ut ved siden av. Kortet er av mørk plast med riller å gripe i og et blankt merke med det samme bildet, og glansen flytter seg når du vipper det. `DetailHeader` tegner det for `sleeve` med `ratio="poster"` og `disc="cartridge"`, i stedet for DVD-en. Brukes for et spill som mest er spilt på Steam Deck.

## 8.74.0

**Større klikkflater, runde tre.** `MapThumb` har fått `stretched`: med `href` i en rad i `Rows` åpner et trykk hvor som helst på raden kartlenken, ikke bare det lille kartet. Kreditten «© OpenStreetMap» er fortsatt sin egen lenke, og den treffes nå 4px utenfor seg selv. I `SourceList` er hele kilden lenken til navnet sitt. Lenkene i `LinkList` (minst 24px, 28px med luften rundt) og i `LinkItems` (32px) treffes over et større område, og på berøringsskjerm er de 44px. Det samme gjelder linjen som folder ut `FoldList`. Pillene i `SummaryBar` er 44px å treffe, det samme er stedene i sideskinnen i `NavBar` og `UserChip` på berøringsskjerm. `LinkButton` og knappene i `IntroCallout` er 44px på berøringsskjerm. Synlig er bare at en linje i `LinkList` er 4px høyere, og at kilder i `SourceList` får en svak farge under pekeren.

## 8.73.0

**Større klikkflater, runde to.** `Rows`, `PictureRows`, `RankedRows` og `EntityRows` er nå lenker over hele raden, så fremt navnet i raden er en `stretched` lenke. Lenken kan være `CardLink stretched`, `TextLink stretched`, `ExternalLink stretched` eller `ItemLink stretched`. Andre lenker og knapper i raden er fortsatt egne mål, for eksempel artisten under tittelen, «i» eller platen som spiller. Uten en slik lenke er raden som før. `TextLink` og `ExternalLink` (bare tekstformen) har fått `stretched`, og `SlugLink` har fått `stretched?`, som appen gjengir som `data-stretched`. Små knapper treffes nå over et større område enn det de ser ut som: kopier-knappen, valgene i `SegmentedToggle`, opp og ned i `ReorderList`, pauseknappen på `Disc` i rader, `TiltButton`, knappene i `InstallPrompt`, `IntroCallout` og `UsernameForm`, og «Hopp over» i `FirstRun`. Hele linjen i `Disclosure` åpner. Hver feil i `FormErrorSummary` er en lenke over hele linjen. Hele `HapticsSetting` slår av og på, også forklaringen. Feilsidene bruker `LinkButton`. Søkeknappen i `SearchField` er like høy som feltet. Historiene er `Rows/Stretched`, `PictureRows/Stretched`, `RankedRows/Stretched` og `EntityRows/Stretched`.

## 8.72.1

**`StopSequence` uten glipe.** Raden til stoppet du ser fra har ikke lenger luft over og under, så skinnen går i ett gjennom den.

## 8.72.0

**Alle stoppene på en tur.** Ny `StopSequence`: hvert stopp på én tur av en linje i den rekkefølgen den kjører, som linjekartet over døra. En tykk skinne i linjens farge med en ring for hvert stopp, navnet og tiden turen er der (forsinkelse med rutetiden strøket), og reisetiden herfra under hvert stopp etter («6 min»). Stoppet du ser fra har en fylt prikk med glorie, en farget rad og merket «Herfra» (`aria-current="location"`). Endestasjonen har en strek på tvers. Stoppene før er foldet inn under én rad («Vis 7 stopp før») med en dempet skinne. Med `href` er hele raden en lenke til stoppets side. Historiene er `StopSequence/Default`, `Open`, `Late` og `FromStart`.

## 8.71.0

**Større klikkflater.** En rad, et kort eller en hendelse med én hovedlenke kan nå trykkes hvor som helst, ikke bare på teksten. Nytt mønster i `lib/link-style`: `STRETCHED_ROW` på raden, `STRETCHED_LINK` (og `data-stretched`) på lenken, `ABOVE_STRETCH` på andre lenker og knapper i raden. Lenken beholder navnet sitt for en skjermleser, og fokusringen går rundt hele raden. Hele raden er lenken i `DepartureBoard` og `DepartureList` (med `lineHref`), `DumbbellChart` (med `href`), `HeadlineList`, `StoryList`, `DatedLinkTable`, `HazardList` og en linje i `Timeline` som har sin egen lenke. `CardLink` har `stretched`. Hele `UserChip` bytter bruker. Tilbakelenken i `Breadcrumbs` og «Se alle» i `PageSection` er 44 px høye, `Pagination` er det på berøringsskjerm, `SortHeader` fyller hele cellen, og `LinkButton`, `ExternalLink`-pillen og «Vis N til» i `Timeline` har usynlige flater på 40 px uten å se annerledes ut. Kartkreditten i `MapThumb` er 24 px høy.

## 8.70.0

**En side per linje, og lenken til holdeplassen under radene.** `DepartureBoard` lenker ikke lenger fra navnet på holdeplassen (`href` er borte). Med `continues` slutter kortet i stedet med en lenke under alle radene, til holdeplassens egen side («Se alle avganger fra Carl Berners plass»), slik `PageSection continues` gjør. Med `lineHref` blir destinasjonen i hver rad en lenke til linjens side fra holdeplassen. Lenken har navn med linjen («Buss 31 mot Fornebu»), og merket ved siden av er bare for øyet. `DepartureList` tar også imot `lineHref`. Foten fra `PageSection` er eksportert som `ContinuationLink`. Historiene er `DepartureBoard/Linked` og `DepartureList/Linked`.

## 8.69.0

**Detaljsider for holdeplasser og dager.** Ny `DepartureList`: alle avgangene fra én holdeplass de neste timene i den rekkefølgen de går, under en overskrift per time, med forsinkelse, innstilling, plattform og avvik som på tavla. Den hører hjemme på holdeplassens egen side, og `DepartureBoard` lenker dit med `href` (navnet på holdeplassen blir en lenke). `DumbbellChart`-rader kan ha `href`, så en rad lenker til en side om seg (dagens egen værmelding); radene blir da en liste en skjermleser kan gå gjennom. Ny `departureTimeline` i `lib/departures`. Historiene `DepartureList/Default`, `DepartureBoard/Linked` og `DumbbellChart/Linked`.

## 8.68.0

**Nøkkeltall i en seksjon.** Ny `KeyFigures`: to til fire tall store og på tvers, hvert over de få ordene for hva det teller («08:32 / soloppgang», «47 øre / nå»), som en `<dl>`. De står først i seksjonen, over diagrammet som viser formen bak dem, og tar plassen til en setning som sier det samme. Samme tall og samme utseende som `DetailHeader`s `figures`, som nå bruker den (`DetailFigure` er `KeyFigure`). Historien `KeyFigures/Default`.

## 8.67.0

**Kart over et sted.** Ny `MapThumb`: et lite, stillestående kartutsnitt fra OpenStreetMap sentrert på `at`, med en nål i primærfargen på stedet og en prikk der leseren er (`from`) når den er innenfor. Bare rutene utsnittet dekker hentes (`loading="lazy"`), og det er ren HTML uten skript. `shape="square"` (3,5 rem) står foran en rad (`Rows lead="poster"` med kartet som `lead`, og `MapCredit` – «Kart: © OpenStreetMap» – én gang under listen); `shape="banner"` går over hele bredden øverst i et kort, med krediteringen i hjørnet. `href` gjør hele kartet til en lenke (`osmLink(at)`), `tiles` tar en annen rutemal, og i mørk modus snus og dempes rutene. `DepartureBoard` tar `at` og `from`: kartet over holdeplassen øverst i kortet, kant til kant, lenket til openstreetmap.org. Ren matematikk i `lib/map-tiles` (Web Mercator, rutene som trengs). Historiene `MapThumb/Square`, `Banner`, `InRows` og `DepartureBoard/WithMap` bruker egne, oppdiktede ruter, så bildene ikke avhenger av nettet. Siden må tillate `img-src https://tile.openstreetmap.org` og sende Referer.

## 8.66.0

**En CD i cover (jewel case).** `AlbumSleeve` tar `kind="cd"`: omslaget under det klare, blanke lokket på et CD-cover (142 × 125 mm, heftet 120 mm kvadratisk til høyre for hengselen), med hengselens riller til venstre, mørk rygg og skuffens kant synlig i margen, og en CD halvveis ut til høyre. CD-en er sett fra dataside: sporene ligger 1,6 µm fra hverandre (DVD: 0,74 µm), så regnbuene kommer i flere og smalere ordener, i en vifte langs radien mot lyset; navet er klart og bredt, og ytterst er platen et speil der musikken slutter. `DetailHeader` tar `disc="cd"` (standard `record`) for et album med `sleeve`. Plate og DVD ser ut som før. Uten WebGL står omslaget der heftet vil ligge i coveret. `SLEEVE_SHAPES.inset` er nå venstre, topp, høyre og bunn. Historiene `AlbumSleeve/Cd` og `DetailHeader/LargeAlbumCd`.

## 8.65.0

- `Picture`, `PictureRows`, `RankedRows` og `Tiles` har `ratio="wide"`: et banner på omtrent 2:1, som et spills header-bilde på Steam (typen `PictureRatio`).
- Ny `LogoList`: tjenester side om side, hver med sin lille kvadratiske logo og navnet (hvor en film strømmes, hvor den kan leies eller kjøpes), gjerne som verdien til et begrep i `FactList`.

## 8.64.1

- `AlbumSleeve`, `Disc` og `AmbientBackdrop` viser nå bildet også når bildetjenesten bare sender CORS-headeren til forespørsler med `Origin` (som TMDB). Før kunne nettleseren gjenbruke kopien uten CORS fra sidens vanlige `<img>`, og DVD-en, platen og bakgrunnsfargene ble borte, særlig på mobil. Feiler hentingen, spør de nå én gang til under en egen adresse (`lib/cors-image`).

## 8.64.0

- `HazardList`: farevarsler fra myndighetene (METs farevarsler, NVEs flom-, jordskred- og snøskredvarsler på Varsom), hvert med nivået i den offisielle fargen og i ord («Gult nivå»), hva, hvor og når, og en lenke til hele varselet. Det alvorligste først; `compact` for en oversikt. `HazardLevelBadge` er nivået alene.
- Nye tokens `--hazard-yellow`, `--hazard-orange` og `--hazard-red` (med `-foreground`), lys og mørk, med kontrasttest.

## 8.63.0

- `AlbumSleeve` (og `DetailHeader` med `sleeve`) har bedre shadere for plate og DVD:
  - En myk skygge på siden bak omslag og plate, bort fra lyset.
  - Vinyl: rillene gir en lysvifte langs radien som følger lyset, med blanke mellomrom mellom låtene, utløp og kantvulst. Etiketten har trykk som ruller med platen, og fargen lyser gjennom ytterst.
  - DVD: sølvet speiler rommet, og datafeltet bryter lyset i spekterets farger (diffraksjon). Platen har gjennomsiktig nav med hull, stablering og strekkode.
  - Platen ligger i omslagets skygge der den kommer ut.
  - Omslaget har ryggen trykket rundt kanten. Pappen har korn, slitt ring og slitte hjørner. DVD-etuiet er matt plast med hengselspor og en lys kant rundt plakatlomma.

## 8.62.0

**A film's poster in a DVD case.** `AlbumSleeve` takes `kind="dvd"`: the poster under the clear sleeve of a black case (135 × 190 mm), and a silver disc half out of it, with its hole and clear hub, whose tracks split the light into a spectrum as it tilts. `DetailHeader` draws it for `sleeve` with `ratio="poster"`, large or not, as it draws an album's sleeve. For a poster the app may alter (TMDB's). `SLEEVE_SHAPES` in `lib/sleeve-shader`. Stories `AlbumSleeve/Dvd`, `DetailHeader/LargeFilm` and `LargeFilmOnPhone`.

## 8.61.1

**`AuroraChart` on a phone.** A day's name too near «Nå» is left out, so the two no longer run into each other, and the summary says «og 1 gang til».

## 8.61.0

**`AuroraChart`, the northern lights over the next days.** The Kp index every three hours as columns, the Kp the place needs (`needed`) as a dashed, labelled line, the dark (`dark`, as in the `Meteogram`) shaded and the time now (`now`) marked. A column that reaches the line in the dark is in the accent, the rest grey. The summary says the highest Kp and the dark hours that reach («nås i mørket lør. 19–01»), and every slot (Kp, measured or forecast, dark, clouds) is a `ChartTable`. `placeDark` takes a `step` (hours per entry). Helpers in `lib/aurora-chart`.

## 8.60.0

**The sun in the `Meteogram`.** New `dark`: the spans from each sunset to the sunrise after it (ISO), which the app works out for its place. The hours in the dark are shaded behind the line, each sunrise and sunset inside the hours is an icon and its time under the line («08:34»), and the summary says them («Sola står opp kl. 08:34 og går ned kl. 15:23.»). A span over every hour (the polar night) shades them all and marks nothing. `placeDark` and `summariseSun` in `lib/meteogram`. Stories `WithSun` and `PolarNight`. New icon `aurora` (the northern lights, in «Place and weather»).

## 8.59.2

**The `NavBar` stays put while the page changes.** On a phone the bar blinked away and back during a view transition: it was part of the root's picture, and `<main>`'s picture was painted over it. The bar (`data-nav-bar`) now has its own `view-transition-name: nav-bar`, above `<main>` and without animation, so only its current place glides. Nothing to change in the apps.

## 8.59.1

**Strict optional props in apps.** `NavBar`, `FirstRun` and `TextField` no longer fail an app's typecheck with `exactOptionalPropertyTypes`: an absent `family` or `glyph` is left out instead of passed as `undefined`, and `TextField` takes `undefined` for its optional text props. Apps can drop their workarounds.

## 8.59.0

**Brand motion: each app's accent, in a few signature moments, opt-in and still under reduced motion.** `data-brand` now also sets `--motion-brand-duration`, `--motion-brand-ease`, `--motion-brand-distance`, `--motion-brand-beats` and `--motion-brand-beat`: amber (Medier) is rhythmic, the light spring at 300 ms beating twice 120 ms apart; teal (Start) is calm and rising, a pure decelerate at 400 ms travelling upward only; rose, blue and violet keep the neutral default. New aliases `--motion-duration-celebrate` (600 ms), `--motion-duration-press` (100 ms) and `--motion-ease-expressive`. `AppMark` takes `reveal` (once: «play» beats twice, «sunrise» rises over its horizon, other glyphs scale and rise) and `loading` (for a wait over a second: beats after 1 s, then rests, never loops; give it `role="status"` and a label). `FirstRun` with `glyph` reveals the mark on its first step, once; at «Ferdig» it shows the new `FirstRunFinish` (the mark and a drawn check, under 1 s, `finishLabel`, default «Alt er klart») while the next page loads, never holding the form back. Its steps now slide on the productive `enter` token. `EmptyState` takes `glyph`. The `NavBar`'s current place is a `data-nav-indicator` that glides to the new item across pages. **To adopt view transitions:** spread `transitionAttributes()` from `lib/motion` on `<html>` (`data-motion="transitions"`): in Medier (Astro, MPA) in `Page.astro`, nothing more, no `ClientRouter`; in Start (Next.js App Router) in `app/layout.tsx`, and wrap `{children}` in React's `<ViewTransition>` (Next 16, no config). Browsers without cross-document view transitions, and reduced motion, just change page. Guide **Foundations / Motion** §9 «Brand motion» (platform, principles, tokens, moments, don'ts, sources); the `designsystem-brand` and `designsystem-ui` skills say when (run `npx designsystem-skills`). Stories: `Wordmark` Reveal and Loading, `FirstRun` Finish, FinishRhythmic and FinishUnbranded, `EmptyState` Branded.

## 8.58.0

**Haptics: a short buzz that confirms what a hand did, opt-in and never alone.** New `lib/haptics`: `haptic(kind)` with seven semantic kinds (`selection`, `impact-light`, `impact-medium`, `success`, `warning`, `error`, and `signature`: Medier's (amber) «play», Start's (teal) sunrise, `success` for any other hue), each a short `navigator.vibrate` pattern under 200 ms. It does nothing on the server, where the browser cannot vibrate (Safari and iOS, Firefox), before the page has had a tap or a key, or when turned off; a buzz too soon after another is dropped unless it says more. Off is the reader's choice in this browser (`localStorage` `ds-haptics`, written by the new `HapticsSetting`, a native switch «Vibrasjon», which on an iPhone gives the system's own tap) or `data-haptics="off"` on `<html>` or an element; without a choice, `prefers-reduced-motion` keeps only `success`, `warning` and `error`. `FirstRun` buzzes a step forward (`selection`), a step that fails (`error`) and «Ferdig» (`signature`); `ReorderList` and `SegmentedToggle` tick a move or a change; `CheckboxList`, `ToggleMatrix` and `ChoiceCards` are marked `data-haptic="selection"`. **To adopt:** put `<Haptics />` once in the layout (Astro: `listenForHaptics()` from `lib/haptics` in a `<script>`), `HapticsSetting` in the «Effekter» `SettingsSection` of the settings page, and `data-haptic="warning"` on a button that confirms a deletion; run `npx designsystem-skills` for the new skill `designsystem-haptics`. Guide **Foundations / Haptics** (principles, vocabulary, support, why not the iOS hidden-switch trick, sources), story `Components / Onboarding / HapticsSetting`.

## 8.57.0

**Brand: one hue and one mark per app in the family, opt-in.** `data-brand="rose|amber|teal|blue|violet"` on `<html>` sets `--brand`, `--brand-foreground` and `--brand-subtle` (Tailwind `brand`, `brand-foreground`, `brand-subtle`), each `light-dark()` and tested in both themes: the brand 4.5:1 on the page and the card, its foreground 4.5:1 on it, and the text 4.5:1 and the brand 3:1 on the subtle surface; the hues are told apart from each other and from `destructive`. Without it they are the ink, the page and `muted`, so an app looks as before. A branded app's focus ring, its primary `Button` and a ticked checkbox or radio take the hue; the `NavBar`'s current place is the hue's icon on its tint. New `Wordmark` and `AppMark` (`Components / Media / Wordmark`): the app's glyph (`play`, `sunrise`) on the family's rounded tile, its name and, quieter, its family; `NavBar` takes `glyph` and `family` to open its rail with it, `FirstRun` takes `glyph`. New bin `npx designsystem-app-icons --hue --glyph` draws the favicon, apple-touch-icon and the manifest's icons from the same drawing. New guide **Foundations / Brand** (research on design systems and brands, principles, layers, a brand platform template and a proposed platform for lmfaole, Medier and Startside), story `Foundations / Tokens / Brand colours`, a «Merkevare» toolbar in Storybook, and the skill `designsystem-brand` (run `npx designsystem-skills` after upgrading); the ui, content, review and components skills point to it.

## 8.56.0

**An album's page with a large sleeve, a number's trend beside it, and one column picked out.** `DetailHeader size="large"` takes `sleeve`: the sleeve's column is half as wide again as a portrait's (20.5rem, 23.5rem from `@3xl`, 29rem from `@5xl`), so the cover is as large as a portrait would be and the record lies beside it; in a narrow head the sleeve is the whole width under the name and the figures go across under it. `AlbumSleeve` takes `size="feature"` for it (as wide as its cell, the cover the left 100/146). A `DetailFigure` takes `trend`: a `Sparkline` beside the number, in a box of its size kept from the first paint, so one streamed in by a server island moves nothing. `ColumnChart` takes `highlight`: the label of the one column the chart is about keeps the series' colour, has its value written over it and its label in bold (kept when the axis thins its labels), and the others are the lightest grey step; colour is never the only sign. Stories `ColumnChart / Highlight`, `DetailHeader / LargeAlbum`, `LargeAlbumOnPhone`.

## 8.55.0

**A gallery of covers in the shape of what they are.** `Tile` takes `corners` (`PictureCorners`: a record's cover `sharp`, a person `round`) and `sources` (the widths the picture's source offers, as for `Picture`), so a grid of album covers has the same shape as the covers in rows and on the album's own page, and a tile fetches no larger a file than it draws. Story `Albums`: an artist's albums by when they came out, the year and the plays under each title, one without a cover.

## 8.54.0

**A head whose picture is its face, and the few numbers that matter in it.** `DetailHeader` takes `size="large"`: the picture is the page's face (an artist's or a person's portrait), `Picture size="feature"` (new: as wide as its cell, lit on its frame like `hero`; `LIT_SIZES` in `lib/picture-frames` says which sizes are the main picture). On a phone the name goes first, the width of the head, and the portrait under it, half the head wide, beside the figures, so a long name does not wrap in a narrow column and the picture is never alone; from a wide head (`@3xl`) the portrait is beside the name at 16rem (20rem from `@5xl`, against 14rem for the hero) with the name, the figures and `children` centred on it. And `figures` (`DetailFigure`: `{ value, label }`): two or three numbers that say most about the thing to the reader («10 903 avspillinger», «22 % av alt du har hørt»), large under the name in a `<dl>`, in either size; each is said there and not again in the page's facts. Stories `WithFigures`, `Large`, `LargeOnPhone`, `LargeWithoutFigures`; «Light and shadow» and the `DetailHeader` docs say so.

## 8.53.0

**A section that previews a subpage is a card, and its foot is the link.** `PageSection` takes `continues` (`{ href, label, icon?, count? }`, the type `Continuation`): the section becomes a card (`bg-card`, `border`, `rounded-2xl`) holding the title, the excerpt (the five latest plays) and, at its foot under a line, one link the width of the card to the subpage, at least 48 px high, its text in the rows' text column (with `icon`, in line with `Rows lead="icon"`), a quiet `count` («1 248 avspillinger») and a chevron at the end. The rows keep their own links, so the card is not one link, and the foot is not a `nav` of its own. It replaces `more` (the types allow one or the other). A one-item `SubPages` under a section's list, which read as a new section and stood out of line with the rows, is now this foot; `SubPages` stays for a settings overview and several subpages together. «Pages and navigation», `SubPages`, `PageSection` and the skills say so, with a Don't.

## 8.52.3

**The tilt starts from how the phone is held.** The light, and with it `AlbumSleeve`'s turn, the shadows and the shine, moved from a fixed rest of 45° forward: a phone held upright in the hand, or lying in bed, had the light at the edge and the sleeve turned as far as it goes. The rest is now learned from the readings (`restFrom` in `lib/light`: it follows them slowly, half the way in three seconds, and the first reading is the rest at once), so the phone held still in any way lights the page as the default does, and only a move from it moves the light.

## 8.52.2

**Links and counts stand with what they are about.** `SubPages` goes at the foot of the section whose content the subpage has more of («Historikk» under «Siste avspillinger»), not all of a page's subpages gathered at the top; only a page that is nothing but its subpages (a settings overview) has the list under its title. `SummaryBar` stands under the title of the section it counts, not first on the page. `SubPages` has no margin of its own any more: the `Stack` or section around it spaces it.

## 8.52.1

**Breadcrumbs start below the menu.** The rule is now said the same way everywhere (`Breadcrumbs`, «Pages and navigation»): a page that is a place in the `NavBar` (the front page, «Musikk», «Innstillinger») has no breadcrumbs, since the bar marks where the reader is; every page below one (a subpage, a detail) has them.

## 8.52

**Where the data comes from, with each source's mark.** `SourceList` (`components/source-list`; `{ sources: { name, brand?, href, description, credit? }[] }`) is a description list of an app's sources, said once at the foot of «Innstillinger» rather than on every page: the source's mark (`BrandIcon`, decorative) beside its name, the name an `ExternalLink` to it, what the app gets from it, and the credit its terms ask for. `BrandIcon` has the marks of Last.fm (`lastfm`), Trakt, TMDB (`tmdb`), Yr, OpenStreetMap (from Simple Icons, CC0) and Entur (its own «EN» icon from `@entur/icons`, EUPL-1.2).

## 8.51.1

**The rail no longer covers the page on a wide screen.** On a screen from 1536 px, `PAGE_COLUMN`'s `2xl:px-10` won over `PageLayout`'s room for the `NavBar` rail (`md:pl-60`), so the page started under the rail. The room is now `2xl:pl-66` there: the rail's 14rem plus the gutter.

## 8.51

**Many places in the bar, the order of the front page, and settings on subpages.** `NavBar` takes more than five places: on a phone the bar scrolls sideways (each place at least 4.5 rem, snapping into place, no wrapping), the current place is scrolled into view when the page opens (`scroll-initial-target`, and `NavBarScroll`, a client part drawn inside the bar), and the side that has more is faded (`data-more-start` / `data-more-end`); the rail shows every place. «Innstillinger» (icon `settings`) is the last place in every app. `lib/preferences` keeps the visitor's order of the front page's sections (`Prefs.order`, `order=a,b,c`) and `orderSections(ids, order)` gives the ids in it: the saved ones first, new ones after in their own order, ones that are gone left out. `ReorderList` (`components/reorder-list`; `{ name, legend, items: { id, label, description?, icon? }[], hint? }`) is a client component with plain props (an island with `client:load` in Astro, drawn straight from a server component in Next.js): a handle to drag with a mouse or a finger, «Flytt X opp» / «Flytt X ned» buttons that keep the focus, «X flyttet til plass 2 av 5» in a polite live region, and the order in the hidden field `name` as comma ids. Without JavaScript the buttons are submit buttons `name="move" value="<id>:up|down"`, and the endpoint saves `applyMove(order, move)` from `lib/reorder` (with `parseMove` and `moveTo`) and redirects back. A story hydrates its server markup and fails on any hydration error. `ToggleMatrix` (`components/toggle-matrix`; `{ legend, rows, columns: { id, label }[], namePrefix, values?: Record<columnId, rowId[]>, hint?, error? }`) is native checkboxes named `<namePrefix>.<columnId>` with the row's id as value: a table from small-tablet width, each column a list of its own on a phone, one set of boxes laid out by grid and subgrid, each column a named group. `TimeField` (`{ name, label, value?, step? = 900, hint?, error?, min?, max? }`) is the native time field. `SubPages` items take `value` (what is chosen there now, under the name) and `description` is optional, for the settings overview; `Banner` has `tone="success"` (role `status`), the «Lagret» after a save. The icon set has `drag`.

## 8.50

**One question per step, and the example is the choice.** A step of `FirstRun` asks one thing: effects and tilt are two steps, and `FirstRunEnhancer` warns in the console of a step with fields of more than one name (`stepQuestions` in `lib/first-run`). `ChoiceCards` has `layout="visual"`, the default when every option has a `preview` (`layout="list"` keeps the row): the picture is large on top of the card with the radio, label and sentence under it, the whole card is the radio, the chosen one has a ring and a check, and the cards stand side by side where the column has room (by its own width) and under each other on a phone. The pictures to put in it: `ThemeSample size="lg"`, `EffectsPreview mode="on"` (the live WebGL sample) and `mode="off"` (the flat one), and `TiltPreview mode="follow"` («Følg telefonen»: the light follows the tilt, choosing it asks the phone from that tap or key, a no sets the radio back, said in a status region, and on a desktop the pointer moves it, labelled «Simulering med peker») and `mode="still"` («Fast lys»). `EffectsPreview` and `TiltPreview` without `mode` work as before and are deprecated. `FirstRun` no longer draws a `<template>` (its error model is a hidden element), so it hydrates without an error in React 19; a story hydrates server markup and fails on any hydration error.

## 8.49

**The first run, the settings, and the visitor's own theme, effects and tilt.** `FirstRun` is a full-screen introduction an app opens on the first visit while the `seen` cookie lacks `first-run@1`: a labelled `<dialog open>` drawn by the server with one `<form method="post">` (`action`, a hidden `back`, the fields of every step and «Hopp over» as `skip=1`), a bar with the title and the progress, and «Tilbake», «Neste», «Ferdig» at the foot. `FirstRunEnhancer` (by its `id`, drawing nothing) makes it a modal wizard: one step at a time with a heading that says «Trinn 2 av 8» and takes focus, steps that move in from the side they come from (at once under reduced motion), Enter for «Neste», Esc that does nothing, and each step checked by the browser and then by the server at `validateUrl` (`validate=<step>`, answered `{ "errors": { "<field>": "<melding>" } }`, shown under the field). Without JavaScript every step stands under the other with one «Ferdig»; after an error the server draws it at `initialStep`. Its look is in `first-run.css` (in `theme.css`, and exported). The same choices make a settings page of `SettingsSection`s, and the fields are new: `ChoiceCards` (radio cards with a description, an icon or a `preview`), `CheckboxList` and `ListField` (one per line, read on the server with `parseListField` from `lib/list-field`); `TextField`, `ChoiceCards`, `CheckboxList` and `ListField` take `hint` and `error`, and the error is `FieldError`. The previews: `ThemeSample` draws a small page by a theme's own tokens, `EffectsPreview` shows the same cover live in WebGL and flat and marks the one chosen by the radio in its form, and `TiltPreview` shows the light following the phone (asking where it must, with a pointer simulation on a desktop, labelled so). The choices are kept in one `prefs` cookie: `lib/preferences` (`PREFS_COOKIE`, `DEFAULT_PREFS`, `parsePrefs`, `serializePrefs`, `prefsCookieString`, `htmlAttributes`, tested), and `htmlAttributes` gives what an app puts on `<html>`: `data-theme` only from the visitor's own choice (rule 6 of `theme.css` now says so), `data-effects="off"` and `data-tilt`. Under `data-effects="off"` every component that draws with WebGL (`AmbientBackdrop`, `AlbumSleeve`, `Disc`, `WeatherParticles`) draws its still version and creates no context, checked by `effectsEnabled` in `lib/effects` (a test holds every one to it); `data-tilt` is read before the stored answer (`resolveTiltPreference`), so `data-tilt="off"` never listens to the phone, and `tiltSupport` and `aimLight` in `lib/light-input` serve the preview.

## 8.48

**The first visit.** `UsernameForm` asks whose public data an app should fetch before it shows anything personal: a plain `<form method="post">` with no script (a hidden `back`, one `TextField` per service typed exactly, errors beside the field), and `UserChip` says whose data is shown with the way to change it («Viser data for octocat · Bytt»). What a visitor has seen is kept in one `seen` cookie of `id@version` entries, read on the server so nothing flashes: `lib/onboarding` (`SEEN_COOKIE`, `parseSeen`, `isSeen`, `addSeen`, `seenCookieString`, `isNew`, tested) and `markSeen` in `lib/onboarding-client`. On it: `IntroCallout`, a word about a page on the first visit, in the flow of the page, closed with «Skjønner» for good (focus goes to the page's heading); `NewBadge` («Nytt» until a date, from a `now` passed in) with `MarkSeen` on the new page, and a `badge` on a `NavBar` item to carry it; and `InstallPrompt`, the offer to install once on a front page («Installer» where the browser has `beforeinstallprompt`, the way by hand in Safari on an iPhone, nothing in the installed app). `PermissionCard` asks for the position or notifications and says each state in words in a live region (`checking`, `prompt`, `pending`, `granted`, `denied`, `unsupported`, `error`; the words in `PERMISSION_TEXT`), with the state from `usePermissionState` in `lib/use-permission-state`. `EmptyState` takes another component as its `action` as well as a link, and `TextField` takes a `placeholder` and `verbatim` (no capital letter, no spelling check).

## 8.47

**A history of events, the steps it went through and how long each took.** `Timeline` shows what happened to a pull request, an issue, a discussion or what you have listened to and watched, newest first: a named list with a heading for each day («I dag · fredag 20. november»), a short line on the rail for each event (an icon in a node coloured by its tone, the actor, what they did and when) and a bordered box for a comment, with the avatar on the rail. The time is relative («for 3 timer siden») with the exact time in `title` and `dateTime`, and links to the event's own `id`. A run of more than `collapseAfter` events of the same `group` shows the first and folds the rest behind a real disclosure («Vis 7 commits til»), named by `groupNoun` or `groupNouns`, and never across a day; an `ongoing` event gets a live dot and «nå». `StateSteps` puts the states above it (Åpnet → Review → Godkjent → Merget) as done, current, upcoming, failed or skipped steps with how long each lasted («3 d så langt»), in a row on a wide screen and a column on a narrow one. `DurationBars` draws spans in lanes on a time axis with ticks, a line at now and an arrow for what goes on, with a list of each span, its length and times under it, and only the list on a phone. The logic is in `lib/timeline` (`formatDuration`, `dayLabel`, `groupByDay`, `collapseRuns`, `durationsBetween`, `layoutDurations` and more), the node colours are the new `--event-*` tokens, and there are ten new icons: `comment`, `review`, `label`, `closed`, `pull-request-closed`, `reopen`, `draft`, `assign`, `force-push` and `listen`.

## 8.46

**Departures from a stop.** `DepartureBoard` shows one stop's next departures as the signs at a stop do: a card with the stop's name (and «4 min å gå · 250 m»), a row for each line to one destination with its `LineBadge`, the destination and the platform, the next departure large («nå», «3 min», the clock from 20 minutes on or for a timetable time marked «Rutetid») and the next two smaller. Under each row a strip of the next hour puts a dot at each departure, hollow when cancelled. With `walkMinutes` the walk is hatched at the start of the strips, what cannot be reached is faint, each row says «Gå nå», «Gå om 4 min» or «Rekker ikke», and the rows come in the order you can catch them. A delay shows the timetable's time struck and «+3 min», a cancelled departure is struck with «Innstilt», and a deviation is a line under its row. Rendered on the server with no script; `now` is passed in, and `Freshness` beside it says how old the data is. `LineBadge` is a line by its own: the symbol and colour of its kind and its code, heard as «Buss 31». The grouping, the counts, the delays and the walk are pure functions in `lib/departures` (`groupDepartures`). New tokens `--transit-bus`, `-tram`, `-metro`, `-rail`, `-ferry`, `-other` with their `-foreground`, and `--transit-late`, keep their contrast in both themes (a test). A new icon meaning `rail` (a train), and `metro` is now the train in a tunnel.

## 8.45

**The record comes out of the sleeve.** In 3D, `AlbumSleeve` (the album `DetailHeader`) starts with the record inside the sleeve when the page opens and slides it out over 0.9 s, turning the label as it goes; then it is drawn only when the light changes again. The vinyl takes the colour of the cover, with light through its rim and a pale label, and its reflection is in the cover's colour too. The film over the sleeve is more like shrink-wrap: a broad and a thin streak that follow the light, haze toward the edges, small creases and a highlight on the folded edge, weaker on a pale cover. Under reduced motion nothing moves, as before.

## 8.44

**The weather hour by hour.** `Meteogram` draws a forecast as Yr and meteoblue do, in bands on one time axis: the sky as a symbol every third hour (`symbolEvery`), the temperature as a line, warm above 0° and cold below it with the zero line drawn and signed degrees on its own axis, and the precipitation as columns in millimetres (or «Ingen nedbør»). Plain SVG and positioned text rendered on the server: it takes the width of its room with its text at its size and leaves out every other label in a narrow room. Under it a summary (lowest and highest with their hours, the precipitation in all and the wettest hour) and every hour as a table (`showTable`). New tokens `--temperature-warm`, `--temperature-cold` and `--precipitation` keep 3:1 in both themes (a test); on a `WeatherStage` the columns take `--weather-rain`. Two icon meanings: `weather-night` (partly cloudy at night) and `sleet`. The helpers (scales, the zero line, Yr's symbols in words and as icons, the summary) are pure, in `lib/meteogram.ts`, with tests.

**8.44.1:** a `Stage` (a `WeatherStage` card, `DetailHeader`) on a page whose ground is the weather (`WeatherStage page`) is solid: the same tint mixed into the page's background, so the page's weather and particles do not show through it. And a stage's backdrop no longer fades out toward the foot: the colours of the picture or the weather fill the whole surface evenly (`DetailHeader`, `NowPlayingCard`, a `WeatherStage` card), so its edge is clear. Muted text on a stage is the full text colour (`--muted-foreground` is set to `--foreground` there), since muted text on the tinted ground fell under 4.5:1. The disc's reflection (`Disc`, in `NowPlayingCard`) is in the cover's colour: the bands brighten the cover where they fall, with only a trace of the spectrum and less strength, in WebGL and in the CSS version (`soft-light` instead of white over a rainbow).

## 8.43

**Colour from the weather.** `WeatherStage` sets `--weather-accent` (this weather's own colour, drawn toward the text colour so it holds on both themes) and `--weather-rain` beneath it, for the marks of what stands on it. `Sparkline` and `DumbbellChart` take a `color`, as the area and column charts already did, and only the marks are coloured: text stays the text colour. `weatherAccent(symbol)` gives the colour.

## 8.42

**The weather's atmosphere, deeper.** Rain and snow are in two layers, far (short, slow, weak) and near (long, fast, strong), and rain falls behind drifting clouds; clouds are soft puffs side by side that drift slowly; a clear or partly cloudy day has a warm sun glow in the upper right corner (`SUN_GLOW`, weak enough that muted text keeps its contrast in both themes); a clear night keeps its stars. There is no flash for thunder (WCAG 2.3.1).

## 8.41

**The weather as particles.** `WeatherStage` (card and `page`) now shows the weather moving on a 2D canvas (`WeatherParticles`): rain and thunder as streaks falling aslant, snow as drifting flakes, sleet as both, fog and cloud as slow mist, a clear night as twinkling stars, a clear day as a few rising motes. In the text colour at low strength, behind the content, never following the pointer. It is drawn once and still under `prefers-reduced-motion`, and does not run in a hidden tab. Unlike the rest of the light, it moves for as long as the page is open: it is the weather's own picture, and it is decoration, hidden from assistive technology.

## 8.40

**8.40.1:** the weather backdrop holds still: a backdrop given its colours (`WeatherStage`) no longer follows the pointer or the tilt.

**`WeatherStage page`: the weather as the ground of a whole page.** The backdrop fixed to the screen behind everything, with no fade at the foot, laid on more weakly (`PAGE_BACKDROP_OPACITY`: 0.15 in the light theme, 0.18 in the dark) because muted text is on it too; a test measures 4.5:1 for muted text on every weather in both themes. `AmbientBackdrop` takes `page`.

## 8.39

**`WeatherStage`: the weather's own colours as the ground.** A `Stage` whose backdrop is four colours of the weather (clear and warm, grey cloud, dark blue rain, pale snow, a night sky after dark) in place of a picture's, drawn in WebGL and moving with the page's light (`lib/weather-mood.ts`, from Yr's `symbol_code`; `AmbientBackdrop` and `Stage` take a `palette`). Every colour keeps its lightness in the band a picture's do, and a test measures 4.5:1 for the text on every weather in both themes. The colours go over to a new weather's in one move; nothing loops.

## 8.38

**The record playing now is a real object.** The disc (`Picture disc`, `NowPlayingCard`) is now a 3D mesh with a thickness (a face, an edge and the wall of its hole, `lib/disc-geometry.ts`), seen a little from above and tilted a little toward the light so that its edge shows, and it reflects its surroundings: a studio (the light itself, a soft box, a cool sky over a dark floor) with more reflection at a glancing angle, and the round grooves' spectrum in two bands that move with the light and the angle (anisotropic). The cover still shapes it (its hue, vividness and lightness), and the frame is transparent where the disc is, so the hole shows what is behind. Same API; the CSS version is unchanged.

## 8.37

**`AlbumSleeve`: an album's cover in 3D.** The cover whole and upright on a slab of plastic with a record pulled half out of it (the label is the cover's most vivid colour), that tilts toward the page's light (the pointer, a phone's tilt) and catches it, drawn in WebGL with a box, a quad and one texture (`lib/mat4.ts`, `lib/sleeve-shader.ts`, no library). `DetailHeader` takes it with `sleeve`. It adds something to the cover, so it is for covers the app may alter (Last.fm's), never Spotify's; before WebGL is ready, where it is not there and under reduced motion it is the cover alone as a sharp square in the same place. It is drawn when the light changes and at no other time. Also: the visual tests wait for the WebGL of a story to be drawn before the picture is taken.

## 8.36

**WebGL, more robust and further.** Rules for every WebGL surface («Foundations / Light and shadow», «WebGL in the system»): at most four at once (`lib/gl-budget.ts`; a surface with no slot shows its CSS version), a lost context is drawn again when the browser gives it back, and a machine that cannot keep up is asked for less (`lib/gl-quality.ts`: fewer pixels, then every other frame). The backdrop's colours go over to a new picture's in one move of 0.7 s (`mixPalette`, `easeOut`; none under reduced motion). `Stage` is the ground the main thing stands on (the backdrop of the picture's colours), now also under `NowPlayingCard`, whose text is the full text colour.

## 8.35

**The cover shapes the disc's light.** The reflections of a `Picture disc` are no longer the same on every cover: the cover's hue sets where the spectrum starts and how much of its own colour is in it, how vivid it is sets how tight the bands are, and its lightness (point by point) decides how much a spot shines (a dark cover shines, a bright one washes out). `lib/palette.ts` `coverTraits`. `NowPlayingCard` takes `disc` (off: the cover as it is, sharp and still, for covers that may not be cropped). `LiveRegion`: a part of the page that changes by itself, told politely to a screen reader.

## 8.34

**`DetailHeader`: the head of a page of a thing, composed.** The main picture (`Picture size="hero"`, lit on its frame) and the name together, the picture beside the name on a phone and not above it with a gap of page around it, on a stage whose ground is four colours taken from the picture (`lib/palette.ts`) and drawn in WebGL (`AmbientBackdrop`, `lib/ambient-shader.ts`) that move with the page's light. Only colours are taken from the picture, never the picture, so it is safe for sources that forbid altering pictures (Spotify's); the backdrop is drawn when the light changes and at no other time, so nothing loops. It is the page's `<h1>`. `lightStore.listeners` are called whenever the light has moved.

## 8.33

**The main picture is lit; the tilt answer is kept.** A `Picture size="hero"` (and the record of `NowPlayingCard`) is the one thing a page lights: a hero is lit on its **frame**, automatically (`lit-frame`: a shadow away from the light and a rim of light towards it, both outside the picture, nothing painted over it), and carries the light's source with it, so the light follows the pointer with nothing added to the page. A reflection over a picture stays the disc's alone: where a source's terms forbid cropping or overlays (Spotify), the frame is all there is. `TiltButton` (put one by the main picture; `NowPlayingCard` has one) lets the light follow how a phone is held, and the answer is kept in `localStorage` (`ds-light-tilt`: `on` or `denied`): asked once, not at every visit; allowed before, it is listened to at once, and if iOS has forgotten, the next tap asks. `LightSource` no longer draws a button. The shadow of a hero is no longer `shadow-md`. «Foundations / Light and shadow» has the rules, «Where the light goes».

## 8.32

**A system for light and shadow** («Foundations / Light and shadow»). A page has one light (`--light-x`, `--light-y`, `lib/light.ts`, `light.css`): `elevation-1` to `-3` are shadows that fall away from it, and `LightSource` moves it with the pointer and, on a phone, with its tilt (iOS asks first). `Picture disc` is now a WebGL record: the cover turns, the reflections stand on the line from the light and move with it, a tap pauses it (WCAG 2.2.2), and it is the same in CSS where WebGL is not there. `NowPlayingCard` is the record large, with «Spilles nå», the dot, the title and a line under it. Light and shadow are depth, never information, and still under `prefers-reduced-motion`.

## 8.31

**The disc turns for as long as it plays.** Slow (12 s a turn) and forever, instead of three turns that slow to a stop; still under `prefers-reduced-motion`. See «Foundations / Motion», loops.

## 8.30

**A song playing now is a spinning disc.** `Picture` takes `disc` (square ratio): the picture is round with a hole in the middle and turns slowly for as long as it plays (`--motion-duration-disc`, 12 s a turn, linear, forever; still under `prefers-reduced-motion`). That is a loop past five seconds, which WCAG 2.2.2 asks to be pausable: it is a choice for the look, small, never alone, and written down in «Foundations / Motion». `PictureRows` rows take `live`: the picture is a disc and the aside, in full text colour with the pulsing `LiveDot`, is what says it («Spilles nå»): the motion is never the only signal.

## 8.29

**`Rows`: `trailing` is optional.** When no row has one, the value column is not drawn (nor its screen-reader header), so a long title has the whole width. Put the time or the count in the body's own line instead, as the pull request lists of the start page now do.

## 8.28

**`RankedRows`: a top list.** The place of each thing (counted by the list, so the order is the data's), an optional picture in a `corners` shape, the name with the whole width, under it how the place moved since the list before (`change`: `up`, `down`, `same`, `new`, always in words, the arrow only a hint) and the score in words at the end of the line, with a thin bar for how far each is from the first (`amount`; each bar is a share of the largest). A table for a screen reader, which hears the place, the name and the score of a row together. No design system we looked at (Carbon, Material, Shopify's, the GOV.UK family) has a ranking component: they say an ordered list for ranked things, the place as real text, and a change that never rests on colour alone; that is what it does.

## 8.27.1

`Picture corners="soft"` has corners of 30 % of its width, not 22 %: at the size of a row the soft tile and the sharp plate were hard to tell apart.

## 8.27

**Shape language for pictures.** `Picture` and `PictureRows` take `corners`: `normal` (the default, as before), `sharp` (a sleeve or a plate), `soft` (a tile with large corners) and `round` (a person or a band; with `ratio="square"`, the top
of the picture kept). The shape says what kind of thing the picture is of, so a reader tells a person from a record from a film before reading a word: choose one shape for each kind in an app and keep it wherever that kind
shows, in a row and on its own page. A row can differ from its list (`PictureRow.corners`). Where a source's terms forbid cropping its pictures, do not use `round` for them.

## 8.26

**Motion and microinteractions**, from research on Carbon, Material 3, Atlassian, Fluent, Primer, NN/g, Saffer and WCAG
(**Foundations / Motion**, rewritten: tokens by purpose, enter and exit, the state model of every control, response times, loops,
opening and closing, what may move, reduced motion).

- **Tokens by purpose**: `enter` 250, `exit` 200 (new: exits are shorter), `reveal` 300, `slow` 400 (was 450), `data` 700 (bars and
  `CountUp`, in place of multipliers), and the easings `enter`, `exit` (softer than the old `ease-in`), `standard`, `spring` (`linear()`,
  falls back to `enter`) and `linear`. `base`, `ease-out` and `ease-in` stay as aliases; nothing in an app has to change.
- **Entrances are quicker**: a rise is 300 ms, the stagger 40 ms and five steps, so a list has settled within half a second.
- **No loop over five seconds** (WCAG 2.2.2, level A): `LiveDot` beats twice and is still; the skeleton's pulse waits a second and
  beats twice.
- **Tailwind's transitions and pulse follow the tokens**, so the generated shadcn parts move on the system's timing.
- **The focus ring is solid**: the global outline and shadcn's `ring-ring/50` were half strength, under 3:1 (WCAG 1.4.11).
- **Overlays close on the exit timing**; `Disclosure` opens and closes smoothly where the browser can animate to `height: auto`.
- **The page's view transition** is asked for only without a reduced-motion wish, runs on the tokens, and is in the safety net.
- **Feedback**: `CopyButton` announces every copy and no longer lets an old timer clear a new «Kopiert»; `FilterChips` and links have a
  pressed state; `CardLink look="block"` lifts under a pointer; `PeriodPicker` dims the page (`main[aria-busy]`) until the next one arrives;
  `SectionSkeleton` drops `aria-busy`, which kept a screen reader from saying «Henter …».
- `motion-lift` fades a shadow drawn once instead of animating `box-shadow`.

## 8.25

**New typefaces: Atkinson Hyperlegible Next and Mono**, one superfamily from the Braille Institute, in place of Geist and JetBrains Mono.

- All text and **every heading** is the sans (`font-heading` is now `font-sans`); the mono (`font-mono`) is only short uppercase labels
  (`Heading look="label"`), code and status codes. Page titles are semibold with tight tracking.
- Why, with the measurements of seven pairs: **Foundations / Typography**, «Typefaces». In short: one family shares x-height, capitals and
  figures, so labels and titles agree; monospace made titles long and uneven; letters that look alike (I l 1, O 0) are told apart; 50 KB
  of fonts in place of 68.
- A project with its own font-face rules (the hjemmeserver app) takes the two new packages: `@fontsource-variable/atkinson-hyperlegible-next`
  and `@fontsource-variable/atkinson-hyperlegible-mono`.

## 8.24

**Storybook is organised by what a reader needs**, not by how a part is made: five roots in the order you need them.

- **Start** (Welcome, status and contributing), **Foundations** (tokens, icons, typography, colour and state, grouping and spacing,
  motion), **Components** by purpose (Layout, Text, Links, Actions, Navigation, Lists, Tables, Charts, Media, Forms, Status, States,
  Overlays, Motion), **Patterns** (how pages are built, and the error pages) and **Engineering** (closed until opened).
- Inside a group the most used comes first, not the alphabet. «Primitives» (how shadcn made a part) and «Feedback» (status, empty and
  loading states and whole pages in one heap) are gone: each part stands with what it is for.
- **Components / Overview**: every component by what you need, one table per group, each name a link to its page.
- The files follow the sidebar (`stories/components/<group>/…`, `stories/foundations`, `stories/patterns`, `stories/engineering`), and the
  reference pictures moved with them. `src/stories.test.ts` fails on a title with no place in `storySort`, a component missing from the
  overview, a file outside its root's folder, and a link between docs pages that leads nowhere.
- The addresses of the pages changed with their titles (`?path=/docs/components-lists-rows--docs`, was `lists-rows`): a bookmark to an
  old one opens Storybook's start.

## 8.23

The gaps 8.21 left under «You check» are closed:

- **`ChartCard` and `PictureCard` titles are headings**, `<h3>` by default, with `level` (`2 | 3 | 4`) to fit the outline (`CardHeading`
  inside shadcn's `CardTitle`, which stays a `<div>`). A page that put its own heading around a card's title drops it.
- **Every link out says so**: `ExternalMark` (the external symbol and «(eksternt nettsted)» for a screen reader) ends `ExternalLink`,
  `TextLink external`, and the links of `DatedLinkTable` and `StoryList`.
- **`Logo decorative`**: `alt=""` for a logo beside its own name.
- **`PeriodPicker` keeps WCAG 3.2.2**: it says in advance that a choice changes the page, and `enableNavigatingSelects` lets the arrow
  keys of a closed select step through the periods, going on Enter or when focus leaves (`decide`, tested); a pointer choice goes at once.
- **`PageSection level={3}`** for a section under another heading.
- **`NotFoundPage` and `ServerErrorPage` take `home`**, the app's front page under a base path (`/start/`); `/` by default.

## 8.22

Performance and sustainability, researched against web.dev, the Web Almanac 2025, the W3C Web Sustainability Guidelines, the Sustainable
Web Design Model v4, GOV.UK and W3C COGA (guide **Performance and sustainability**):
- **`Picture`** takes `sources` (the widths its source offers: `srcset` with a `sizes` that is the width it is drawn at, so a 40 px thumbnail
  takes the small file) and `priority` (the one picture that leads the page: eager and `fetchpriority="high"`; every other is lazy).
- **`npx designsystem-budget <dist>`** weighs every built page (HTML, CSS and script gzipped, the `latin` font files, its own pictures) against a
  budget (500 KB a page; 150 script, 50 CSS, 100 fonts), fails above it, and gives grams of CO2e per view and the SWDM v4 rating. A page of
  this system is about 85 KB without pictures: 0.013 g, A+.
- The skills: light pages in `designsystem-ui`, a check in `designsystem-review`, refresh no faster than the data changes in `designsystem-ux`.
- Myths written down: dark mode saves energy only on OLED at high brightness; `prefers-reduced-data` is in no browser yet.

## 8.21

- **Every component page's Accessibility section** is now what the component handles and what the page must still check («You check»), each
  point with its WCAG 2.2 criterion, and every story says in a line why it exists. Writing them down against the code found claims it did
  not keep and gaps that are now fixed: the scroll regions of `Heatmap` and `CalendarHeatmap` and the zoom button of `ImageLightbox` have a
  focus ring, and **`SegmentedToggle` takes a required `label`** (its group had no name). What is not fixed is written under «You check»
  on the page: `CardTitle` is no heading, `TextLink external`, `DatedLinkTable` and `StoryList` do not say a link leaves, `Logo` has no
  decorative mode, `PeriodPicker` changes the page on a choice, `PageSection`'s title is always an `h2`.
- **Visual regression in CI**: `npm run test:visual` compares every story's picture with the reference kept in `__screenshots__`; the
  Visual workflow makes the references: a new story's on the push that adds it, a changed one by hand with «update» (or, since 8.52.2,
  before the push with `npm run test:visual:docker -- --update`).
- `CalendarHeatmap` and `Heatmap` take `unit` as `{ one, many }`, so a count of one reads «1 visning».

## 8.20

How well-made design systems use Storybook (Primer, Carbon, Fluent, Spectrum, Polaris, Atlassian; Digdir, NAV Aksel, Equinor, Skatteetaten,
SpareBank 1), and what was taken:
- **Tema «Begge»**: a story in light and in dark side by side (Primer's «All», SpareBank 1's «Begge moduser»); the tokens now follow
  `data-theme` on any element, not only the root.
- **Skjermlesertekst «Synlig»** (Skatteetaten): what only a screen reader hears is drawn, dashed, where it stands. It found the first wrong
  one at once: `Rows` stories said «Antall» over a column of dates.
- **`lang="nb"`** on the stories' document (it said `en` over Norwegian text), and controls without handlers, refs and aria attributes.
- **Do and don't as stories** (Digdir, Equinor, Aksel): `Dont…` («Ikke:», kept out of the manifest) and `Do…` («Gjør:»); the first pair is
  sections side by side against under each other (`Grid`).
- **A Welcome page** that says how to use it, how to read it and where an agent finds it as data.
- The skills: a JSDoc line on each story saying why it exists; the Accessibility section as what the component handles and what the page
  must still check, with WCAG 2.2 criteria.

Not taken, with the reason: a snapshot story per component and visual regression (Digdir, Aksel, Primer: their pictures need one fixed
machine; a later step in CI), a language toolbar (the system has one language), pseudo-states for hover and focus in snapshots (with the
snapshots), docs generated from one data file per component (Atlassian, Equinor: worth it when the README and the stories drift).

## 8.19

Storybook used as more than a gallery, from three research passes over its documentation (docs, controls and testing, organisation and AI):
- **A catalogue for agents:** the build writes `manifests/components.json` (every component with its description, props and story code) and
  `manifests/docs.json` (the guides), published with Storybook; `@storybook/addon-mcp` serves components, stories, docs and test runs to an
  agent in this repository (`.mcp.json`). The skills point at both.
- **Docs pages:** the template's sections are headings (a test holds them), a table of contents on every page, a code panel, WCAG 2.2 AA and
  best-practice rules in the axe run, required props first in the props table, and live examples in the guides (`Canvas`).
- **Organisation:** a `manager.ts` with the system's name and link and the accessibility panel first; `experimental` and `deprecated` tags,
  hidden in the sidebar by default; the token pages kept out of the components manifest.
- **Tests:** the light and dark runs set the theme with `initialGlobals`, as the toolbar does.

Not taken: `react-docgen-typescript` (it needs TypeScript's JavaScript API, which TypeScript 7 does not have), visual snapshot tests (their
pictures differ between machines; a later step, in CI only), CSF Factories (still a preview).

## 8.18

Storybook as the system's test bench, from Storybook's own guidance (the Vitest addon, accessibility tests) and how other design systems keep
theirs: every story is a test (`npm run test:stories`, `@storybook/addon-vitest`): it renders in Chromium **in the light and the dark theme**,
runs its `play` test and **fails on an axe violation** (`a11y: { test: "error" }`); CI runs it. The toolbar has **Tema** (as the device,
light, dark: `data-theme` on the root, which only Storybook and the tests set; an app follows the device) and **Viewport** with the five
width classes. `play` tests for `SegmentedToggle`, `Disclosure`, `FoldList` and `CommandButton` with `Overlay`.

Found by the new tests and fixed: `--destructive` in light is darker (4.0:1 on its own tint in the destructive button, now 4.7:1; 5.6:1 on
the page; a test holds it), `SegmentedToggle` says which option is on with `aria-pressed` (it was told by the look alone), `DumbbellChart`'s
`role="img"` is on a `div` (not allowed on a `ul`), and the tables of `DumbbellChart` and `Heatmap` have a first column header
(`Heatmap rowName`).

## 8.17

Wide screens, researched against Material 3 (window size classes, supporting pane), GOV.UK (two-thirds and one-third), Primer (`PageLayout`
pane) and the research on line length: the line does not grow on a desktop; the width goes to a **pane**, to more pictures across, or to margin,
in that order. New: `PageLayout width="pane"` (the 48rem reading column and a pane of at most 20rem), `Split position="start" | "end"` (the pane
is who the page is about, or what supports it), the width classes (`WIDTH_CLASSES`, compact to extra-large, as container queries in rem) and
the guide **Wide screens**. Fixed: a `Split` in the reading column never had room for its pane (48rem against the 56rem it needs); its main
column is now held at 48rem, and `page-width.test.ts` holds the numbers to each other. The skills check at 400, 768, 1024, 1440 and 2560 px.

## 8.15

Six charts for distributions, relations, rhythm and change, from research into graphical perception (Cleveland and McGill), box-plot and histogram practice (Tukey; Freedman and Diaconis), colour-scale and accessibility guidance for heat maps (Visa, Carbon, Smashing, the W3C): `CalendarHeatmap` (days by week, Monday first), `Heatmap` (two categories, optional numbers in the cells), `ScatterChart` (dots, a dashed trend line, r² and a sentence that it is not a cause), `Histogram`, `BoxPlot` and `DumbbellChart` (change between two moments). Every one has a visible summary, a table (`showTable`), an empty state, steps that keep 3:1 (a test) and no meaning in colour alone. The statistics are pure functions in `lib/stats.ts`, `lib/heatmap.ts` and `lib/dumbbell.ts`, with tests.

## 8.14

New: `LineChart` (several series over time, each named at its line's end, with a dash pattern and not colour alone), `Progress` takes a `target` (a bullet: the value against a goal and a mark where the goal is), `BrandIcon` (GitHub, Spotify, Bluesky, Mastodon; LinkedIn is not in Simple Icons any more, so a link there uses its words). Corrected: the default grey steps of a stacked chart are now `100, 66, 44` (and `100, 72, 52, 44` for lines), the lightest that keep 3:1 against the surface, checked by a test.

## Charts (8.13)

Researched against GOV.UK (Analysis Function), Carbon, Primer, NN/G, Datawrapper, the W3C (complex images), Chartability and the chart library's own documentation. A chart box now has its **final height from the first paint, in CSS** (`clamp(height, 22cqw, 480px)`), where it used to grow after it had measured itself and push the page; numbers in a tooltip and a table are formatted `nb-NO` through `formatChartValue` (a test fails on a bare `toLocaleString()`);
a chart with no data says why at its height (`emptyMessage`); every chart can show a visible `summary` (`summariseSeries()` writes one in Norwegian) and offer its table to everyone (`showTable`); the donut's `keep` is at most five and it keeps its ring in forced colours. New: `Sparkline`, a number's shape, plain markup with no script. Guides: **Data visualisation** (rewritten: a decision table, what is not drawn, limits, anatomy), **Accessible charts**, **Charts on the server**.

## Colour and icons (8.11)

Researched against Primer, Atlassian, Radix, Carbon, GOV.UK, NN/G, WCAG and MDN. `src/theme-contrast.test.ts` works out the contrast of every token pair from `theme.css` on each `npm test` (text 4.5:1, marks 3:1, the decorative lines under 3:1 on purpose, the chart series told apart in four kinds of vision) with `src/lib/colour.ts`, which has no dependency. The six `series-*` colours were changed to differ in lightness as well as hue; `shell.css` repairs forced colours and `theme.css` answers `prefers-contrast: more`. Five icon meanings were added (`copy`, `mail`, `history`, `filter`, `sort`). The guides **Colour and state** (with a routine for a change) and **Icons / Guide** (before you reach for one, icon and word, accessible names, governance) and the skills have the rules.

## Installed apps and server rendering (8.10)

Researched against web.dev, MDN, the WebKit blog, React, Next.js, Astro, Primer and NN/G; the rules are in the guides **Installed apps (PWA)**, **Server rendering** and **Fresh data and offline** (Storybook) and in the skills.

| Component or helper | For |
| --- | --- |
| `Freshness` | When the page's data was made («Oppdatert 19:27»); past a threshold a warning in words. A still line, not a live region |
| `ConnectionBanner` | «Du er frakoblet» in a live region that is always on the page; a hint, never a gate |
| `StreamedSection`, `SectionSkeleton` | A part that arrives on its own, with a skeleton at its final height and one status |
| `webManifest()`, `inScope()` (`lib/manifest.ts`) | A manifest that meets what browsers need, or an error; a scope check on a whole segment |

A component that uses a hook or a handler starts with `"use client"`, and none reads the clock or a random number in render: `src/server-safe.test.ts` fails otherwise. Components that are client components: `ChartFrame`, `CommandButton`, `FormErrorSummary`, `Freshness`, `ConnectionBanner`, `Overlay`, `SegmentedToggle`, `VirtualTbody`. (Five of these had no `"use client"` until 8.10, which would fail in a server component such as a Next.js page.)

## Documentation of a component

Every component's story has the same sections in its description (Storybook, **Docs**): **Use it when**, **Do not use it when** (naming the component to use instead), **Accessibility**, **Content** (the Norwegian wording) and **Related**. A new component is not added without them (see the guide «Status and contributing»). The tokens and the icon catalogue are documented in their own guides.

## Migrating to 10.0.0

10.0.0 has one component per use case, and an app passes data (what a thing is, the role of a text, what failed), never appearance.
The table «Which component» is the whole list. Pin it (`npx designsystem-bump`, the latest `main`) in the app on `main`, then go through the groups below; `npm run typecheck` in the app finds every call that changed.

### A. Primitives and frame

**Text: a role, not a look.**

| 9.x | 10.0 |
| --- | --- |
| `<Text>` | `<Text>` (`role="body"`, the default) |
| `<Text size="sm" tone="muted">`, `<Text size="sm">`, `<Text tone="muted">` | `<Text role="quiet">`. A muted line that really says «nothing here» is an `EmptyState`; one that says something failed is an `ErrorMessage` |
| `<Text size="xs" tone="muted">` | `<Text role="note">`, or gone: `PageSection source` draws «Tekst fra …» |
| `<Text numeric>`, `<Text as="span" …>` with a number | `<Text role="figure">` (a `span`, tabular figures) |
| `size="lg"`, `weight`, `tone="destructive"`, `as` | Removed. A heading is a `Heading`; a failure is an `ErrorMessage`; a number is `figure` |

**Layout: the gaps are the system's.**

| 9.x | 10.0 |
| --- | --- |
| `<Stack gap="xl">` / `gap="lg"` around the sections of a page | Delete the wrapper: put the sections straight in `PageLayout` (through the app Shell), which spaces them 2rem apart (`SECTION_RHYTHM` in `lib/page-width`). Do it in the same change as the bump, or the spacing doubles where a wrapper stays |
| `<Stack gap="md">`, `"lg"`, `"xl"` inside a section | `<Stack>` (`default`) |
| `<Stack gap="xs">`, `"sm"` | `<Stack gap="tight">` (row titles go away with `List`, group B) |
| `<Stack width="prose">` | Removed: the reading column is the measure (`PageLayout width="reading"`) |
| `<Inline gap="…">` | `<Inline>`: one fixed gap |
| `<Inline as="ul" aria-label="Sjangere"><li>…</li></Inline>` | `<Inline label="Sjangere" items={[…]} />` |
| `<Grid gap="…" columns="…">` | `<Grid columns="tiles" \| "charts">` |
| `Split` (`rail`, `position`) | Removed from the API. A detail page's two columns are `DetailLayout` (group D) |

**Sections.**

| 9.x | 10.0 |
| --- | --- |
| `<PageSection>` without `icon` | `icon` is required. «Om …» sections use `info` |
| `<Text size="sm" tone="muted">Tekst fra Last.fm</Text>` under a section | `<PageSection source={{ label: "Last.fm", href }}>` |
| `error ? <ErrorMessage error={error}>Kunne ikke hente været</ErrorMessage> : …` in a section | `<PageSection what="været" error={error}>…</PageSection>` |
| `SectionGroup`, `SubSection` | Removed (no app used them). A part of a part is a page of its own |
| `<StreamedSection title="…">`, `<SectionSkeleton title="…">` | `<StreamedSection title="…" icon="…">`: the skeleton shows the section's title and icon. Do not place a `SectionSkeleton` yourself |
| `PageHeader` | Unchanged (`title`, `description`, `actions`). One per page, through the Shell |

**Pictures: what it is, and where it stands.**

| 9.x | 10.0 |
| --- | --- |
| `<Picture src ratio="square" corners="rounded" size="row">` | `<Picture src kind="album" context="row">`. `kind`: `album`, `track`, `artist`, `person`, `film`, `show`, `game`, `podcast`, `episode`, `place`, `achievement`; `context`: `row`, `hero`, `tile`. The shapes are in `lib/picture-kinds` (`PICTURE_KINDS`, `shapeOf`) |
| `<Picture disc>` | Internal: the disc is drawn by `AlbumSleeve` and `NowPlaying` |
| medier `lib/shapes.ts` (`SHAPES`, `SPOTIFY_COVER`, `GAME`) | Delete once group B lands: `kind` carries it (`SPOTIFY_COVER` → `album`/`track`, `GAME` → `game`) |

**Removed and internal.**

| 9.x | 10.0 |
| --- | --- |
| `Code`, `CopyButton` | Deleted |
| `components/card` (`Card`), `components/separator` (`Separator`) | Internal: no longer exported. A card is drawn by the components that are one (`ChartCard`, `PageSection continues`); a line between parts is space (README rule 7) |
| Any `Npx` length in an app | rem, em, %, cqi or a Tailwind step (README rule 12) |

### B. Lists

One `List` for every list of things that link somewhere. A row is data: the list draws it, so the same row looks the same in
every app. `import { List, type ListRow } from "@lmfaole/designsystem/components/list"`.

```tsx
<List
  kind="podcast"                       // the picture in front, in this kind's shape (optional)
  ranked={false}                       // a top list: places, `change`, a bar from `amount`
  label="Abonnementer"                 // a caption for a screen reader (optional)
  columns={{ value: "Sist", action: "Spill av" }} // the hidden column headers (optional)
  rows={[{
    key, title: "Ekko", href: "/podkast/ekko", external: false,
    picture: { src, sources },         // or leave out: the frame stays
    meta: ["NRK", 412, <Time … />, { label: "Åpne i Spotify", href, external: true }],
    value: <Time … />,                 // at the end
    action: <PlayButton … />,          // its own target at the end
    badge: { label: "Utkast", icon, tone }, isNew: { until, now }, live: true,
    status: [{ text, icon, tone }], progress: 0.4,
    map: { at, from, label, tiles },   // a small map in front (no `kind`)
    icon: "pull-request", iconLabel: "Pull request", iconTone: "destructive", // (no `kind`)
    change: { kind: "up", by: 2 }, amount: 84, // (with `ranked`)
    kind: "track",                     // this row's kind where it differs from the list's
  }]}
/>
```

**Components.**

| 9.x | 10.0 |
| --- | --- |
| `Rows`, `PictureRows`, `RankedRows` | `List` |
| `type RowData`, `PictureRow`, `RankedRow`, `RowColumns`; `Tile`'s `ratio`, `corners`, `sources`, `description`, `lines` | `type ListRow`, `ListColumns` (and `ListMeta`, `ListLink`, `ListPicture`, `ListBadge`); `Tile` has `picture: ListPicture` and `meta` |
| `EntityRows`, `VirtualTbody` | `List` with the first rows, and «Se alle» (`PageSection more`) to a page with `Pagination` |
| `EntryList`, `EntrySection`, `DatedEntry`, `EntryGroup`, `GroupItem` | `List` (`meta` for the dates) or `Timeline` |
| `HeadlineList`, `StoryList`, `DatedLinkTable` | `List` with `href` + `external: true`, the site and the day in `meta` |
| `FoldList` | `List` with the first rows and «Se alle» to the rest |
| `PictureCard` | `List` with a `kind`, or `Tiles` |
| `CardLink` as a row's title, `ItemLink` / `SlugLink stretched` | the row's `href` (see the rows below) |
| `CardLink`, `ItemLink` elsewhere | `TextLink` |
| `details([...])` (`components/picture-rows`) | `meta: [...]`. Outside a list (`NowPlayingCard detail`): `[a, b].filter(Boolean).join(" · ")` |
| `LINKED_ROW` from `components/rows` | `LINKED_ROW` from `lib/link-style` |
| `lib/virtual-spacers`, `lib/progressive-count`, `lib/use-progressive-count` | Deleted |
| `Badge`, `NewBadge`, `LiveDot` in a row | A row's `badge: { label, icon, tone }`, `isNew: { until, now }`, `live: true`. The components stay for use outside a list |

**The list's props.**

| 9.x | 10.0 |
| --- | --- |
| `Rows lead="icon"` | `List` (the icon column is drawn when a row has `icon`) |
| `Rows lead="poster"` with `<Picture … />` or `<MapThumb … />` as `picture` | `List kind="…"` with `picture: { src }`; a map is the row's `map: { at, from, label }` |
| `Rows lead="rank"`, `RankedRows` | `List ranked`; `RankedRows` `amount` and `change` stay on the row |
| `PictureRows ratio="square"` / `"poster"` / `"wide"`, `corners`, `{...SHAPES.x}`, `GAME`, `SPOTIFY_COVER` | `kind`: `album`, `track`, `artist`, `person`, `film`, `show`, `game`, `podcast`, `episode`, `place`, `achievement` |
| AchievementRows `ratio="square"` (medier) | `kind="achievement"` |
| A row whose `corners` differs from the list's (a song among albums) | the row's `kind` |
| `columns={{ name, value }}` | `columns={{ name, value, action }}` |

**A row.**

| 9.x | 10.0 |
| --- | --- |
| `title: <TextLink href={h} stretched>T</TextLink>`, `<CardLink href={h} look="strong">T</CardLink>`, `<ItemLink … stretched>` | `title: "T", href: h` |
| `title: <ExternalLink href={h} stretched>T</ExternalLink>` | `title: "T", href: h, external: true` |
| `title: <Text>T</Text>` (not a link) | `title: "T"` (no `href`) |
| `title: <Stack gap="xs"><…>T</…><Text size="sm" tone="muted">{details([a, b])}</Text></Stack>` | `title: "T", meta: [a, b]` |
| `title: <Stack …>T<StatusLine items={s} /></Stack>` | `title: "T", status: s` |
| `description: details([a, b, c])`, `description: "a"` (`PictureRows`, `RankedRows`) | `meta: [a, b, c]`, `meta: ["a"]` (empty parts are left out) |
| A `TextLink` / `ExternalLink` among the details | `{ label, href }` / `{ label, href, external: true }` in `meta` |
| `<Time … />` in the details or the value | the same element in `meta` or `value` |
| `value: <Text as="span" size="sm" tone="muted">x</Text>` | `value: x` (the list sets its look) |
| `value: <PlayButton …/>`, a `<form>`, a subscribe button | `action: …` |
| `value: "Nr. 3"` to show a place (TopArtistRows) | `List ranked`: the place comes from the order |
| `live` (`PictureRows`), its value text | `live: true`; the value is «Spilles nå» with the dot by itself |
| `picture: <Picture src={s} sources={x} … />`, `picture: s, sources: x` | `picture: { src: s, sources: x }` |
| `picture: null, sources: x` | `picture: { sources: x }` |
| `picture: <MapThumb at={a} from={f} label={l} stretched />` (startside `bikeRow`) | `map: { at: a, from: f, label: l }`; leave out `href` and the map is the row's link |
| `icon`, `iconLabel`, `iconTone` | unchanged |
| A `<Badge>` or `<NewBadge>` after the title | `badge: { label, icon?, tone? }`, `isNew: { until, now }` |
| A `<Progress>` / bar under an episode | `progress: 0..1`, and the words in `meta` («32 min igjen») |
| startside hour rows (`hourRows`) | `title: "14 Lett regn"`, `meta: ["0,4 mm", "3 m/s"]`, `value: "12°"`, `icon` for the weather |
| startside `conditionRows` `line(…)` | `title`, `meta`, `href` from the same parts |

**Tiles.**

| 9.x | 10.0 |
| --- | --- |
| `<Tiles tiles={…}>` with `ratio`, `corners` or `...SHAPES.x` on each tile | `<Tiles kind="person" \| "album" \| … tiles={…}>` |
| tile `description: d, lines: [a, b]` | `meta: [d, a, b]` |
| tile `picture: s, sources: x` | `picture: { src: s, sources: x }` |

### C. Links, actions and states

**Links.**

| 9.x | 10.0 |
| --- | --- |
| `import { ExternalLink } from "…/components/external-link"`; `<ExternalLink href>…</ExternalLink>` | `import { TextLink } from "…/components/text"`; `<TextLink external href>…</TextLink>` |
| `<TextLink stretched href>`, `<ExternalLink stretched href>` (a row's name covering the row) | Removed: a row is a `List` row (group B), which owns its link. Until then, drop `stretched` |
| `ExternalMark` | Internal: `TextLink external` and `LinkButton external` draw it |
| `<LinkButton variant="default" \| "outline">` | `<LinkButton>`: always outline. The one filled action on a page is a form's `PendingButton` |

**Buttons.** `components/button` is now the design system's own button: always outline, one size, the icon by name and the words as a
string. The shadcn button behind it is internal.

| 9.x | 10.0 |
| --- | --- |
| `<Button type="button" variant="outline" size="sm" disabled={busy} onClick={f}>…</Button>` | `<Button disabled={busy} onClick={f}>…</Button>` (`type="button"` is the default) |
| `<Button …><Icon name="download" slot="start" />Last ned</Button>` | `<Button icon="download">Last ned</Button>` |
| `<Button aria-label="Slett …" …>` | `<Button ariaLabel="Slett …">` |
| `<Button type="submit" variant="outline">` (a secondary form action: «Vis introen igjen») | `<Button type="submit">` |
| `<Button type="submit">` (filled: the form's main action) | `<PendingButton pendingLabel="Lagrer …">Lagre</PendingButton>`: it says what it is doing while it waits |
| `<PendingButton size="lg">` | `<PendingButton>`: one size |
| `CommandButton` | Internal (`Overlay` and `ImageLightbox` use it) |
| `SegmentedToggle` | Deleted: switching views of the same page is `FilterChips` (group E) |

**Empty states: say why, and what.** The words, the picture, the height and the action follow from `reason`; `what` is a plural noun
phrase («åpne pull requests», «episoder»). A page's empty state fills the rest of the screen, a section's (`PageSection`, or anything with
`data-frame="section"`) a smaller part of it.

| 9.x | 10.0 |
| --- | --- |
| `<EmptyState glyph="play" title="Velkommen" description="Søk opp en podkast …" action={…} />` (an app's first, empty start) | `<EmptyState reason="first-run" what="abonnementer" description="Søk opp en podkast …" action={{ href: "/sok", label: "Finn podkaster" }} />`: `description` and `action` are required, the picture carries the app's brand |
| `<EmptyState icon="history" title="Ingen avspillinger ennå" description="Tidslinjen fylles med …" />` (it comes by itself) | `<EmptyState reason="nothing-yet" what="avspillinger" />`: «Ingen avspillinger ennå» + «De dukker opp her når det kommer noe.» Keep a `description` only where it says something the reader can act on |
| `<EmptyState title="Ingen treff" description="Prøv færre filtre." />` after a search | `<EmptyState reason="no-results" what="podkaster" query={q} />`: «Ingen treff for «{q}»», and «Tøm søket» unless you give an `action` |
| `<EmptyState title="Ingen … i perioden" … />` after a filter or a period | `<EmptyState reason="no-results" what="filmer" />` (no `query`): «Ingen treff» + «Ingen filmer passer det du har valgt. Prøv færre filtre.» |
| `<EmptyState title="Ingen åpne pull requests" description="Alt er behandlet." />`, «Ingen avganger», «Ingen nedlastinger» | `<EmptyState reason="all-done" what="åpne pull requests" />`: «Ingen åpne pull requests» + «Alt er behandlet.»; no `action` (a type error) |
| `title`, `icon`, `glyph` | Removed (type errors): the title is written from `reason` and `what`, the picture is drawn from `reason` |
| `action={<SomeButton />}` (a component) | `action` is a `LinkTo` (`{ href, label, icon? }`), or in a client component an `ActionTo` (`{ label, icon?, onSelect }`, new in `lib/vocabulary`) |
| `<EmptyState title="Ingen beskrivelse." />` and other one-line «nothing here» notes inside a page | Leave the part out. An `EmptyState` is for a page or a section that has nothing |
| medier: `<EmptyState title="Fikk ikke svar fra Podkast" …>`, `"Fikk ikke svar fra Trakt"`, `"Spill er ikke satt opp"`, offline `"Ingen nett"` | `<ErrorMessage what="lyttingen" error={error} retry />` (and `what="oppsummeringen"`, `what="spill"`, `what="siden"`): a failure is never an empty state (`rules.test.ts`) |

**Failures: one `ErrorMessage`.**

| 9.x | 10.0 |
| --- | --- |
| `<ErrorMessage error={e}>Kunne ikke hente været</ErrorMessage>` | `<ErrorMessage what="været" error={e} retry />`: «Kunne ikke hente været», the cause under «Detaljer», «Prøv igjen» reloads the page |
| `<ErrorMessage error={e}>Kunne ikke hente avganger fra Entur</ErrorMessage>` | `<ErrorMessage what="avganger fra Entur" error={e} retry />` |
| `<ErrorMessage error={e}>Kunne ikke søke nå</ErrorMessage>` | `<ErrorMessage what="søketreff" error={e} retry />` |
| `retry` to another address | `retry={{ href, label: "Prøv igjen" }}` |
| `error: Error` | `error: unknown`: pass what the source gave; a string or an `Error` both show their message |
| An `ErrorMessage` inside a `PageSection`'s body | `<PageSection … what="været" error={error}>`: the section draws the `ErrorMessage` itself |
| Several `ErrorMessage`s for several failed sources of one section | One `ErrorMessage` with the first error, or one section per source |
| `<Banner tone="warning" title="Kunne ikke …">` | `ErrorMessage`. `Banner` has only `success` and `info` (`warning` is a type error) |
| `<Banner tone="warning" title="Dataene er fra i går">` (old data, not a failure) | `<Banner tone="info" …>` |
| `<ErrorPage actions={<><LinkButton href="/">Til forsiden</LinkButton></>} />` | `<ErrorPage actions={[{ href: "/", label: "Til forsiden" }]} />` |

**Removed.**

| 9.x | 10.0 |
| --- | --- |
| `CountUp`, `DataCell`, `NumberCell` | Deleted (no app used them): a number is `Text role="figure"`, or a `List` row's `value` |
| `SortHeader`, `Pagination`, `lib/pagination` | Deleted (no app used them): a long list is one `List` (group B), in one order |

### D. Detail pages and facts

A detail page now has a single skeleton. The head is `DetailHeader` for a thing with a picture, or the page's own `PageHeader` for one without. Under it comes `DetailLayout`: the sections as `children`, and a rail on the end side whose slots are data, always in the same order:

1. `map`
2. `status`
3. `steps`
4. `actions`
5. `facts` (never under a title of their own; «Fakta» is gone)
6. `links` (out to other sites; never last in the main content)
7. `updated`

On a phone the rail comes first, under the head. There is no `position`.

```ts
import { DetailLayout } from "@lmfaole/designsystem/components/detail-layout"

<DetailLayout
  map?={{ at, from?, label, tiles? }}          // a map across the top of the rail (replaces StopMap / ChartCard + MapThumb)
  status?={Status[]}                           // StatusLine
  steps?={{ label, steps, now }}               // StateSteps (vertical in the rail)
  actions?={<Subscribe … />}                   // the one row of actions: PendingButton, Button, a form
  facts?={[["Gren", "a → b"], ["Etiketter", labels]]}   // FactList, untitled
  links?={[{ href, label, icon? }]}            // LinkButton external, under the facts
  updated?={{ at: iso, now: iso }}             // «Sist endret <Time format="datetime">.»
>
  {sections}
</DetailLayout>
```

**Removed exports.**

| 9.x | 10.0 |
| --- | --- |
| `Split` (`components/layout`; `rail`, `position`) | `DetailLayout` (see the pages below). It is the only two-column layout |
| `LinkList` (`components/fact-list`) | `DetailLayout links` (0 uses in the apps) |
| `MapThumb`, `MapThumbProps` (`components/map-thumb`) | Internal. A map is data: a `List` row's `map`, `DetailLayout map`, `DepartureBoard at` |
| `MapCredit` | Drawn by `List` under a list whose rows have a `map`. Delete your own `<MapCredit />` (startside `components/conditions.tsx`) |
| `osmLink`, `OSM_TILES`, `LatLon`, `TileSource` from `components/map-thumb` | `@lmfaole/designsystem/lib/map-tiles` |
| `DetailHeader` `ratio`, `corners` | `kind: PictureKind` (`"album"`, `"artist"`, `"film"`, `"show"`, `"game"`, `"person"`, `"podcast"` …): the shape follows from the kind |
| `DetailHeader` `kind` (the words: «Album», «Film · 1995») | `label` |
| `DetailHeader` `size="large"` | Derived: large for `kind="artist"` and wherever there is a `sleeve`; the ordinary head otherwise (as before for a person, a show, a song, a podcast) |

**New look.**
- A page's head (`DetailHeader`, `Stage as="header"`) has a hairline frame (`border-border`).
- In the light theme, a picture that is light as a whole (`LIGHT_ART`, `isLightArt` in `lib/palette`) gets the `--muted` ground and a stronger backdrop, so a white cover's edge shows.
- A `palette.test.ts` case holds the head's text to 4.5:1 on it.

**Page by page** (mechanical):

| App, page | 9.x | 10.0 |
| --- | --- | --- |
| startside PR, issue and discussion (`app/{pull-requests,issues,discussions}/[owner]/[repo]/[number]/page.tsx`) | `<Split rail={<Stack gap="lg"><StatusLine items={status} /><PageSection id="facts" title="Fakta" icon="info"><FactList facts={F} /></PageSection></Stack>}>` with `<StateSteps label={L} steps={S} now={at} />` in the main content, `<Text size="xs" tone="muted">Sist endret <Time value={u} now={new Date(at)} format="datetime" />.</Text>` and `<div><LinkButton href={url} external>Åpne på GitHub</LinkButton></div>` last | `<DetailLayout status={status} steps={{ label: L, steps: S, now: at }} facts={F} links={[{ href: url, label: "Åpne på GitHub" }]} updated={{ at: u, now: at }}>`: delete the `StateSteps`, the «Sist endret» line and the `LinkButton` from the main content |
| startside stop and line (`app/transport/[id]/page.tsx`, `app/transport/[id]/[linje]/page.tsx`) | `<Split position="end" rail={<StopMap stop={stop} from={from} />}>`; `StopMap` (`components/stop.tsx`) is a `MapThumb shape="banner"` inside `<ChartCard title="Her er stasjonen">` | `<DetailLayout map={{ at: stop.at, ...(from === null ? {} : { from }), label: \`Kart over ${stop.name}\` }}>`. Delete `StopMap`: the map is not a chart, and the card is now the rail. Its title «Her er stasjonen» goes; the map's `label` names it |
| startside conditions (`components/conditions.tsx`) | `<List rows={stations} />` then `<MapCredit />` | `<List rows={stations} />`: the list credits its maps |
| podkast podcast (`app/podkast/[id]/page.tsx`) | `<Split rail={<Stack gap="lg"><Inline><Subscribe … /></Inline><FactList facts={F} /></Stack>}>` and `<Inline><LinkButton href={podcast.href} external>Åpne i Apple Podcasts</LinkButton></Inline>` last in main | `<DetailLayout actions={<Subscribe … />} facts={F} links={[{ href: podcast.href, label: "Åpne i Apple Podcasts" }]}>` |
| podkast episode (`app/podkast/[id]/[episode]/page.tsx`) | `<Split rail={<Stack gap="md"><StatusLine items={statuses} /><Download …>…</Download></Stack>}>` and «Åpne på podkastens nettside» last in main | `<DetailLayout status={statuses} actions={<Download …>…</Download>} links={item.link ? [{ href: item.link, label: "Åpne på podkastens nettside" }] : []}>` |
| medier film and show (`components/detail.tsx` `TitleDetail`) | `<Split rail={facts}>` … `<LinkButton href={page.traktUrl} external>Åpne på Trakt</LinkButton>` last | `<DetailLayout facts={F} links={[{ href: page.traktUrl, label: "Åpne på Trakt" }]}>`. Here `F` is the array that was given to `FactList` |
| medier artist (`ArtistDetail`) | `<Split position="end" rail={<Stack gap="xl">{similar}<Stack gap="sm"><LinkButton …Last.fm/><LinkButton …Spotify/>{onward}</Stack></Stack>}>` | `<DetailLayout links={[{ href: page.url, label: "Åpne på Last.fm" }, ...(spotify ? [{ href: spotify.url, label: "Åpne i Spotify" }] : [])]}>`. Move `{similar}` into the sections (it is a `List`, and is read). `{onward}` (MusicBrainz's links, a server island) becomes the last section, a `PageSection` with a `List` of `external` rows. The «Lyttere på Last.fm» `FactList` in «Om artisten» moves to `facts` |
| medier person (`PersonDetail`) | `<Split rail={rail}>` … `<LinkButton …>Åpne på TMDB</LinkButton>` | `<DetailLayout facts={F} links={[{ href: \`https://www.themoviedb.org/person/${id}\`, label: "Åpne på TMDB" }]}>` |
| medier song and album (`TrackDetail`, `AlbumDetail`) | `<Split rail={<Stack gap="lg">{facts ?? <AlbumFacts facts={…} />}</Stack>}>` … `<MusicLinks lastfm spotify />` last | `<DetailLayout facts={albumFactsOf(page, info)} links={[{ href: page.url, label: "Åpne på Last.fm" }, ...(spotify ? [{ href: spotify.url, label: "Åpne i Spotify" }] : [])]}>`. Delete `MusicLinks`. The facts are data now (a `ReactNode` is allowed as a value): resolve the label and the country that the `facts` island streamed in before rendering, or pass the island as one fact's value |
| medier podcast (`components/podkast.tsx` `PodcastView`) | `<Split rail={rail}>` … `<LinkButton href={detail.podcast.href} external>Åpne i Podkast</LinkButton>` | `<DetailLayout facts={F} links={[{ href: detail.podcast.href, label: "Åpne i Podkast" }]}>` |
| medier game (`components/games.tsx` `GameDetail`) | `<Split rail={rail}>` … `<LinkButton href={view.link.href} external>{view.link.label}</LinkButton>` | `<DetailLayout facts={F} links={[view.link]}>` |
| medier head (`components/head.tsx`) | `<DetailHeader kind={kind} size={large ? "large" : "normal"} {...SHAPES[shape]} …>` | `<DetailHeader kind={shape === "film" && isShow ? "show" : shape} label={kind} …>`. Drop `large` and `SHAPES`; `shape` is already a `PictureKind`. The tv page may keep `"film"` (same shape). The large head follows `kind="artist"` or `sleeve` exactly as the pages set `large` today |

The `Head` island's own `kind` prop (the words) can keep its name in medier; only the design system's prop is now `label`.

### E. Settings and choices

The settings pages are the design system's now: the app passes what is chosen, where the form goes and where it comes back to. The
field names (`theme`, `effects`, `tilt`, `back`, `rerun`), the `prefs` and `seen` cookies and the server actions are unchanged.

**Components.**

| 9.x | 10.0 |
| --- | --- |
| `PeriodPicker` (`components/period-picker`) | `FilterChips` with the same `chips`: over six it renders the navigating `NativeSelect` itself (`MAX_CHIPS`) |
| `<ChoiceCards layout="visual" options={[{ …, preview: <ThemeSample theme="…" /> }]}>` for theme / effects / tilt | `<ThemeChoice value={prefs.theme} />`, `<EffectsChoice value={prefs.effects} />`, `<TiltChoice value={prefs.tilt} />` (`components/appearance-settings`), in a first run |
| `ChoiceCards` `layout`, an option's `preview` | Removed. Other `ChoiceCards` (startside «Tid på døgnet», «Posisjon») are unchanged |
| `ThemeSample`, `EffectsPreview`, `TiltPreview`, `HapticsSetting`, `SourceList` | Internal: drawn by `AppearanceSettings` and `SourcesSettings`. The `Source` type is exported from `components/app-settings` |
| The three `SettingsSection`s «Tema», «Effekter» (+ `HapticsSetting`), «Lyset» in a form with `back` and «Lagre» | `<AppearanceSettings prefs={prefs} action={endpoint} back={back} />` (its own form, button included; section ids `tema`, `effekter`, `lys` as before) |
| `InstallPrompt seen={false} id="install-settings"` + the «Ser du ingen knapp …» line on the app subpage | `<InstallSettings appName="…" cookiePath="…" />` (section id `installer`) |
| A form with `rerun=1` and «Vis introen igjen» | `<IntroSettings action={endpoint} back={frontPage} />` (section id `intro`) |
| `Credits()` = `SettingsSection id="kilder"` + `SourceList` | `<SourcesSettings sources={SOURCES} />` (the app keeps only its list of sources) |
| The overview's «Utseende» and «App(en)» rows, and an app's own `appearanceSummary` | `appearancePage(href, prefs)` and `appPage(href, appName)` from `lib/settings-pages` (and `appearanceSummary`). `SubPages` puts them first |

**podkast** (`action` `/api/innstillinger`).

| 9.x | 10.0 |
| --- | --- |
| `app/innstillinger/utseende/page.tsx`: `SettingsForm` + three sections + `HapticsSetting`, `appearanceFields` | `<SettingsSubpageLayout …><AppearanceSettings prefs={parsePrefs(…)} action="/api/innstillinger" back="/innstillinger/utseende" /></SettingsSubpageLayout>`; delete `appearanceFields` |
| `app/innstillinger/app/page.tsx`: `InstallPrompt appName="Podkast" seen={false} cookiePath="/" id="install-settings"` + the quiet line | `<InstallSettings appName="Podkast" cookiePath="/" />` |
| `app/innstillinger/page.tsx`: rows «Utseende», «App» and `appearanceSummary` from `components/settings` | `appearancePage("/innstillinger/utseende", prefs)`, `appPage("/innstillinger/app", "Podkast")`, then «Del lytting», «Dine data» |
| (no intro, no sources) | Not required. `IntroSettings` only once the app has a `FirstRun` and the endpoint reads `rerun=1`; `SourcesSettings` once it lists its sources |

**startside** (`action` `SETTINGS_ENDPOINT`).

| 9.x | 10.0 |
| --- | --- |
| `app/innstillinger/utseende/page.tsx`: `SettingsForm slug="utseende"` + three sections + `HapticsSetting` | `<AppearanceSettings prefs={state.prefs} action={SETTINGS_ENDPOINT} back={settingsPage("utseende")} />` inside `SettingsSubpageLayout` (which keeps `FormErrorSummary`) |
| `components/settings-fields.tsx` `theme`, `effects`, `tilt` (`ChoiceCards` + previews), used by `components/first-run.tsx` | `<ThemeChoice value={prefs.theme} />`, `<EffectsChoice …/>`, `<TiltChoice …/>`; remove the three keys from `settingsFields` |
| `app/innstillinger/app/page.tsx`: `InstallPrompt … cookiePath={SEEN_PATH} id="install-settings"` + the quiet line | `<InstallSettings appName="Startside" cookiePath={SEEN_PATH} />` |
| `app/innstillinger/page.tsx`: `IntroAgain`, `Credits`, rows «Utseende» / «App» with `appearanceSummary` from `lib/settings` | `<IntroSettings action={SETTINGS_ENDPOINT} back={BASE} />`, `<SourcesSettings sources={SOURCES} />`, `appearancePage(settingsPage("utseende"), prefs)`, `appPage(settingsPage("app"), "Startside")`; delete `IntroAgain`, `Credits` and `appearanceSummary`. `OldSettingsAnchor` (`#tema`, `#effekter`, `#lys`, `app#installer`) keeps working |
| `components/credits.tsx` | Keep only `SOURCES: Source[]` (`import type { Source } from "@lmfaole/designsystem/components/app-settings"`) |
| `vaer/[dato]`, `components/stop.tsx`: `FilterChips` | Unchanged |

**medier** (`action` `${base}api/innstillinger/`).

| 9.x | 10.0 |
| --- | --- |
| `pages/innstillinger/utseende.astro`: `SettingsForm` + `ThemeField` + `EffectsChoice` / `TiltChoice` islands + `HapticsSetting client:visible` | `` <AppearanceSettings client:visible prefs={prefs} action={`${base}api/innstillinger/`} back={back} /> `` |
| `components/effect-choices.tsx`, `ThemeField` in `components/settings-fields.tsx` (also in `MedierFirstRun`) | `EffectsChoice`, `TiltChoice`, `ThemeChoice` from `components/appearance-settings`; delete `effect-choices.tsx` and `ThemeField` |
| `pages/innstillinger/app.astro`: `InstallPrompt client:idle` (id `install`) | `<InstallSettings client:idle appName="Medier" cookiePath={SEEN_PATH} />`. Its answer is recorded as `install-settings` in the `seen` cookie, not `install`, so the front page's offer is no longer marked answered from here |
| `pages/innstillinger/index.astro`: the «Vis introen igjen» button (`name="rerun"`, section `#introen`), `Credits`, rows «utseende» (moon) / «app» (phone) | `` <IntroSettings action={`${base}api/innstillinger/`} back={base} /> `` (the anchor is `#intro`), `<SourcesSettings sources={SOURCES} />`, `appearancePage(…)`, `appPage(…, "Medier")` |
| `components/wrapped.tsx`: `FilterChips` (Periode) | Unchanged; more than six periods become a select by themselves |

### F. Charts

**The look is the chart's.** Delete these props; the rest of each call stays.

| 9.x | 10.0 |
| --- | --- |
| `<ColumnChart height={140}>`, `height={200}`, `height={220}` (and on `AreaChart`) | Delete `height`. Every chart is `--chart-height` tall (`clamp(12.5rem, 22cqi, 20rem)`), so strøm's 140 grows to at least 12.5rem |
| `<ColumnChart labelEvery={3}>` | Delete `labelEvery`: the chart labels every column up to eight, then every `labelStep(count)` = ⌈count / 8⌉. Every column is still in the table |
| `color="var(--weather-accent)"` (`ColumnChart`, `DumbbellChart`) | Delete `color`. The marks are `--chart-accent`, which `WeatherStage` sets to the weather's colour; elsewhere they are `primary` |
| `showTable`, `showTable={false}` (every chart) | Delete. The table under «Vis tallene» is always there |
| `emptyMessage="Du har ikke spilt … i denne perioden."` (`CalendarHeatmap`, `AuroraChart`, `Meteogram`, `ColumnChart`) | Delete; put the empty state on the card: `<ChartCard empty={days.length === 0 ? "avspillinger" : undefined}>`. A chart given no data at all says «Ingen data å vise.» |
| `<ChartCard empty="Ingen avspillinger i perioden.">` | `<ChartCard empty="avspillinger">`: a plural noun for what there is none of; the card says «Ingen avspillinger å vise.» at the chart's height |
| `<ChartEmpty height={…} message="…">` | `<ChartEmpty what="…">` (a plural noun), though a page uses `ChartCard empty` |
| `<ChartFrame height grow color>` | `ChartFrame` takes only `definition` and `ariaLabel` |
| `<ChartTable visible>` | `ChartTable` takes no `visible`: the table is always under «Vis tallene» |

**A chart stands in a `ChartCard`.** `ColumnChart`, `AreaChart`, `DumbbellChart`, `CalendarHeatmap` and `AuroraChart` (`rules.test.ts` rule 3). `Sparkline` (in a row), `Meteogram` and `DurationBars` do not.

| 9.x | 10.0 |
| --- | --- |
| startside `app/vaer/page.tsx`: `<DumbbellChart … color showTable={false} />` on its own | `<ChartCard title="…"><DumbbellChart … /></ChartCard>` |
| startside `components/sky.tsx`: `<AuroraChart … showTable={false} />` on its own | `<ChartCard title="Nordlys de neste dagene"><AuroraChart … /></ChartCard>` |
| startside `components/stop.tsx`: `<ChartCard title="Her er stasjonen">` around a `MapThumb` | Not a chart: a map is group D's (`MapThumb` in the detail layout); drop the `ChartCard` |
| medier `trend.tsx` `PlaysChart` (`labelEvery`, `emptyMessage` props) | Drop both props from `PlaysChart` and its callers (`Wrapped.astro`, `podkast/maned/[month].astro`, `podkast/index.astro`); `empty={… ? "avspillinger" : undefined}` (or `"minutter"`) |

**Removed.** No app imported any of them.

| 9.x | 10.0 |
| --- | --- |
| `LineChart` | `AreaChart`, one per series, each in its `ChartCard` |
| `RankedBarChart` | A `List` that is `ranked` (group B) |
| `StackedColumnChart`, `DonutChart` | `ColumnChart`, or a `SummaryBar` for one whole |
| `ScatterChart`, `BoxPlot`, `Histogram`, `Heatmap` | Deleted |
| `components/heat-legend` (`HeatLegend`) | Internal to `CalendarHeatmap` |
| `lib/stats`, `lib/donut`, `lib/chart-labels` | Deleted |
| `lib/chart-format` `EMPTY_CHART_MESSAGE` | `ChartCard empty`; new: `labelStep` |
| `lib/chart-colors` `LINE_STEPS`, `defaultSeriesColor` | Deleted; the chart colour is `--chart-accent` |
| `lib/chart-rows` `stackedRows`, `lineRows`, `seriesLabels` | Deleted; `datumRows` stays |
| `lib/chart-summary-complex` `summariseScatter`, `summariseBoxes`, `summariseHistogram`, `summariseHeatMatrix` | Deleted |

### G. Podcasts (podkast)

Nothing to change: these are new, and each replaces what an app would otherwise build itself.

```tsx
import { Transcript } from "@lmfaole/designsystem/components/transcript"
import { podcastFacts } from "@lmfaole/designsystem/lib/podcast-facts"
import { personRole } from "@lmfaole/designsystem/lib/people"

<Transcript cues={cues} episode={episode} />                     // follows the DS player; or currentTime + onSeek
<Transcript text={plain} />                                       // a transcript without times
<Transcript error={error} retry />                                // «Kunne ikke hente transkripsjonen»

<List kind="episode" rows={[{ key, title, href, episode: { season: 2, number: 14, type: "bonus" }, meta: [<Time … />] }]} />
<DetailHeader kind="episode" label="Episode" episode={{ season: 2, number: 14 }} title={title} />

<List kind="person" rows={people.map((p) => ({ key: p.name, title: p.name, href: p.href, picture: { src: p.img }, role: personRole(p.role) }))} />

<List kind="podcast" rows={[{ key, title, href, picture, meta: [publisher], reason: { by: "Ekko" } }]} />   // or { follows }, { with: [...] }

<DetailLayout facts={podcastFacts({ publisher, categories, language, episodeDates, episodes, now })} … />
```

| What the app has | 10.0 |
| --- | --- |
| Season and episode number in a row's meta (`` `S${s} E${e}` ``), a «Bonus» badge | the row's `episode: { season, number, type }` |
| Its own transcript list, scroll-follow and search | `Transcript` |
| People as rows with the role in `meta` | `role` on each row of a `List kind="person"` (grouped by the list) |
| «Anbefalt av X» in `meta` | `reason: { by: "X" }` |
| Its own podcast facts (`["Språk", "no"]`, «hver fredag») | `podcastFacts(...)` |

### H. Games (Steam)

New, for a game's page, a wishlist, a game's news and a Steam profile. The words and the logic are in `lib/games` (pure, tested): Steam's review steps in Norwegian, prices and sales, the Deck verdict, how a game is played, presence, level and stats. The structure of the pages is in «Pages and navigation»: Spill (the digest) → a game's page, Ønskeliste, Nyheter or Profil; no tabs.

```tsx
import { gameFacts } from "@lmfaole/designsystem/components/game-facts"
import { MediaGallery } from "@lmfaole/designsystem/components/media-gallery"
import { deckCompatibility, deckStatus, levelProgress, newSales, newsKind, presenceOf, statFacts } from "@lmfaole/designsystem/lib/games"

// A game's page: the hero art across the head, the rail's facts in a fixed order, the sections under it.
<DetailHeader kind="game" label="Spill · 2023" title={name} picture={capsule} backdrop={{ src: libraryHero }} figures={[…]} />
<DetailLayout
  facts={gameFacts({ reviews: { positive, total }, playersNow, deck: deckCompatibility(resolved_category), categories: categories.map((c) => c.id), developers, publishers, released, price: price_overview })}
  links={[{ href: storeUrl, label: "Åpne i Steam-butikken" }]}
>
  <PageSection id="bilder" title="Bilder og videoer" icon="image">
    <MediaGallery items={[...movies.map((m) => ({ kind: "video", key: m.id, src: m.mp4.max, poster: m.thumbnail, label: m.name })), ...screenshots.map((s, i) => ({ kind: "picture", key: s.id, src: s.path_full, label: `${name}, bilde ${i + 1}` }))]} />
  </PageSection>
  <PageSection id="statistikk" title="Statistikk" icon="chart"><FactList facts={statFacts(stats)} /></PageSection>
  <PageSection id="nyheter" title="Nyheter" icon="article" continues={{ href, label: "Alle nyheter" }}>
    <List rows={news.map((n) => ({ key: n.gid, title: n.title, href: n.url, external: true, icon: "article", news: newsKind(n.tags) ?? undefined, meta: [<Time … />, n.feedlabel] }))} />
  </PageSection>
  <PageSection id="dlc" title="Tilleggsinnhold" icon="package"><List kind="game" columns={{ value: "Pris" }} rows={dlc.map((d) => ({ …, external: true, price: d.price }))} /></PageSection>
</DetailLayout>

// The wishlist: a price per row, «Nytt tilbud» for what came on sale since the last visit (the app keeps the keys it showed in its `seen` cookie).
const fresh = new Set(newSales(onSaleNow, seenKeys))
<List kind="game" columns={{ value: "Pris" }} rows={wishlist.map((w) => ({ key: w.appid, title: w.name, href, picture, price: { ...w.price, newSale: fresh.has(w.appid) }, status: [deckStatus(w.deck)] }))} />
<NavBar items={[…, { key: "spill", label: "Spill", href: "/spill/", icon: "game", current, count: { value: fresh.size, label: `${fresh.size} nye tilbud` } }]} />

// A Steam profile: where they are now, the level as progress, the badges as rows.
<DetailHeader kind="person" label="Steam-profil" title={personaname} picture={avatarfull} presence={presenceOf(personastate, gameextrainfo, lastlogoff, now)} figures={[…]} />
<Progress {...levelProgress({ level, xp: player_xp, xpAtLevel: player_xp_needed_current_level, xpToNext: player_xp_needed_to_level_up })} />
```

| What the app has | 10.0 |
| --- | --- |
| Its own review text («Svært positive», a percent) or a coloured score | `gameFacts({ reviews })` («Svært positive · 94 % av 12 345», icon by sentiment) |
| A price with a struck old price and a «-40%» badge in `value` | the row's `price: { final, initial }` |
| «Ny» for a sale since the last visit, a count in the menu | `price.newSale` from `newSales()`; `NavItem.count` |
| Its own screenshot grid or lightbox for trailers | `MediaGallery` |
| A hero image behind or above the head (`className`, `style`) | `DetailHeader backdrop` |
| «Spiller nå: X» as text beside a name | `DetailHeader presence` (`presenceOf()`) |
| A Deck badge, «Co-op», «Kontroller» as words in `meta` | `gameFacts({ deck, categories })` on the page; `deckStatus()` as a row's `status` |
| «Patch notes» as text in a news row | the row's `news: "patch-notes"` (`newsKind(tags)`) |
| A level bar of its own | `Progress {...levelProgress(...)}` |

## Migrating to 8.0

**Breaking:**

| 7.x | 8.0 |
| --- | --- |
| `BackLink` | Removed. `Breadcrumbs` is the way back (the parent alone on a phone, the whole trail from tablet width) |
| `NavCards` | Removed. `SubPages`: the pages under a page as a list (icon, name, one line), in one column |

New: `Breadcrumbs`, `SubPages`, and `FactList` takes several values per term (additive).

## Migrating to 7.1

Additive: `Markdown`.

## Migrating to 7.0

**Breaking:** `PageTabs` (5.3) is gone, replaced by `NavBar`. A row of links under the title looked like tabs, which switch views of one
page, when it goes to other pages; on a phone it also wrapped onto two lines. `NavBar` is a bar at the foot of the screen on a phone and
a rail at the left from tablet width, and is given to `PageLayout` as `nav` (the page leaves room for it).

| 6.x | 7.0 |
| --- | --- |
| `<PageTabs label tabs={[{ key, label, href, icon, current, count }]} />` under the title | `<PageLayout nav={<NavBar label title items={[{ key, label, href, icon, current }]} />}>` (no `count`; one-word labels) |

## Migrating to 6.0

6.0 makes the reading direction «down» the rule (rule 7). **Breaking:**

| 5.x | 6.0 |
| --- | --- |
| Lists of rows (`Rows`, `PictureRows`, `EntityRows`), `HeadlineList`, `StoryList`, `FoldList` and `EntryList` flowed into several columns on a wide screen | One column, under each other. `LIST_COLUMNS` (`lib/page-width`) is gone |
| `Grid columns="sections"` | Removed: stack the sections (`Stack`); put what belongs together in a `SectionGroup` |
| `SectionGroup width="row"` / `"cell"` | `width` is gone: the subsections always stand under each other |
| A page filled the whole page area | `PageLayout` and `PageColumn` have `width="reading"` (the default: 48rem, centred); use `width="wide"` for a page that is mostly pictures or charts |

Pictures (`Tiles`), charts, `Grid` counts and `Split` are unchanged: they are looked at, not read.

## Migrating to 5.4

Additive: the skills (above) and the `designsystem-skills` command.

## Migrating to 5.3

5.3 is additive, with one visible change: **`ExternalLink` now always carries the external symbol** and is read as external
(it left the reader to guess before). New: `NavBar`, `BackLink`, `SummaryBar`, `LinkButton`, `more` on the section
components, the `back` icon, and the rules above.

## Migrating to 5.2

5.2 is additive: `Icon`, `StatusLine`, the `ICONS` register, `icon` on `PageSection`/`SectionGroup`/`SubSection`,
`Rows` `lead="icon"`, and an icon in `ErrorMessage` (a warning symbol in front of its text). `NavCards` links take an
`IconName` as well as an icon component (prefer the name). A page that imports from `lucide-react` should import from
`lib/icons` instead, or better ask for a meaning with `<Icon name="…" />`.

## Migrating to 5.0

5.0 removes what was specific to one kind of content (music, film, CVs) or to one framework, and leaves general building blocks.
Pictures and links are plain addresses: resolving a base path is the project's, not a component's.

| 4.x | 5.0 |
| --- | --- |
| `Cover` (`url`) | `Picture` (`src`) |
| `MediaRows` (`cover`, `subtitle`, `when`), `TrackRows` | `PictureRows` (`picture`, `detail`, `aside`); a track is a title with a `detail` of artist and album |
| `Gallery` (`slug`, `link` render prop, `year`, `meta`) | `Tiles` (`href`, `detail`, `lines`) |
| `CreatorLogo`, `CreatorLogos` (`names` + `logos` map) | `Logo` (`src`), `Logos` (`logos: {name, src}[]`) |
| `BackdropCard` | `PictureCard` |
| `CoverLightbox` | `ImageLightbox` |
| `PageLinks` (`to`, app base, Astro prefetch, left-out pages) | `NavCards` (`href`; leave out the current page yourself) |
| `CvSection`, `CvList`, `CvEntry`, `CvEmployer`, `CvRole`, `CvProjects`, `CvProject`, `CvLinkList`; `CvNote` | `EntrySection`, `EntryList`, `DatedEntry`, `EntryGroup`, `GroupItem`, `SubItems`, `SubItem`, `LinkItems`; `Text role="quiet"` |
| `EntityRow` `loved` | removed |
| `EntityPage`, `lib/base-url` (`appUrl`) | removed |
