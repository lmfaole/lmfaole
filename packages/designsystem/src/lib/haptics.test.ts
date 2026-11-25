import { strict as assert } from "node:assert"
import { test } from "node:test"

import { BRAND_SIGNATURES, HAPTICS_KEY, HAPTIC_PATTERNS, createHaptics, haptic, hapticPattern, hapticsSupported, readHapticsPreference, writeHapticsPreference, type HapticsEnvironment } from "./haptics.ts"

/** A player over a mocked device: what it was asked to play, and a clock and settings the test moves. */
function device(overrides: Partial<HapticsEnvironment> = {}) {
  const played: number[][] = []
  const state: HapticsEnvironment = {
    vibrate: (pattern) => {
      played.push(pattern)
      return true
    },
    activated: true,
    attribute: null,
    preference: null,
    reducedMotion: false,
    brand: null,
    now: 1000,
    ...overrides,
  }
  return { played, state, play: createHaptics(() => state) }
}

test("a kind plays its pattern, and the signature is the brand's", () => {
  const { played, play, state } = device()
  assert.equal(play("success"), true)
  state.now += 1000
  state.brand = "amber"
  play("signature")
  state.now += 1000
  state.brand = "teal"
  play("signature")
  state.now += 1000
  state.brand = "rose"
  play("signature")
  assert.deepEqual(played, [[...HAPTIC_PATTERNS.success], [...(BRAND_SIGNATURES.amber ?? [])], [...(BRAND_SIGNATURES.teal ?? [])], [...HAPTIC_PATTERNS.success]])
})

test("every pattern is short: under 200 ms from start to end", () => {
  const patterns = [...Object.values(HAPTIC_PATTERNS), ...Object.values(BRAND_SIGNATURES)]
  for (const pattern of patterns) assert.ok(pattern.reduce((sum, ms) => sum + ms, 0) < 200, `${pattern.join(",")}`)
  assert.deepEqual(hapticPattern("signature"), HAPTIC_PATTERNS.success)
})

test("nothing where it cannot vibrate, before a gesture, or when turned off", () => {
  assert.equal(createHaptics(() => null)("success"), false)
  for (const overrides of [{ vibrate: null }, { activated: false }, { attribute: "off" }, { preference: "off" as const }]) {
    const { played, play } = device(overrides)
    assert.equal(play("error"), false)
    assert.deepEqual(played, [])
  }
  // A browser that does not say whether it has had a gesture is trusted: the Vibration API itself refuses without one.
  assert.equal(device({ activated: undefined }).play("selection"), true)
  assert.equal(hapticsSupported(), typeof navigator !== "undefined" && typeof navigator.vibrate === "function")
})

test("under reduced motion without a choice, only the outcomes are felt, and the signature as a success", () => {
  const { played, play, state } = device({ reducedMotion: true, brand: "amber" })
  assert.equal(play("selection"), false)
  assert.equal(play("impact-medium"), false)
  assert.equal(play("signature"), true)
  state.now += 1000
  state.preference = "on"
  assert.equal(play("selection"), true)
  assert.deepEqual(played, [[...HAPTIC_PATTERNS.success], [...HAPTIC_PATTERNS.selection]])
})

test("a run of buzzes is thinned: too soon is dropped, unless it says more", () => {
  const { played, play, state } = device()
  assert.equal(play("selection"), true)
  state.now += 20
  assert.equal(play("selection"), false)
  state.now += 20
  assert.equal(play("error"), true, "an error cuts in over a tick")
  state.now += 100
  assert.equal(play("success"), false, "within the error and its gap")
  state.now += 200
  assert.equal(play("selection"), true)
  assert.equal(played.length, 3)
})

test("a device that refuses or throws is not remembered", () => {
  const refusing = device({ vibrate: () => false })
  assert.equal(refusing.play("success"), false)
  const throwing = device({
    vibrate: () => {
      throw new Error("blocked")
    },
  })
  assert.equal(throwing.play("success"), false)
})

test("the preference is kept in storage, and missing or refusing storage breaks nothing", () => {
  const map = new Map<string, string>()
  const storage = { getItem: (key: string) => map.get(key) ?? null, setItem: (key: string, value: string) => void map.set(key, value), removeItem: (key: string) => void map.delete(key) }
  assert.equal(readHapticsPreference(storage), null)
  writeHapticsPreference(storage, "off")
  assert.equal(map.get(HAPTICS_KEY), "off")
  assert.equal(readHapticsPreference(storage), "off")
  writeHapticsPreference(storage, null)
  assert.equal(readHapticsPreference(storage), null)
  map.set(HAPTICS_KEY, "maybe")
  assert.equal(readHapticsPreference(storage), null)
  const broken = {
    getItem: () => {
      throw new Error("denied")
    },
    setItem: () => {
      throw new Error("denied")
    },
    removeItem: () => undefined,
  }
  assert.equal(readHapticsPreference(broken), null)
  writeHapticsPreference(broken, "on")
  assert.equal(readHapticsPreference(null), null)
})

test("in a browser: `haptic` reads the mocked navigator, `<html>` and storage", () => {
  const played: number[][] = []
  const attributes: Record<string, string> = { "data-brand": "teal" }
  const store = new Map<string, string>()
  const saved = Object.getOwnPropertyDescriptor(globalThis, "navigator")
  const globals: Record<string, unknown> = globalThis
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { vibrate: (pattern: number[]) => played.push(pattern) > 0, userActivation: { hasBeenActive: true } } })
  globals["window"] = { localStorage: { getItem: (key: string) => store.get(key) ?? null }, matchMedia: () => ({ matches: false }) }
  globals["document"] = { documentElement: { getAttribute: (name: string) => attributes[name] ?? null } }
  try {
    assert.equal(haptic("signature"), true)
    assert.deepEqual(played, [[...(BRAND_SIGNATURES.teal ?? [])]])
    store.set(HAPTICS_KEY, "off")
    assert.equal(haptic("error"), false)
    store.delete(HAPTICS_KEY)
    attributes["data-haptics"] = "off"
    assert.equal(haptic("error"), false)
    assert.equal(played.length, 1)
  } finally {
    if (saved === undefined) delete globals["navigator"]
    else Object.defineProperty(globalThis, "navigator", saved)
    delete globals["window"]
    delete globals["document"]
  }
})
