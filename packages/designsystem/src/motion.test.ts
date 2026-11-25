import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

const motion = readFileSync(join(import.meta.dirname, "motion.css"), "utf8")

test("an entrance moves and never fades", () => {
  const rise = motion.match(/@keyframes motion-rise \{([^}]*\{[^}]*\}[^}]*)\}/)?.[1] ?? ""
  assert.match(rise, /transform/)
  assert.doesNotMatch(rise, /opacity/)
})

test("no animation of the system loops for ever (WCAG 2.2.2: a loop stops within five seconds), but the disc of a record playing now", () => {
  const theme = readFileSync(join(import.meta.dirname, "theme.css"), "utf8")
  const withoutDisc = motion.replace(/\.motion-disc \{[^}]*\}/, "")
  for (const css of [withoutDisc, theme]) assert.doesNotMatch(css, /\binfinite\b/)
  assert.match(motion, /\.motion-disc \{[^}]*infinite/)
  const reduced = motion.slice(motion.indexOf("@media (prefers-reduced-motion: reduce)"))
  assert.match(reduced, /\.motion-disc[^{]*\{\s*animation: none/)
})

test("every duration token lands at once under reduced motion", () => {
  const reduced = motion.slice(motion.indexOf("@media (prefers-reduced-motion: reduce)"))
  const durations = [...motion.matchAll(/^\s*(--motion-duration-[a-z]+): (?!var\()/gm)].map((match) => match[1] ?? "")
  assert.ok(durations.length >= 8)
  const missing = durations.filter((name) => !new RegExp(`${name}: 0\\.01ms`).test(reduced))
  assert.deepEqual(missing, [])
})

const ms = (value: string): number => (value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000)
const block = (selector: string): string => motion.match(new RegExp(`${selector.replace(/[[\]]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? ""
const token = (css: string, name: string): string => css.match(new RegExp(`${name}: ([^;]+);`))?.[1]?.trim() ?? ""

test("brand motion: each app's hue gives its accent, Medier's two beats on the light spring and Start's one rise with no overshoot", () => {
  const amber = block("[data-brand='amber']")
  assert.equal(token(amber, "--motion-brand-beats"), "2")
  assert.equal(token(amber, "--motion-brand-ease"), "var(--motion-ease-spring)")
  const teal = block("[data-brand='teal']")
  assert.equal(token(teal, "--motion-brand-beats"), "1")
  assert.equal(token(teal, "--motion-brand-ease"), "var(--motion-ease-enter)")
  assert.doesNotMatch(teal, /spring|linear\(/)
  for (const name of ["--motion-brand-duration", "--motion-brand-ease", "--motion-brand-distance", "--motion-brand-beats", "--motion-brand-beat"]) assert.match(motion.slice(0, motion.indexOf("[data-brand=")), new RegExp(`${name}:`))
})

test("a signature gesture, every beat and rest of it, is over within a second, and the celebration too", () => {
  const scale: Record<string, number> = { "var(--motion-duration-slow)": 400 }
  for (const css of [block(":root"), block("[data-brand='amber']"), block("[data-brand='teal']")]) {
    const durationOf = token(css, "--motion-brand-duration")
    if (durationOf === "") continue
    const duration = scale[durationOf] ?? ms(durationOf)
    const beats = Number(token(css, "--motion-brand-beats") || "1")
    const rest = ms(token(css, "--motion-brand-beat") || "0ms")
    assert.ok(beats * duration + (beats - 1) * rest <= 1000, css)
  }
  assert.ok(ms(token(block(":root"), "--motion-duration-celebrate")) <= 600)
})

test("under reduced motion no brand moves: the hues' accents land at once, and the marks and the drawn check stand still", () => {
  const reduced = motion.slice(motion.lastIndexOf("@media (prefers-reduced-motion: reduce)"))
  const tokens = motion.slice(motion.indexOf("@media (prefers-reduced-motion: reduce)"))
  assert.match(tokens, /\[data-brand\] \{\s*--motion-brand-duration: 0\.01ms;\s*--motion-brand-distance: 0rem;\s*--motion-brand-beat: 0ms;/)
  assert.ok(motion.indexOf("[data-brand] {") > motion.indexOf("[data-brand='teal']"), "the reduced block comes after the hues, so it wins")
  assert.match(reduced, /\.motion-draw,\s*\[data-mark-motion\],\s*\[data-mark-motion\] \* \{\s*animation: none/)
})

test("a mark's gesture plays once: no brand animation repeats beyond its beats", () => {
  const marks = motion.slice(motion.indexOf("[data-mark-motion='reveal']"), motion.indexOf(".motion-draw {"))
  assert.doesNotMatch(marks, /infinite/)
  assert.match(marks, /calc\(var\(--motion-brand-beats\) - 1\)/)
})
