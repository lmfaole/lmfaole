import { strict as assert } from "node:assert"
import { readFileSync } from "node:fs"
import { runInNewContext } from "node:vm"
import { test } from "node:test"

const PUBLIC = new URL("../public/", import.meta.url)
const manifest = JSON.parse(readFileSync(new URL("manifest.webmanifest", PUBLIC), "utf8")) as {
  id: string
  scope: string
  start_url: string
  short_name: string
  display: string
  background_color: string
  theme_color: string
  icons: { src: string; sizes: string; purpose: string }[]
}

/** The width and height a PNG says it has, from its header. */
function pngSize(path: string): string {
  const bytes = readFileSync(new URL(path.replace(/^\//, ""), PUBLIC))
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`
}

test("the manifest is one a browser offers to install: an id that is the start address, a scope with a closing slash, opaque colours, and an icon of each kind at 192 and 512 that is the size it says", () => {
  assert.equal(manifest.id, manifest.start_url)
  assert.ok(manifest.scope.endsWith("/") && manifest.start_url.startsWith(manifest.scope))
  assert.equal(manifest.display, "standalone")
  assert.ok(manifest.short_name.length <= 12)
  for (const colour of [manifest.background_color, manifest.theme_color]) assert.match(colour, /^#[0-9a-f]{6}$/i)
  for (const purpose of ["any", "maskable"]) {
    for (const size of ["192x192", "512x512"]) {
      const icon = manifest.icons.find((one) => one.purpose === purpose && one.sizes === size)
      if (icon === undefined) {
        // The maskable icon is only needed at 512 (one is enough, and the manifest has one).
        assert.ok(purpose === "maskable" && size === "192x192", `${purpose} at ${size} is missing`)
        continue
      }
      assert.equal(pngSize(icon.src), size, icon.src)
    }
  }
  assert.ok(manifest.icons.every((icon) => icon.purpose === "any" || icon.purpose === "maskable"), "never one icon that is both")
})

// --- The service worker, run with a cache and a network of our own. ---

type Listener = (event: FakeEvent) => void
interface FakeEvent {
  request?: { method: string; url: string; mode: string }
  respondWith?: (answer: Promise<unknown>) => void
  waitUntil: (work: Promise<unknown>) => void
}
interface FakeResponse {
  ok: boolean
  type: string
  redirected: boolean
  clone: () => FakeResponse
  body: string
  headers: { get: (name: string) => string | null }
  text: () => Promise<string>
}

const ORIGIN = "https://m.test"
const response = (body: string, over: Partial<FakeResponse> & { who?: string } = {}): FakeResponse => {
  const { who, ...rest } = over
  return { ok: true, type: "basic", redirected: false, body, clone() { return this }, headers: { get: (name: string) => (name === "X-Medier-Who" ? (who ?? null) : null) }, text: async () => body, ...rest }
}

function worker(network: (url: string) => FakeResponse | "down") {
  const stores = new Map<string, Map<string, FakeResponse>>()
  const fetched: string[] = []
  const listeners = new Map<string, Listener>()
  let claimed = false
  const href = (key: string | { url: string }) => new URL(typeof key === "string" ? key : key.url, ORIGIN).href
  const sandbox = {
    self: { addEventListener: (type: string, listener: Listener) => listeners.set(type, listener), location: { origin: ORIGIN }, clients: { claim: async () => { claimed = true } } },
    caches: {
      open: async (name: string) => {
        const store = stores.get(name) ?? new Map<string, FakeResponse>()
        stores.set(name, store)
        return {
          match: async (key: string | { url: string }) => store.get(href(key)),
          put: async (key: string | { url: string }, value: FakeResponse) => { store.set(href(key), value) },
          keys: async () => [...store.keys()].map((url) => ({ url })),
          delete: async (key: string | { url: string }) => store.delete(href(key)),
        }
      },
      keys: async () => [...stores.keys()],
      delete: async (name: string) => stores.delete(name),
    },
    fetch: async (input: string | { url: string }) => {
      const url = typeof input === "string" ? input : input.url
      fetched.push(url)
      const answer = network(url)
      if (answer === "down") throw new TypeError("offline")
      return answer
    },
    Response: Object.assign(function (body: string) { return response(body) }, { error: () => response("error", { ok: false, type: "error" }) }),
    URL,
  }
  runInNewContext(readFileSync(new URL("sw.js", PUBLIC), "utf8"), sandbox)
  const pending: Promise<unknown>[] = []
  const dispatch = (type: string, request?: FakeEvent["request"]): { answer: Promise<unknown> | undefined } => {
    let answer: Promise<unknown> | undefined
    const event: FakeEvent = { ...(request === undefined ? {} : { request }), respondWith: (value) => { answer = value }, waitUntil: (work) => { pending.push(work) } }
    listeners.get(type)?.(event)
    return { answer }
  }
  const settle = async () => { await Promise.all(pending.splice(0)) }
  return { dispatch, settle, stores, fetched, claimed: () => claimed }
}

const nav = (path: string) => ({ method: "GET", url: `${ORIGIN}${path}`, mode: "navigate" })

/** A visit to a page, to the end: the answer is given, and what the worker did after giving it (keeping the copy) is done. */
async function visit(app: ReturnType<typeof worker>, path: string): Promise<FakeResponse> {
  const shown = (await app.dispatch("fetch", nav(path)).answer) as FakeResponse
  await app.settle()
  return shown
}

test("a page is fetched from the network and its copy kept by its address with the query; it is the network's answer that is shown", async () => {
  const app = worker((url) => response(`page ${url}`))
  assert.equal((await visit(app, "/musikk/?x=1")).body, `page ${ORIGIN}/musikk/?x=1`)
  assert.ok(app.stores.get("medier-pages-v6")?.has(`${ORIGIN}/musikk/?x=1`))
  assert.ok(!app.stores.get("medier-pages-v6")?.has(`${ORIGIN}/musikk/`))
})

test("with no network the last copy of the page is shown, else the front page, else the offline page, else an error", async () => {
  const online = worker((url) => response(`page ${url}`))
  await visit(online, "/")
  await visit(online, "/musikk/")
  const pages = online.stores.get("medier-pages-v6")
  const offline = worker(() => "down")
  for (const [key, value] of pages ?? []) offline.stores.set("medier-pages-v6", (offline.stores.get("medier-pages-v6") ?? new Map()).set(key, value))
  offline.stores.get("medier-pages-v6")?.set(`${ORIGIN}/offline/`, response("offline page"))
  const shown = async (path: string) => ((await offline.dispatch("fetch", nav(path)).answer) as FakeResponse).body
  assert.equal(await shown("/musikk/"), `page ${ORIGIN}/musikk/`)
  assert.equal(await shown("/film/"), `page ${ORIGIN}/`)
  offline.stores.get("medier-pages-v6")?.delete(`${ORIGIN}/`)
  assert.equal(await shown("/film/"), "offline page")
  offline.stores.get("medier-pages-v6")?.delete(`${ORIGIN}/offline/`)
  assert.equal(await shown("/film/"), "error")
})

test("an error, a redirect (a login) or a page from somewhere else is shown but never kept as the page", async () => {
  for (const bad of [{ ok: false }, { redirected: true }, { type: "opaque" }]) {
    const app = worker(() => response("x", bad))
    await visit(app, "/musikk/")
    assert.ok(!app.stores.get("medier-pages-v6")?.has(`${ORIGIN}/musikk/`), JSON.stringify(bad))
  }
})

test("only the last pages are kept: more than forty and the oldest go, and the offline page stays", async () => {
  const app = worker((url) => response(url))
  const pages = await app.stores.set("medier-pages-v6", new Map([[`${ORIGIN}/offline/`, response("offline")]])).get("medier-pages-v6")
  assert.ok(pages !== undefined)
  for (let index = 0; index < 45; index += 1) {
    await visit(app, `/film/t-${index}/`)
  }
  // The pages, the offline page, and whose they are.
  assert.equal(pages.size, 42)
  assert.ok(pages.has(`${ORIGIN}/offline/`))
  assert.ok(!pages.has(`${ORIGIN}/film/t-0/`) && pages.has(`${ORIGIN}/film/t-44/`))
})

test("the pages kept are one visitor's: a page for other usernames drops the pages of the ones before, so they are never shown offline", async () => {
  let who = "ola|ola"
  const app = worker((url) => response(`${who} ${url}`, { who }))
  app.stores.set("medier-pages-v6", new Map([[`${ORIGIN}/offline/`, response("offline")]]))
  await visit(app, "/musikk/")
  await visit(app, "/film/")
  const pages = app.stores.get("medier-pages-v6")
  assert.ok(pages?.has(`${ORIGIN}/musikk/`) && pages.has(`${ORIGIN}/film/`))
  who = "kari|"
  await visit(app, "/")
  assert.ok(!pages?.has(`${ORIGIN}/musikk/`) && !pages?.has(`${ORIGIN}/film/`))
  assert.ok(pages?.has(`${ORIGIN}/`) && pages.has(`${ORIGIN}/offline/`))
  assert.equal(pages?.get(`${ORIGIN}/`)?.body, `kari| ${ORIGIN}/`)
})

test("a built file is fetched once and then comes from the cache", async () => {
  const app = worker((url) => response(url))
  const asset = { method: "GET", url: `${ORIGIN}/_astro/app.abc.css`, mode: "no-cors" }
  await app.dispatch("fetch", asset).answer
  await app.dispatch("fetch", asset).answer
  assert.deepEqual(app.fetched, [asset.url])
})

test("what is another site's, and what is not a GET, is left to the browser", () => {
  const app = worker(() => response("x"))
  assert.equal(app.dispatch("fetch", { method: "GET", url: "https://i.scdn.co/image/abc", mode: "no-cors" }).answer, undefined)
  assert.equal(app.dispatch("fetch", { method: "POST", url: `${ORIGIN}/musikk/`, mode: "navigate" }).answer, undefined)
  assert.equal(app.dispatch("fetch", { method: "GET", url: `${ORIGIN}/api/x`, mode: "cors" }).answer, undefined)
})

test("a new version deletes the caches of the old one and takes over; installing keeps the offline page and does not skip waiting", async () => {
  const app = worker(() => response("offline page"))
  app.stores.set("medier-pages-v0", new Map())
  app.stores.set("medier-static-v0", new Map())
  app.dispatch("install")
  await app.settle()
  assert.ok(app.stores.get("medier-pages-v6")?.has(`${ORIGIN}/offline/`))
  app.dispatch("activate")
  await app.settle()
  assert.deepEqual([...app.stores.keys()].sort(), ["medier-pages-v6"])
  assert.ok(app.claimed())
  assert.ok(!readFileSync(new URL("sw.js", PUBLIC), "utf8").includes("skipWaiting()"))
})
