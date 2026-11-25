// Cloudflare Access stands in front of the page; the Worker (worker.mjs) still checks the token Access signs for every request
// (`Cf-Access-Jwt-Assertion`), so a gap in Access's coverage does not open the page. Pure: the keys are given, nothing is fetched here.

export interface AccessConfig {
  /** The team domain, as the token's `iss` has it: `https://<team>.cloudflareaccess.com`. */
  issuer: string
  /** The application's AUD tag. */
  audience: string
}

/** The addresses Access lets through without a login (its bypass application «Startside – app-filer»), since browsers fetch them without the cookie. */
const OPEN_ROUTES = new Set(["/start/manifest.webmanifest", "/start/icon.png", "/start/apple-icon.png"])

/**
 * Whether a request may be answered without a token: the manifest and the icons, and the built files (`/_next/static`, no personal
 * data) only where they are one of the embedded files, so nothing else under those prefixes reaches Next unchecked.
 */
export function isPublicPath(pathname: string, embedded: boolean): boolean {
  if (OPEN_ROUTES.has(pathname)) return true
  return embedded && (pathname.startsWith("/start/_next/static/") || pathname.startsWith("/start/icons/"))
}

function base64url(text: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null
  const binary = atob(text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

function json(bytes: Uint8Array | null): Record<string, unknown> | null {
  if (bytes === null) return null
  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export interface Jwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  /** `header.payload`, the bytes the signature is over. */
  signed: Uint8Array
  signature: Uint8Array
}

/** A compact JWT taken apart, or `null` where it is not one. Nothing is checked yet. */
export function decodeJwt(token: string): Jwt | null {
  const parts = token.split(".")
  if (parts.length !== 3 || parts.some((part) => part === "")) return null
  const [head, body, sig] = parts as [string, string, string]
  const header = json(base64url(head))
  const payload = json(base64url(body))
  const signature = base64url(sig)
  if (header === null || payload === null || signature === null) return null
  return { header, payload, signed: new TextEncoder().encode(`${head}.${body}`), signature }
}

/** Whether the claims are Access's for this application and good now (`now` in seconds; `leeway` for clocks that differ a little). */
export function claimsValid(payload: Record<string, unknown>, config: AccessConfig, now: number, leeway = 60): boolean {
  if (payload.iss !== config.issuer) return false
  const aud = payload.aud
  if (!(aud === config.audience || (Array.isArray(aud) && aud.includes(config.audience)))) return false
  if (typeof payload.exp !== "number" || now > payload.exp + leeway) return false
  if (payload.nbf !== undefined && (typeof payload.nbf !== "number" || now < payload.nbf - leeway)) return false
  return true
}

/** Whether `token` is signed with one of Access's keys (RS256 only) and its claims hold. Never throws; anything odd is `false`. */
export async function verifyAccessJwt(token: string, config: AccessConfig, keyFor: (kid: string) => Promise<CryptoKey | null>, now = Date.now() / 1000): Promise<boolean> {
  try {
    const jwt = decodeJwt(token)
    if (jwt === null || jwt.header.alg !== "RS256" || typeof jwt.header.kid !== "string") return false
    const key = await keyFor(jwt.header.kid)
    if (key === null) return false
    const signed = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, jwt.signature as BufferSource, jwt.signed as BufferSource)
    return signed && claimsValid(jwt.payload, config, now)
  } catch {
    return false
  }
}

/** The RSA keys of a JWKS (`{ keys: [...] }`, as Access's `/cdn-cgi/access/certs` has it), by `kid`. */
export async function importJwks(jwks: unknown): Promise<Map<string, CryptoKey>> {
  const keys = new Map<string, CryptoKey>()
  const list = (jwks as { keys?: unknown } | null)?.keys
  if (!Array.isArray(list)) return keys
  for (const jwk of list as Record<string, unknown>[]) {
    if (jwk?.kty !== "RSA" || typeof jwk.kid !== "string" || typeof jwk.n !== "string" || typeof jwk.e !== "string") continue
    try {
      keys.set(jwk.kid, await crypto.subtle.importKey("jwk", { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]))
    } catch {
      // A key that cannot be read is left out.
    }
  }
  return keys
}

/**
 * Access's keys, kept: fetched again after `ttl`, or at once for a `kid` not seen (it rotates its keys), but not more often than
 * every `retry`, so a failing fetch is tried again soon without being asked on every request. Where a fetch fails, the keys
 * already had are used for up to `maxAge`; with none, nothing is let in.
 */
export function keyStore(load: () => Promise<unknown>, { ttl = 3_600_000, retry = 10_000, maxAge = 86_400_000, clock = Date.now } = {}): (kid: string) => Promise<CryptoKey | null> {
  let keys = new Map<string, CryptoKey>()
  let fetchedAt = -Infinity
  let triedAt = -Infinity
  let pending: Promise<void> | null = null
  const refresh = async (): Promise<void> => {
    triedAt = clock()
    try {
      const fresh = await importJwks(await load())
      if (fresh.size > 0) {
        keys = fresh
        fetchedAt = clock()
      }
    } catch {
      // Tried again after `retry`.
    }
  }
  return async (kid) => {
    const now = clock()
    if ((now - fetchedAt > ttl || !keys.has(kid)) && now - triedAt >= retry) {
      pending ??= refresh().finally(() => {
        pending = null
      })
    }
    if (pending !== null) await pending
    if (clock() - fetchedAt > maxAge) return null
    return keys.get(kid) ?? null
  }
}
