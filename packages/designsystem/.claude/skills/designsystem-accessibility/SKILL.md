---
name: designsystem-accessibility
description: Use when building, changing or reviewing anything a person will use with the design system, to make it accessible - semantics and headings, landmarks, keyboard and focus, contrast and colour, target size, icons, tables, forms, media and transcripts, live updates, installed-app settings (zoom, text size, forced colours), screen readers and testing. Target is WCAG 2.2 AA.
---

# Accessibility with the design system

The target is **WCAG 2.2 AA**. The components already do most of it; the rest is how a page uses them. Do not work around a
component to fix accessibility: fix the component (see **designsystem-components**).

## The rules we answer to

- **WCAG 2.2 AA** is our bar, above what Norwegian law asks today: the ikt-forskriften (Uutilsynet) asks private sites and apps for 35
  WCAG 2.0 A and AA criteria (not 1.2.3–1.2.5) and the public sector for EN 301 549 (WCAG 2.1) plus a tilgjengelighetserklæring on
  uustatus.no; WCAG 2.2 is not in Norwegian law yet. Meeting 2.2 meets all of it. Size and form of the owner do not matter, and an app
  that needs the network counts as a web solution.
- **The European Accessibility Act** has applied in the EU since 28 June 2025 (e-commerce, banking, e-books, services that give access to
  film and TV); in Norway it is delayed. Nothing extra is needed if WCAG 2.2 AA is met.
- **WCAG 3** is a working draft that will change for years; do not build to it. Its direction (more for cognitive needs, outcomes over
  pass/fail) is already in this skill.

## What the components give you

- A **skip link** and `<main id="main-content">` (`PageLayout`).
- **Headings:** `PageHeader` is the one `<h1>`; `PageSection` is `<h2>`, each section is
  `aria-labelledby` its heading.
- **Navigation:** `NavBar`, `Breadcrumbs`, `SubPages`, `SummaryBar` are `<nav aria-label>` (the foot of a `PageSection` with `continues` is one plain link that names where it goes, at least 48 px high, not a `nav`); the current page is `aria-current="page"` (in the breadcrumbs it is the last item, not a link). A `FactList` is a `<dl>` with a `<div>` per term holding its `<dt>` and every `<dd>`, read «term: value, value».
- **Icons are hidden** from a screen reader unless given a `label`; a status always has words beside its symbol (`StatusLine`).
- **External links** carry the external symbol and a hidden «(eksternt nettsted)» (`TextLink external`, `LinkButton external`).
- **Tables** keep their roles; `SrTableHead` gives a header row that is read, never drawn; `List` is a table for a screen reader.
- **Focus** is visible (`focus-visible` ring from the `ring` token); targets are at least 24 px, 44 px or more on touch.
- **Native patterns before ARIA ones:** `Disclosure` is `<details>`, `Overlay` a `<dialog>`, `NativeSelect` and `FilterChips` (over six) a `<select>`, `SearchField` a GET form, `FilterChips` links that change the page (said in advance, WCAG 3.2.2), `ReorderList` buttons «Flytt opp»/«Flytt ned» beside the drag handle (WCAG 2.5.7) with a polite «flyttet til plass 2 av 5».
- **Sound** plays only when asked (`PodcastPlayer`, `PlayButton`): a landmark «Avspiller», native controls named in Norwegian, a scrubber that says the time in words («12 min 5 s av 1 t 2 min»), no keys of the page taken, «Spilles nå» (`NowPlaying`) a modal `<dialog>` that takes focus to play and gives it back to the bar, closed by «Lukk» and Esc (a drag down is never the only way), and the page leaves room under the docked player so nothing focused hides under it. The lock screen and a headset's buttons work through Media Session.
- **Transcripts** (`Transcript`): the line said now is marked, a tap seeks, search says the count, and it stops following when the reader scrolls.
- **Motion** is off under `prefers-reduced-motion`; entrances never fade text.

## What a page must do

1. **One `<h1>`**, headings in order, no skipped levels for looks. The `<title>` is unique and begins with the page's own name (**designsystem-content**); an installed app shows no address, so the title is what the app switcher and a screen reader name the page by (2.4.2).
2. **Every `Icon` that stands alone gets a `label`** (`iconLabel` on a `List` row). An icon beside its words stays hidden.
3. **Never colour alone.** A state is a symbol plus words; `destructive` also gets medium weight. Check by looking at the page in
   greyscale.
4. **Names of links and buttons say what they do:** «Se alle pull requests», «Åpne på GitHub». Never «Klikk her» or «Mer». An
   icon-only button has an `aria-label`, and a visible label is the start of the accessible name (2.5.3, so voice control finds it).
