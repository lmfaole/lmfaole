/** fetch for a Worker's run: the type the sync code takes (so a test can hand it `fakeFetch`), and the global fetch made safe to pass around, with a
 *  User-Agent, a timeout and retries when asked for. Pure apart from the fetch itself. */

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>

export interface FetchOptions {
  /** Sent where the request has no User-Agent of its own: a polite one names the site (`catalog (+https://lmfaole.party)`). */
  userAgent?: string
  /** Milliseconds before a request is given up (an `AbortSignal.timeout`, alongside the request's own signal). */
  timeout?: number
  /** Further tries of a GET or HEAD that failed on the network, timed out or was answered 429 or 5xx. Each try is a subrequest (50 a run on the free plan). */
  retries?: number
  /** The wait before the first retry, doubled for each one after, or the answer's `Retry-After` when that is shorter than a minute. 500 ms by default. */
  backoff?: number
  /** The fetch to wrap; the global one by default. */
  fetch?: typeof fetch
  /** How to wait; `setTimeout` by default (the tests make it instant). */
  sleep?: (ms: number) => Promise<void>
}

const RETRY_STATUS = (status: number): boolean => status === 429 || status >= 500

/**
 * The global fetch as a function of its own: workerd throws «Illegal invocation» when `fetch` is called as a method of something else (`options.fetch(…)`).
 * Without options it is only that.
 */
export function workerFetch(options: FetchOptions = {}): (input: string | URL | Request, init?: RequestInit) => Promise<Response> {
  const { userAgent, timeout, retries = 0, backoff = 500, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = options
  const inner = options.fetch ?? ((input: string | URL | Request, init?: RequestInit) => fetch(input, init))
  if (userAgent === undefined && timeout === undefined && retries === 0) return (input, init) => inner(input, init)
  return async (input, init) => {
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
    if (userAgent !== undefined && !headers.has("user-agent")) headers.set("user-agent", userAgent)
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase()
    const tries = method === "GET" || method === "HEAD" ? retries + 1 : 1
    for (let attempt = 1; ; attempt++) {
      const signals = [init?.signal, timeout === undefined ? undefined : AbortSignal.timeout(timeout)].filter((s): s is AbortSignal => s != null)
      const request: RequestInit = { ...init, headers }
      if (signals.length > 0) request.signal = AbortSignal.any(signals)
      let wait = backoff * 2 ** (attempt - 1)
      try {
        const response = await inner(input, request)
        if (attempt >= tries || !RETRY_STATUS(response.status)) return response
        const after = Number(response.headers.get("retry-after"))
        if (after > 0 && after < 60) wait = after * 1000
      } catch (error) {
        if (attempt >= tries || init?.signal?.aborted) throw error
      }
      await sleep(wait)
    }
  }
}
