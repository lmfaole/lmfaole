---
name: designsystem-review
description: Use after building or changing a page or component with the design system, and when asked to review one - runs a checklist across structure, hierarchy, look, brand, haptics, accessibility, content, components and the installed app (PWA), and reports concrete findings. Run it before saying the work is done.
---

# Review against the design system

Go through the page or component and report **findings with where and what to change**. Do not say «looks good»; say what you
checked. Fix what is a clear violation, report what is a judgement call. Each group points to the skill that owns its rules: when a
line is unclear, read that skill, not this list.

## 1. Look at it

Render it (Storybook, or the running app) at **400, 768, 1024, 1440 and 2560 px** (the five width classes), in **light and dark**.
Take a screenshot of each. Open a list and a detail page, not only the front page. Then at 320 px, 200 % zoom and the phone's largest
text; with reduced motion; and, for an app, installed (no address bar, no back button on iOS).

## 2. Checklist

**Structure (designsystem-ux)**
- [ ] At most three levels; the front page is a digest: `SummaryBar` first, 3–5 items per section picked by need, «Se alle 14», one or two phone screens, no load-more.
- [ ] Front-page order: what stops something → what the reader was in the middle of («Fortsett») → new in what they follow → recommendations → the rest.
- [ ] A thing with more to say has a detail page with an address (never only a dialog); a row links to the app's own page; the link out is last and names the place.
- [ ] What the reader chose (search, filter, period) is in the address (`?q=`); back, reload and a shared link give the same view.
- [ ] Every way to another page is a real `<a href>`; links stay in the window.
- [ ] `NavBar` (as `nav` on `PageLayout`): 3–5 places, one-word labels, same order everywhere, «Innstillinger» last, current place marked, never hidden or disabled; its `count` only for what is new and waits.
- [ ] No tabs for navigation; `Breadcrumbs` on every page with a parent (the title not repeated); `SubPages` (one column) on a settings overview; an excerpt of a subpage is `PageSection continues`, named for where it goes.
- [ ] Back returns to the same row and state: no `unload` handler, no scroll-to-top on render, every late part at its final height.
- [ ] Search: one per page, label says the scope, `?q=`, a count («5 treff»); no results is `EmptyState reason="no-results"` with «Tøm søket» and a way on.
- [ ] Loading, empty, error and not-found are designed; one failing source does not take the page down; no toast.
- [ ] Routine actions act at once and can be undone where they stand; only what cannot be undone is confirmed, naming the thing; no optimistic UI (`PendingButton`, then «Lagret»).
- [ ] A long list is one list with headings (day, season, letter), split by a natural group with an address; no pagination or infinite scroll.
- [ ] First run asks only what the app cannot work without; a permission is asked from a tap where it is used (`PermissionCard`); every recommendation says why (`reason`).
- [ ] A notification is time-bound, asked for, and opens the thing's page.

**Reading and hierarchy (designsystem-hierarchy)**
- [ ] Everything read is in **one column, under each other**; no `Grid` for text, lists or sections; sections straight in `PageLayout`.
- [ ] No line is longer at 2560 than at 1440 (45–75 characters); extra width went to a pane, more across, or margin, in that order.
- [ ] A detail page's pane is beside the main content from 1024 px; nothing in it is the only place something is said; nothing is hidden at a width.
- [ ] The order top to bottom is the priority, the same at every width; one thing first, at most two stand out; the chrome is quieter than the content.
- [ ] Three levels of type and two text colours, visibly different; section titles say what is in them (never «Mer», «Diverse»).
- [ ] Space groups: tight inside an item, default inside a section, `PageLayout`'s between sections; no boxes or lines to group.
- [ ] One left edge; rows start with what tells them apart; the first two words of titles, rows and links carry the meaning.
- [ ] Several things of one kind are several values of one `FactList` term, stacked, never `a, b, c`.

