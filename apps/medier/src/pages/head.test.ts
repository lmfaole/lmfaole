import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

const pages = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? pages(join(dir, entry.name)) : entry.name.endsWith(".astro") ? [join(dir, entry.name)] : []))

test("a page of a detail component has its own head, the design system's DetailHeader as an island, and no other title", () => {
  const detail = pages(import.meta.dirname).filter((file) => /components\/detail'/.test(readFileSync(file, "utf8")))
  assert.ok(detail.length >= 5)
  const missing = detail.filter((file) => {
    const source = readFileSync(file, "utf8")
    return !/<Head client:idle /.test(source) || !/<Page\s+bare\b/.test(source)
  })
  assert.deepEqual(missing, [], "the head is the page's <h1> and must be hydrated (the detail components are not), and the page's own title is left out with `bare`")
})
