import assert from "node:assert/strict"
import { test } from "node:test"
import { appIconSvg, brandColours, HUES, oklchToHex, pageColours } from "./app-icon.mjs"

test("oklch() is converted to the sRGB hex a browser shows for it", () => {
  assert.equal(oklchToHex("oklch(1 0 0)"), "#ffffff")
  assert.equal(oklchToHex("oklch(0 0 0)"), "#000000")
  assert.equal(oklchToHex("oklch(0.145 0 0)"), "#0a0a0a")
  assert.equal(oklchToHex("oklch(0.628 0.2577 29.23)"), "#ff0000")
})

test("every hue in theme.css gives an icon with its brand tile and the glyph in its foreground", () => {
  assert.ok(HUES.length >= 2)
  for (const hue of HUES) {
    const { brand, foreground } = brandColours(hue)
    const svg = appIconSvg({ hue, glyph: "play" })
    assert.match(svg, new RegExp(`<rect [^>]*fill="${brand.light}"`))
    assert.match(svg, new RegExp(`fill="${foreground.light}"`))
    assert.doesNotMatch(svg, /currentColor|strokeWidth/)
  }
})

test("a maskable icon keeps the glyph inside the safe circle, the favicon is rounded, and no brand is the ink", () => {
  assert.match(appIconSvg({ hue: "teal", glyph: "sunrise", purpose: "maskable" }), /scale\(0\.72\)/)
  assert.match(appIconSvg({ hue: "teal", glyph: "sunrise", purpose: "favicon" }), /rx="22"/)
  assert.equal(brandColours("none").brand.light, "#0a0a0a")
  assert.deepEqual(pageColours(), { light: "#ffffff", dark: "#0a0a0a" })
})

test("an unknown hue or glyph is refused with the ones there are", () => {
  assert.throws(() => appIconSvg({ hue: "green", glyph: "play" }), /rose/)
  assert.throws(() => appIconSvg({ hue: "teal", glyph: "star" }), /sunrise/)
})
