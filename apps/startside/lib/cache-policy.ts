/**
 * What to do with an answer that is kept at the edge (`upstream.ts`): show it as it is while it is good (`fresh`); show it at once and ask the source again in the
 * background while it is a little old (`stale`), so a page never waits for GitHub when it has seen the answer lately; or ask and wait (`expired`). Pure, so a test pins the limits.
 */
export type Verdict = "fresh" | "stale" | "expired"

/** `age` is how many seconds ago the answer was fetched, `ttl` how long it is good, `staleFor` how much longer it may still be shown while it is fetched anew. */
export function verdict(age: number, ttl: number, staleFor: number): Verdict {
  if (!Number.isFinite(age) || age < 0) return "expired"
  if (age < ttl) return "fresh"
  return age < ttl + staleFor ? "stale" : "expired"
}

/** How long a kept answer may be shown after its `ttl`, while it is fetched anew: the lists of a page that was open ten minutes ago are still a good first picture. */
export const STALE_SECONDS = 600

/**
 * How many seconds an answer is good: `revalidate`, or longer when the source says in `Expires` that it has nothing new before then (MET asks that a forecast is not
 * fetched again before it expires). An `Expires` that cannot be read, or that is past, changes nothing.
 */
export function freshSeconds(revalidate: number, expires: string | null, now: number): number {
  const until = expires === null ? Number.NaN : Date.parse(expires)
  return Number.isFinite(until) ? Math.max(revalidate, Math.round((until - now) / 1000)) : revalidate
}
