import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { SETTINGS } from "./settings.ts"

test("the workflow hands the deploy every GitHub secret and every key it uploads, and no other secret of the Worker", () => {
  const workflow = readFileSync(new URL("../../../../.github/workflows/medier.yml", import.meta.url), "utf8")
  for (const setting of SETTINGS) {
    const handed = new RegExp(`\\bsecrets\\.${setting.name}\\b`).test(workflow)
    assert.equal(handed, setting.where === "github" || setting.deploy === true, `${setting.name}: ${setting.where}`)
  }
})