5. **Language:** the page is `lang="nb"`. A passage in another language (an English game description, a Swedish podcast's notes) is marked with `lang` on its element (3.1.2); names of works, people and products are not.
6. **Forms:** every control has a visible label and a stable `id`; errors say what went wrong and how to fix it, next to the field.
7. **Selects are native** (`NativeSelect`): phones and screen readers get their own picker.
8. **A page that updates itself** keeps focus and scroll, never moves what the reader is on, and does not announce every refresh.
   A change the reader must know about (an error, something new that needs them) goes in a polite live region.
9. **Dialogs** use `Overlay` (native `<dialog>`/popover): focus goes in, Escape closes, focus returns. A thing with an address is a
   page, not a dialog.
10. **Zoom and reflow:** at 320 CSS px (400 % zoom of 1280) and 200 % text nothing is cut off and nothing scrolls sideways except a table in its own box (1.4.10, 1.4.4). Never `user-scalable=no` or `maximum-scale`: in an installed app pinch is the only zoom left.
11. **Contrast:** use the tokens (they are checked in light and dark). WCAG 2 ratios are the requirement; APCA is only a second look (**designsystem-ui**). Never lower contrast with opacity on text.
12. **Focus is never hidden** under the docked `NavBar`, player bar or a banner (2.4.11). Tab through at phone width to the rows just above the bars; if one hides, the fix is scroll padding in the design system, not in the page.
13. **Help, a contact or «Om appen» sits in the same place on every page** that has it (3.2.6). Never ask for the same thing twice in one task: what the reader gave is filled in or offered (3.3.7).
14. **Logging in never needs memory or a puzzle** (3.3.8): allow paste and password managers (`autocomplete="username"`, `"current-password"`, `"one-time-code"`), no CAPTCHA; a link by e-mail or a passkey is better.

## Patterns (WAI-ARIA APG), and when not to

- **No ARIA is better than bad ARIA.** Use the element first: `<button>`, `<a href>`, `<details>`, `<dialog>`, `<select>`, `<input type="search">`. ARIA only adds a role, never the keyboard.
- **Disclosure:** `Disclosure` (`<details>`); a custom one is a `<button aria-expanded>` that controls the next content, never a link.
- **Tabs:** views with addresses are links (`FilterChips`, `SubPages`), not tabs. A real tab list (rare: panels already on the page) follows the APG: one tab stop, arrows move, Tab leaves to the panel, `aria-selected`; it activates on focus only when the panel shows at once.
- **Listbox and combobox:** a choice is `NativeSelect`; a search is `SearchField` (submit, results on a page with `?q=`). A suggest-as-you-type combobox is a new component with the full APG pattern (`aria-expanded`, `aria-activedescendant`, Esc keeps the typed text), tested with NVDA and VoiceOver, never built in a page.
- **Dialog:** `Overlay`. Its title names it, the first focus is the first thing to do (or the title for reading), and it is closed by «Lukk», Esc and the Android back gesture.
- **Live regions:** see below. `role="status"` (polite) for results and progress, `role="alert"` only for what stops the reader.

## Live and offline

- Offline pages, kept copies and the service worker are **designsystem-pwa**'s; what they say to a screen reader is here.
- A live region exists **before** it changes (`LiveRegion`; MDN: in the first markup, or some screen readers miss it). It is read as plain text: a link or button inside it is not announced as one. `polite` for a status, `assertive`/`alert` only for what stops something. A renewal that happens by itself is not announced; offline, back and a failure are, once.
- Say the result, not the process: «5 treff», «Lagret», «Kunne ikke hente episodene»; not «Laster …» for what arrives within a second (**designsystem-ux**, Loading).
- `navigator.onLine` is a hint, never a gate: it says a network exists, not that a source can be reached.
- Content that updates by itself next to other content can be paused, stopped or hidden, or its rate controlled, unless it is essential (WCAG 2.2.2).
- A retry control keeps focus and uses `aria-busy` while it runs. Push is asked for from a tap (`PermissionCard`).
- A skeleton group is **one** status with a hidden label, not one announcement per bar.
- After a client-side page change the new `<title>` is announced (the route announcer of Next.js and of Astro's client router; never turn it off) and focus starts at the top of the new page, not on the link that was pressed.

## Media: audio, video, transcripts

- **Audio never starts by itself** (1.4.2); a video in `MediaGallery` waits for play and has the browser's controls.
- **A podcast episode is prerecorded audio: offer its transcript** where the feed has one (`Transcript`, linked beside the player, 1.2.1). A transcript that a machine made is labelled as such. A video with speech gets its captions as `<track kind="captions" srclang="nb">` when the source has them.
- **Every control has a keyboard way and a name:** play and pause is one button whose name changes («Spill av», «Pause»), skips say how far («15 sekunder tilbake», «30 sekunder fram»), speed is a native choice. Chapters (`ChapterList`) are a list of buttons with the time in words.
- **Media Session metadata is the episode's title, the show and the artwork**, and the actions are the same as on the screen, so a lock screen, a watch or a car is an equivalent control.
- Speed and position are kept; a reader with a tremor should never have to scrub to find their place again.

## Installed apps and the reader's own settings

- **There is no browser around an installed app:** no back button on iOS, no address bar, no page zoom menu. Every page has a visible way up (`Breadcrumbs`), every dialog a visible «Lukk», and pinch zoom works. The manifest, the service worker and offline are in **designsystem-pwa**.
- **Text size:** sizes are in `rem` (the tokens), so a browser's text size works. Test with the phone's text at its largest (iOS Larger Text, Android font size and display size): about a third of phone users change it. Nothing clips, rows grow, nothing is hidden by a fixed height.
- **Orientation** is never locked (1.3.4); a landscape phone still reaches the player and the navigation.
- **Forced colours** (Windows high contrast) and **more contrast** are repaired in `shell.css` and `theme.css`; a new component is looked at in both (Playwright `emulateMedia({ forcedColors: 'active', contrast: 'more' })`): borders return, icons follow `currentColor`, a state is still told apart.
- **Reduced motion:** nothing moves, nothing glides; a scroll that follows (a transcript) jumps instead. **Reduced transparency:** a blurred or translucent bar becomes opaque (fix in the design system, not the page).

## Screen readers differ: test with two

- **NVDA or JAWS (Windows):** browse mode reads with arrows, so a custom key handler works only in a widget that switches to focus mode; headings (H), landmarks (D) and lists of links (Insert+F7) are how people move.
- **VoiceOver (macOS, iOS):** iOS is swipe by swipe and the rotor; `title` is never read on touch; Safari drops list semantics from a list styled without bullets outside a `nav` (add `role="list"` where the count matters).
- **TalkBack (Android):** like VoiceOver on iOS. `aria-label` on a plain `div` or `span` is forbidden in ARIA 1.2 and ignored by some readers: name only controls, landmarks, groups and images.
- Write for the ear as well: a minus is **−** (U+2212), not a hyphen (read as «minus», not «bindestrek» or nothing); a hidden name uses only the abbreviations every voice says (`kl.`, `min`, `s`, `kr`), never a code of the app's own.

## Cognitive accessibility (COGA)

- Familiar patterns and the same word for the same thing on every page; the system's components are those patterns.
- One thing to do first on a page; no timer on reading or deciding; undo (or a confirming question) before what cannot be reversed.
- Plain words, short sentences, the key point first (**designsystem-content**); numbers with their unit; a date in words near «i dag».
- Nothing to remember from one page to the next: the state is shown, not implied.

## What automation cannot find

The Storybook panel (axe) and tools like WAVE catch only part: axe found 57 % of issues by count in Deque's audits, but far fewer of the criteria. By hand: reading order, whether a name means something out of context, link text, alt text that says what the picture is for, whether focus lands somewhere sensible after a page change, a dialog or a delete, whether focus hides under a bar, whether a live region's wording makes sense when read, whether a chart has an equivalent, text at 200 %, and whether an error says how to fix it.

## How to check

1. **Storybook:** open the story, the **Accessibility** panel at the bottom must show no violations in light and dark.
2. **Keyboard:** tab through the page at desktop and phone width. Every control is reachable in a sensible order, the focus is always visible and never under a bar, nothing traps it, Esc closes what opened.
3. **Screen reader:** NVDA with Firefox or Chrome, and VoiceOver on an iPhone with the app installed. Read one list and one detail page. Do rows read as «kind, name, status, date»? Does a link out say it leaves? Is a change announced once?
4. **Zoom and text:** 320 px wide, 200 % zoom, and the phone's largest text.
5. **Greyscale, forced colours and more contrast:** is every state still told apart?
6. **Reduced motion and transparency:** turn them on; nothing should move, no bar should be see-through.

## Colour and icons

- Colour is never the only signal (WCAG 1.4.1): a symbol and a word, and a green and red pair needs another cue even at 3:1. Text is 4.5:1; marks, edges and the focus ring 3:1 (1.4.11), and under a translucent layer too; a test checks the token pairs, in light and dark.
- An icon beside its word is decorative (hidden). An icon that is the kind of a row has a `label`. An icon with no word is a control whose **name says what it does** (not what it looks like), as `aria-label` or hidden text, never `title` alone, and the accessible name contains the visible label. Label the control, not the `svg`.
- An image's `alt` says what it is **for** here (W3C alt decision tree): artwork beside its title is `alt=""`; a picture that is a link says where it goes; a picture with information says the information.
- Never the same icon on sibling items, and never one icon for two meanings.

## Charts

- **A chart is an image with a label, a `summary` (type, range, trend, extremes; `summariseSeries()` writes one) and its data as a table** (always a table anyone can open, «Vis tallene»). It is not a tab stop (Chartability O6); a tooltip is never the only route to a value (WCAG 1.4.13); a mark that is only a fill keeps its colours in forced colours (`data-chart-mark`).
- The table is `ChartTable`, drawn by the card; the title states what the chart shows with the unit and the period. A bar too small to reach with a pointer is reachable in the table (Carbon, chart anatomy).
- **Never shade alone.** Name the series on the chart (direct labels) before a legend; separate neighbouring parts with a 1–2 px gap in the background colour; marks meet 3:1 against the background and axis text 4.5:1 (Primer, data visualization). Lines are 2 px; the first is solid and later ones are dashed with another marker.
- **Limits** (Primer): line 5 series or fewer, bars 10 or fewer, stacked segments 5, the rest folded into «Annet». No pies or donuts (**designsystem-ui**, Charts).
- Loading, empty and error are designed for a chart too: a skeleton at the chart's final height (no layout shift), a sentence for empty with no axes drawn, and the error in the part that failed.

## Forms (rare, but they exist)

- A visible label above the field; the hint and the error stay visible beside it (no tooltip) and are tied with `aria-describedby`. The error says what is wrong and how to fix it, begins with a hidden «Feil:», and has the same words in the `FormErrorSummary` and beside the field. A placeholder is never the label.
- **Validate on submit**, not while typing or on leaving the field, and on the server too. After submit show the summary at the top and move focus to it, list each error as a link to its field, prefix the `<title>` with «Feil: », and keep what the reader wrote. Do not use the HTML `required` attribute (use `novalidate` and say it in words); mark only the minority: «(valgfritt)» when most fields are required. (GOV.UK, validation and error summary.)
- **Say what a field is for to the browser** with `autocomplete` (1.3.5) where it is the reader's own data (`username`, `email`, `name`); a field whose value would be wrong to fill in says `off`.
- A switch takes effect at once; a checkbox needs an explicit save. The label names the setting, not the state (Primer, toggle switch). Read-only is shown as text; avoid `disabled` (Aksel and Designsystemet: it is not focused, not read, and does not say why) and say in words what is missing instead.

## Tables

`aria-sort` on the sorted column header, and the sort control is a link or button with a target of at least 24 by 24 CSS pixels. A table that scrolls sideways in a narrow window has a focusable wrapper with a name. A page change is announced («11–20 av 100»); nothing is announced for content that arrives within a second. (Primer, data table accessibility.)

## Targets and pointer

WCAG 2.2 target size (2.5.8) is 24 × 24 CSS px; the exceptions are spacing (a 24 px circle centred on the target overlaps no other target), an equivalent control, an inline link in a sentence, a browser control and what is essential. Ours are larger on touch (44 px or more: rows 48, the `NavBar` bar 56; the sizes are in **designsystem-ui**, Density). **Everything done by dragging has a single tap or click way** (2.5.7): a scrubber also takes a tap and the skip buttons, a sheet that is dragged down has «Lukk», a reorder has «Flytt opp»/«Flytt ned». A gesture with two fingers or a path has a one-tap alternative (2.5.1), and an action happens on release, not on press (2.5.2).

## Common mistakes

- An icon with no text and no label (a button that says nothing to a screen reader).
- A status told only by red.
- A link text that repeats on every row without context (the row's own name is the link text: good).
- Opacity on text to make it «quieter» (use `Text role="quiet"`).
- A `div` with `onClick` instead of a `button` or `a`.
- A live region added at the moment it is needed (it says nothing), or one that announces every refresh.
- A focused row hidden under the docked bars at phone width.
- A disabled button with no word on why.

## Sources

[W3C, What's new in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) ·
[Uutilsynet, Kva seier forskrifta?](https://www.uutilsynet.no/regelverk/kva-seier-forskrifta/153) ·
[Uutilsynet, EAA](https://www.uutilsynet.no/tilgjengelighetsdirektivet-eaa/eus-tilgjengelegheitsdirektiv-eaa/268) ·
[WAI-ARIA APG patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) ·
[MDN, ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions) ·
[W3C, Making content usable for people with cognitive and learning disabilities](https://www.w3.org/TR/coga-usable/) ·
[Deque, automated coverage report](https://www.deque.com/automated-accessibility-coverage-report/)

Before finishing, run **designsystem-review**.
