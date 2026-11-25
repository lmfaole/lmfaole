/**
 * One component per use case: the decision table of 10.0.0, the single source of the table in the README («Which component») and in
 * the `designsystem-components` skill. `npm run use-cases` writes it into both; `use-cases.test.ts` fails when they differ from it.
 * An app passes data (what a thing is, its role, what failed), never appearance: the «Fixed look» column is what the component decides.
 * What is not in this table is internal or removed.
 */

export interface UseCase {
  /** What a page shows. */
  when: string
  /** The component(s), in Markdown. */
  use: string
  /** What is fixed, or how to use it. */
  note: string
}

/**
 * Names the table uses that a later part of 10.0.0 adds, with the group that adds it. Each group removes its names here when its
 * component lands; `use-cases.test.ts` fails if a name here already exists (so the list cannot rot) and the skills test accepts them until then.
 */
export const PLANNED: Readonly<Record<string, "B" | "C" | "D" | "E" | "F">> = {
}

export const USE_CASES: readonly UseCase[] = [
  { when: "A page and its title", use: "`PageLayout` + `PageHeader` (via the app Shell)", note: "Section gap is fixed; no `Stack` around sections" },
  { when: "One thing with a picture (album, film, artist, podcast, episode, game)", use: "`DetailHeader` + `DetailLayout`", note: "Picture shape comes from `kind`" },
  { when: "One thing without a picture (PR, issue, stop, line, station)", use: "`PageHeader` + `DetailLayout`", note: "Same rail anatomy as above" },
  { when: "A titled part of a page", use: "`PageSection` (`icon` **required**)", note: "`more` = a «see all» link in the header; `continues` = an excerpt of a subpage; `source` = «Tekst fra …»; `what` + `error` = it could not be fetched" },
  { when: "A part of a page that arrives late", use: "`StreamedSection` (`title`, `icon`)", note: "Draws the section's skeleton at its place" },
  { when: "Any list of things that link somewhere", use: "`List` (one row shape, data rows)", note: "`kind` gives the lead picture; `icon` for non-media, `map` for a place; `ranked` for top lists; `meta` is the line under the title, `action` a button of its own" },
  { when: "Episodes of a podcast", use: "`List kind=\"episode\"` (row `episode: { season, number, type }`)", note: "«S2 E14» first in the meta, «Trailer» / «Bonus» as the badge; on the episode's page `DetailHeader episode`" },
  { when: "The people of a podcast or an episode (hosts, guests)", use: "`List kind=\"person\"` (row `role`; `personRole()` reads `podcast:person`)", note: "Grouped by role in a fixed order under «Verter», «Gjester» …; round pictures" },
  { when: "Recommendations (a podroll, «Anbefalt for deg», «Mer fra samme utgiver»)", use: "`List kind=\"podcast\"` (row `reason`: `by`, `follows`, `with`)", note: "The reason is a line of its own in fixed words: «Anbefalt av …», «Fordi du følger …», «Med …»" },
  { when: "A game's page (Steam)", use: "`DetailHeader kind=\"game\" backdrop` + `DetailLayout facts={gameFacts(…)}` (`components/game-facts`)", note: "The hero art across the top, decorative, nothing on it; the rail's facts in a fixed order: «Anmeldelser» (Steam's words, icon by sentiment), «Spiller nå», «Steam Deck», «Spillere», «Kontroller», «Utvikler», «Utgiver», «Utgitt», «Pris»" },
  { when: "A game's screenshots and trailers", use: "`MediaGallery` (`items`: `picture` or `video` with `poster`)", note: "16:9 thumbnails, the first six and «Se alle N»; a dialog with «Forrige» / «Neste», arrow keys and «3 av 24»; a video never plays by itself" },
  { when: "Things with a price (a wishlist, DLC)", use: "`List` (row `price`: `final`, `initial`, `newSale`)", note: "The value column: «−40 %», the price, and the price before struck through; `newSale` is «Nytt tilbud» beside the title (`newSales()` in `lib/games`)" },
  { when: "A game's news and patch notes", use: "`List` (row `news`: `patch-notes` or `event`; `external`)", note: "«Oppdatering» / «Hendelse» as the badge; the date in `meta` as a `Time`" },
  { when: "Where a person is now (in a game, online)", use: "`DetailHeader presence` (`presenceOf()` in `lib/games`)", note: "A live dot and «Spiller Hades II» (a link to the game), «På nett», «Borte», «Frakoblet · sist på nett …» under the name" },
  { when: "A level and how far to the next", use: "`Progress` (`levelProgress()` in `lib/games`)", note: "«312 av 500 XP til nivå 43» in words" },
  { when: "New things waiting in a place of the app (sales since the last visit)", use: "`NavBar` item `count: { value, label }`", note: "A number in a pill, its words to a screen reader; 0 draws nothing" },
  { when: "An episode's transcript", use: "`Transcript` (`cues` or `text`; `currentTime` + `onSeek`, or `episode`)", note: "Marks and follows the line said now, a tap seeks, speakers in turns, search; `EmptyState` / `ErrorMessage` by itself" },
  { when: "A gallery of pictures (cast, albums of an artist)", use: "`Tiles` (`kind`)", note: "Only when the picture *is* the content" },
  { when: "A picture of a thing", use: "`Picture` (`kind`, `context`)", note: "Shape and size come from `kind` and `context`" },
  { when: "Terms and values about one thing", use: "`FactList`", note: "In the `DetailLayout` rail, or as section content for stats; a podcast's are `podcastFacts()` (`lib/podcast-facts`), a game's stats `statFacts()` (`lib/games`)" },
  { when: "2–4 headline numbers for a section", use: "`KeyFigures`", note: "First in the section, above its chart" },
  { when: "A count that links to a filtered list", use: "`SummaryBar`", note: "—" },
  { when: "The state of one thing under its title", use: "`StatusLine` (detail) / `Badge` (in a row, via `List` `badge`)", note: "—" },
  { when: "Data could not be fetched", use: "`ErrorMessage` (`what`, `error`), or `PageSection` `what` + `error`", note: "Always «Kunne ikke hente {what}» + «Prøv igjen»" },
  { when: "Nothing to show (a page or a section)", use: "`EmptyState` (`reason`: `first-run`, `nothing-yet`, `no-results`, `all-done`; `what`)", note: "Full height with a picture and at most one central action; words are fixed by `reason`. Never used for errors" },
  { when: "Something was done (saved, deleted) or a page-wide notice", use: "`Banner` (`success` or `info` only)", note: "Never used for a failed fetch" },
  { when: "Offline or reconnecting", use: "`ConnectionBanner`", note: "—" },
  { when: "Running text", use: "`Text` (`role`: `body`, `quiet`, `note`, `figure`), `Heading`", note: "Size, weight and colour follow from the role" },
  { when: "Small text under content", use: "`Text role=\"note\"`", note: "A credit, «Sist endret»; usually via `PageSection` `source` or the `DetailLayout` rail instead" },
  { when: "Things under each other inside a section; things in a line", use: "`Stack` (`default` or `tight`), `Inline` (`items` + `label` for a list)", note: "The gaps are fixed" },
  { when: "Things looked at in columns", use: "`Grid` (`tiles` or `charts`)", note: "Never for text, lists or sections" },
  { when: "A link inside running text", use: "`TextLink` (`external` for other sites)", note: "`ExternalLink` is gone" },
  { when: "An action that goes to a page or to another site", use: "`LinkButton` (`external` for out)", note: "Always outline; no variant" },
  { when: "An action that submits a form", use: "`PendingButton`", note: "Primary; the only filled button" },
  { when: "A secondary form action (reset, re-run)", use: "`Button` (DS wrapper)", note: "Always outline; no variant or size" },
  { when: "Switching between views of the same page (Day, Line, Period)", use: "`FilterChips`", note: "More than 6 options becomes a navigating `NativeSelect` automatically" },
  { when: "One of N in settings", use: "`ChoiceCards`", note: "Words only; theme, effects and tilt are `ThemeChoice` / `EffectsChoice` / `TiltChoice`" },
  { when: "Several of N", use: "`CheckboxList`; a grid of groups × options: `ToggleMatrix`", note: "—" },
  { when: "Free text, a time, a typed list, a search", use: "`TextField`, `TimeField`, `ListField`, `SearchField`", note: "—" },
  { when: "Appearance settings (theme, effects, tilt, haptics)", use: "`AppearanceSettings`", note: "Identical in all apps; the first run uses `ThemeChoice` / `EffectsChoice` / `TiltChoice`" },
  { when: "Re-running the intro / showing sources / installing", use: "`IntroSettings` / `SourcesSettings` / `InstallSettings`", note: "Identical in all apps" },
  { when: "The settings overview", use: "`SubPages`", note: "`appearancePage` + `appPage` first, app-specific after; `IntroSettings` + `SourcesSettings` under the list" },
  { when: "A chart", use: "`ChartCard` + one of `ColumnChart`, `AreaChart`, `DumbbellChart`, `CalendarHeatmap`, `AuroraChart`", note: "One height and colour; table always on; `empty` names what is missing" },
  { when: "A number's shape in a row", use: "`Sparkline`", note: "—" },
  { when: "Domain screens", use: "`DepartureBoard`, `DepartureList`, `StopSequence`, `HazardList`, `Meteogram`, `DurationBars`, `WeatherStage`, `PodcastPlayer`, `ChapterList`, `Timeline`, `StateSteps`", note: "Unchanged; they are the only fit" },
]

/** The table as Markdown, as it stands in the README and the skill. */
export function renderUseCaseTable(): string {
  return [
    "| When you show … | Use | Fixed look / note |",
    "| --- | --- | --- |",
    ...USE_CASES.map(({ when, use, note }) => `| ${when} | ${use} | ${note} |`),
  ].join("\n")
}

export const USE_CASES_START = "<!-- use-cases:start (generated from src/lib/use-cases.ts: npm run use-cases) -->"
export const USE_CASES_END = "<!-- use-cases:end -->"

/** `text` with the generated table between the markers; it throws when the markers are missing. */
export function withUseCaseTable(text: string): string {
  const start = text.indexOf(USE_CASES_START)
  const end = text.indexOf(USE_CASES_END)
  if (start < 0 || end < start) throw new Error("the use-case markers are missing")
  return `${text.slice(0, start + USE_CASES_START.length)}\n\n${renderUseCaseTable()}\n\n${text.slice(end)}`
}
