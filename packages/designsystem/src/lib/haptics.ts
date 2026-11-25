/**
 * Haptics (guide «Foundations / Haptics»): a short buzz that confirms what a hand just did, never the only sign of it. A small, semantic
 * vocabulary (`selection`, `impact-light`, `impact-medium`, `success`, `warning`, `error` and the brand's `signature`), each a
 * `navigator.vibrate` pattern in milliseconds. Progressive enhancement: where there is no Vibration API (Safari and iOS, Firefox) it does
 * nothing, as it does on the server, before the page has had a tap or a key (sticky user activation), and when the reader has turned
 * vibration off.
 *
 * Off is said in two places. The reader's choice in this browser is `localStorage` `ds-haptics` (`on` or `off`; `HapticsSetting` writes
 * it), since vibration belongs to a device and not to an account. A page or a part of one can say `data-haptics="off"` (the nearest
 * ancestor of the control wins, then `<html>`), which beats it. Without a choice, `prefers-reduced-motion: reduce` is taken as a hint: only
 * the outcomes (`success`, `warning`, `error`) are felt, the ticks and the signature are not.
 *
 * Never on hover, scroll or page load: only in answer to a gesture. A buzz that comes too soon after another is dropped, unless it says
 * more (an error over a tick), so a quick run of changes never becomes a storm.
 */
import type { BrandHue } from "./brand"

export const HAPTIC_KINDS = ["selection", "impact-light", "impact-medium", "success", "warning", "error", "signature"] as const
export type HapticKind = (typeof HAPTIC_KINDS)[number]
export type HapticPattern = readonly number[]

/** Each kind as on/off milliseconds. Kept short (under 200 ms in all), firm rather than long: a clear tap, never a buzz (Android). */
export const HAPTIC_PATTERNS: Readonly<Record<Exclude<HapticKind, "signature">, HapticPattern>> = {
  /** A value changed: a switch, a choice, a step on, a row moved. The faintest there is. */
  selection: [10],
  /** Something small landed or snapped into place. */
  "impact-light": [15],
  /** Something larger landed: a drawer at its stop, a pull to refresh let go. */
  "impact-medium": [25],
  /** It worked: two taps, the second firmer (Apple Pay's «two simple taps»). */
  success: [15, 60, 25],
  /** Done, but look: two even taps, further apart. */
  warning: [25, 90, 25],
  /** It did not work: three firm taps. */
  error: [30, 50, 30, 50, 30],
}

/**
 * The family's signatures, by the app's hue (`data-brand`): the moment an app is set up, and nothing else. Amber (Medier) is a «play»: a
 * tap and a push, short then long. Teal (Start) is a sunrise: four taps that grow. A hue without one, or no brand, signs with `success`.
 */
export const BRAND_SIGNATURES: Readonly<Partial<Record<BrandHue, HapticPattern>>> = {
  amber: [12, 70, 40],
  teal: [6, 40, 10, 40, 16, 40, 24],
}

export const HAPTICS_KEY = "ds-haptics"
export type HapticsPreference = "on" | "off" | null

/** The shortest time between two buzzes, in ms, on top of the length of the one before. */
export const HAPTIC_GAP_MS = 80

const RANK: Readonly<Record<HapticKind, number>> = { selection: 0, "impact-light": 1, "impact-medium": 1, success: 2, signature: 2, warning: 3, error: 3 }

export const isHapticKind = (value: unknown): value is HapticKind => HAPTIC_KINDS.some((kind) => kind === value)

/** The pattern a kind plays, under a brand (`data-brand`); `signature` without one of its own is `success`. */
export function hapticPattern(kind: HapticKind, brand?: string | null): HapticPattern {
  if (kind !== "signature") return HAPTIC_PATTERNS[kind]
  const signature = Object.entries(BRAND_SIGNATURES).find(([hue]) => hue === brand)?.[1]
  return signature ?? HAPTIC_PATTERNS.success
}

const total = (pattern: HapticPattern): number => pattern.reduce((sum, ms) => sum + ms, 0)

type Reading = Pick<Storage, "getItem">
type Writing = Pick<Storage, "setItem" | "removeItem">

export function readHapticsPreference(storage: Reading | null): HapticsPreference {
  try {
    const value = storage?.getItem(HAPTICS_KEY)
    return value === "on" || value === "off" ? value : null
  } catch {
    return null
  }
}

export function writeHapticsPreference(storage: Writing | null, value: HapticsPreference): void {
  try {
    if (value === null) storage?.removeItem(HAPTICS_KEY)
    else storage?.setItem(HAPTICS_KEY, value)
  } catch {
    // Kept nowhere: the default holds next time, which is all that is lost.
  }
}

