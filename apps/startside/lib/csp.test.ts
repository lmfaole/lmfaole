import { strict as assert } from "node:assert"
import { test } from "node:test"

import { contentSecurityPolicy } from "./csp.ts"

const analytics = { script: "https://static.cloudflareinsights.com", connect: "https://cloudflareinsights.com" }

test("the policy keeps its limits and lets in Web Analytics' beacon and nothing else outside", () => {
  const directives = Object.fromEntries(contentSecurityPolicy({ accessTeamDomain: "https://team.cloudflareaccess.com", analytics }).split("; ").map((d) => [d.split(" ")[0], d]))
  assert.equal(directives["frame-ancestors"], "frame-ancestors 'none'")
  assert.equal(directives["object-src"], "object-src 'none'")
  assert.equal(directives["form-action"], "form-action 'self' https://team.cloudflareaccess.com")
  assert.match(directives["img-src"], /^img-src 'self' data: blob: https:\/\/github\.com /)
  assert.doesNotMatch(directives["img-src"], /\*|https:(?:\s|$)/)
  assert.equal(directives["script-src"], "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com")
  assert.equal(directives["connect-src"], "connect-src 'self' https://cloudflareinsights.com")
})

test("without Access, forms go only to the page", () => {
  assert.match(contentSecurityPolicy({ analytics }), /form-action 'self';/)
})
