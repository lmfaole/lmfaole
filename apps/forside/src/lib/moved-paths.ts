/**
 * Paths that moved. Forside owns `lmfaole.party/*`, so a request for an old path lands on its Worker; `movedTo` says where it went, so a
 * bookmark keeps working. The media pages are the `medier` Worker's now, at `/medier/` (its route `lmfaole.party/medier*` wins over this
 * one, so `/medier/…` never reaches this Worker). A path that never was ours returns `null` and is answered as usual.
 */

/** `[from, to]`: a path that moved and its new home, with the trailing slash the page serves. */
const MOVED: readonly (readonly [string, string])[] = [
  ['/media', '/medier/'],
  ['/alle-apper', '/medier/'],
  ['/musikk', '/medier/musikk/'],
  ['/film', '/medier/film/'],
]

/** Where `pathname` went, or `null` when it did not move. What came after an old app's path is dropped: the new app's addresses are its own. */
export function movedTo(pathname: string): string | null {
  for (const [from, to] of MOVED) if (pathname === from || pathname === `${from}/` || pathname.startsWith(`${from}/`)) return to
  return null
}
