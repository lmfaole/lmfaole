import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { headersFileRules, SECURITY_HEADERS, secure } from './headers.ts'

test('the built files have the same security headers as the Worker', () => {
  const file = readFileSync(new URL('../../public/_headers', import.meta.url), 'utf8')
  assert.deepEqual(headersFileRules(file, '/cv/*'), SECURITY_HEADERS)
})

test('a header the answer already has is kept', () => {
  const headers = new Headers({ 'Referrer-Policy': 'no-referrer' })
  secure(headers)
  assert.equal(headers.get('Referrer-Policy'), 'no-referrer')
  assert.equal(headers.get('X-Frame-Options'), 'DENY')
})
