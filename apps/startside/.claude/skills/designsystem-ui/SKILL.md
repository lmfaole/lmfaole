---
name: designsystem-ui
description: Use when building or changing the look of a page or component with the design system - layout and spacing, typography, colour and state, cards, icons, density, wide screens and motion. Use whenever you are about to write markup, pick a spacing or a colour, or reach for a className.
---

# UI with the design system

A page is **put together from the components**. It writes no `className`, `style` or stylesheet of its own (rule 1). When nothing
fits, the markup becomes a component in the design system, named for what it is, never for the project.

## Layout

- **Stacks and rows:** `Stack` (things under each other: the default for a page), `Inline` (short things next to each other, wraps),
  `PageColumn`/`PageLayout` (the page's frame and **reading column**). Gaps are the system's: `Stack` is `default` or `tight`, `Inline` and `Grid` have one each, and the sections of a page are spaced by `PageLayout`.
- **One reading direction: down** (rule 7). What is read (text, lists, the sections of a page) stands under each other in the reading
  column (`width="reading"`, 48rem, centred). On a wide screen the rest is margin. See **designsystem-hierarchy**.
- **Columns are for what is looked at:** `Grid columns="tiles" | "charts"`, `Tiles`, and the rail
  of a detail page. A page that is mostly such things is `width="wide"`. Never `Grid` for text, lists or sections.
- **Responsive by the room, not the device** (guide «Wide screens»): width classes compact (<40rem), medium, expanded (≥56rem), large
  (≥75rem), extra-large (≥100rem), as container queries (`@container`), so a part behaves by the room it has wherever it stands. A page
  chooses its width: `reading` (text and lists), `pane` (a detail page: the reading column and its rail beside it from expanded up),
  `wide` (galleries, charts). Content is never hidden at a width: it moves (a pane goes under), it does not disappear.
- **A detail page on a desktop:** the cover and its facts in the rail (DetailLayout, from 10.0.0), the lists in the main column and the
  link out last in it (rule: a link out comes last on the page); on a phone the pane comes first and the lists follow.
- **Sections:** straight in `PageLayout`, each with an icon, under each other; a part of a part is a page of its own.
- Check at **400, 768, 1024, 1440 and 2560** px and at 200 % zoom.

## Type

- Text only through `Text`, by its role: `body`, `quiet` (a secondary line), `note` (a credit or source under content),
  `figure` (a number in a line, tabular). Never a size, a tone or a weight of your own; headings are `Heading` (`level` is the element, `look` is the appearance: page, section, label, item).
- One page `<h1>` (`PageHeader`). Sections are `<h2>`, their parts `<h3>`. Never skip a level for looks.
- Figures in a line use `Text role="figure"` (tabular numbers). Titles are short noun phrases, not sentences.
- **Three levels, no fourth:** page, section, item. A section is never made by bolding or enlarging `Text`; it is a `Heading`. Bold is for what stops something or the point; no italic.
- **Paragraphs stand in `Stack width="prose"`** (45–75 characters, about 65; **designsystem-hierarchy**). A list, a row or a table can use the whole reading column.
- **Uppercase** only in short labels (`Heading look="label"`), never a sentence. `xs` is for fine print and secondary notes, never the only place something needed to act is said.
- Never a size in viewport units; text must survive 200 % zoom and WCAG 1.4.12 text spacing. `<html lang="nb">` is set once. If a
  size is ever made fluid (`clamp()` with a rem floor), its largest step is at most 2.5 × its smallest, or zoom cannot reach 200 %.
- **No light or thin weights** (Apple HIG: they fail first at small sizes and in dark mode). Regular for text, semibold for headings;
  the superfamily is variable, so there is no faux bold and no second family for "display".
- **Wrapping:** heads are balanced (`text-balance`, in `HEAD_TITLE` and the empty and first-run titles); a short lead or empty-state
  paragraph is `text-pretty` (no single word on its last line). Both are progressive: where unsupported the text wraps as usual, so
  never depend on them for fit. Never `text-balance` on long prose (it is limited to a few lines and costs layout).
- Numbers that are compared or that change in place (a timer, a count, a column of figures) are tabular (`Text role="figure"`,
  `formatChartValue`), so they do not jitter as they tick.
- Quotes « », ranges with an en dash and no spaces, a non-breaking space between a number and its unit.
- **Long titles are the design system's** (`lib/long-titles`, Storybook «Patterns / Long titles»). Never add `truncate`, `line-clamp`, a size or a `title=` tooltip to a title you pass:
  - Rows, tiles, the compact player, chapters: the title is cut at two lines (`ROW_TITLE`), the line under it at one (`ROW_META`); the whole text stays in the DOM and names the link.
  - Heads (`PageHeader`, `DetailHeader`, `NowPlayingCard`, «Spilles nå»): never cut; balanced, hyphenated, a long word broken (`HEAD_TITLE`), a step smaller past 60 characters and two past 120 (`titleStep`).
  - In a component: every flex/grid child that holds text has `min-w-0`, every badge, value or action beside a title `shrink-0`; a word with no place to break breaks (`[overflow-wrap:anywhere]`). No marquee.

## Colour, surfaces and dark mode

- **Tokens only** (rule 5): `background`, `foreground`, `muted`, `primary`, `destructive`, `border`, `ring`, the `chart-*` and
  `series-*` colours. No hex, no `rgb()`, no `bg-white`. A test fails on a raw colour. The tokens are OKLCH, so a step in lightness
  looks like the same step in every hue; never convert one to hex to "fix" it.
- **No px, ever** (README rule 12): lengths are rem, em, ch, %, vw/dvh, cqi, lh, `clamp()` or a Tailwind step; a hairline is `border`;
  queries are in rem or em. `src/units.test.ts` fails on `<number>px` in the design system; keep apps the same.
- **One colour of meaning** (guide «Colour and state»): `destructive`, for what stops something, never for emphasis. There is no green:
  good is plain; a state is a symbol and a word. Colour is never the only signal (**designsystem-accessibility**). One colour never
  means two things on a page. A second colour is a new role with a symbol, measured first.
- An app's **brand** hue (`data-brand` on `<html>`) is identity, not a colour of meaning: it reaches the page only through the components
  (the mark, the `NavBar`'s current place, the ring, the one primary `Button`), never through a `className`, and never in content,
  charts or states (**designsystem-brand**).
- **Contrast is WCAG 2** (4.5:1 text, 3:1 large text, marks and edges). WCAG 3's contrast method is still undecided (draft of
  September 2026), so APCA is at most a second look where WCAG 2 misjudges: light text on dark, thin strokes, small grey text. Never
  ship a pair that passes APCA but fails WCAG 2.
- **Alpha never carries text or a mark that needs 3:1** (`border` and `input` are decorative, about 1.3:1; a field takes its edge from
  `muted-foreground`). Check a pair on `card` as well as on the page.
- **Dark mode is its own palette, not an inversion.** The page is a near-black grey (`oklch(0.145 0 0)`), never `#000`; a raised
  surface is *lighter* (`card`, `popover` at 0.205, `muted` above), because shadows barely show on dark. Elevation in dark is told
  by lightness and a `border`, in light by shadow and a `border` (guide «Light and shadow»). Never a pure-white text block on
  the dark page larger than a heading: body text is `foreground` (0.985), quiet text `muted-foreground`.
- **Materials:** translucency and blur are for chrome that floats over content (the `NavBar`, the docked player, an `Overlay`
  scrim) and only there; never for a card, a list or anything read (Apple's Liquid Glass rule: the glass layer is controls and
  navigation, never content). Chrome stays nearly opaque (`bg-background/95`) so text on it holds 4.5:1 whatever scrolls behind; a
  page never adds `backdrop-blur` of its own.
- Light and dark follow `prefers-color-scheme`; both are checked in Storybook, also with forced colours and increased contrast. An app
  sets `data-theme` (and `data-effects`, `data-tilt`) on `<html>` only from the visitor's own choice, with `htmlAttributes` from
  `lib/preferences`.
- A part with a shadow-only edge or a fill-only state also has a border or a mark (forced colours drop shadows and fills). Icons use `currentColor`.
- A change to a token: `npm test` (`theme-contrast.test.ts`), the numbers in Foundations / Tokens / Overview, the Accessibility panel
  in light and dark, and a look at hover, focus, selected, disabled and error.

## Pictures and artwork

- Every picture is a `Picture` (its frame, its ratio reserved, `sources`, lazy unless it leads the page). Cover art is shown whole and
  unaltered: never cropped to another ratio, tinted, blurred as a picture, overlaid with text or given a filter (Spotify and other
  sources forbid it). Text never stands on a picture; it stands beside or under it.
- Colour *from* a picture is taken, never the picture: `AmbientBackdrop` draws four colours from it behind a `Stage`, and
  `Tiles`/rows keep the plain frame. A light cover (`LIGHT_ART`) gets the `muted` ground so its edge shows; in dark mode a white
  cover is not dimmed by a filter (it may not be altered); its frame and the `Stage` around it soften the edge.
- A picture with no meaning is `alt=""`; one that carries content names it (**designsystem-content**). A missing picture is the
  kind's icon in the same frame, never a broken image or a grey box of another size.

## Charts

- **Ask the question first** (guide «Data visualisation»): one number is a `SummaryBar`, a number and its movement is a `Sparkline`, a trend is `AreaChart`, a few categories `ColumnChart`, a ranking a `List` that is `ranked`, rhythm over days `CalendarHeatmap`, change between two moments `DumbbellChart`, the northern lights `AuroraChart`, each in a `ChartCard`, the weather hour by hour `Meteogram` (temperature, rain and the sky on one time axis). Not drawn: 3D, radial gauges, pies and donuts, two value axes, a truncated bar axis, colour as size, fewer than three points.
- A bar chart starts at zero. The title states the message; the subtitle gives what is counted, the unit and the period (`ChartCard`).
- **Colour is not the code:** series are told apart by direct labels, then pattern, dash and marker, never by shade alone. Name the series on the chart before a legend. Marks meet 3:1 against the background (the default grey steps, 100, 66 and 44 % of the foreground, keep 3:1 on the page and the card; a fourth series takes a `series-*` colour, six that differ in lightness as well as hue and hold for every kind of colour vision). Never rely on the lightest default step or a `chart-*` step alone. Neighbouring parts are separated by a thin gap.
- Numbers are formatted `nb-NO` (`formatChartValue`), tabular, never the runtime's default. `destructive` marks only the one value that stops something, with a symbol and a word.
- A chart has one height (`--chart-height`) and one colour (`--chart-accent`), never the page's; with no data its card says so (`ChartCard empty="avspillinger"`); and is a `StreamedSection` when its source is slow. Limits per chart and the table behind it are in **designsystem-accessibility** (Charts).

## Cards

A card (drawn by `ChartCard` and the components that are one; `Card` itself is internal from 10.0.0) is only for **one self-contained item** that is comparable with its siblings or clickable as a whole,
or a frame around a chart. It needs real content of its own and at least two of its kind. Everything else is a `PageSection`
with a list, a table, a `dl` or `Text`. The one other card is a section that is an excerpt of a subpage:
`PageSection` with `continues` (`{ href, label, icon?, count? }`) draws the section as a card with the link to the subpage at its
foot, under a line, the whole width. Never a one-item `SubPages` under the list for it, never a `more` as well, never the whole card as one
link (the rows keep theirs). Cards are not nested (rule 8).

## Icons (rule 10)

Use an icon wherever it makes something **quicker to find or to understand**: a section title (`icon`), the kind of a row
(`List`), a status (`StatusLine`), an action (`<Icon slot="start" />` in a `Button`), a page to go to (`NavBar`,
`SubPages`). Ask for a **meaning** (`<Icon name="failure" />`), never a glyph, never `lucide-react` in a page. Not for
decoration, and not the same icon on every row (use it to tell kinds and states apart). See Storybook **Icons / Guide**.

- An icon takes the `Icon` size steps (`sm`, default, `lg`, in rem, so it grows with the text size and zoom); a `Button` sizes its own.
  Never a size of your own beside text.
- One icon never stands for two things in an app, and two icons never stand for the same thing. An icon alone (no visible word)
  is only for the handful everyone knows (close, back, play, search, more) and still has an accessible name.
- Icons are line icons of one stroke in `currentColor` (a tone only through `data-tone`): no filled-and-outlined mix, no colour of
  their own, no emoji as an icon. A direction (back, next) mirrors itself right to left.

## Density and rows

- Lists of rows use `List` (always one column, under each other; `kind` gives the picture in front); a gallery of pictures is `Tiles`.
- A row is: kind icon, a name that links, one line of where it is from, a `StatusLine`, when it moved at the end.
- **Targets by the pointer** (this section owns the sizes). WCAG 2.5.8 is the floor: 24 px or spaced so a 24 px circle fits (`ENTITY_LINK` is `min-h-6`). On touch
  the aim is Apple's 44 pt and Material's 48 dp: rows (`List`, `SubPages`) are `min-h-12`, a `NavBar` place on a phone `min-h-14`,
  and a checkbox or radio is one target with its label. On a desktop with a fine pointer the rail and `SummaryBar` are denser (36–40 px). Never shrink a target
  to fit; wrap, or move it to its own line. Prefer `size="lg"` on a `Button` on a page used by touch.
- Density changes by the room and the pointer (container queries, `pointer: coarse`), never by a "compact" toggle in an app.
- Hover adds, never hides: nothing is reachable only on hover (touch and keyboard have none), and no tooltip carries what is needed to act.
- A select is a native `<select>` (`NativeSelect`), always (rule 6).

## Motion

Durations and easings come from the `--motion-*` tokens, named by purpose (`instant` for a press, `fast`, `enter`, `exit`, `reveal`,
`data`, `live`; the easings `enter`, `exit`, `standard`, `spring`). Entrances **move and never fade text**; exits are shorter, on the exit
curve. Everything is off under `prefers-reduced-motion`. Motion is for orienting the reader (a new row, a change of page), never decoration.
The guide is **Foundations / Motion**.

- **Productive everywhere, expressive rarely.** Everyday motion is the same in every app. The app's brand accent (`--motion-brand-*`, set by
  its hue) is only for signature moments, through components: `AppMark reveal`/`loading`, `FirstRun glyph`, `FirstRunFinish`, `EmptyState
  reason="first-run"`. Never replay a reveal, re-run a chart reveal on a refetch, spring text or a large surface, or add Lottie or Rive
  (**designsystem-brand**).

