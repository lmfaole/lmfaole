import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { test } from "node:test"
import { toRem } from "./lib/units.ts"

// The owner's rule: no length is in pixels. Lengths are rem, em, ch, %, vw/dvh, cqi, lh, clamp() or Tailwind's scale, so they follow
// the reader's text size and the screen. Pixel maths in numbers (a canvas, WebGL, a measured box) is fine; a CSS string is not.
const ROOT = new URL("..", import.meta.url).pathname
const PIXELS = /\d+(?:\.\d+)?px(?![a-z])/i
const SELF = join("src", "units.test.ts")

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === "__screenshots__" || name === "node_modules" ? [] : files(path)
    return /\.(ts|tsx|css|mdx)$/.test(name) ? [path] : []
  })
}

test("no length in src or stories is written in px", () => {
  const found = ["src", "stories"].flatMap((dir) => files(join(ROOT, dir))).flatMap((path) => {
    const name = relative(ROOT, path)
    if (name === SELF) return []
    return readFileSync(path, "utf8")
      .split("\n")
      .flatMap((line, index) => (PIXELS.test(line) ? [`${name}:${index + 1}: ${line.trim().slice(0, 120)}`] : []))
  })
  assert.deepEqual(found, [], `Use rem, em, %, cqi or a Tailwind step, not px:\n${found.join("\n")}`)
})

test("toRem turns a measured length into rem at the root's font size", () => {
  assert.equal(toRem(40), "2.5rem")
  assert.equal(toRem(-12, 16), "-0.75rem")
  assert.equal(toRem(30, 20), "1.5rem")
})
