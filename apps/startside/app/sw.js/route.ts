// The service worker, at /start/sw.js. Its scope is /start (the page itself has no trailing slash), which is wider than
// the folder it is in, so it says so with Service-Worker-Allowed. It handles /start and what is under /start/, never /startfoo; a page is kept by its address with the query.
// Other apps share the origin (lmfaole.party/medier, /design), so on an update it deletes only its own old caches (startside-…).
// Every page is the same for everyone (nothing is posted, no settings): a kept copy is only ever old, never someone else's.

const SCRIPT = String.raw`
const STATIC = "startside-static-v1"
const PAGES = "startside-pages-v3"
const OFFLINE = "/start/offline"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES).then(async (cache) => {
      const response = await fetch(OFFLINE, { credentials: "same-origin" })
      if (response.ok) await cache.put(OFFLINE, response)
    }).catch(() => {}).then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("startside-") && key !== STATIC && key !== PAGES).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== location.origin || !(url.pathname === "/start" || url.pathname.startsWith("/start/"))) return

  // The built files never change under one name: from the cache when there, else fetched and kept.
  if (url.pathname.startsWith("/start/_next/static/") || url.pathname.startsWith("/start/icons/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok) cache.put(request, response.clone())
        return response
      }),
    )
    return
  }

  // A page: always fresh from the network. The last good copy of each page is kept by its address (with the position, ?pos=), and
  // shown when there is no network: else the same page without the query, else the front page, else the offline page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic" && url.pathname !== OFFLINE) {
            const copy = response.clone()
            caches.open(PAGES).then((cache) => cache.put(url.pathname + url.search, copy))
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(PAGES)
          return (await cache.match(url.pathname + url.search)) ?? (await cache.match(url.pathname)) ?? (await cache.match("/start")) ?? (await cache.match(OFFLINE)) ?? Response.error()
        }),
    )
  }
})
`

export const dynamic = "force-static"

export function GET() {
  return new Response(SCRIPT, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/start",
    },
  })
}