- **Spatial and effect motion are different** (Material 3's motion scheme): what moves or changes size (`translate`, `scale`, a
  sheet) may take the spring; what changes colour or opacity never overshoots (`standard`, `enter`, `exit`), or it flickers.
- **Frequent things barely move.** Apple: avoid motion on interactions people repeat. A press is `instant`, a toggle `fast`; save
  `reveal`, `celebrate` and the brand accent for the first time or the end of a task.
- **Never make people wait for motion.** Input during an animation is taken at once (a transition is interrupted from where it is,
  never queued); nothing that matters waits for an entrance to finish.
- **Every control keeps one state model**: hover (a tint, pointer only), pressed (at once, `motion-press`), focus (a solid outline in
  `--ring`, never animated), selected, busy (`aria-busy`, label kept, dimmed with `motion-pending`), done or failed (a sentence in a status
  region). No ripple; a state never changes the layout.
- **Answer within 0.1 s; over 1 s say it is on its way** (a skeleton, `main[aria-busy]`); over 10 s say how long.
- **No loop longer than five seconds** (WCAG 2.2.2): a pulse beats twice and stops.
- **Only compositor properties move** (`transform`, `translate`, `scale`, `opacity`, registered numbers); never `transition-all` in our code.
- Opening and closing is CSS (`@starting-style`, `allow-discrete`, `::details-content`); a change of page is the view transition, never
  a `Reveal` on top of it. View transitions are progressive (cross-document: Chrome 126, Safari 18.2, not yet Firefox): the page
  must work and look finished with none; never name more than the few elements that carry over (the cover, the title).
