import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cacheableRequest, cacheableResponse } from './page-cache.ts'

test('only a GET of the CV or its JSON is kept at the edge', () => {
  assert.ok(cacheableRequest('GET', '/cv/', '/cv/'))
  assert.ok(cacheableRequest('GET', '/cv/api/cv.json', '/cv/'))
  assert.ok(!cacheableRequest('HEAD', '/cv/', '/cv/'))
  assert.ok(!cacheableRequest('POST', '/cv/', '/cv/'))
  assert.ok(!cacheableRequest('GET', '/cv/finnes-ikke/', '/cv/'))
  assert.ok(!cacheableRequest('GET', '/', '/cv/'))
})

test('only an answer that went well, sets no cookie and does not forbid it is kept', () => {
  assert.ok(cacheableResponse(200, new Headers({ 'Content-Type': 'text/html' })))
  for (const status of [301, 404, 500]) assert.ok(!cacheableResponse(status, new Headers()), String(status))
  assert.ok(!cacheableResponse(200, new Headers({ 'Set-Cookie': 'a=b' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'no-store' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'private' })))
})
