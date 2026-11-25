#!/usr/bin/env node
// Draws an app's icons from its brand (guide «Brand»): the glyph on a tile in the brand colour, the same drawing as its `AppMark`.
//
//   npx designsystem-app-icons --hue violet --glyph play
//   npx designsystem-app-icons --hue teal --glyph sunrise --apple app/apple-icon.png --favicon app/icon.png --svg app/icon.svg
//
// Writes `--svg` (public/favicon.svg), `--favicon` (public/favicon.png, 64 px), `--apple` (public/apple-touch-icon.png, 180 px) and, in
// `--out` (public/icons), icon-192.png, icon-512.png, maskable-192.png and maskable-512.png; then prints the manifest's colours. The PNGs are drawn by
// Playwright, which is not a dependency: the project's, $PLAYWRIGHT, or a global one (`npm i -g playwright`). `--svg-only` skips them.

import { mkdirSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { appIconSvg, brandColours, GLYPHS, HUES, pageColours } from "./app-icon.mjs"

const option = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`)
  return index === -1 ? fallback : process.argv[index + 1]
}
const hue = option("hue")
const glyph = option("glyph")
if (hue === undefined || glyph === undefined) {
  console.error(`Usage: designsystem-app-icons --hue <${HUES.join("|")}|none> --glyph <${Object.keys(GLYPHS).join("|")}> [--out public/icons] [--apple path] [--favicon path] [--svg path] [--svg-only]`)
  process.exit(1)
}

const out = option("out", "public/icons")
const svgPath = option("svg", "public/favicon.svg")
const write = (path, content) => {
  mkdirSync(dirname(resolve(path)), { recursive: true })
  writeFileSync(resolve(path), content)
  console.log(path)
}
write(svgPath, appIconSvg({ hue, glyph, purpose: "favicon" }))

if (!process.argv.includes("--svg-only")) {
  const require = createRequire(join(process.cwd(), "package.json"))
  let playwright
  try {
    playwright = require(process.env.PLAYWRIGHT ?? "playwright")
  } catch {
    playwright = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? "playwright")
  }
  const icons = [
    [join(out, "icon-192.png"), 192, "any"],
    [join(out, "icon-512.png"), 512, "any"],
    [join(out, "maskable-192.png"), 192, "maskable"],
    [join(out, "maskable-512.png"), 512, "maskable"],
    [option("apple", "public/apple-touch-icon.png"), 180, "apple"],
    [option("favicon", "public/favicon.png"), 64, "favicon"],
  ]
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage()
  for (const [path, size, purpose] of icons) {
    mkdirSync(dirname(resolve(path)), { recursive: true })
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${appIconSvg({ hue, glyph, purpose })}`)
    await page.locator("svg").screenshot({ path: resolve(path), omitBackground: true })
    console.log(path)
  }
  await browser.close()
}

const page = pageColours()
const { brand } = brandColours(hue)
console.log(`
Manifest: "background_color": "${page.dark}", "theme_color": "${page.dark}" (the page; the brand is in the icon, ${brand.light}).
<meta name="theme-color">: ${page.light} (light) and ${page.dark} (dark).
<link rel="icon" href="/${svgPath.replace(/^(public|app)\//, "")}" type="image/svg+xml">, with the PNG as the fallback.`)