**Look (designsystem-ui)**
- [ ] No `className`, `style`, raw colour, `px` or stylesheet in the project; only components and tokens.
- [ ] One `<h1>`; headings in order; type only through `Text`/`Heading`; no light weights, no viewport-unit sizes, no italic.
- [ ] No `truncate`, `line-clamp` or `title=` on a title passed to a component; prose in `Stack width="prose"`.
- [ ] Contrast meets WCAG 2 (4.5:1 text, 3:1 marks and edges), also on `card`; APCA is only a second look, never a pass for a WCAG 2 failure.
- [ ] Dark is near-black with lighter raised surfaces; blur and translucency only on floating chrome, never on content.
- [ ] Pictures are `Picture`, art whole and unaltered, no text on a picture; a missing one is the kind's icon in the same frame.
- [ ] Cards only where a card is right (`ChartCard`, `PageSection continues`), never nested.
- [ ] Icons by meaning, one stroke, `currentColor`, `Icon` sizes; one icon per meaning; an icon alone only for close, back, play, search, more.
- [ ] Targets: 24 px floor; on touch rows `min-h-12`, the `NavBar` `min-h-14`; nothing only on hover.
- [ ] Motion from the `--motion-*` tokens: entrances move, never fade text; no loop over five seconds; no scroll-driven entrances; a skeleton is still and at its final height, no spinner for a section.

**Brand (designsystem-brand)**
- [ ] `data-brand` once, on `<html>`, a hue from `BRAND_HUES`; `NavBar` has `glyph` and `family`, `FirstRun` its `glyph`.
- [ ] The hue only where components put it (mark, current place, ring, primary button); never in content, charts, states or around a picture.
- [ ] Icons only from `npx designsystem-app-icons`: no text, no effects, glyph inside the safe zone, readable at 16 px and tinted.
- [ ] No splash, intro or logo in front of content; the brand is met in `FirstRun`, once.
- [ ] Brand motion only in the signature moments (`FirstRun glyph`, `FirstRunFinish`, `EmptyState reason="first-run"`, `AppMark loading`), never replayed.
- [ ] The app's name is the same in `<title>`, manifest, `Wordmark` and first run.

**Haptics (designsystem-haptics)**
- [ ] Every buzz answers a gesture, lands with its visible outcome, and has its sign on screen; none on hover, scroll, load, timer or live update.
- [ ] Kinds for their meaning only; frequent actions none or `selection`; no milliseconds, no `navigator.vibrate` of the app's own.
- [ ] `Haptics` once in the layout; «Vibrasjon» in `AppearanceSettings`; the page is complete with no haptics (iPhone, desktop).

**Accessibility (designsystem-accessibility)**
- [ ] Storybook accessibility panel: no violations, light and dark.
- [ ] Keyboard: reachable, sensible order, visible focus never under the `NavBar` or player, no trap, Esc closes.
- [ ] Every state is a symbol and words, not colour alone (check greyscale, forced colours, more contrast).
- [ ] An icon alone has a label; an icon-only button has an `aria-label`; a visible label starts the accessible name.
- [ ] The `<title>` is unique and starts with the page's name; a passage in another language has `lang`.
- [ ] 320 px / 200 % zoom / largest phone text: nothing cut off or sideways; orientation not locked; no `user-scalable=no`.
- [ ] Live regions exist before they change; one status for a skeleton group; a renewal by itself is not announced.
- [ ] Dragging has a tap alternative (`ReorderList` buttons, «Lukk» on a sheet); audio never starts by itself; a transcript is offered.
- [ ] Forms: visible labels, validate on submit, `FormErrorSummary` with focus, «Feil: » in the title, no `disabled` without words why.

