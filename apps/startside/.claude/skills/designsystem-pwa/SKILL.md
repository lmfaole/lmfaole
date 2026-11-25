---
name: designsystem-pwa
description: Use when building, changing or reviewing what makes an app made with the design system installable and app-like - the manifest, icons and the install offer, the service worker, offline page and stale data, updates, downloads and storage, push, badges, sharing, media controls, page transitions, safe areas, platform differences (iOS, Android, desktop) and the performance budget.
---

# Installed apps (PWA) with the design system

The full guides are «Engineering / Installed apps (PWA)», «Fresh data and offline», «Server rendering» and «Performance and
sustainability». Our apps are server-rendered multi-page apps on Cloudflare Workers, installed on a home screen or desktop and opened
without browser chrome: no address bar, no reload, no tabs, on iOS no back button.

## Principles

1. **An app because it behaves like one, not because it looks like one.** Instant pages, a way up on every page, nothing lost offline,
   no surprise reloads. Never imitate native chrome (a fake status bar, an iOS tab bar, a splash screen drawn in HTML).
2. **The browser owns installing, permissions and the window.** Offer once, never nag, never ask for a permission on load.
3. **Honest offline.** What is shown says how old it is; nothing is kept that could mislead or show one person's data to another.
4. **Progressive.** Every capability is feature-detected; where it is missing (Safari, Firefox) nothing breaks and nothing is promised.

## The app feel (the shell and the components do it)

- `display: "standalone"` and `viewport-fit=cover`. The insets (`--safe-top` … `--safe-left`) are applied by `PageLayout`, `NavBar` and
  `NowPlaying`; a page never reads `env(safe-area-inset-*)` and never sets `overscroll-behavior` (the shell sets `none`, so a pull neither
  drags nor reloads the app).
- A change of page is the shell's cross-document view transition (Chrome 126+, Safari 18.2+, off under reduced motion). For the named
  ones (the `NavBar` place, `<main>`, a docked player that plays on) put `transitionAttributes()` on `<html>`; never animate a page change
  in a script and never add a `view-transition-name` of your own.
- Instant navigation is real navigation: small server-rendered pages, a service worker with navigation preload (so its start-up does not
  delay the page), and the back/forward cache kept usable (no `unload` handler, no `Cache-Control: no-store` on ordinary pages).
  Speculation rules (`prerender`, `eagerness: "moderate"`, same origin, never an address that changes something) are allowed: Chromium
  uses them, others ignore them.
- Every page below the top has `Breadcrumbs`; links stay in the window, and a link out is `TextLink external` / `LinkButton external`,
  last. `(display-mode: standalone)` may change behaviour in a script, never the content: installed and browser readers see one page.
- `theme-color`: one `<meta name="theme-color">` per scheme (`media="(prefers-color-scheme: …)"`), opaque hex, in the colours
  **designsystem-brand** names; the status bar follows it. Never draw content under the status bar with Apple's meta tags.
- The page `<title>` is the window's title on desktop and in the app switcher: «Side – App» (the format in **designsystem-content**).

## The manifest

Build it with `webManifest()` (it throws on a wrong `id`, scope, colour or icon set) and spread it for the optional fields:
`{ ...webManifest(input), screenshots, shortcuts }`.

- **Identity:** `id` set once and never changed; `scope` ends with a slash and `start_url` is inside it (paths checked with `inScope()`).
  `name` is said as everywhere else; `short_name` ≤ 12 characters; `description` one plain sentence of what it does; `lang: "nb"`.
- **Icons** from `npx designsystem-app-icons`: `any` at 192 and 512, a separate `maskable` at 192 and 512 (`webManifest()` requires both; never `"any maskable"`), the
  apple-touch-icon. Add a `monochrome` icon only when the app sends notifications or sets a badge (Android draws it in the status bar).
