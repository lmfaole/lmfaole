---
name: designsystem-brand
description: Use when giving an app built with the design system its brand - its hue (data-brand), its mark and name in the NavBar and first run, its icons and favicon, its motion accent in signature moments, its brand platform (purpose, personality, voice) - or when deciding whether a colour, logo or tone belongs in a page. The content leads, the brand signs.
---

# Brand with the design system

The apps are a **family** under lmfaole (Medier, Startside), in an **endorsed** architecture: each app has its own name, hue and glyph, and
the family follows its name quietly («Medier · lmfaole»). The full guide, with the research behind it, is «Foundations / Brand».

## Principles

1. **The content leads, the brand signs.** Covers, posters, the weather and the day are the colour of a page; the brand is a signature in
   the chrome.
2. **One hue per app**, from the closed set `BRAND_HUES` (`rose`, `amber`, `teal`, `blue`, `violet`), each tested for contrast in light and
   dark. Identity, never meaning: not success, a warning, a link or a series. There is no green.
3. **One mark per app, one shape for the family:** a glyph on the shared rounded tile (`AppMark`). A new hue or glyph is added to the design
   system for the family, never invented in an app.
4. **Neutral by default.** Without `data-brand` every brand token is the ink, so an app looks as it did.
5. **Voice is the family's strongest asset:** plain bokmål, «du», short sentences, no exclamation marks; the tone moves with the moment
   (**designsystem-content**).

## Setting it up

- `data-brand="<hue>"` once, on `<html>` (`brandAttributes(hue)` from `lib/brand`). Never on a section to colour it; never two hues on a page.
- `NavBar` with `title`, `glyph` and `family` («lmfaole»): the rail opens with the app's `Wordmark`, and the current place takes the hue.
- `FirstRun` with `glyph`: the first meeting is where the mark is learned (Apple: onboarding, not a launch screen).
- Icons from the same drawing: `npx designsystem-app-icons --hue <hue> --glyph <glyph>` (favicon.svg, 64 px PNG, apple-touch-icon, 192 and 512,
  maskable 192 and 512). Keep `theme-color` and the manifest's `background_color` the page's colour; the icon carries the hue. The manifest itself (`webManifest()`) and where the icons go: **designsystem-pwa**.
- The app's name is said the same in the `<title>`, the manifest's `name`, the `Wordmark` and the first run.

## The app icon and favicon

The icon is the brand's most repeated asset: it sits among the reader's other apps, often small, often tinted by the system. The
manifest, the files and `theme-color` are **designsystem-pwa**'s; what the icon looks like is decided here.

- **Only from the generator.** The glyph on the hue's tile, drawn by `npx designsystem-app-icons`; never a screenshot, a photo, a
  wordmark, a gradient or a drawing of the app's own. No text in an icon (not even the initial), no baked shadow, gloss or
  border: the system adds its own effects (iOS 26 Liquid Glass, Android adaptive masks).
- **Centred and simple, so it survives every mask.** The glyph stays inside the maskable safe zone (the inner 80 %, a circle of
  40 % radius), and reads at 16 px in a browser tab. Check the favicon in a tab in light and dark, and the maskable icon as a circle,
  a squircle and a rounded square (maskable.app).
- **Every appearance is the same icon.** iOS 18+ shows default, dark, clear and tinted versions and Android 13+ themes
  icons into one tone: the same glyph in the same place in all of them, so it is recognised when its colours are gone. The
  glyph alone, on a transparent ground, must still say which app it is; that is what a tinted or `monochrome` icon shows.
- **The tile is opaque.** Never a transparent PNG for the `any` or apple-touch icon (iOS fills it with black); `theme-color`
  and `background_color` stay the page's colours, so the hue is in the icon and not in the browser's frame.

## Launch and splash

A launch is not a brand moment (Apple: the launch screen is the first screen, empty, not an ad). An installed app opens on its
own page, painted by the server; the system's splash comes from the manifest's name, icon and `background_color`. Never a
splash drawn in HTML, a logo in front of content or an intro that delays the first page. The brand is met in `FirstRun`, once,
and is skippable.

## Where the brand goes, and never goes

- **Goes (through the components only):** the mark, the current place in the `NavBar`, the focus ring, the one primary `Button`, a ticked
  checkbox or radio, the first run's header, the icons.
- **Never:** text, headings or links in the content; charts (`series-*`, `chart-*`); states (`destructive`, `Badge`, events, `transit-*`,
  temperatures); the background of a page, card or header; over or around a cover, poster or a maker's logo (`Logo`, `BrandIcon` are theirs).
