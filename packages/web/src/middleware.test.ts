import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { APIContext, MiddlewareNext } from 'astro'

import { type Edge, pageCache, type PageCacheOptions, secured, withHeaders } from './middleware.ts'
import { cacheablePage, cacheablePaths } from './page-cache.ts'

/** The Workers cache over a map, and the promises it was handed to finish. */
function fakeEdge(): Edge & { kept: Map<string, Response>; pending: Promise<unknown>[] } {
  const kept = new Map<string, Response>()
  const pending: Promise<unknown>[] = []
  const cache = {
    match: async (key: Request) => kept.get(key.url)?.clone(),
    put: async (key: Request, response: Response) => void kept.set(key.url, response),
  } as unknown as Cache
  return { cache, waitUntil: (promise) => void pending.push(promise), kept, pending }
}

const context = (url: string, method = 'GET', isPrerendered = false): APIContext =>
  ({ url: new URL(url), request: new Request(url, { method }), isPrerendered, locals: {} }) as unknown as APIContext

/** A `next` that draws a page and counts how often it was asked. */
function drawing(init: ResponseInit = { headers: { 'Content-Type': 'text/html' } }): MiddlewareNext & { drawn: number } {
  const next = Object.assign(async () => {
    next.drawn++
    return new Response(`page ${next.drawn}`, init)
  }, { drawn: 0 })
  return next as MiddlewareNext & { drawn: number }
}

const cached = (edge: Edge | null, options: Partial<PageCacheOptions> = {}) =>
  pageCache({ cacheable: cacheablePaths(['/app/']), edge: () => edge, ...options })

test('a page drawn once is kept at the edge and the next visitor gets the copy, one for every query', async () => {
  const edge = fakeEdge()
  const answer = cached(edge)
  const next = drawing()
  const first = await answer(context('https://lmfaole.party/app/'), next)
  assert.equal(first.headers.get('Cache-Control'), 'public, max-age=0, s-maxage=300')
  assert.equal(await first.text(), 'page 1')
  await Promise.all(edge.pending)
  assert.equal(edge.kept.get('https://lmfaole.party/app/')?.headers.get('Cache-Control'), 'public, max-age=300')
  const second = await answer(context('https://lmfaole.party/app/?x=1'), next)
  assert.equal(await second.text(), 'page 1')
  assert.equal(second.headers.get('Cache-Control'), 'public, max-age=0, s-maxage=300')
  assert.equal(next.drawn, 1)
})

test('by query, with a marker and its own ttl', async () => {
  const edge = fakeEdge()
  const answer = cached(edge, { byQuery: true, marker: 'X-Cache', ttl: 60 })
  const next = drawing()
  const first = await answer(context('https://lmfaole.party/app/?a=1'), next)
  assert.equal(first.headers.get('X-Cache'), 'miss')
  assert.equal(first.headers.get('Cache-Control'), 'public, max-age=0, s-maxage=60')
  await Promise.all(edge.pending)
  assert.equal((await answer(context('https://lmfaole.party/app/?a=1'), next)).headers.get('X-Cache'), 'hit')
  assert.equal(await (await answer(context('https://lmfaole.party/app/?a=2'), next)).text(), 'page 2')
})

test('what may not be kept is drawn anew and left as it is', async () => {
  const edge = fakeEdge()
  const answer = cached(edge)
  for (const [url, method] of [['https://lmfaole.party/app/x/', 'GET'], ['https://lmfaole.party/app/', 'HEAD']] as const) {
    const response = await answer(context(url, method), drawing())
    assert.equal(response.headers.get('Cache-Control'), null, `${method} ${url}`)
  }
  const failed = await answer(context('https://lmfaole.party/app/'), drawing({ status: 500 }))
  assert.equal(failed.headers.get('Cache-Control'), null)
  assert.equal(edge.kept.size, 0)
  // Without the edge (astro dev), the page is not marked either.
  assert.equal((await cached(null)(context('https://lmfaole.party/app/'), drawing())).headers.get('Cache-Control'), null)
})

test('every page says it may be kept, and the rest says `uncached` where it says nothing of its own', async () => {
  const answer = cached(null, { everyPage: true, keep: cacheablePage, uncached: 'no-cache' })
  assert.equal((await answer(context('https://lmfaole.party/app/x/'), drawing())).headers.get('Cache-Control'), 'public, max-age=0, s-maxage=300')
  assert.equal((await answer(context('https://lmfaole.party/app/'), drawing({ headers: { 'Content-Type': 'application/json' } }))).headers.get('Cache-Control'), 'no-cache')
  assert.equal((await answer(context('https://lmfaole.party/app/'), drawing({ status: 404, headers: { 'Cache-Control': 'max-age=60' } }))).headers.get('Cache-Control'), 'max-age=60')
})

test('every answer of the Worker gets the security headers; a prerendered page is left alone', async () => {
  const middleware = secured(async (_context, next) => next())
  const answered = (await middleware(context('https://lmfaole.party/app/'), drawing())) as Response
  assert.equal(answered.headers.get('X-Frame-Options'), 'DENY')
  const built = (await middleware(context('https://lmfaole.party/app/', 'GET', true), drawing())) as Response
  assert.equal(built.headers.get('X-Frame-Options'), null)
})

test('an answer whose headers are fixed is copied to change them', () => {
  const fixed = Response.redirect('https://lmfaole.party/app/', 301)
  const changed = withHeaders(fixed, (headers) => headers.set('X-Test', '1'))
  assert.notEqual(changed, fixed)
  assert.equal(changed.headers.get('X-Test'), '1')
  assert.equal(changed.status, 301)
})
