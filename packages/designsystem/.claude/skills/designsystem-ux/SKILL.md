---
name: designsystem-ux
description: Use when deciding how a page or a set of pages is structured with the design system - what goes on a front page, what gets a list page or a detail page, how pages link to each other, what navigation to use, how loading, empty and error states look, and when a link may leave the app. Use before building or changing any page, not after.
---

# UX with the design system

The rules are in the README («Pages and navigation», rule 11) and in Storybook (**Patterns / Pages and navigation**). This is the
working version: decide the structure first, then build it from the components named here.

## 1. Decide the levels first

A place has at most **three levels**: front page → list → detail (in an app with subpages: front page → page → subpage or detail). A fourth means the structure is wrong.

| Level | It is | It answers | Built from |
| --- | --- | --- | --- |
| Front page | A **digest** | Do I have to do something now? | `SummaryBar`, `PageSection` with `more`, `List` |
| List | **Everything** of one kind, in groups | What is there? | `PageSection`, `List`, `NavBar`; a group of its own is a subpage (`SubPages`) |
| Detail | **One thing**, enough to decide | What is this, what do I do? | `Breadcrumbs`, `PageHeader`, `StatusLine`, `FactList`, `LinkButton`; on a desktop the picture and facts in the rail (DetailLayout, from 10.0.0), the link out still last in the main column |

A thing needs a **detail page** when it has more to say than a row can (a description, a history, checks) *and* the reader needs
that to decide. A thing that is one line (an hour of the forecast) has none. A detail page has an **address of its own**
(`/pull-requests/owner/repo/12`); it is never only a dialog.

