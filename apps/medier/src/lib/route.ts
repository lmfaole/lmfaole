/**
 * Which way an ask to a source goes (`runtime.ts`'s `ask`), pure so a test pins it. The relay (`upstream/`) is a Worker of the same account, so the site asks it through a
 * service binding (`UPSTREAM` in `wrangler.jsonc`): Worker to Worker, never over the public internet. A relay's address (`UPSTREAM_URL`) is the way where there is no
 * binding (a mock, a run without one); without a relay at all (`astro dev` with no settings) the source is asked directly. The key the two share goes with every ask to the
 * relay, by either way: the relay still says no without it.
 */

/** A service binding of the Worker, as far as it is used here. */
export interface Service {
  fetch(input: string, init?: RequestInit): Promise<Response>
}

export const asService = (value: unknown): Service | null =>
  typeof value === "object" && value !== null && typeof (value as { fetch?: unknown }).fetch === "function" ? (value as Service) : null

/** The relay's address through its binding: a binding is given the whole request, and only the path (`/<host>/<path>`) is read, so the host is a name of no one's. */
const BOUND_RELAY = "https://medier-upstream.internal"

export type Route =
  /** The relay, through its binding. */
  | { via: "upstream"; url: string; key: string }
  /** The relay, at its public address. */
  | { via: "relay"; url: string; key: string }
  /** The source itself. */
  | { via: "direct"; url: string }

export interface Ways {
  /** Whether the Worker has the `UPSTREAM` binding. */
  upstream: boolean
  /** `UPSTREAM_URL`. */
  relay: string | undefined
  /** `UPSTREAM_KEY`. */
  key: string | undefined
}

const through = (base: string, target: URL): string => `${base.replace(/\/$/, "")}/${target.host}${target.pathname}${target.search}`

export function routeOf(url: string, ways: Ways): Route {
  const target = new URL(url)
  const key = ways.key === undefined || ways.key === "" ? undefined : ways.key
  if (key !== undefined && ways.upstream) return { via: "upstream", url: through(BOUND_RELAY, target), key }
  if (key !== undefined && ways.relay !== undefined && ways.relay !== "") return { via: "relay", url: through(ways.relay, target), key }
  return { via: "direct", url }
}
