/**
 * Helpers for an app's tests (`node --test`), never for the Worker: they read files and use `node:sqlite`.
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { headersFileRules, SECURITY_HEADERS } from './headers.ts'

/** A test that the app's `public/_headers` gives the built files under `pattern` (`/cv/*`) the same security headers as the Worker's answers. */
export function testHeadersFile(file: URL, pattern: string): void {
  test(`the built files (${pattern}) have the same security headers as the Worker`, () => {
    assert.deepEqual(headersFileRules(readFileSync(file, 'utf8'), pattern), SECURITY_HEADERS)
  })
}

// D1 over SQLite is the Workers' stand-in too; one copy, in @lmfaole/worker.
export { migratedSqlite, sqliteD1 } from '@lmfaole/worker/testing'