**What the reader chose is in the address.** A search, a filter, a period, a season: `?q=`, `?periode=uke`, never only in script state. Then
back, reload, a shared link and a notification all land on the same view. A path is readable and stable (a slug or an id the source
keeps), and the `<title>` names the thing first, then the app («Hades II – Medier»; the format is **designsystem-content**'s).

## 2. The front page is a digest

1. `SummaryBar` first: counts, each a link to the group it counts. Leave out zeros.
2. Then each source gets **one section of three to five items**, picked by *need* (blocked before waiting, oldest review first),
   not by time, with `more={{ href, label: "Se alle 14" }}` on the section.
3. Aim for one screen of what matters, **two at most on a phone**. Digest rows are compact: no secondary line, at most two
   statuses, the one that stops something first.
4. A section with nothing for the reader: one quiet line, or nothing. Never an empty box.
5. **Complete at rest.** What matters is visible without a click. «Se alle» is navigation to a page, never a «vis mer» that opens
   in place.
6. Things that belong together are one `PageSection`, with an icon on its title; more than one section's worth is a subpage.
7. **The sections stand under each other** in the order of what needs the reader (never side by side); the order is the priority.
8. **The order of kinds:** what stops something or needs the reader → what they were in the middle of (an episode half played, a game
   played now: «Fortsett») → what is new in what they follow → recommendations → the rest. Personal before generic (NN/g: a «for you»
   section low on a page is not found).
9. **A digest ends.** The front page never loads more as it is scrolled and is never a feed of everything in time order; that is a
   list page. When nothing needs the reader, say so once (`EmptyState reason="all-done"`) and show what they were in the middle of.

## 3. Links

1. **Internal first.** A name in a row links to the app's own page for the thing. Leaving is a choice made on the detail page.
2. A link out (`TextLink external`, `LinkButton external`) carries the external symbol, is read as external, **names the place**
   («Åpne på GitHub», never «Les mer»), and comes **last** on the page, once for each place.
3. Where there is no page of our own (a credit, «Værdata fra Yr»), a `TextLink external` in running text is right.
4. Links open in the same window (an installed app has no tabs).
5. Plain `<a>` in the components do not add an app's base path: write the full path (`/start/issues`).
6. **Every way to another page is a real link** (`<a href>`, through the components): it can be opened, copied and shared, and works
   before the script. Never a `button` or a click handler that navigates.

## 4. Navigation

- **`NavBar`** between the top-level places, as `nav` on `PageLayout`: a bar at the foot of the screen on a phone, a rail at the left from
  tablet width. Three to five places is best (more scroll sideways on a phone), one-word labels, the same order on every page, the current one marked (on a detail page: the
  list it belongs to). «Innstillinger» (the `settings` icon) is the last place in every app.
- **Settings are an overview and subpages** when there are more than a few kinds: «Innstillinger» is a `SubPages` list with each kind's
  current `value` («Mørkt · effekter av»); each subpage has `Breadcrumbs`, its own small form with «Lagre» (a `PendingButton`, «Lagrer …» while it is sent), and after the save a
  `Banner tone="success"` («Lagret», `role="status"`) under the title.
- **Navigation is not tabs.** Tabs switch views of the same content on one page; navigation goes to another page. Never build navigation
  as a row of tabs under the title, and never hide content in tabs: the design system has no tabs component.
- **Breadcrumbs on every page that has a parent** (`Breadcrumbs`; a subpage, a detail, a page of an app in a group): the whole trail from tablet width, the parent alone as a way back on a
  phone. The breadcrumbs say *where*, the title says *what*: never repeat the title in a second heading. The first crumb is the group
  (`Hjem`, `Medier`) and links to the page that lists its apps: that is how the reader moves between apps.
- **A page that is nothing but its subpages shows them with `SubPages`** under the title: a list in ONE column (icon, name, one line of what is on it), never
  cards, buttons or a second menu.
- **A section that is an excerpt of a subpage is a card**: `PageSection` with `continues={{ href, label, icon?, count? }}`. The title, the first
  few rows (with their own links), and at the foot one full-width link to the subpage that names where it goes («Se hele historikken»,
  «Se månedens Wrapped», never «Se alle» or «Mer» alone). Each way on stands at the foot of what it continues, never gathered at the top;
  no `more` as well, and no one-item `SubPages` under the list. Top-level pages are in the `NavBar` (five or so); everything else is a subpage or a detail.
- A count in `SummaryBar` is a link to what it counts.
- **Never hide or disable a place in the `NavBar`** because it is empty or a source is down: the place opens and says why
  (`EmptyState`, `ErrorMessage`). A moving bar is a bar no one learns (Apple HIG, tab bars). A `NavBar` `count` is only for what is new
  *and* waits for the reader, never a total.
- **Adapt by the room, not the device:** the bar at the foot in a compact window, the rail from medium up, by the window's width (Material 3
  window size classes; a phone on its side is compact in height, so no pane there). The places and their order never change with the width.

## 5. Back, scroll and state

Back is the most used button there is (web.dev: one in five navigations on a phone is back or forward). It must return the reader **to
the view they left, in the state they left it** (GOV.UK, question pages; Apple HIG, launching).

1. **Keep the page bfcache-able:** no `unload` handler, and nothing left open when the page is hidden (a socket, a lock). Then back is
   instant, with the scroll and the open fold as they were. Renew the data on `pageshow` with `persisted` (section 9), never by reloading.
2. **Leave `history.scrollRestoration` at `auto`;** never scroll to the top on render, and give every late part its final height
   (`StreamedSection`, `Skeleton`) so the restored position lands on the same row.
3. **List → detail → back lands on the same row,** with the same search and filter (they are in the address, section 1). Never a list
   that loads more as it scrolls: its position is lost on back (NN/g, infinite scrolling).
4. **The `NavBar` keeps each place's own state:** going to another place and back opens the page, not a reset of the app.
5. **After a once-only action** (a form that was sent), back shows the result, never the form again to send twice.
6. **An installed app opens on its front page** and every deeper page is reached by its address (a notification, a shared link). Install,
   offline and the service worker: **designsystem-pwa**.

## 6. Search and filter

