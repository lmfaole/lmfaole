/**
 * Helpers for an app's tests (`node --test`), never for the Worker: they read files and use `node:sqlite`.
 */

import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { DatabaseSync, type SQLInputValue } from 'node:sqlite'
import { test } from 'node:test'

import type { Database, Row, Statement } from './d1.ts'
import { headersFileRules, SECURITY_HEADERS } from './headers.ts'

/** A test that the app's `public/_headers` gives the built files under `pattern` (`/cv/*`) the same security headers as the Worker's answers. */
export function testHeadersFile(file: URL, pattern: string): void {
  test(`the built files (${pattern}) have the same security headers as the Worker`, () => {
    assert.deepEqual(headersFileRules(readFileSync(file, 'utf8'), pattern), SECURITY_HEADERS)
  })
}

/** An in-memory SQLite with every migration in `migrations` applied in order (none with `migrated` false: the database before the migration). */
export function migratedSqlite(migrations: URL, migrated = true): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  if (migrated) for (const file of readdirSync(migrations).sort()) if (file.endsWith('.sql')) db.exec(readFileSync(new URL(file, migrations), 'utf8'))
  return db
}

/** D1's binding over a SQLite. */
export function sqliteD1(db: DatabaseSync): Database {
  const statement = (sql: string, params: SQLInputValue[] = []): Statement => ({
    bind: (...values) => statement(sql, values),
    all: async () => ({ results: db.prepare(sql).all(...params) as Row[] }),
  })
  return { prepare: (sql) => statement(sql), batch: (statements) => Promise.all(statements.map((s) => s.all())) }
}