- An app never writes `bg-brand`, `text-brand` or a colour of its own (rule 1). If the brand is needed somewhere new, it is a change to a
  component here.

## The brand platform

Each app keeps a short platform in its README: **purpose** (one sentence), **position** (for whom, instead of what), **personality** (three
adjectives, each with what it is not), **voice** (how it always speaks, how the tone moves: welcome, empty, error, success), **distinctive
assets** (hue, glyph, name, a recurring moment), **signature moments** (two or three), and **do / don't**. The guide has the template and a
draft for lmfaole, Medier and Startside, marked as a proposal until the owner approves it.

## Signature moments, neutral everyday

The brand is felt where the app meets the person (the first run, an empty page, a look back at a week or a year, like Spotify Wrapped), not
on every control. Distinctive assets work by repetition: use the same hue, tile, glyph and words the same way for a long time.

- **Restraint is the modern brand in product UI** (Linear, Vercel, Things, Apple's own apps): a calm, neutral interface with one
  accent and a recognisable shape, and the craft in alignment, type and motion rather than in colour. Apple: apply the accent
  colour judiciously, do not put the logo everywhere, let branding defer to content.
- **Expressive is for emphasis, not decoration.** Material 3 Expressive's research (46 studies, 18 000 people) found that size,
  colour and shape make the key action found up to four times faster, but breaking familiar patterns (a list that is not a list,
  icons without their labels) hurt use, and a strong minority preferred calm. A signature moment may be bold; the controls,
  lists and navigation around it stay familiar.
- **A signature is earned and rare:** two or three per app, each tied to something the person did or reached, never a
  reward for a routine action, never a pop-up of its own.

## Brand motion: an accent, in signature moments only

Every app moves on the same productive tokens; the hue also sets the app's **accent** (`--motion-brand-*`), used only in a signature
moment. `amber` (Medier) is rhythmic: the play mark beats twice on the light spring. `teal` (Start) is calm and rising: the sun clears its
horizon, with no overshoot. The guide is «Foundations / Motion», section 9.

- **Use it** only through these: `FirstRun glyph` (the mark's gesture on the first step, once), `FirstRunFinish` (shown by the enhancer as
  «Ferdig» sends the form: the check, then the mark), `EmptyState reason="first-run"` (an app's first, empty start: its «+» in the hue), and `AppMark loading`
  (a wait of over a second for the app itself, with words beside it). Use `AppMark reveal` alone only on a page about the app.
- **Page changes:** `transitionAttributes()` from `lib/motion` on `<html>`, beside `brandAttributes`, slides the `NavBar`'s current place
  and lets `<main>` rise in. An Astro MPA needs nothing more. A Next.js app wraps its `children` in React's `<ViewTransition>` (see the guide).
- **Never:** a reveal or celebration that replays on every visit or navigation; a celebration for a routine save; brand motion where the
  hue isn't (cards, headings, text); a spring on text or a large surface; two expressive motions at once; a loop; a mark as a page loader
  in front of content; Lottie or Rive; durations or curves of the app's own. Under reduced motion it all stands still, and that is complete.

## Checklist

- [ ] `data-brand` is on `<html>` only, with a hue from `BRAND_HUES`.
- [ ] The `NavBar` has the app's `glyph` and `family`; the `FirstRun` its `glyph`.
- [ ] The icons and favicon come from `npx designsystem-app-icons` with the same hue and glyph; no text, no effects, the glyph
      inside the safe zone, recognisable tinted and in one tone, readable at 16 px in a light and a dark tab.
- [ ] No splash or intro of the app's own; the brand is met in `FirstRun`.
- [ ] No brand colour in content, charts, states or around pictures; no `className` for it.
- [ ] The app's name is the same everywhere; the words follow the app's voice.
- [ ] Brand motion only in the signature moments above, each once. Nothing new moves in the everyday, and nothing plays under reduced motion.

## Sources

- Apple HIG: App icons, Branding, Launching, Color — https://developer.apple.com/design/human-interface-guidelines/app-icons
- Material 3 Expressive research — https://design.google/library/expressive-material-design-google-research
- Maskable icons — https://web.dev/articles/maskable-icon ; manifest `icons` and `monochrome` — https://developer.mozilla.org/en-US/docs/Web/Manifest/icons
- Android adaptive and themed icons — https://developer.android.com/develop/ui/views/launch/icon_design_adaptive
- Linear, How we redesigned the Linear UI — https://linear.app/now/how-we-redesigned-the-linear-ui
