---
name: designsystem-haptics
description: Use when an app built with the design system should vibrate - deciding whether a control gets a haptic and which kind (selection, impact, success, warning, error, the brand's signature), wiring Haptics and data-haptic, the reader's off switch («Vibrasjon» in AppearanceSettings), or reviewing a page that buzzes. Haptics confirm a gesture; they never carry meaning alone.
---

# Haptics with the design system

The full guide, with the research and the support matrix, is «Foundations / Haptics». The module is `lib/haptics` (`haptic(kind)`), on
`navigator.vibrate`: Chrome and Samsung Internet on Android (and PWAs installed from them) feel it; Safari, iOS and Firefox feel nothing,
and nothing is lost. An app installed on iOS has no vibration either (**designsystem-pwa**, platform differences). Design every haptic as an extra: the page is complete without it, which is what most readers get.

## Principles

1. **Confirm a gesture, never start one.** In the handler of a click, change or key, once the outcome is known. Never on hover, scroll,
   focus, page load, a timer or a live update.
2. **Never alone.** Every buzz has its words, symbol or position on screen: the error under the field, a `Banner`, a moved row announced.
3. **Few and semantic.** Use the kinds for their meanings; an app never writes milliseconds or calls `navigator.vibrate` itself.
4. **Rare, and strength follows importance.** Not every button buzzes. The more often something happens, the subtler its haptic
   (Android: frequent events very subtle; a 10 ms `selection` tick, not an impact); if the reader feels it often, take it away.
   Given a buzzy haptic or none, choose none.
5. **Clear, not buzzy.** Short, crisp taps (10–30 ms) feel like a click; a long or repeated vibration feels like an old phone's
   alert. The patterns are already short; never add length, repeat a kind or chain two.
6. **In step with what is seen.** The tap lands with the visual change it confirms (the toggle flips, the row lands, the error
   appears), not before the outcome is known and not after the screen has moved on.
7. **Consistent.** One kind means one thing in every app of the family (Apple: use system patterns for their meanings, always the
   same way), so a reader learns it once.
8. **The reader decides.** «Vibrasjon» in `AppearanceSettings` on the settings page; their «off» is never overridden.

## The kinds

| Kind | For |
| --- | --- |
| `selection` | A value changed: a switch, a choice, a step forward, a row moved |
| `impact-light`, `impact-medium` | Something snapped into place, or landed (a pull to refresh released) |
| `success` | It worked, and the screen says so (saved, sent) |
| `warning` | Confirming something destructive, or done with a caveat |
| `error` | It did not work, with the error shown |
| `signature` | The app's own (Medier's «play», Start's sunrise, by `data-brand`): only at the end of onboarding, which `FirstRun` already does |

## Setting it up in an app

- Once, in the layout: `<Haptics />` (React/Next.js), or in Astro `listenForHaptics()` from `lib/haptics` in a `<script>`. It plays the
  controls marked `data-haptic="<kind>"`, also in server-drawn markup. `CheckboxList`, `ToggleMatrix` and `ChoiceCards` are marked
  `selection` already; `FirstRun` and `ReorderList` buzz without it.
- «Vibrasjon», which `AppearanceSettings` puts in its «Effekter» section on the settings page. It is kept in the browser (`localStorage` `ds-haptics`), not in
  the `prefs` cookie: it is the phone that vibrates.
- Mark sparingly: `data-haptic="warning"` on the button that confirms a deletion; `haptic("success")` in a script after a save that is
  confirmed on screen.
- `listenForHaptics` plays only for a real gesture (trusted events), never for a disabled or `aria-disabled` control, and two
  haptics within 80 ms are one (the stronger). Do not work around either.
- Never while the camera or microphone records or media is capturing (Apple), and not during a call or video: turn them off
  there with `data-haptics="off"`.
- `data-haptics="off"` on `<html>` or an element turns them off there (a preview, a kiosk). Under `prefers-reduced-motion`, without a choice
  of the reader's, only `success`, `warning` and `error` are felt.

## Where it is felt (2026)

| Platform | What happens |
| --- | --- |
| Chrome, Samsung Internet, Edge on Android; PWAs installed from them | `navigator.vibrate` plays the pattern (after a gesture, not in a cross-origin frame) |
| Firefox on Android | `navigator.vibrate` exists and returns true but nothing is felt |
| Firefox desktop | removed (129); nothing |
| Safari on iOS and macOS | no Vibration API; a native `<input type="checkbox" switch>` gives its own system tap on iPhone (iOS 18+) |
| Desktop browsers, a laptop's trackpad | nothing; the web cannot reach it |

A **Web Haptics** API is being designed (WICG; the CSS working group agreed in 2026 to start a draft): semantic effects (`hint`,
`edge`, `tick`, `align`, `success`, `error`) with an intensity, gated by user activation and a permissions policy, in script and CSS.
It is not shipped anywhere yet. Our kinds map onto it (`selection` → `tick`, `impact-light` → `align`, `impact-medium` → `edge`,
`success`, `error`; `warning` has no match yet), so an app that only uses the kinds gets it when `lib/haptics` adopts it. Never
reach for it, a polyfill or another library in an app.

## Don't

- Buzz on navigation, on every button, or on what the reader did not do.
- Let a rhythm be the only way to tell success from error.
- Use the signature for routine actions.
- Buzz for a live update, a notification on the page, a timer or a scroll position (nothing the reader just did).
- Pair a haptic with a sound of the app's own, or use one to draw attention.
- Fake iOS haptics by clicking a hidden switch or overlaying one: WebKit has closed it, and it pollutes focus and the accessibility tree.
  Where a control is on or off, a native `<input type="checkbox" switch>` gives an iPhone its own tap honestly (as «Vibrasjon» does).

Words in a setting follow **designsystem-content**; the signature is part of the brand (**designsystem-brand**); a page that buzzes is
reviewed with **designsystem-review**.

## Checklist

- [ ] Each haptic follows a gesture whose outcome is shown on screen in words or a symbol, at the same moment.
- [ ] Kinds used for their meaning only; no milliseconds, no `navigator.vibrate` in the app.
- [ ] Frequent actions have none or `selection`; `warning`/`error` only where the screen says so.
- [ ] «Vibrasjon» in `AppearanceSettings` turns everything off; reduced motion leaves only outcomes.
- [ ] The page is the same with no haptics (iPhone, desktop, Firefox).

## Sources

- Apple HIG, Playing haptics — https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- Android, Haptics design principles — https://developer.android.com/develop/ui/views/haptics/haptics-principles
- MDN, Vibration API and browser-compat-data — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API
- WebKit, Safari 18.0 (the `switch` control) — https://webkit.org/blog/15865/webkit-features-in-safari-18-0/
- WICG Web Haptics — https://github.com/WICG/web-haptics
