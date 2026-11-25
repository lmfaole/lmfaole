import { getCloudflareContext } from "@opennextjs/cloudflare"

import { freshSeconds, STALE_SECONDS, verdict } from "./cache-policy"
import { env, mocking } from "./env"
import { mockFetch } from "./mock"
import { askSource, type Fetcher, type Relay } from "./relay"
import { isFresh, readIndex, readSnapshot, requestKey, type Snapshot, type SnapshotIndex, type Store } from "./snapshot"

/** The relay as this Worker has it: the service binding `UPSTREAM`, the address `UPSTREAM_URL`, the shared key `UPSTREAM_KEY` (`lib/relay.ts`). */
function relay(): Relay {
  let binding: Fetcher | undefined
  try {
    binding = (getCloudflareContext().env as unknown as { UPSTREAM?: Fetcher }).UPSTREAM
  } catch {
    // Not running in a Worker.
  }
  return { binding, url: env("UPSTREAM_URL"), key: env("UPSTREAM_KEY") }
}

/** Whether the sources are asked through the relay (which holds GitHub's token), so the page needs no token of its own: wherever the key is set (`askSource`). */
export function throughRelay(): boolean {
  return Boolean(env("UPSTREAM_KEY"))
}

/**
 * Fetches a source: through the relay (`workers/relay` at the repository's root, by the service binding or its address) when it is set, as on lmfaole.party, where a Worker cannot
 * reach GitHub itself; straight to the source only where there is no relay key at all, as in `next dev` (`askSource`). Through the relay, the relay adds the GitHub token.
 */
async function fetchSource(url: string, init: { headers?: Record<string, string>; revalidate: number; /** How long past `revalidate` a kept answer may still be shown while it is asked for anew (default `STALE_SECONDS`; 0 for what must not be old, like what plays now). */ staleFor?: number; /** A JSON body makes it a POST (GitHub's GraphQL, which the relay allows). */ json?: unknown; /** A text body makes it a POST too (a form); the caller sets its Content-Type. */ body?: string }): Promise<Response> {
  if (mocking()) return mockFetch(url, init)
  const headers: Record<string, string> = { ...init.headers, ...(init.json === undefined ? {} : { "Content-Type": "application/json" }) }
  const post = init.json !== undefined ? { method: "POST", body: JSON.stringify(init.json) } : init.body !== undefined ? { method: "POST", body: init.body } : {}
  return askSource(url, { ...post, headers, next: { revalidate: init.revalidate } }, relay())
}

/** The snapshot the cron keeps in KV (`lib/snapshot.ts`), or none (as in `next dev`, or before the binding is there). */
function snapshotStore(): Store | undefined {
  try {
    return (getCloudflareContext().env as unknown as { SNAPSHOT?: Store }).SNAPSHOT
  } catch {
    return undefined
  }
}

/** The index is read once a half minute in an isolate, not once for each source a page asks. */
let index: { at: number; value: Promise<SnapshotIndex> } | undefined
function snapshotIndex(store: Store): Promise<SnapshotIndex> {
  const now = Date.now()
  if (index === undefined || now - index.at > 30_000) {
    const value = readIndex(store, 60).catch((): SnapshotIndex => ({ version: 1, entries: {} }))
    index = { at: now, value }
  }
  return index.value
}

async function snapshotFor(key: string): Promise<Snapshot | null> {
  const store = snapshotStore()
  if (store === undefined) return null
  try {
    return await readSnapshot(store, key, Date.now(), await snapshotIndex(store))
  } catch {
    return null
  }
}

/** The edge cache every Worker has next to its own requests; none in `next dev`, where a source is simply asked each time. */
const edgeCache = (): Cache | undefined => (typeof caches === "undefined" ? undefined : (caches as unknown as { default?: Cache }).default)

/**
 * Asks a source, and keeps an answer that was good in the edge cache (`revalidate` seconds fresh, then `STALE_SECONDS` more that may be shown at once while it is asked for anew in the background).
 * Next's own `revalidate` keeps nothing on Workers without an incremental cache, so without this every page, and every renewal of an open page, asked GitHub for everything again and waited.
 * An answer that is not ok is never kept. A request for the same address and the same body is the same question, whoever asks.
 */
