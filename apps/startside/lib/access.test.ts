import { strict as assert } from "node:assert"
import { test } from "node:test"

import { claimsValid, isPublicPath, keyStore, verifyAccessJwt } from "./access.ts"

const CONFIG = { issuer: "https://team.cloudflareaccess.com", audience: "app-aud" }
const NOW = 1_800_000_000

const b64 = (bytes: Uint8Array | string): string => Buffer.from(bytes).toString("base64url")

const pair = (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair
const other = (await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"])) as CryptoKeyPair
const jwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "k1" }
const keys = keyStore(async () => ({ keys: [jwk] }))

async function sign(payload: Record<string, unknown>, { header = { alg: "RS256", kid: "k1", typ: "JWT" } as Record<string, unknown>, key = pair.privateKey } = {}): Promise<string> {
  const signed = `${b64(JSON.stringify(header))}.${b64(JSON.stringify(payload))}`
  const signature = new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(signed)))
  return `${signed}.${b64(signature)}`
}

const good = { iss: CONFIG.issuer, aud: [CONFIG.audience], exp: NOW + 600, nbf: NOW - 10, iat: NOW - 10, email: "a@b.no" }
const verify = (token: string): Promise<boolean> => verifyAccessJwt(token, CONFIG, keys, NOW)

test("a token Access signed for this application is let in, with aud as a list or a string", async () => {
  assert.equal(await verify(await sign(good)), true)
  assert.equal(await verify(await sign({ ...good, aud: CONFIG.audience })), true)
})

test("an expired, not yet valid, other application's or other issuer's token is not", async () => {
  assert.equal(await verify(await sign({ ...good, exp: NOW - 120 })), false)
  assert.equal(await verify(await sign({ ...good, nbf: NOW + 120 })), false)
  assert.equal(await verify(await sign({ ...good, aud: ["other-aud"] })), false)
  assert.equal(await verify(await sign({ ...good, iss: "https://evil.cloudflareaccess.com" })), false)
  assert.equal(await verify(await sign({ ...good, exp: undefined })), false)
})

test("a bad signature, an unknown key, alg none or HS256, and garbage are not", async () => {
  assert.equal(await verify(await sign(good, { key: other.privateKey })), false)
  assert.equal(await verify(await sign(good, { header: { alg: "RS256", kid: "nope" } })), false)
  const [head, body] = (await sign(good)).split(".")
  assert.equal(await verify(`${b64(JSON.stringify({ alg: "none", kid: "k1" }))}.${body}.`), false)
  assert.equal(await verify(`${b64(JSON.stringify({ alg: "none", kid: "k1" }))}.${body}.${b64("x")}`), false)
  assert.equal(await verify(await sign(good, { header: { alg: "HS256", kid: "k1" } })), false)
  assert.equal(await verify(`${head}.${body}`), false)
  assert.equal(await verify("not a token"), false)
  assert.equal(await verify(""), false)
})

test("claims: a little leeway for clocks, and the audience must match exactly", () => {
  assert.equal(claimsValid({ ...good, exp: NOW - 30 }, CONFIG, NOW), true)
  assert.equal(claimsValid({ ...good, aud: "app-aud-and-more" }, CONFIG, NOW), false)
})

test("the keys are fetched once, again for an unknown kid, and a failed fetch lets nothing in but is tried again", async () => {
  let time = 0
  let calls = 0
  let fail = true
  const store = keyStore(async () => {
    calls += 1
    if (fail) throw new Error("down")
    return { keys: [jwk] }
  }, { retry: 10_000, clock: () => time })
  assert.equal(await store("k1"), null)
  fail = false
  assert.equal(await store("k1"), null, "not asked again at once")
  time = 10_000
  assert.ok(await store("k1"))
  assert.ok(await store("k1"))
  assert.equal(calls, 2)
  time = 20_000
  assert.equal(await store("new"), null)
  assert.equal(calls, 3)
})

test("requests that come together while the keys are fetched all wait for them", async () => {
  const store = keyStore(async () => ({ keys: [jwk] }))
  const [a, b] = await Promise.all([store("k1"), store("k1")])
  assert.ok(a && b)
})

test("only the manifest, the icons and the embedded built files are open", () => {
  for (const path of ["/start/manifest.webmanifest", "/start/icon.png", "/start/apple-icon.png"]) assert.equal(isPublicPath(path, false), true)
  assert.equal(isPublicPath("/start/icons/icon-192.png", true), true)
  assert.equal(isPublicPath("/start/_next/static/chunks/a.js", true), true)
  assert.equal(isPublicPath("/start/_next/static/chunks/a.js", false), false)
  for (const path of ["/start", "/start/", "/start/pull-requests/a/b/1", "/start/icon.png/x", "/start/sw.js", "/start/api/x"]) assert.equal(isPublicPath(path, true), false)
})
