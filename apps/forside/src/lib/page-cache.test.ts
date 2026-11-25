import assert from 'node:assert/strict'
import { test } from 'node:test'

import { cacheableRequest, cacheableResponse } from './page-cache.ts'

test('only a GET of a page drawn from D1 (the front page, the glossary) is kept at the edge', () => {
  assert.ok(cacheableRequest('GET', '/'))
  assert.ok(cacheableRequest('GET', '/ordliste'))
  assert.ok(!cacheableRequest('HEAD', '/'))
  assert.ok(!cacheableRequest('POST', '/'))
  for (const path of ['/kilder', '/finnes-ikke', '/ordliste/', '/cv/', '/medier/']) assert.ok(!cacheableRequest('GET', path), path)
})

test('only a page that went well, sets no cookie and does not forbid it is kept', () => {
  assert.ok(cacheableResponse(200, new Headers({ 'Content-Type': 'text/html' })))
  for (const status of [301, 404, 500]) assert.ok(!cacheableResponse(status, new Headers()), String(status))
  assert.ok(!cacheableResponse(200, new Headers({ 'Set-Cookie': 'a=b' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'no-store' })))
  assert.ok(!cacheableResponse(200, new Headers({ 'Cache-Control': 'private' })))
})
