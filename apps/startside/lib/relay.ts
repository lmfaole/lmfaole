// How the page reaches the relay (`workers/relay` at the repository's root, shared with medier): through the service binding `UPSTREAM` when the Worker has it (a call inside Cloudflare,
// never over the internet), else over its public address `UPSTREAM_URL`, and that too where the binding answers with Cloudflare's own
// origin errors, 520–530: called through the binding during a request to lmfaole.party, the relay's own fetch of api.github.com has
// ended in 525 (README «How it runs»), so the address is not optional. The shared key goes with either. Pure: the fetches are given.

export interface Fetcher {
  fetch(input: string, init?: RequestInit): Promise<Response>
}

export interface Relay {
  /** The service binding `UPSTREAM` (the Worker `medier-upstream`). */
  binding?: Fetcher
  /** The relay's public address, for `next dev` against the relay and as the fallback. */
  url?: string
  /** The shared key, `UPSTREAM_KEY`. */
  key?: string
}

/** The relay from the Worker's bindings and variables: the service binding, its address as the fallback, and the shared key. */
export const relayOf = (env: { UPSTREAM?: Fetcher; UPSTREAM_URL?: string; UPSTREAM_KEY?: string }): Relay => ({ binding: env.UPSTREAM, url: env.UPSTREAM_URL, key: env.UPSTREAM_KEY })

/** The address of a source on the relay: `/<host><path><query>`. */
export function relayPath(url: string): string {
  const target = new URL(url)
  return `/${target.host}${target.pathname}${target.search}`
}

/** Cloudflare's own errors for an origin it could not reach or read (520–530): the binding is tried, then the address. */
const unreachable = (status: number): boolean => status >= 520 && status <= 530

/** What a source is asked with. `next` is for `next dev` only, where the source is asked directly; the relay never sees it. */
export interface SourceInit {
  method?: string
  body?: string
  headers?: Record<string, string>
  signal?: AbortSignal
  next?: { revalidate: number }
}

/** The source's host, for the log. */
const host = (url: string): string => new URL(url).host

/**
 * Asks the relay for `url`, or `null` where there is no relay at all (no key: `next dev`): then the caller asks the source itself.
 * With a key there is never a way round the relay: neither a binding nor an address is an error, not a direct fetch, since a direct
 * fetch from a Worker on lmfaole.party ends in 525 for GitHub. `init` is what the source is asked with; its `Authorization` is
 * dropped, since the relay holds GitHub's token.
 */
export async function viaRelay(
  url: string,
  init: SourceInit,
  relay: Relay,
  fetchUrl: (input: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<Response | null> {
  if (!relay.key) return null
  if (relay.binding === undefined && !relay.url) throw new Error("Reléet er ikke tilgjengelig: UPSTREAM_KEY er satt, men verken bindingen UPSTREAM eller UPSTREAM_URL")
  const headers: Record<string, string> = { ...init.headers, "X-Upstream-Key": relay.key }
  delete headers.Authorization
  const request = (): RequestInit => ({ ...(init.method === undefined ? {} : { method: init.method }), ...(init.body === undefined ? {} : { body: init.body }), ...(init.signal === undefined ? {} : { signal: init.signal }), headers })
  const path = relayPath(url)
  const address = relay.url ? `${relay.url.replace(/\/$/, "")}${path}` : null
  if (relay.binding !== undefined) {
    try {
      // The host is the binding's to ignore; the relay reads only the path.
      const response = await relay.binding.fetch(`https://relay.internal${path}`, request())
      if (!unreachable(response.status)) return response
      // `X-Relay` is set by the relay on what it passes on: without it, the binding itself failed; with it, the relay's own fetch of the source did.
      const from = response.headers.get("X-Relay") === null ? "bindingen" : "kilden bak reléet"
      console.warn(`Reléet via binding svarte ${response.status} for ${host(url)} (fra ${from})${address === null ? "" : "; prøver adressen"}`)
      if (address === null) return response
    } catch (error) {
      if (address === null) throw error
      console.warn(`Reléet via binding feilet for ${host(url)}; prøver adressen`, error)
    }
  } else {
    console.warn(`Ingen binding UPSTREAM her; ${host(url)} hentes gjennom reléets adresse`)
  }
  return fetchUrl(address as string, request())
}

/**
 * Asks a source: through the relay when there is one (`viaRelay`), and straight to the source only where there is no relay at all
 * (`next dev`). The one place a source is fetched: `lib/upstream.ts` and the cron in `worker.mjs` both ask through it (a test holds every other file to it).
 */
export async function askSource(url: string, init: SourceInit, relay: Relay, fetchUrl: (input: string, init: RequestInit) => Promise<Response> = fetch): Promise<Response> {
  const relayed = await viaRelay(url, init, relay, fetchUrl)
  if (relayed !== null) return relayed
  const response = await fetchUrl(url, init as RequestInit)
  if (unreachable(response.status)) console.warn(`${host(url)} svarte ${response.status} uten relé`)
  return response
}