**Content (designsystem-content)**
- [ ] Norwegian bokmål, «du», active voice, no «!», no «Vennligst», «Beklager» or «Noe gikk galt».
- [ ] Short noun titles; controls are verbs that say what happens; links name where they go; one word per action («Slett», «Endre»).
- [ ] `<title>` is «Side – App»; the front page is the app's name alone.
- [ ] Empty and error words are the components' (`EmptyState what`, `ErrorMessage what`); «Lagret» for done, «Lagrer …» while sending.
- [ ] Dates, times and numbers via `Intl` (nb-NO, Europe/Oslo); `−` for minus; non-breaking space before units and `%`; en dash ranges; plural via `Intl.PluralRules`.
- [ ] One word per meaning for statuses; never pointing by colour or place («den grønne knappen»).
- [ ] Alt text says what the picture is for (artwork beside its title is `alt=""`); text made by a machine says «laget av KI».

**Components (designsystem-components)**
- [ ] Each use is the component the use-case table names; no markup that copies one; no `lucide-react` in a page.
- [ ] Words a component owns are not rewritten by the page; the page passes nouns and data.
- [ ] In the design system: a story per state with a `play` test, a `use-cases.ts` row, a README note, the right semver.

**Charts**
- [ ] The right chart for the question; no pie, donut, 3D or two axes; a title with the message, a subtitle with unit and period.
- [ ] Bars from zero; series named on the chart; numbers in `nb-NO`; height reserved; an empty sentence that says why.
- [ ] A summary and a `ChartTable`; the chart is not a tab stop; nothing by colour alone.

**Installed app (designsystem-pwa)**
- [ ] Manifest from `webManifest()`: stable `id`, scope with a closing slash, `start_url` in scope, `short_name` ≤ 12, `lang: "nb"`.
- [ ] Icons `any` and a separate `maskable` at 192 and 512 (never `"any maskable"`); `monochrome` only with push or a badge.
- [ ] `theme-color` per colour scheme; no `orientation`, no `prefer_related_applications`.
- [ ] No install button, banner or modal of the app's own: only `InstallPrompt` (once, on the front page) and `InstallSettings`.
- [ ] Service worker: pages network first with a kept copy, hashed files cache first, live data network only; no `POST`, login page or other person's page kept.
- [ ] An offline page of components that links to what works; a kept copy shows `ConnectionBanner` and `Freshness`, not an error.
- [ ] A change made offline is never shown as done; downloads survive updates; a full disk says what to delete.
- [ ] Updates wait; no `skipWaiting()` without notice, no reload under the reader.
- [ ] Push and badges only for what the reader asked for, from a tap; sharing via `navigator.share`, a cancel is not an error.
- [ ] Insets and overscroll come from the shell (`PageLayout`, `NavBar`); page changes by `transitionAttributes()`, no names of the app's own.

**Live and server-rendered (designsystem-ux)**
- [ ] Each source that can fail has its own error that names it and says whether old data is kept.
- [ ] The page says when it was made (`Freshness`); a stale renewal becomes a warning in words; at most one banner.
- [ ] A part on its way is a `StreamedSection` at its final height (never `null`); nothing jumps when it arrives.
- [ ] No clock, random number or `window` in render; a component with a hook starts with `"use client"`.
- [ ] Auto-updating content can be paused, or says why it is essential; it refreshes no faster than the data changes.

**Performance (designsystem-pwa)**
- [ ] `npx designsystem-budget dist` passes; the page's rating and grams per view are in the review.
- [ ] LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 where measured; one `priority` picture; pictures from an API have `sources`.
- [ ] No third-party script, font or CDN, no autoplay; nothing hydrates that does not react.

**Code**
- [ ] `npm run verify` and, in the design system, `npm run test:stories` and `npm run build-storybook` pass.
- [ ] An app follows the design system in the same repository (a workspace) and gets its skills with `npm run skills`, never by editing the skills it copied.

## 3. Report

For each finding: **severity** (violates a rule / should fix / judgement), **where**, **what is wrong**, **what to do**, and the
skill that owns the rule. End with what you checked and what you could not (for example, a screen reader, a real phone, the
installed app on iOS).