export async function upstream(url: string, init: Parameters<typeof fetchSource>[1]): Promise<Response> {
  const cache = mocking() ? undefined : edgeCache()
  if (cache === undefined) return fetchSource(url, init)
  const staleFor = init.staleFor ?? STALE_SECONDS
  const id = await requestKey(url, init.json, init.body)
  const key = new Request(`https://startside.invalid/upstream/${id}`)
  const keep = async (body: ArrayBuffer | string, status: number, type: string, expires: string | null, modified: string | null, at?: { fetchedAt: number; ttl: number }): Promise<void> => {
    const now = at?.fetchedAt ?? Date.now()
    const ttl = at?.ttl ?? freshSeconds(init.revalidate, expires, now)
    const headers: Record<string, string> = { "Content-Type": type, "X-Fetched-At": String(now), "X-Fresh-For": String(ttl), "X-Upstream-Status": String(status), "Cache-Control": `public, max-age=${Math.max(1, Math.round(ttl + staleFor - (Date.now() - now) / 1000))}` }
    if (modified !== null) headers["X-Last-Modified"] = modified
    await cache.put(key, new Response(body, { status: 200, headers }))
  }
  const refresh = async (kept?: Response): Promise<Response> => {
    // Asked again with the time of what is kept, a source that has nothing new answers 304 and the kept answer is good for another while (MET asks for this).
    const modified = kept?.headers.get("X-Last-Modified") ?? null
    const response = await fetchSource(url, modified === null ? init : { ...init, headers: { ...init.headers, "If-Modified-Since": modified } })
    if (response.status === 304 && kept !== undefined) {
      const body = await kept.arrayBuffer()
      const type = kept.headers.get("Content-Type") ?? "application/json"
      const status = Number(kept.headers.get("X-Upstream-Status") ?? 200)
      await keep(body, status, type, response.headers.get("Expires"), modified)
      return status === 204 ? new Response(null, { status: 204 }) : new Response(body, { status, headers: { "Content-Type": type } })
    }
    if (!response.ok) return response
    // 204 («nothing is playing») may not have a body, so it is kept as a 200 that says it was a 204.
    const empty = response.status === 204
    const body = empty ? "" : await response.arrayBuffer()
    const type = response.headers.get("Content-Type") ?? "application/json"
    await keep(body, response.status, type, response.headers.get("Expires"), response.headers.get("Last-Modified"))
    return empty ? new Response(null, { status: 204 }) : new Response(body, { status: response.status, headers: { "Content-Type": type } })
  }
  const asKept = (found: Response): Response => (found.headers.get("X-Upstream-Status") === "204" ? new Response(null, { status: 204 }) : found)
  const found = await cache.match(key)
  const age = found === undefined ? Number.NaN : (Date.now() - Number(found.headers.get("X-Fetched-At"))) / 1000
  const state = found === undefined ? "expired" : verdict(age, Number(found.headers.get("X-Fresh-For") ?? init.revalidate), staleFor)
  if (found === undefined || state === "expired") {
    // Nothing good at this edge: the cron's snapshot in KV, when it is recent, then the source, and the snapshot again (up to a day old) when the source fails.
    const snapshot = init.json === undefined && init.body === undefined ? await snapshotFor(id) : null
    const fromSnapshot = (taken: Snapshot): Response => new Response(taken.status === 204 ? null : taken.body, { status: taken.status, headers: { "Content-Type": taken.type } })
    if (snapshot !== null && isFresh(snapshot)) {
      await keep(snapshot.body, snapshot.status, snapshot.type, null, snapshot.lastModified ?? null, { fetchedAt: snapshot.checkedAt, ttl: snapshot.freshFor })
      // Older than the source's own `revalidate` (issues are asked every minute, the cron comes every 15): shown at once, and asked anew behind it.
      if (Date.now() - snapshot.checkedAt > init.revalidate * 1000) {
        try {
          getCloudflareContext().ctx.waitUntil(refresh().catch(() => undefined))
        } catch {
          // No execution context: the snapshot stands until it is no longer fresh.
        }
      }
      return fromSnapshot(snapshot)
    }
    try {
      const response = await refresh(found)
      if (response.ok || response.status === 304 || snapshot === null) return response
    } catch (error) {
      if (snapshot === null) throw error
    }
    return fromSnapshot(snapshot as Snapshot)
  }
  if (state === "stale") {
    try {
      getCloudflareContext().ctx.waitUntil(refresh(found.clone()).catch(() => undefined))
    } catch {
      // No execution context to hand it to: the stale answer is shown, and the next ask fetches it.
    }
  }
  return asKept(found)
}
