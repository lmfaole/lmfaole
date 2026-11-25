import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DatabaseSync } from 'node:sqlite'

import { asDatabase, isMissingTable, num, optional, readAll, readOr, str } from './d1.ts'
import { sqliteD1 } from './testing.ts'

function sqlite(): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  db.exec("CREATE TABLE t (id INTEGER, name TEXT); INSERT INTO t VALUES (1, 'a'), (2, 'b')")
  return db
}

test('a batch gives the rows of each query in order, with its parameters', async () => {
  const db = sqliteD1(sqlite())
  const answers = await readAll(db, ['SELECT name FROM t ORDER BY id', { sql: 'SELECT id FROM t WHERE name = ?', params: ['b'] }])
  assert.deepEqual(answers.map((rows) => rows.map((row) => ({ ...row }))), [[{ name: 'a' }, { name: 'b' }], [{ id: 2 }]])
})

test('only a binding that can prepare and batch is a database', () => {
  assert.notEqual(asDatabase(sqliteD1(sqlite())), null)
  for (const none of [undefined, null, 'x', {}, { prepare() {} }]) assert.equal(asDatabase(none), null)
})

test('without a database, a missing table or a failure, the fallback; only a failure is logged', async (t) => {
  const logged = t.mock.method(console, 'error', () => {})
  assert.equal(await readOr(undefined, 'site: x', async () => 1, 0), 0)
  assert.equal(await readOr(sqliteD1(sqlite()), 'site: x', async (db) => (await readAll(db, ['SELECT COUNT(*) AS n FROM t']))[0]?.[0]?.['n'], 0), 2)
  assert.equal(await readOr(sqliteD1(sqlite()), 'site: x', (db) => readAll(db, ['SELECT * FROM missing']).then(() => 1), 0), 0)
  assert.equal(logged.mock.callCount(), 0)
  assert.equal(await readOr(sqliteD1(sqlite()), 'site: x', async () => Promise.reject(new Error('D1 down')), 0), 0)
  assert.equal(logged.mock.callCount(), 1)
  assert.equal(logged.mock.calls[0]?.arguments[0], 'site: x could not be read from D1')
})

test('a table that is not there reads as empty; any other failure is thrown', async () => {
  assert.ok(isMissingTable(new Error('D1_ERROR: no such table: cv_person: SQLITE_ERROR')))
  assert.deepEqual(await optional(Promise.reject(new Error('no such table: x'))), [])
  await assert.rejects(optional(Promise.reject(new Error('D1 down'))), /D1 down/)
})

test('a number or a non-empty string, or null', () => {
  assert.equal(num(3), 3)
  assert.equal(num(3n), 3)
  assert.equal(num(Number.NaN), null)
  assert.equal(num('3'), null)
  assert.equal(str('a'), 'a')
  assert.equal(str(''), null)
  assert.equal(str(1), null)
})
