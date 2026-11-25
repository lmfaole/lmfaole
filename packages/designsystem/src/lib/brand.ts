/**
 * The brand of an app in the family (guide «Brand»): one hue from a closed set, set once with `data-brand` on `<html>`, and a glyph for its
 * mark. The colours are in `theme.css` (`[data-brand="…"]`, tested for contrast); the glyphs' shapes are in `app-glyphs.json`, which the icon
 * script (`npx designsystem-app-icons`) reads too, so the mark in the page and the icon on the home screen are drawn from the same data.
 */
import glyphs from "./app-glyphs.json" with { type: "json" }

/** The hues an app can take. Named for the colour, not for an app: which app has which is the app's choice, written once on its `<html>`. */
export const BRAND_HUES = ["rose", "amber", "teal", "blue", "violet"] as const
export type BrandHue = (typeof BRAND_HUES)[number]

/** One path of a glyph: its `d`, and its fill and stroke in `currentColor` (the attributes as React names; the icon script writes them as SVG's). */
export type GlyphPath = Readonly<{ d: string; fill: string; stroke?: string; strokeWidth?: string; strokeLinejoin?: string; strokeLinecap?: string }>

/** The paths of each glyph, on a 100 × 100 grid. */
export const APP_GLYPHS: Readonly<Record<keyof typeof glyphs, readonly GlyphPath[]>> = glyphs
export type AppGlyph = keyof typeof glyphs

/** The attribute that brands an app, for its `<html>` beside `htmlAttributes`: `<html {...htmlAttributes(prefs)} {...brandAttributes("violet")}>`. */
export function brandAttributes(hue: BrandHue): { "data-brand": BrandHue } {
  return { "data-brand": hue }
}
