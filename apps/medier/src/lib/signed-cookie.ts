/**
 * The username cookies are signed by the site (HMAC-SHA256 with the Worker's `COOKIE_SECRET`), so only a name the site checked with its service (`/api/brukernavn/`, `/api/innstillinger/`)
 * is asked about with the site's keys: a cookie made by hand is no username. `<name>.<signature>`, the signature base64url (no `.`); a name may have a `.`, so it is split at the last one.
 * The signature covers the cookie's name too, so one service's cookie is not another's. Pure (Web Crypto), with a test.
 */

import { cleanUsername, COOKIE, SERVICES, type Users } from "./users.ts"

const encoder = new TextEncoder()

const hmacKey = (secret: string): Promise<CryptoKey> => crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])

const toBase64url = (bytes: ArrayBuffer): string => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

function fromBase64url(text: string): Uint8Array<ArrayBuffer> | null {
  if (!/^[A-Za-z0-9_-]+$/.test(text)) return null
  try {
    return Uint8Array.from(atob(text.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0))
  } catch {
    return null
  }
}

/** The cookie's value for `value` under `name`: the value and its signature. */
export async function sign(name: string, value: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(`${name}=${value}`))
  return `${value}.${toBase64url(signature)}`
}

/** The value of a signed cookie, or `null` for one without a signature or with a wrong one (checked in constant time, by `crypto.subtle.verify`). */
export async function verify(name: string, cookie: string | undefined, secret: string): Promise<string | null> {
  if (cookie === undefined) return null
  const at = cookie.lastIndexOf(".")
  if (at < 1) return null
  const value = cookie.slice(0, at)
  const signature = fromBase64url(cookie.slice(at + 1))
  if (signature === null || signature.length !== 32) return null
  return (await crypto.subtle.verify("HMAC", await hmacKey(secret), signature, encoder.encode(`${name}=${value}`))) ? value : null
}

/** The usernames in a request's cookies that the site signed; any other is none. */
export async function readSignedUsers(cookie: (name: string) => string | undefined, secret: string): Promise<Users> {
  const names = await Promise.all(SERVICES.map(async (service) => [service, cleanUsername(await verify(COOKIE[service], cookie(COOKIE[service]), secret))] as const))
  return Object.fromEntries(names) as unknown as Users
}
