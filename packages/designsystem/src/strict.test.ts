/**
 * Closed by default (README rule 8). These tests keep the components from growing open props again, keep `Card` out of
 * components that are not a card, and keep colours in `theme.css`.
 *
 * `ALLOWED`, `APPEARANCE_ALLOWED` and `CARD_USERS` may only shrink: each entry is a use a consumer still has, and goes when the consumer is migrated.
 */

import { strict as assert } from "node:assert"
import { readFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"
import { test } from "node:test"

const src = import.meta.dirname

const files = (directory: string, extension: RegExp): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) return entry.name === "ui" ? [] : files(path, extension)
    return extension.test(entry.name) ? [path] : []
  })

const components = files(join(src, "components"), /\.tsx$/)
const name = (path: string): string => relative(src, path)

/** Open props that are left, per file, with the reason: the consumer's use that blocks removing them. */
const ALLOWED: Readonly<Record<string, readonly string[]>> = {}

/** The components that draw a `Card`: a card is one item among its kind (a picture, a stop among stops), or a frame around a chart. */
const CARD_USERS: readonly string[] = ["components/chart-card.tsx", "components/departure-board.tsx"]

test("no component has an open className, style or ComponentProps prop beyond ALLOWED", () => {
  const found: Record<string, string[]> = {}
  for (const file of components) {
    const text = readFileSync(file, "utf8")
    const hits = [...new Set(text.match(/\b(?:className|style)\?:|ComponentProps(?:WithoutRef)?<|HTMLAttributes<|\.\.\.props\b/g) ?? [])]
      .toSorted()
    if (hits.length > 0) found[name(file)] = hits
  }
  const expected = Object.fromEntries(Object.entries(ALLOWED).filter(([, hits]) => hits.length > 0))
  assert.deepEqual(found, expected, "a component got an open prop (make it a closed variant), or ALLOWED lists more than is left (lower it)")
})

/**
 * Props that choose an appearance (10.0.0: apps pass data, never appearance). A public component takes none of them, beyond
 * `APPEARANCE_ALLOWED`. `internal/` and `ui/` are not public and are not checked.
 */
const APPEARANCE = new Set(["size", "tone", "variant", "gap", "stretched", "position", "height", "ratio", "corners", "as", "showTable"])

/** What is left, per `file#Component`, with the group of 10.0.0 that removes it, or why it stays. */
const APPEARANCE_ALLOWED: Readonly<Record<string, readonly string[]>> = {
  // A: kept on purpose
  "components/layout.tsx#Stack": ["gap"], // two values only: tight | default
  "components/icon.tsx#Icon": ["size", "tone"], // the primitive under every icon
  "components/brand-icon.tsx#BrandIcon": ["size"],
  "components/wordmark.tsx#AppMark": ["size"],
  "components/wordmark.tsx#Wordmark": ["size"],
  "components/line-badge.tsx#LineBadge": ["size"],
  "components/disc.tsx#Disc": ["size"],
  "components/reveal.tsx#Reveal": ["as"],
  "components/reveal.tsx#Stagger": ["as"],
  "components/stage.tsx#Stage": ["as"],
  "components/overlay.tsx#Overlay": ["variant"],
  "components/markdown.tsx#Markdown": ["size"],
  "components/play-button.tsx#PlayButton": ["position"],
  "components/album-sleeve.tsx#AlbumSleeve": ["size"],
  // B: kept on purpose. A badge's tone is what the word means (the shared Tone vocabulary), as a status's in StatusLine
  "components/badge.tsx#Badge": ["tone"],
  // C: links, actions, states
  "components/banner.tsx#Banner": ["tone"], // kept: success | info, what kind of message it is (data), never a failure
}

test("no public component takes a prop that chooses its appearance beyond APPEARANCE_ALLOWED", () => {
  const found: Record<string, string[]> = {}
  for (const file of components.filter((path) => !name(path).startsWith("components/internal/"))) {
    for (const match of readFileSync(file, "utf8").matchAll(/export function ([A-Z]\w*)\(\s*\{([^}]*)\}/g)) {
      const props = (match[2] ?? "").split(",").map((part) => part.trim().replace(/^\.\.\./, "").split(/[=:\s]/)[0] ?? "")
      const hits = props.filter((prop) => APPEARANCE.has(prop)).toSorted()
      if (hits.length > 0) found[`${name(file)}#${match[1] ?? ""}`] = hits
    }
  }
  assert.deepEqual(found, APPEARANCE_ALLOWED, "a public component takes a prop that chooses its look (take data instead: kind, role, what), or APPEARANCE_ALLOWED lists more than is left (lower it)")
})

test("only the listed components draw a Card", () => {
  const users = components
    .filter((file) => /import\s*\{[^}]*\bCard\b[^}]*\}\s*from\s*["']\.\/ui\/card["']/.test(readFileSync(file, "utf8")))
    .map(name)
    .toSorted()
  assert.deepEqual(users, [...CARD_USERS].toSorted(), "a component uses Card without being a card (use PageSection and a list, README rule 8), or CARD_USERS lists more than is left")
})

test("no raw colour outside theme.css", () => {
  const sources = [...files(src, /\.(?:tsx?|css)$/)].filter((file) => !file.endsWith("theme.css") && !file.endsWith(".test.ts"))
  const raw = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|\brgba?\(|\bhsla?\(|\b(?:bg|text|border|fill|stroke)-(?:white|black)\b|\bbackdrop:bg-black\b/
  const found = sources.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, index) => (raw.test(line) ? [`${name(file)}:${index + 1}: ${line.trim()}`] : [])),
  )
  assert.deepEqual(found, [], "a colour is a token of theme.css (var(--...) or a theme colour class)")
})
