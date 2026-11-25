import assert from "node:assert/strict"
import { test } from "node:test"

import { BACKDROP_HIGHLIGHT, BACKDROP_OPACITY, coverTraits, easeOut, isLightArt, LIGHT_ART, lively, mixPalette, paletteOf, quarterMean, type Rgb } from "./palette.ts"

const square = (size: number, colour: (x: number, y: number) => [number, number, number, number]): number[] => {
  const pixels: number[] = []
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) pixels.push(...colour(x, y))
  return pixels
}

test("each quarter of a picture has its own mean colour", () => {
  const pixels = square(8, (x, y) => (y < 4 ? (x < 4 ? [255, 0, 0, 255] : [0, 255, 0, 255]) : x < 4 ? [0, 0, 255, 255] : [255, 255, 255, 255]))
  assert.deepEqual(quarterMean(pixels, 8, 0), [255, 0, 0])
  assert.deepEqual(quarterMean(pixels, 8, 1), [0, 255, 0])
  assert.deepEqual(quarterMean(pixels, 8, 2), [0, 0, 255])
  assert.deepEqual(quarterMean(pixels, 8, 3), [255, 255, 255])
})

test("transparent pixels are not counted, and a quarter with nothing is a neutral grey", () => {
  const pixels = square(4, (x) => (x < 2 ? [200, 100, 50, 255] : [0, 0, 0, 0]))
  assert.deepEqual(quarterMean(pixels, 4, 0), [200, 100, 50])
  assert.deepEqual(quarterMean(pixels, 4, 1), [128, 128, 128])
})

