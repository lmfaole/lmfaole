// The Worker: the static files the build embedded (scripts/embed-assets.mjs), then Next for everything else. The page is open and the
// same for everyone, so a visitor is held to a request rate (`LIMITER`) and a drawn page is kept a short while at the edge (lib/page-cache.ts).
import assets from "./.open-next/embedded-assets.mjs"
import next from "./.open-next/worker.js"
import { WEB_ANALYTICS_CSP } from "@lmfaole/designsystem/lib/cloudflare"

import { gatewayOptions, runModel } from "./lib/ai-gateway.ts"
import { contentSecurityPolicy } from "./lib/csp.ts"
import { cacheableRequest, cacheableResponse, cacheKey, keptCacheControl, pageCacheControl, ttlFor } from "./lib/page-cache.ts"
import { askSource, relayOf } from "./lib/relay.ts"
import { refreshSnapshot, sharedJobs } from "./lib/snapshot.ts"
import { MODEL, refreshSummaries, SUMMARY_QUERY, summaryVariables } from "./lib/summaries.ts"

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
const SECURITY_HEADERS = {
  "Content-Security-Policy": contentSecurityPolicy({ analytics: WEB_ANALYTICS_CSP }),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
}

function secure(response) {
  const out = new Response(response.body, response)
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) out.headers.set(name, value)
  return out
}

/** Whether this visitor (by address) has asked for more than the binding's limit this minute; with no binding (as in a local preview), never. */
async function limited(request, env) {
  if (env.LIMITER === undefined) return false
  try {
    const { success } = await env.LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") ?? "ukjent" })
    return !success
  } catch {
    return false
  }
}

const TOO_MANY = () =>
  new Response("For mange forespørsler på kort tid. Vent et minutt og prøv igjen.", {
    status: 429,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" },
  })

/** A page from the edge's copy, or drawn by Next and kept there when it may be (lib/page-cache.ts). */
async function page(request, env, ctx) {
  const url = new URL(request.url)
  const cache = globalThis.caches?.default
  if (cache === undefined || !cacheableRequest(request.method, url, request.headers)) return next.fetch(request, env, ctx)
  const ttl = ttlFor(url.pathname)
  const key = new Request(cacheKey(url))
  const hit = await cache.match(key)
  if (hit !== undefined) {
    const out = new Response(hit.body, hit)
    out.headers.set("Cache-Control", pageCacheControl(ttl))
    out.headers.set("X-Startside-Cache", "hit")
    return out
  }
  const drawn = await next.fetch(request, env, ctx)
  if (!cacheableResponse(drawn.status, drawn.headers)) return drawn
  const kept = new Response(drawn.clone().body, drawn)
  kept.headers.set("Cache-Control", keptCacheControl(ttl))
  kept.headers.delete("Vary")
  ctx.waitUntil(cache.put(key, kept).catch((error) => console.warn("Kunne ikke lagre siden", error)))
  const out = new Response(drawn.body, drawn)
  out.headers.set("Cache-Control", pageCacheControl(ttl))
  out.headers.set("X-Startside-Cache", "miss")
  return out
}

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)
    const read = request.method === "GET" || request.method === "HEAD"
    const asset = read ? assets[pathname] : undefined
    if (asset !== undefined) {
      const immutable = pathname.includes("/_next/static/")
      return secure(new Response(request.method === "HEAD" ? null : bytes(pathname), {
        headers: { "Content-Type": asset.type, "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=3600" },
      }))
    }
    // Nothing here adds or changes anything: every page is read, so any other method is refused before Next sees it.
    if (!read) return secure(new Response(null, { status: 405, headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" } }))
    if (await limited(request, env)) return secure(TOO_MANY())
    return secure(await page(request, env, ctx))
  },

  // Called every 15 minutes by workers/scheduler (its service binding): fills the snapshot in KV with what every visitor shares (lib/snapshot.ts),
  // then makes the AI summaries that are missing (lib/summaries.ts; the only place the model is run). No address leads here, so a request cannot start it.
  async scheduled(controller, env, ctx) {
    if (env.SNAPSHOT === undefined) return
    const relay = relayOf(env)
    const ask = (job, signal) => askSource(job.url, { headers: job.headers, signal }, relay)
    ctx.waitUntil(
      refreshSnapshot(env.SNAPSHOT, sharedJobs(env), ask, controller.scheduledTime).then(
        (report) => console.log("Øyeblikksbilde", report),
        (error) => console.error("Øyeblikksbilde feilet", error),
      ),
    )
    if (env.AI === undefined) return
    const askGitHub = async () => {
      const init = {
        method: "POST",
        body: JSON.stringify({ query: SUMMARY_QUERY, variables: summaryVariables(env.GITHUB_USER ?? "lmfaole", env.GITHUB_EXCLUDE_ORGS) }),
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal: AbortSignal.timeout(15_000),
      }
      if (!relay.key && !env.GITHUB_TOKEN) throw new Error("Verken relé eller GITHUB_TOKEN er satt")
      // The token is only used where there is no relay (askSource drops it on the way to the relay, which holds its own).
      const token = env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}
      const response = await askSource("https://api.github.com/graphql", { ...init, headers: { ...init.headers, ...token, "User-Agent": "startside" } }, relay)
      if (!response.ok) throw new Error(`GitHub svarte ${response.status}`)
      return (await response.json()).data
    }
    const run = (messages, kind) => runModel(env.AI, MODEL, { messages, max_tokens: 200 }, gatewayOptions(env.AI_GATEWAY, kind))
    ctx.waitUntil(
      refreshSummaries(env.SNAPSHOT, askGitHub, run, controller.scheduledTime).then(
        (report) => console.log("Oppsummeringer", report),
        (error) => console.error("Oppsummeringer feilet", error),
      ),
    )
  },
}
