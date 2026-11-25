import assert from 'node:assert/strict'
import { test } from 'node:test'

import { headersFile, headersFileRules, SECURITY_HEADERS, secure } from './headers.ts'

test('a header the answer already has is kept', () => {
  const headers = new Headers({ 'Referrer-Policy': 'no-referrer' })
  secure(headers)
  assert.equal(headers.get('Referrer-Policy'), 'no-referrer')
  assert.equal(headers.get('X-Frame-Options'), 'DENY')
})

test('an app may give its own headers', () => {
  const headers = new Headers()
  secure(headers, { 'X-Frame-Options': 'SAMEORIGIN' })
  assert.deepEqual([...headers], [['x-frame-options', 'SAMEORIGIN']])
})

test('a written _headers file is read back as the security headers, for its pattern only', () => {
  const file = headersFile('/app/*', 'Why.')
  assert.ok(file.startsWith('# Why.\n/app/*\n'))
  assert.deepEqual(headersFileRules(file, '/app/*'), SECURITY_HEADERS)
  assert.deepEqual(headersFileRules(`${file}/app/sw.js\n  Cache-Control: no-cache\n`, '/app/sw.js'), { 'Cache-Control': 'no-cache' })
  assert.deepEqual(headersFileRules(file, '/*'), {})
})
