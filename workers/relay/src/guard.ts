// The relay's checks, apart from the handler so a test can hold them: the key, the size of a POST's body, and that a GraphQL query only reads.

/** The keys the relay takes: `UPSTREAM_KEY`, and while a new one is handed out also `UPSTREAM_KEY_NEXT` (README «Nøkkelen»). An empty one is none. */
export function keysOf(env: { UPSTREAM_KEY?: string | undefined; UPSTREAM_KEY_NEXT?: string | undefined }): string[] {
  return [env.UPSTREAM_KEY, env.UPSTREAM_KEY_NEXT].filter((key): key is string => typeof key === "string" && key !== "")
}

/** `timingSafeEqual` is Workers' own (`crypto.subtle`), not the web's: a loop that does not stop at the first difference where it is missing (node's tests). */
function equal(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const own = (crypto.subtle as unknown as { timingSafeEqual?: (a: ArrayBuffer, b: ArrayBuffer) => boolean }).timingSafeEqual
  if (typeof own === "function") return own.call(crypto.subtle, a, b)
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

/**
 * Whether `given` is one of `keys`, in a time that does not tell how much of it was right: both sides are hashed (so the lengths are the same), and every
 * key is compared, also after one matched.
 */
export async function knownKey(given: string | null, keys: readonly string[]): Promise<boolean> {
  if (given === null || keys.length === 0) return false
  const encoder = new TextEncoder()
  const digest = (text: string): Promise<ArrayBuffer> => crypto.subtle.digest("SHA-256", encoder.encode(text))
  const [asked, ...known] = await Promise.all([digest(given), ...keys.map(digest)])
  let found = false
  for (const key of known) found = equal(asked as ArrayBuffer, key) || found
  return found
}

/** The largest body a POST may have (a GraphQL query, Spotify's token form). */
export const BODY_MAX = 64 * 1024

/** The body of a POST as text, or `null` where it is larger than `BODY_MAX`. */
export async function smallBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length") ?? 0) > BODY_MAX) return null
  const text = await request.text()
  return new TextEncoder().encode(text).length > BODY_MAX ? null : text
}

/** Whether a GraphQL query only reads: no mutation or subscription outside its strings and comments (GitHub's token could otherwise write). */
export function readOnlyQuery(query: unknown): boolean {
  if (typeof query !== "string") return false
  const code = query.replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|#[^\n]*/g, " ")
  return !/(^|[^A-Za-z0-9_])(mutation|subscription)(?![A-Za-z0-9_])/.test(code)
}
