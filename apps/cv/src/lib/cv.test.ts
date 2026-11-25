import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formatDate } from './cv.ts'

test('a commit day is written in Norwegian time', () => {
  assert.equal(formatDate('2026-11-17T12:55:35Z'), '17. november 2026')
  assert.equal(formatDate('2026-11-17T23:30:00Z'), '18. november 2026')
})
