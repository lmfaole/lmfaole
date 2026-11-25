import assert from "node:assert/strict"
import { test } from "node:test"
import { parseEnvFile } from "./env.ts"

test("env files: export, quotes, comments on a line and after an unquoted value, empty values", () => {
  const text = '# books\nHARDCOVER_TOKEN="Bearer a=b # not a comment"\nexport OTHER=x # note\n  SINGLE=\'y\'\nEMPTY=\nnot a line\n'
  assert.deepEqual(Object.fromEntries(parseEnvFile(text)), { HARDCOVER_TOKEN: "Bearer a=b # not a comment", OTHER: "x", SINGLE: "y", EMPTY: "" })
})
