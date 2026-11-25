import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

const components = join(import.meta.dirname, "components")
const source = (name: string): string => readFileSync(join(components, name), "utf8")
const files = readdirSync(components).filter((name) => name.endsWith(".tsx"))

test("the page's main picture is lit, and carries the light's source with it (Foundations / Light and shadow, «Where the light goes»)", () => {
  const picture = source("internal/picture-frame.tsx")
  assert.match(picture, /lit && 'lit-frame'/)
  assert.match(picture, /const lit = LIT_SIZES\.includes\(size\)/)
  assert.match(picture, /<LightSource \/>/)
})

test("the main picture is lit on its frame, outside the picture: nothing of the light is painted over it, except by the disc", () => {
  const css = readFileSync(join(import.meta.dirname, "light.css"), "utf8")
  const frame = css.match(/\.lit-frame \{([^}]*)\}/)?.[1] ?? ""
  assert.match(frame, /box-shadow/)
  assert.doesNotMatch(frame, /background|::after|::before|mix-blend/)
  const painters = files.filter((name) => /light-sheen/.test(source(name)))
  assert.deepEqual(painters, ["disc.tsx"], "a reflection over a picture is the disc's alone (a source's terms may forbid an overlay)")
})

test("the card of what plays now offers the tilt once, and the answer is kept so a reader is not asked at every visit", () => {
  assert.match(source("now-playing-card.tsx"), /<TiltButton \/>/)
  const input = readFileSync(join(import.meta.dirname, "lib", "light-input.ts"), "utf8")
  assert.match(input, /resolveTiltPreference/, "the page's data-tilt first, then what the browser kept")
  assert.match(input, /writeTiltPreference/)
})

test("a visitor who turned the effects off gets no WebGL context: every part that takes a slot asks first", () => {
  const takers = files.filter((name) => /acquireGlSlot\(\)/.test(source(name)))
  assert.ok(takers.length >= 3)
  for (const name of takers) {
    const text = source(name)
    const asks = text.indexOf("effectsEnabled(")
    assert.ok(asks !== -1 && asks < text.indexOf("acquireGlSlot()"), `${name} asks effectsEnabled() before it takes a GL slot`)
  }
})

test("the guide says where the light goes", () => {
  const guide = readFileSync(join(import.meta.dirname, "..", "stories", "foundations", "Light-and-shadow.mdx"), "utf8")
  assert.match(guide, /## \d+\. Where the light goes/)
})

test("the head of a page of a thing is the page's h1 with the lit main picture and a backdrop that draws only when the light changes", () => {
  const header = source("detail-header.tsx")
  assert.match(header, /<Heading level=\{1\}/)
  assert.match(header, /size="hero"/)
  assert.match(header, /<Stage /)
  assert.match(source("stage.tsx"), /<AmbientBackdrop/)
  assert.match(source("now-playing-card.tsx"), /<Stage /)
  assert.match(source("weather-stage.tsx"), /<Stage /)
  const backdrop = source("ambient-backdrop.tsx")
  assert.match(backdrop, /lightStore\.listeners\.add/)
  // One frame for a change of light, and one that goes on only while the colours go over to a new picture's (`from !== null`): nothing else asks for a frame, so at rest nothing loops.
  assert.equal(backdrop.match(/requestAnimationFrame\(/g)?.length, 2)
  assert.match(backdrop, /if \(from !== null\) raf = requestAnimationFrame\(draw\)/)
})

test("the backdrop's strength in the component is the one the contrast test measured", async () => {
  const { BACKDROP_OPACITY } = await import("./lib/palette.ts")
  const backdrop = source("ambient-backdrop.tsx")
  assert.ok(backdrop.includes(`opacity-${Math.round(BACKDROP_OPACITY.light * 100)} dark:opacity-${Math.round(BACKDROP_OPACITY.dark * 100)}`))
})

test("the sleeve in 3D is only drawn when the light changes (and once as the record slides out), has a slot in the WebGL budget, and falls back to the cover alone", () => {
  const sleeve = source("album-sleeve.tsx")
  assert.equal(sleeve.match(/requestAnimationFrame\(/g)?.length, 1, "the one frame it asks for is the draw the light asked for, and the slide out goes on through it")
  assert.match(sleeve, /if \(out < 1 \|\| spin\.moving\(\)\) schedule\(\)/, "the record slides out once and a hand's spin settles, and the frames stop when both are still")
  assert.match(sleeve, /acquireGlSlot\(\)/)
  assert.match(sleeve, /lightStore\.listeners\.add/)
  assert.match(sleeve, /<PictureFrame ratio=\{dvd \? "poster" : "square"\} size=\{cased && size === "hero" \? "fill" : size\} corners="sharp"/, "the cover (or the poster) alone is the lit main picture, at the sleeve's size")
  assert.match(sleeve, /size\?: "hero" \| "feature"/, "only the lit sizes")
  assert.match(sleeve, /prefers-reduced-motion/)
  assert.match(source("detail-header.tsx"), /const held = ratio === "poster" \? \(isGameCase\(disc\) \? disc : "dvd"\) : disc === "cd" \? "cd" : "record"/, "a poster's sleeve is a DVD case (or a game's case), a square's a record's (or a CD's)")
  assert.match(source("detail-header.tsx"), /disc = "record"/, "a square's sleeve is a record's unless the page says it is a CD")
})

test("the disc is a mesh with a thickness that reflects a studio, and it is still drawn with a slot and a CSS version", () => {
  const shader = readFileSync(join(import.meta.dirname, "lib", "disc-shader.ts"), "utf8")
  assert.match(shader, /discMesh\(/)
  assert.match(shader, /vec3 env\(vec3 d\)/)
  assert.match(shader, /reflect\(-V,N\)/)
  assert.match(source("disc.tsx"), /acquireGlSlot\(\)/)
  assert.match(source("disc.tsx"), /light-sheen/)
})
