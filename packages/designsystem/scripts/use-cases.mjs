#!/usr/bin/env node
// Writes the decision table of src/lib/use-cases.ts into the README and the designsystem-components skill.
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { withUseCaseTable } from "../src/lib/use-cases.ts"

const root = join(import.meta.dirname, "..")
for (const file of ["README.md", ".claude/skills/designsystem-components/SKILL.md"]) {
  const path = join(root, file)
  const before = readFileSync(path, "utf8")
  const after = withUseCaseTable(before)
  if (after !== before) writeFileSync(path, after)
  console.log(after === before ? `${file}: unchanged` : `${file}: written`)
}
