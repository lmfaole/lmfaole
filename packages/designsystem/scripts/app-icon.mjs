// The drawing of an app's icon (guide «Brand»): the app's glyph (src/lib/app-glyphs.json) on a tile in its brand colour (theme.css,
// `[data-brand="…"]`), the same as the `AppMark` in the page. Pure functions, used by `npx designsystem-app-icons` and its test.

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
export const THEME_CSS = readFileSync(resolve(root, "src", "theme.css"), "utf8")
export const GLYPHS = JSON.parse(readFileSync(resolve(root, "src", "lib", "app-glyphs.json"), "utf8"))

/** `oklch(L C H)` as `#rrggbb`, clipped to sRGB (the brand colours are tested to be inside it). */
export function oklchToHex(value) {
  const match = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/.exec(value)
  if (match === null) throw new Error(`Not an oklch() colour: ${value}`)
  const [l, c, h] = [Number(match[1]), Number(match[2]), (Number(match[3]) * Math.PI) / 180]
  const a = c * Math.cos(h)
  const b = c * Math.sin(h)
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3
  const linear = [4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_, -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_, -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_]
  const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
  return `#${linear.map((x) => Math.round(Math.min(1, Math.max(0, gamma(x))) * 255).toString(16).padStart(2, "0")).join("")}`
}

/** The hues theme.css offers. */
export const HUES = [...new Set([...THEME_CSS.matchAll(/\[data-brand="([a-z]+)"\]/g)].map((match) => match[1]))]

/** A hue's colours as hex, light and dark: `brand`, `foreground` (the glyph on it) and `subtle`. Without a hue (`none`), the ink and the page. */
export function brandColours(hue) {
  const selector = hue === "none" ? ":root {\n    --brand:" : `[data-brand="${hue}"] {`
  const start = THEME_CSS.indexOf(selector)
  if (start === -1) throw new Error(`No brand hue "${hue}". Choose one of: ${HUES.join(", ")}, or none.`)
  const block = THEME_CSS.slice(start, THEME_CSS.indexOf("}", start))
  const pair = (name) => {
    const match = new RegExp(`--${name}:\\s*light-dark\\((oklch\\([^)]*\\)),\\s*(oklch\\([^)]*\\))\\)`).exec(block)
    if (match === null) throw new Error(`--${name} is missing in ${selector}`)
    return { light: oklchToHex(match[1]), dark: oklchToHex(match[2]) }
  }
  return { brand: pair("brand"), foreground: pair("brand-foreground"), subtle: pair("brand-subtle") }
}

/** The page's colour in each theme, for the manifest's `background_color` and the `theme-color` meta. */
export function pageColours() {
  const light = /\[data-theme="light"\] \{[^}]*?--background:\s*(oklch\([^)]*\))/.exec(THEME_CSS)
  const dark = /\[data-theme="dark"\] \{[^}]*?--background:\s*(oklch\([^)]*\))/.exec(THEME_CSS)
  return { light: oklchToHex(light?.[1] ?? "oklch(1 0 0)"), dark: oklchToHex(dark?.[1] ?? "oklch(0.145 0 0)") }
}

const SVG_NAMES = { strokeWidth: "stroke-width", strokeLinejoin: "stroke-linejoin", strokeLinecap: "stroke-linecap" }

/**
 * The icon as SVG. `purpose`: `any` (the full square; the system rounds it), `maskable` (the glyph inside the circle a system may cut to),
 * `apple` (a little inset, iOS rounds it), `favicon` (rounded here, as a tab shows it as drawn).
 */
export function appIconSvg({ hue, glyph, purpose = "any" }) {
  const paths = GLYPHS[glyph]
  if (paths === undefined) throw new Error(`No glyph "${glyph}". Choose one of: ${Object.keys(GLYPHS).join(", ")}.`)
  const { brand, foreground } = brandColours(hue)
  const scale = { any: 1, maskable: 0.72, apple: 0.86, favicon: 1 }[purpose]
  if (scale === undefined) throw new Error(`No purpose "${purpose}"`)
  const colour = (value) => (value === "currentColor" ? foreground.light : value)
  const shapes = paths
    .map((path) => `<path ${Object.entries(path).map(([name, value]) => `${SVG_NAMES[name] ?? name}="${colour(value)}"`).join(" ")}/>`)
    .join("")
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="${purpose === "favicon" ? 22 : 0}" fill="${brand.light}"/><g transform="translate(50 50) scale(${scale}) translate(-50 -50)">${shapes}</g></svg>\n`
}