/** What a buzz needs to know of the world; the browser's by default, a test's in a test. */
export type HapticsEnvironment = {
  vibrate: ((pattern: number[]) => boolean) | null
  /** Whether the page has had a tap or a key yet (`navigator.userActivation.hasBeenActive`); `undefined` where the browser does not say. */
  activated: boolean | undefined
  /** The nearest `data-haptics` above the control, or `<html>`'s. */
  attribute: string | null
  preference: HapticsPreference
  reducedMotion: boolean
  brand: string | null
  now: number
}

export type HapticOptions = {
  /** The control the buzz answers; its nearest `data-haptics` counts before `<html>`'s. */
  from?: Element | null
}

function browserEnvironment(from?: Element | null): HapticsEnvironment | null {
  if (typeof window === "undefined" || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return null
  const root = document.documentElement
  let storage: Storage | null = null
  try {
    storage = window.localStorage
  } catch {
    storage = null
  }
  return {
    vibrate: (pattern) => navigator.vibrate(pattern),
    activated: "userActivation" in navigator ? navigator.userActivation.hasBeenActive : undefined,
    attribute: from?.closest("[data-haptics]")?.getAttribute("data-haptics") ?? root.getAttribute("data-haptics"),
    preference: readHapticsPreference(storage),
    reducedMotion: typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    brand: root.getAttribute("data-brand"),
    now: performance.now(),
  }
}

type Allowed = HapticsEnvironment & { vibrate: (pattern: number[]) => boolean }

/** Whether a buzz may be felt at all in this environment (supported, activated, not turned off). */
export function hapticsAllowed(env: HapticsEnvironment | null): env is Allowed {
  return env !== null && env.vibrate !== null && env.activated !== false && env.attribute !== "off" && env.preference !== "off"
}

/** A player with its own memory of the last buzz, over the environment it is given: `haptic` is one over the browser's. */
export function createHaptics(environment: (options: HapticOptions) => HapticsEnvironment | null) {
  let last: { until: number; rank: number } | null = null
  return function play(kind: HapticKind, options: HapticOptions = {}): boolean {
    const env = environment(options)
    if (!hapticsAllowed(env)) return false
    // Without a choice of their own, a reader who asks for less motion feels the outcomes only, and the signature as a plain success.
    const hinted = env.reducedMotion && env.preference !== "on"
    if (hinted && RANK[kind] < 2) return false
    const played = hinted && kind === "signature" ? "success" : kind
    const rank = RANK[played]
    if (last !== null && env.now < last.until + HAPTIC_GAP_MS && rank <= last.rank) return false
    const pattern = hapticPattern(played, env.brand)
    let asked = false
    try {
      asked = env.vibrate([...pattern])
    } catch {
      return false
    }
    if (asked) last = { until: env.now + total(pattern), rank }
    return asked
  }
}

/**
 * Plays a kind, if this browser can and the reader wants it; returns whether it asked the device to. Call it from the handler of a gesture
 * (a click, a change, a key), once the outcome is known, and pair it with what the eye and a screen reader get.
 */
export const haptic = createHaptics(({ from }) => browserEnvironment(from))

/** Whether this browser can vibrate at all (the setting says so where it cannot). False on the server. */
export function hapticsSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
}

const toggles = (element: Element): boolean => element instanceof HTMLInputElement && (element.type === "checkbox" || element.type === "radio")

/** The kind a marked control plays, and the control, for the target of an event. */
function marked(target: EventTarget | null): [HapticKind, Element] | null {
  if (typeof Element === "undefined" || !(target instanceof Element)) return null
  const control = target.closest("[data-haptic]")
  const kind = control?.getAttribute("data-haptic")
  return control === null || control === undefined || !isHapticKind(kind) ? null : [kind, control]
}

/**
 * Listens under `root` for the controls marked `data-haptic="<kind>"` and plays their kind when a hand uses them: a checkbox, a switch or a
 * radio on `change`, anything else on `click`. Only trusted events (a script that ticks a box is not a hand). Returns what stops it. Lets a
 * server-drawn page (Astro, a server component) mark its controls without a script of its own: `<button data-haptic="warning">Slett</button>`.
 */
export function listenForHaptics(root: Document | HTMLElement = document): () => void {
  const onChange = (event: Event) => {
    const found = event.isTrusted ? marked(event.target) : null
    if (found !== null && toggles(found[1])) haptic(found[0], { from: found[1] })
  }
  const onClick = (event: Event) => {
    const found = event.isTrusted ? marked(event.target) : null
    if (found === null || toggles(found[1]) || found[1].matches(":disabled, [aria-disabled='true']")) return
    haptic(found[0], { from: found[1] })
  }
  root.addEventListener("change", onChange)
  root.addEventListener("click", onClick)
  return () => {
    root.removeEventListener("change", onChange)
    root.removeEventListener("click", onClick)
  }
}
