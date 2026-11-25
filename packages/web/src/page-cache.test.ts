import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cacheablePage, cacheablePaths, cacheableResponse, keptCacheControl, pageCacheControl } from './page-cache.ts'

test('the browser asks again each time, a shared cache and the edge keep the page for the ttl', () => {
  assert.equal(pageCacheControl(300), 'public, max-age=0, s-maxage=300')
  assert.equal(keptCacheControl(60), 'public, max-age=60')
})

test('only a GET of one of the paths is kept at the edge', () => {
  const cacheable = cacheablePaths(['/cv/', '/cv/api/cv.json'])
  assert.ok(cacheable('GET', '/cv/'))
  assert.ok(cacheable('GET', '/cv/api/cv.json'))
  assert.ok(!cacheable('HEAD', '/cv/'))
  assert.ok(!cacheable('POST', '/cv/'))
  for (const path of ['/cv', '/cv/finnes-ikke/', '/', '/cv/api/cv.json/']) assert.ok(!cacheable('GET', path), path)
})

test('only an answer that went well, sets no cookie and does not forbid it is kept', () => {
  assert.ok(cacheableResponse(200, new Headers({ 'Content-Type': 'application/json' })))
  assert.ok(cacheableResponse(200, new Headers()))
  for (const status of [301, 302, 404, 429, 500, 503]) assert.ok(!cacheableResponse(status, new Headers()), String(status))
  assert.ok(!cacheableResponse(200, new Headers({ 'Set-Cookie': 'a=b' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'no-store' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'private, no-cache' })))
})

test('a page is HTML too', () => {
  assert.ok(cacheablePage(200, new Headers({ 'Content-Type': 'text/html; charset=utf-8' })))
  assert.ok(!cacheablePage(404, new Headers({ 'Content-Type': 'text/html' })))
  assert.ok(!cacheablePage(200, new Headers({ 'Content-Type': 'application/json' })))
  assert.ok(!cacheablePage(200, new Headers()))
})
