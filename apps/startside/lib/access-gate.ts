// Whether a request carries Cloudflare Access's token for this app (`Cf-Access-Jwt-Assertion`, checked by lib/access.ts): asked by the
// Worker (worker.mjs) of every request but the public files, and again by the endpoints that write (app/api/logg), so a write is never
// taken on the Worker's word alone. Access's signing keys are kept between requests, fetched straight from Access or through the relay
// if a Worker on this zone cannot reach it.

import { keyStore, verifyAccessJwt } from "./access.ts"
import { viaRelay, type Fetcher, type Relay } from "./relay.ts"

export interface GateEnv {
  ACCESS_TEAM_DOMAIN?: string
  ACCESS_AUD?: string
  /** `1` only in `.dev.vars`, for `npm run preview`, which has no Access in front. Never in wrangler.jsonc or as a secret. */
  ACCESS_SKIP?: string
  UPSTREAM?: Fetcher
  UPSTREAM_URL?: string
  UPSTREAM_KEY?: string
}

/** The relay (lib/relay.ts): the service binding, its address as the fallback, and the shared key. */
export const relayOf = (env: GateEnv): Relay => ({ binding: env.UPSTREAM, url: env.UPSTREAM_URL, key: env.UPSTREAM_KEY })

let keys: ((kid: string) => Promise<CryptoKey | null>) | undefined
let keysFor: string | undefined

function accessKeys(env: GateEnv & { ACCESS_TEAM_DOMAIN: string }) {
  if (keys === undefined || keysFor !== env.ACCESS_TEAM_DOMAIN) {
    keysFor = env.ACCESS_TEAM_DOMAIN
    keys = keyStore(async () => {
      const certs = new URL("/cdn-cgi/access/certs", env.ACCESS_TEAM_DOMAIN)
      try {
        const response = await fetch(certs, { headers: { Accept: "application/json" } })
        if (response.ok) return await response.json()
      } catch {
        // Through the relay below.
      }
      const response = await viaRelay(certs.href, { headers: { Accept: "application/json" } }, relayOf(env))
      if (response === null) throw new Error("Access' nøkler er ikke tilgjengelige")
      if (!response.ok) throw new Error(`Access' nøkler: ${response.status}`)
      return await response.json()
    })
  }
  return keys
}

/** Whether Access let the request through: a valid token for this team and application. No token, no configuration: no. */
export async function accessAllowed(headers: Headers, env: GateEnv): Promise<boolean> {
  // `npm run preview` has no Access in front: ACCESS_SKIP=1 in .dev.vars, never in wrangler.jsonc or as a secret.
  if (env.ACCESS_SKIP === "1") return true
  const token = headers.get("Cf-Access-Jwt-Assertion")
  const { ACCESS_TEAM_DOMAIN, ACCESS_AUD } = env
  if (!token || !ACCESS_TEAM_DOMAIN || !ACCESS_AUD) return false
  return verifyAccessJwt(token, { issuer: ACCESS_TEAM_DOMAIN, audience: ACCESS_AUD }, accessKeys({ ...env, ACCESS_TEAM_DOMAIN }))
}
