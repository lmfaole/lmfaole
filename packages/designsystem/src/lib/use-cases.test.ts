import { strict as assert } from "node:assert"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { test } from "node:test"

import { PLANNED, USE_CASES, withUseCaseTable } from "./use-cases.ts"

const root = join(import.meta.dirname, "../..")

test("the README and the components skill show the decision table as use-cases.ts has it (npm run use-cases)", () => {
  for (const file of ["README.md", ".claude/skills/designsystem-components/SKILL.md"]) {
    const text = readFileSync(join(root, file), "utf8")
    assert.equal(text, withUseCaseTable(text), `${file} differs from src/lib/use-cases.ts: run npm run use-cases`)
  }
})

test("a planned name is not there yet: the group that adds it takes it off PLANNED", () => {
  const components = join(root, "src/components")
  const source = readdirSync(components, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => readFileSync(join(components, file), "utf8"))
    .join("\n")
  for (const name of Object.keys(PLANNED)) assert.doesNotMatch(source, new RegExp(`export (?:function|const) ${name}\\b`), `${name} exists: remove it from PLANNED`)
})

test("every use case names a component", () => {
  for (const { when, use } of USE_CASES) assert.match(use, /`[A-Z]/, when)
})