- **Search where search is needed:** a `SearchField` above the list it searches, or a place of its own in the `NavBar` when searching is
  what the app is for (Podkast's «Søk»). One search on a page, never two boxes.
- **Say the scope:** the label names what is searched («Søk i episoder»); users assume a search covers everything and miss a scope (NN/g,
  scoped search). A search of one list is a filter of it; the app-wide search is the place.
- **A search has an address** (`?q=`, `SearchField` is a GET form), keeps the query in the field, says how many («5 treff») and orders by
  match, not by date.
- **No results is a way on, not a dead end** (Baymard: tips alone do not help): `EmptyState reason="no-results"` with «Tøm søket», and
  under it what is close (the group the words point to, the whole list, what the reader follows). Never a page of nothing but advice.
- **Filters** are `FilterChips`, in the address; when filters are on, say which and how to clear them; a filter that gives nothing names
  itself in the empty state.
- Search history is the reader's: keep it on the device, never on the server, and give a way to clear it (Apple HIG, searching).

## 7. States

Every page that fetches has all four states, designed:

| State | Do |
| --- | --- |
| Loading | Show the page frame at once; a part that waits is `Skeleton`, not a blank. |
| Empty | `EmptyState`: what would be here, why it is empty if the reader can change that, and one next step if there is one. It replaces the whole empty structure (no table headers over no rows). |
| Error | `ErrorMessage` **in the part that failed**, with what went wrong. One failing source never takes the page down: each part asks for its data and shows its own error. |
| Not found | `notFound()` and `NotFoundPage`; check an address before it goes into a query. |

State is told **in form** (a symbol and words), and `destructive` is only for what stops something.

**Loading.** Show nothing for a part that arrives within a second (a flash feels slower); use `Skeleton` for what takes longer and for whole regions; announce a group of skeletons once, not each one, with a hidden label («Henter pull requests»). A skeleton has the **shape of what comes** (rows, a title line, a picture's box): a frame with an empty middle is a spinner by another name (NN/g). No spinner over a page; a wait inside a control is the control's own (`PendingButton`: «Lagrer …»).

**Errors keep the reader's work.** A form that failed keeps what was written; a failed part keeps its last good data; the way on (`Prøv igjen`, the list it belongs to) is in the failed part. A not-found page names what was looked for and links to the list it would be in.

**Messages.** Choose by scope. A message about the whole page or a section is a `Banner` at the top of its body. A message about one action or one field is inline next to it. A message the reader must answer before going on is a dialog. There is **no toast** (it disappears before it can be read and is hard to reach). A message about what stops something cannot be dismissed until it is solved. Do not show success where it is already evident.

## 8. Actions: undo before confirm

The apps mostly read; where they write (follow, save, add to a queue, a setting), keep the reader in control without asking twice.

1. **Make it reversible and do it without asking.** The reverse stands where the action was (`Følg` becomes «Følger» with «Slutt å følge»; a
   download has «Slett nedlastingen»). A confirmation on a routine action trains people to click through it (NN/g).
2. **Confirm only what cannot be undone and costs** (forgetting all data, deleting a list): a dialog that names the thing and what is lost
   («Slette «Kveldslytting» og 14 episoder?»), buttons that say what happens («Slett listen», «Behold»), no destructive default.
3. **The result shows when the server has it:** no optimistic UI (guide «Motion»); the button is busy (`PendingButton`) and the page then
   says it (`Banner tone="success"`, «Lagret») or the control's new state says it by itself.
4. A setting that is a switch takes effect at once; a group of settings has one «Lagre» (**designsystem-accessibility**, forms).

## 9. Live pages

A page that updates while open keeps what is on screen until the new content has arrived, never empties, and says when it was
last built (`Freshness`: «Oppdatert 19:27»). Pause when the window is hidden, and renew when it comes back or is restored from the back/forward cache.

- **Every source that can fail has its own error,** names the source, and says whether old data is kept. A part that fails keeps its last good data where there is some. One failing source never removes another part.
- **Stale and offline are states with a time and an action, not errors:** past the threshold `Freshness` becomes a warning in words; offline is a `ConnectionBanner`. Never disable a control because a source is down. At most one banner on a page.
- **A renewal that takes under a second shows nothing;** a part that is on its way is a `StreamedSection` with a skeleton at its final height, never `null`.
- A retry is a button in the failed part, «Prøv igjen», and only where the reader has no other way (an installed app has no reload button).
- Auto-updating content has a way to pause or stop it, or a reason why it is essential (WCAG 2.2.2).
- It refreshes as often as the data changes and no more (departures each minute, weather each half hour, a log each few hours): every refresh costs the reader's battery and data.

## 10. Long lists

- **A list page holds the whole list** in one order (the system has no pagination and no infinite scroll: both lose the reader's place;
  GOV.UK, NN/g). Never load more as the reader scrolls.
- **Give a long list landmarks:** group it under headings the reader knows (by day, season, year, letter), newest or most needed first,
  so it can be scanned heading to heading and found again.
- **When a list outgrows a page** (the page budget, or more than a reader would scroll), split it by a natural group with its own address
  (`/episoder/2024`, a season, a subpage per kind) and search across it, never by an arbitrary «side 2».

## 11. First run, personal and permissions

- **Value first.** The app shows something useful before it asks anything; `FirstRun` asks only what it cannot work without (whose data:
  `UsernameForm`), one question a step, everything else a sensible default (the theme follows the system). No account, no sign-in wall.
  Every choice can be changed later in «Innstillinger», and `IntroSettings` runs the intro again (Apple HIG, onboarding).
- **Teach in place, not in a tour:** a page's first word is an `IntroCallout`, once, dismissed for good. No coach marks, no carousel of
  screens to swipe before using the app (NN/g: tutorials do not improve performance).
- **Ask for a permission where it is used,** from the reader's tap, when the value is obvious (`PermissionCard`: what it is for, and a
  `fallback` when it is denied). Never on load, never in the first run unless the app cannot work without it.
- **Every recommendation says why** (`List` `reason`: «Fordi du følger …», «Anbefalt av …»), each reason its own section, below what the
  reader chose; never an unexplained «Anbefalt for deg» or a vague «og mer» (NN/g, recommendations).
- **Say where data comes from and what is kept:** a section names its source (`PageSection` `source`), `SourcesSettings` lists them, and
  the app stores only what it says it stores (the `prefs` and `seen` cookies). No tracking, no third-party script.

## 12. Notifications

- **A notification is for something time-bound the reader asked to hear about** (a new episode of a show they follow, a departure), and
  is as urgent as it says (Apple HIG: misrepresented urgency loses trust). Never to bring the reader back.
- **It opens the page of the thing** (a detail page with an address), not the front page.
- **Ask from a tap, after the value is clear** (on the show's page: «Varsle meg om nye episoder»), never on load; the off switch is in
  «Innstillinger». What is new while the reader is in the app is a `NavBar` `count` or a row's `isNew`, not a push.

## 13. Installed and server-rendered

- **An installed app has no browser around it:** every page below the top has a visible way up (`Breadcrumbs`), links stay in the window, and a link out is marked and last. No install button of the app's own: only `InstallPrompt` and `InstallSettings` (**designsystem-pwa**).
- **A page renders on the server and in the browser with the same first render:** no clock, random number or `window` in render; time is passed in. See the guides **Server rendering** and **Installed apps (PWA)**.

## Don't

- Don't show the whole list on the front page and again on the list page.
- Don't hide what matters behind «vis mer», tabs or accordions.
- Don't let a tap on a row leave the app when the app has a page for it.
- Don't put a modal where a page with an address would do.
- Don't mark everything urgent.
- Don't make the reader remember: show the current value next to a setting, the query in the search field, the filter that is on.
- Don't ask «Er du sikker?» for what can be undone.

Layout and order: see **designsystem-hierarchy**. Before finishing, run **designsystem-review**.

Sources: Apple HIG (tab bars, searching, onboarding, launching, notifications); Material 3 window size classes; NN/g (infinite
scrolling, skeleton screens, confirmation dialogs, scoped search, recommendations, onboarding tutorials); Baymard (no-results pages);
GOV.UK Design System (question pages, pagination); web.dev (back/forward cache, permission UX).
