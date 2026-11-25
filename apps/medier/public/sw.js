// The service worker of the installed app (scope «/»). Pages: the network first, the last good copy of each when there is no network, the front page then, and last our own
// offline page. The built files (`/_astro/`, the icons) never change under one name: from the cache when there, else fetched and kept. Nothing from another site is touched
// (the covers and pictures are other sites' own, Spotify's among them, and are not kept). A new worker waits until the app is closed: no `skipWaiting`, so an old page is never
// served by a new worker. Change `VERSION` and the old caches are deleted when it takes over. A page is made for the visitor's usernames (cookies): the server says whose it is (`X-Medier-Who`),
// and as what it was drawn (the visitor's theme, effects and sections, and whether the first-run wizard was open), and the pages kept are of one such at a time, so a page from before a change
// (Innstillinger) is never shown offline after it.

const VERSION = "v6"
const STATIC = `medier-static-${VERSION}`
const PAGES = `medier-pages-${VERSION}`
const OFFLINE = "/offline/"
/** How many pages are kept: the last visited, so the cache stays small and nothing in it is old for long. */
const MAX_PAGES = 40
/** Whose pages are kept: an entry of its own in the pages' cache, with the server's `X-Medier-Who` of the last page kept. */
const WHO = "/__medier-who__"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then(async (cache) => {
        const response = await fetch(OFFLINE, { credentials: "same-origin" })
        if (response.ok) await cache.put(OFFLINE, response)
      })
      .catch(() => {}),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== STATIC && key !== PAGES).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

/** A page of someone else (other usernames) than the pages kept: those go, all but the offline page, before it is kept. */
async function keepFor(cache, who) {
  const kept = await cache.match(WHO)
  if (kept !== undefined && (await kept.text()) === who) return
  const keys = (await cache.keys()).filter((request) => new URL(request.url).pathname !== OFFLINE)
  await Promise.all(keys.map((request) => cache.delete(request)))
  await cache.put(WHO, new Response(who))
}

/** The oldest pages go when there are more than `MAX_PAGES` (a cache lists its keys in the order they were added); the offline page stays. */
async function trim(cache) {
  const keys = (await cache.keys()).filter((request) => ![OFFLINE, WHO].includes(new URL(request.url).pathname))
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_PAGES)).map((request) => cache.delete(request)))
}

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin) return

  if (url.pathname.startsWith("/_astro/") || url.pathname.startsWith("/icons/")) {
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

  if (request.mode === "navigate") {
    const key = url.pathname + url.search
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only a page that came back ok, from here, and not a redirect: a copy of an error or of somewhere else would be shown as the page.
          if (response.ok && response.type === "basic" && !response.redirected && url.pathname !== OFFLINE) {
            const copy = response.clone()
            const who = response.headers.get("X-Medier-Who") ?? ""
            event.waitUntil(caches.open(PAGES).then(async (cache) => {
              await keepFor(cache, who)
              await cache.put(key, copy)
              await trim(cache)
            }))
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(PAGES)
          return (await cache.match(key)) ?? (await cache.match("/")) ?? (await cache.match(OFFLINE)) ?? Response.error()
        }),
    )
  }
})
