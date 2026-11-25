// The Worker: checks Cloudflare Access's token, then the static files the build embedded (scripts/embed-assets.mjs), then Next for everything else.
import assets from "./.open-next/embedded-assets.mjs"
import next from "./.open-next/worker.js"
import { WEB_ANALYTICS_CSP } from "@lmfaole/designsystem/lib/cloudflare"

import { isPublicPath } from "./lib/access.ts"
import { accessAllowed, relayOf } from "./lib/access-gate.ts"
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

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    const read = request.method === "GET" || request.method === "HEAD"
    const asset = read ? assets[pathname] : undefined
    if (!(read && isPublicPath(pathname, asset !== undefined)) && !(await accessAllowed(request.headers, env))) {
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