test("a backdrop colour is lifted to a coloured middle band, never white or black, and a grey stays grey", () => {
  for (const colour of [[255, 255, 255], [0, 0, 0], [10, 10, 12], [250, 250, 245]] as const) {
    const [r, g, b] = lively([...colour])
    const lightness = (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 255
    assert.ok(lightness >= 0.33 && lightness <= 0.63, `${colour} gave lightness ${lightness}`)
  }
  const grey = lively([120, 120, 120])
  assert.ok(Math.abs(grey[0] - grey[1]) <= 1 && Math.abs(grey[1] - grey[2]) <= 1)
  const dull = lively([150, 110, 100])
  const spread = (c: number[]) => Math.max(...c) - Math.min(...c)
  assert.ok(spread(dull) > spread([150, 110, 100]), "a dull colour is made more saturated")
})

test("the palette has four colours, one per quarter", () => {
  const palette = paletteOf(square(8, () => [200, 80, 60, 255]), 8)
  assert.equal(palette.length, 4)
  for (const colour of palette) assert.equal(colour.length, 3)
})

const linear = (value: number): number => {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: number[]): number => 0.2126 * linear(r ?? 0) + 0.7152 * linear(g ?? 0) + 0.0722 * linear(b ?? 0)
const ratio = (a: number[], b: number[]): number => {
  const [high, low] = luminance(a) > luminance(b) ? [luminance(a), luminance(b)] : [luminance(b), luminance(a)]
  return (high + 0.05) / (low + 0.05)
}

test("the head's text keeps 4.5:1 on the backdrop, on the worst colour a picture can give, with the light's highlight on it, in both themes", () => {
  const hueToRgb = (hue: number): Rgb => {
    const channel = (n: number): number => Math.round(255 * Math.max(0, Math.min(1, Math.abs((((hue / 60 + n) % 6) - 3)) - 1)))
    return [channel(4), channel(0), channel(2)]
  }
  const dim = ([r, g, b]: Rgb): Rgb => [128 + (r - 128) * 0.3, 128 + (g - 128) * 0.3, 128 + (b - 128) * 0.3]
  for (const [bg, text, opacity] of [[[10, 10, 10], [250, 250, 250], BACKDROP_OPACITY.dark], [[255, 255, 255], [10, 10, 10], BACKDROP_OPACITY.light]] as const) {
    for (let hue = 0; hue < 360; hue += 5) {
      for (const dull of [false, true]) {
        const base = hueToRgb(hue)
        const colour = lively(dull ? dim(base) : base)
        for (const shown of [colour, colour.map((v) => Math.min(255, v + BACKDROP_HIGHLIGHT * 255))]) {
          const blended = shown.map((v, index) => v * opacity + (bg[index] ?? 0) * (1 - opacity))
          assert.ok(ratio([...text], blended) >= 4.5, `hue ${hue} ${dull ? "dull" : "vivid"} on ${bg[0]} gave ${ratio([...text], blended).toFixed(2)}`)
        }
      }
    }
  }
})

test("a picture has a main hue, a saturation and a lightness, and covers that differ give traits that differ", () => {
  const red = coverTraits(square(8, () => [200, 20, 20, 255]), 8)
  const blue = coverTraits(square(8, () => [20, 40, 200, 255]), 8)
  const grey = coverTraits(square(8, () => [128, 128, 128, 255]), 8)
  const dark = coverTraits(square(8, () => [20, 20, 25, 255]), 8)
  assert.ok(red.hue < 0.05 || red.hue > 0.95)
  assert.ok(Math.abs(blue.hue - 0.64) < 0.05)
  assert.ok(red.saturation > 0.7 && grey.saturation < 0.01)
  assert.ok(dark.lightness < 0.15 && grey.lightness > 0.45 && grey.lightness < 0.55)
  assert.notEqual(red.hue.toFixed(2), blue.hue.toFixed(2))
})

test("a palette changes colour by shares of the way, and the move settles", () => {
  const a: [Rgb, Rgb, Rgb, Rgb] = [[0, 0, 0], [100, 0, 0], [0, 100, 0], [0, 0, 100]]
  const b: [Rgb, Rgb, Rgb, Rgb] = [[200, 200, 200], [100, 100, 0], [0, 0, 0], [50, 50, 50]]
  assert.deepEqual(mixPalette(a, b, 0), a)
  assert.deepEqual(mixPalette(a, b, 1), b)
  assert.deepEqual(mixPalette(a, b, 0.5)[0], [100, 100, 100])
  assert.deepEqual(mixPalette(a, b, 9), b)
  assert.equal(easeOut(0), 0)
  assert.equal(easeOut(1), 1)
  assert.ok(easeOut(0.5) > 0.5, "fast at first")
  assert.ok(easeOut(0.9) - easeOut(0.8) < easeOut(0.2) - easeOut(0.1), "settles")
})

test("a light picture is told from the rest, and its stronger backdrop on the muted ground keeps the head's text at 4.5:1 and stands apart from the page", () => {
  const solid = (colour: readonly number[]): number[] => Array.from({ length: 16 * 16 }, () => [...colour, 255]).flat()
  assert.equal(isLightArt(solid([255, 255, 255]), 16), true)
  assert.equal(isLightArt(solid([240, 236, 228]), 16), true)
  assert.equal(isLightArt(solid([180, 40, 60]), 16), false)
  assert.equal(isLightArt(solid([20, 20, 20]), 16), false)
  // The light theme's --muted (oklch 0.97) and text; every light colour a picture can give, at its lightest made lively.
  const muted = [247, 247, 247]
  const text = [10, 10, 10]
  for (let hue = 0; hue < 360; hue += 5) {
    for (const lightness of [LIGHT_ART.lightness, 0.92, 1]) {
      const channel = (n: number): number => Math.round(255 * lightness - (n === Math.floor(hue / 120) ? 0 : 255 * (1 - lightness)))
      const colour = lively([channel(0), channel(1), channel(2)])
      for (const shown of [colour, colour.map((v) => Math.min(255, v + BACKDROP_HIGHLIGHT * 255))]) {
        const blended = shown.map((v, index) => v * LIGHT_ART.opacity + (muted[index] ?? 0) * (1 - LIGHT_ART.opacity))
        assert.ok(ratio(text, blended) >= 4.5, `hue ${hue} at ${lightness} gave ${ratio(text, blended).toFixed(2)}`)
      }
    }
  }
  // A white picture's backdrop is darker than the page under it: the picture's edge shows.
  const white = lively([255, 255, 255]).map((v, index) => v * LIGHT_ART.opacity + (muted[index] ?? 0) * (1 - LIGHT_ART.opacity))
  assert.ok(ratio([255, 255, 255], white) >= 1.5, `white on its stage gave ${ratio([255, 255, 255], white).toFixed(2)}`)
})
