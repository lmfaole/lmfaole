// How the page reaches the relay (`upstream/`): through the service binding `UPSTREAM` when the Worker has it (a call inside Cloudflare,
// never over the internet), else over its public address `UPSTREAM_URL` (and that too where the binding answers with Cloudflare's own
// origin errors, 520–530, so a binding that cannot reach out never takes the page down). The shared key goes with either. Pure: the fetches are given.

export interface Fetcher {
  fetch(input: string, init?: RequestInit): Promise<Response>
}

export interface Relay {
  /** The service binding `UPSTREAM` (`startside-upstream`). */
  binding?: Fetcher
  /** The relay's public address, for `next dev` against the relay and as the fallback. */
  url?: string
  /** The shared key, `UPSTREAM_KEY`. */
  key?: string
}

/** The address of a source on the relay: `/<host><path><query>`. */
export function relayPath(url: string): string {
  const target = new URL(url)
  return `/${target.host}${target.pathname}${target.search}`
}

/** Cloudflare's own errors for an origin it could not reach or read (520–530): the binding is tried, then the address. */
const unreachable = (status: number): boolean => status >= 520 && status <= 530

/**
 * Asks the relay for `url`, or `null` where no relay is set (no key, or neither a binding nor an address): then the caller asks the source itself.
 * `init` is what the source is asked with; its `Authorization` is dropped, since the relay holds GitHub's token.
 */
export async function viaRelay(
  url: string,
  init: { method?: string; body?: string; headers?: Record<string, string>; signal?: AbortSignal },
  relay: Relay,
  fetchUrl: (input: string, init: RequestInit) => Promise<Response> = fetch,
): Promise<Response | null> {
  if (!relay.key || (relay.binding === undefined && !relay.url)) return null
  const headers: Record<string, string> = { ...init.headers, "X-Upstream-Key": relay.key }
  delete headers.Authorization
  const request = (): RequestInit => ({ ...(init.method === undefined ? {} : { method: init.method }), ...(init.body === undefined ? {} : { body: init.body }), ...(init.signal === undefined ? {} : { signal: init.signal }), headers })
  const path = relayPath(url)
  const address = relay.url ? `${relay.url.replace(/\/$/, "")}${path}` : null
  if (relay.binding !== undefined) {
    try {
      // The host is the binding's to ignore; the relay reads only the path.
      const response = await relay.binding.fetch(`https://startside-upstream${path}`, request())
      if (address === null || !unreachable(response.status)) return response
      console.warn(`Reléet via binding svarte ${response.status}; prøver adressen`)
    } catch (error) {
      if (address === null) throw error
      console.warn("Reléet via binding feilet; prøver adressen", error)
    }
  }
  return fetchUrl(address as string, request())
}
