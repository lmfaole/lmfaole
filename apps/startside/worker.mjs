// The Worker: checks Cloudflare Access's token, then the static files the build embedded (scripts/embed-assets.mjs), then Next for everything else.
import assets from "./.open-next/embedded-assets.mjs"
import next from "./.open-next/worker.js"
import { WEB_ANALYTICS_CSP } from "@lmfaole/designsystem/lib/cloudflare"

import { isPublicPath, keyStore, verifyAccessJwt } from "./lib/access.ts"
import { contentSecurityPolicy } from "./lib/csp.ts"
import { viaRelay } from "./lib/relay.ts"
import { refreshSnapshot, sharedJobs } from "./lib/snapshot.ts"

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js"

const decoded = new Map()

function bytes(path) {
  let body = decoded.get(path)
  if (body === undefined) {
    body = Uint8Array.from(atob(assets[path].body), (c) => c.charCodeAt(0))
    decoded.set(path, body)
  }
  return body
}

// What the page may load and where it may send (lib/csp.ts).
const SECURITY_HEADERS = (env) => ({
  "Content-Security-Policy": contentSecurityPolicy({ accessTeamDomain: env.ACCESS_TEAM_DOMAIN, analytics: WEB_ANALYTICS_CSP }),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
})

function secure(response, env) {
  const out = new Response(response.body, response)
  for (const [name, value] of Object.entries(SECURITY_HEADERS(env))) out.headers.set(name, value)
  return out
}

// Access's signing keys, kept between requests (lib/access.ts). Fetched straight from Access, or through the relay if a Worker on this zone cannot reach it.
let keys
let keysFor
function accessKeys(env) {
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

/** The relay (lib/relay.ts): the service binding, its address as the fallback, and the shared key. */
const relayOf = (env) => ({ binding: env.UPSTREAM, url: env.UPSTREAM_URL, key: env.UPSTREAM_KEY })

async function allowed(request, env) {
  // `npm run preview` has no Access in front: ACCESS_SKIP=1 in .dev.vars (wrangler dev gives the request the route's address, so it cannot be told by that). Never in wrangler.jsonc or as a secret.
  if (env.ACCESS_SKIP === "1") return true
  const token = request.headers.get("Cf-Access-Jwt-Assertion")
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return false
  return verifyAccessJwt(token, { issuer: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD }, accessKeys(env))
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    const read = request.method === "GET" || request.method === "HEAD"
    const asset = read ? assets[pathname] : undefined
    if (!(read && isPublicPath(pathname, asset !== undefined)) && !(await allowed(request, env))) {
      return secure(new Response("Forbidden", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }), env)
    }
    if (asset !== undefined) {
      const immutable = pathname.includes("/_next/static/")
      return secure(new Response(request.method === "HEAD" ? null : bytes(pathname), {
        headers: { "Content-Type": asset.type, "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=3600" },
      }), env)
    }
    return secure(await next.fetch(request, env, ctx), env)
  },

  // Called every 15 minutes by workers/scheduler (its service binding): fills the snapshot in KV with what every visitor shares (lib/snapshot.ts).
  // No address leads here, so a request cannot start it.
  async scheduled(controller, env, ctx) {
    if (env.SNAPSHOT === undefined) return
    const relay = relayOf(env)
    const ask = async (job, signal) => (await viaRelay(job.url, { headers: job.headers, signal }, relay)) ?? fetch(job.url, { headers: job.headers, signal })
    ctx.waitUntil(
      refreshSnapshot(env.SNAPSHOT, sharedJobs(env), ask, controller.scheduledTime).then(
        (report) => console.log("Øyeblikksbilde", report),
        (error) => console.error("Øyeblikksbilde feilet", error),
      ),
    )
  },
}