- **No scroll-driven entrances, parallax or scroll-jacking.** Scrolling stays the reader's: content is there when it arrives, not
  faded in by `animation-timeline`, and scroll speed and snap are never changed for effect.
- **A skeleton is the final layout, grey and still**: a slow part is a `StreamedSection`, whose `SectionSkeleton` stands at the real
  height with the section's title and icon in place, and pulses only after a second, twice, so a quick load never flickers. No
  shimmer, no spinner for a section; a spinner-like busy state is only for the one control that is working.
- **Focus is never hidden**: a solid `--ring` outline at full strength (3:1; a brand's ring keeps it), never removed or dimmed for
  a mouse (`:focus-visible` decides), never animated. It is never covered by the bottom `NavBar` or the docked player (WCAG 2.4.11): check by tabbing to the
  last rows of a long page on a phone.

## Installed and server-rendered

- Insets come from the tokens (`--safe-top` … `--safe-left`) through `PageLayout` and `NavBar`; a page never reads `env(safe-area-inset-*)` itself, and never sets overscroll, `touch-action` or the tap highlight (the shell does).
- Manifest colours, icons and `theme-color` come from `webManifest()` and `npx designsystem-app-icons` (**designsystem-pwa**); a manifest takes no variables.
- Reserve the place of what arrives late (a skeleton at its final height, an image with width and height, a control that appears after hydration); animate with `transform`.
- No `window`, `Date.now()` or `Math.random()` in render (a test fails); a value only the browser has is read in an effect.

## Light pages (guide «Performance and sustainability»)

- A `Picture` gets `sources` (the widths its API offers) so the browser takes the smallest sharp one; only the picture that leads the page
  is `priority`, every other is lazy.
- No third-party script, font or CDN; no autoplay; one font superfamily (Atkinson Hyperlegible Next and Mono), `latin` only, mono only for short labels and code; motion from the tokens.
- An app runs `npx designsystem-budget dist` in CI: under 500 KB a page (150 script, 50 CSS, 100 fonts), with grams of CO2e per view.

## Before you write markup

1. Is there a component? Check **designsystem-components**.
2. Is it one of: layout, text, a list, a status, a section, navigation? Use that. Is it read, or looked at? Read: stack it.
3. Still nothing? Add a component to the design system (see **designsystem-components**), do not style in the project.

Before finishing, run **designsystem-review**.

## Sources

- Apple HIG: Materials (Liquid Glass), Dark Mode, Color, Typography, Motion, Accessibility — https://developer.apple.com/design/human-interface-guidelines/
- Material 3 Expressive research — https://design.google/library/expressive-material-design-google-research
- Compose motion scheme (spatial vs effects) — https://developer.android.com/develop/ui/compose/designsystems/material3#motion
- WCAG 2.2 (2.4.11 Focus Not Obscured, 2.5.8 Target Size) — https://www.w3.org/TR/WCAG22/ ; WCAG 3 draft — https://www.w3.org/TR/wcag-3.0/
- WebKit, Better typography with text-wrap pretty — https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty/
- Fluid type and zoom (the 2.5 × rule) — https://www.smashingmagazine.com/2023/11/addressing-accessibility-concerns-fluid-type/
- Browser support from MDN browser-compat-data — https://github.com/mdn/browser-compat-data
