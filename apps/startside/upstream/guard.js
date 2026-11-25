// The relay's checks, apart from the Worker so they can be tested (worker.test.js) and the Worker exports only its handler.

/** Whether the key is the shared one, in a time that does not tell how much of it was right (both are hashed, so the lengths are the same). */
export async function sameKey(given, key) {
  if (typeof given !== "string" || typeof key !== "string" || key === "") return false
  const encoder = new TextEncoder()
  const [a, b] = await Promise.all([crypto.subtle.digest("SHA-256", encoder.encode(given)), crypto.subtle.digest("SHA-256", encoder.encode(key))])
  if (typeof crypto.subtle.timingSafeEqual === "function") return crypto.subtle.timingSafeEqual(a, b)
  const x = new Uint8Array(a)
  const y = new Uint8Array(b)
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i]
  return diff === 0
}

/** Whether a GraphQL query only reads: no mutation or subscription outside its strings and comments (the token could otherwise write). */
export function readOnlyQuery(query) {
  if (typeof query !== "string") return false
  const code = query.replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\\n])*"|#[^\n]*/g, " ")
  return !/(^|[^A-Za-z0-9_])(mutation|subscription)(?![A-Za-z0-9_])/.test(code)
}