- **`screenshots`** turn Chrome's install dialog into an app-store sheet: two to five real screens with sample data, `form_factor:
  "narrow"` (phone) and `"wide"` (desktop), each with a Norwegian `label`. Never a marketing picture; renew them when the UI changes.
- **`shortcuts`** (a long press on the icon): up to four places the reader goes straight to, named as in the `NavBar` («Nedlastinger»),
  addresses in scope, a 96 px icon each. Never an action that changes something.
- **`display_override`** only with a reason: `window-controls-overlay` needs a title bar the design system draws (`env(titlebar-area-*)`,
  `app-region: drag`); none does yet, so leave it out.
- **`share_target`** only when the app truly takes in links or files (Android and Chromium only): `GET` for `title`, `text`, `url`;
  `POST` multipart for files or anything that changes data; the target page works when opened empty. `protocol_handlers` and
  `file_handlers` only for an app that really opens them; none of ours does.
- Never `prefer_related_applications` and never `orientation` (the reader turns the phone).
- A changed manifest reaches Android installs when the app is next opened; on iOS only when it is added again, so get the name and icon
  right the first time.

## Installing

- **No install button of the app's own** (in a header, menu, banner or modal). The offers are `InstallPrompt`, once, in the front page's
  flow (only after the browser says it can install, or the steps by hand in Safari on iOS; never in the installed app or after «Ikke nå»),
  and `InstallSettings` on «Innstillinger › App». The browser's own install entry does the rest.
- iOS has no install event: «Del» → «Legg til på Hjem-skjerm» is the only way. Never sniff the browser to show an overlay about it;
  `InstallPrompt` already does the one hint.

## The service worker and offline

| What | Strategy |
| --- | --- |
| A page (navigation) | Network first with navigation preload; without network the last good copy of that address (path and query), then the offline page |
| A file with a hash in its name, the icons | Cache first |
| Data that may be a little old | Stale while revalidate, with `Freshness` on the page |
| Data an old copy would make wrong (departures, live state) | Network only |

- Keep only `ok`, same-origin, non-redirected `GET` responses; never a login page, a `POST` or a response that sets a cookie. Name the
  caches by app and version, delete the others on `activate`, and bound the page cache (about 40 pages).
- A page drawn for a person (cookies, settings) is kept for that person only: clear the kept pages when what they show changes (a
  subscription, a setting, another username). A shared or edge cache never keeps a personal page.
- **The offline page** is an app page of components (`PageLayout`, `PageHeader`, `Text`, `TextLink`), kept at install: it says what
  needs a network and links to what works without one (downloads). Never a dead end.
- A kept copy is not an error: `ConnectionBanner` says the reader is offline and `Freshness` when the page was made. Showing another
  page's copy (the front page for an address never visited) is a last resort, and it must not pretend to be the asked-for page.
- A change made offline is never pretended done. Keep the form filled and say it was not saved (`ErrorMessage`); queue it with
  Background Sync only where it exists (Chromium) and say «Lagres når du er på nett igjen».

## Downloads and storage

- A download the reader chose (an episode) lives in its own cache, survives updates and is removed only by the reader. Show its
  `Progress`, and on the downloads page the space used and left (`navigator.storage.estimate()`), in words.
- After the first download call `navigator.storage.persist()` once (Chrome and Safari decide silently, Firefox asks); if refused, say
  that the device may delete downloads when space runs short. Always catch a QuotaExceededError and say what to delete.
- Media from a service worker answers range requests (206); iOS will not play audio the worker fetched from another origin, so answer
  only what is already downloaded.

## Updates

- A new service worker **waits** until every window of the app is closed. No `skipWaiting()` without telling the reader: the design system
  has no «Ny versjon» notice yet, so until it does, let it wait.
- Never reload under the reader, never lose a typed form, a scroll position or a playing episode for an update, and never hold the first
  render for an update check. Changing the worker's bytes triggers an update; renaming the file leaves the old worker in place.

## Notifications, badges and permissions

- Push only for what the reader asked to be told (a new episode of a show they follow); never marketing or «Vi savner deg». Ask from a
  tap where it belongs, with `PermissionCard` (`usePermissionState`) first, so a «no» leaves the browser's prompt unused. Each kind can
  be turned off in the app's settings.
- iOS and iPadOS: push and badges only for an app on the Home Screen, 16.4 and later, after permission from a tap. In Safari, say it
  needs the installed app instead of offering it.
- A badge (`navigator.setAppBadge(n)`) counts something unread the reader can clear in the app; `clearAppBadge()` once seen. Never a badge
  to lure them back.
- A notification's words follow **designsystem-content** (what happened, to what); a tap opens that thing's page.

## Sharing and media

- Share with `navigator.share({ title, url })` from a tap, where it exists; elsewhere copy the link and say «Lenken er kopiert». Share the
  canonical address, never one with tracking. A cancel (AbortError) is not an error.
- Audio goes through `PodcastPlayer`: it sets the Media Session (title, show, artwork, position, play, pause, seek, skip), so the lock
  screen, headphones and car work. Never an `<audio>` element of the app's own.

## Platform differences

- **iOS and iPadOS:** no install event, no Background Sync, no share target, no vibration. A home-screen app has storage of its own, apart
  from Safari's (a cookie set in Safari is not there: a first run happens again). Safari may delete a site's data after weeks unused; the
  installed app is spared that.
- **Android and Chromium:** richer install sheet, shortcuts, share target, badges, Background Sync. The system back gesture goes back in
  history, so a dialog closes on back, and in-page states never pile up in history.
- **Desktop:** a resizable window with its own title bar; wide layouts and the keyboard matter (**designsystem-ui**).

## Performance budget

- Core Web Vitals at the 75th percentile: **LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1**. `npx designsystem-budget dist` in CI (under 500 KB a
  page). One `priority` `Picture`; what streams in has a skeleton at its final height (`StreamedSection`, `SectionSkeleton`).
- The service worker never slows the first visit: keep at install only the offline page and what the shell needs.

## Don't

- An install button, banner or modal of your own; a «Hent appen» wall; a permission asked for on load.
- A fake splash screen, a shell that is empty until script runs, or a page that is blank without JavaScript.
- `skipWaiting()` without a notice, a reload under the reader, a cache that is never cleaned, a kept login page.
- Keeping one person's page for another, a `POST`, or live data an old copy would make wrong.
- `user-scalable=no`, a pull-to-refresh of your own, a link out of the app that does not say so.

The words follow **designsystem-content**, the states **designsystem-ux**, motion and insets **designsystem-ui**, icons and colours
**designsystem-brand**; a change here is checked with **designsystem-review**.

## Sources

[web.dev, install criteria](https://web.dev/articles/install-criteria),
[web.dev, promote install](https://web.dev/articles/promote-install),
[Chrome, richer install UI](https://developer.chrome.com/blog/richer-pwa-installation),
[web.dev, updates](https://web.dev/learn/pwa/update),
[WebKit, web push on iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/),
[WebKit, storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/),
[MDN, Badging API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API),
[Chrome, cross-document view transitions](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document).
