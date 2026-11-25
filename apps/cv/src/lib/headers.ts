/**
 * The security headers of every answer: the Worker's (`src/middleware.ts`) and the built files' (`public/_headers`, which must say the same:
 * `headers.test.ts`). Nothing is loaded from another site, so everything is `'self'`; inline scripts and styles are Astro's islands and hydration.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
}

/** Sets the headers an answer does not already have. */
export function secure(headers: Headers): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) if (!headers.has(name)) headers.set(name, value)
}

/** The headers of one path pattern in a `_headers` file. */
export function headersFileRules(text: string, pattern: string): Record<string, string> {
  const rules: Record<string, string> = {}
  let inside = false
  for (const line of text.split('\n')) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue
    if (!/^\s/.test(line)) {
      inside = line.trim() === pattern
      continue
    }
    if (!inside) continue
    const colon = line.indexOf(':')
    rules[line.slice(0, colon).trim()] = line.slice(colon + 1).trim()
  }
  return rules
}
