/**
 * The security headers of every answer of an app: the Worker's (`secured` in `middleware.ts`) and the built files' (the app's `public/_headers`, which
 * must say the same: `testHeadersFile` in `testing.ts`). Nothing is loaded from another site, so everything is `'self'`; inline scripts and styles are
 * Astro's islands and hydration. Pure.
 */

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
}

/** Sets the headers an answer does not already have: these, or an app's own (medier's policy lets in the analytics beacon). */
export function secure(headers: Headers, rules: Readonly<Record<string, string>> = SECURITY_HEADERS): void {
  for (const [name, value] of Object.entries(rules)) if (!headers.has(name)) headers.set(name, value)
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

/** A `_headers` file that gives the built files under `pattern` the security headers, after a comment that says why (`npm run new-app` writes it). */
export function headersFile(pattern: string, comment: string): string {
  return [`# ${comment}`, pattern, ...Object.entries(SECURITY_HEADERS).map(([name, value]) => `  ${name}: ${value}`), ''].join('\n')
}
