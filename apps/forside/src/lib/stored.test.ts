import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

import { type Database, isMissingTable, type Row } from './d1.ts'
import { OWNER } from './profile.ts'
import { storedOwner } from './stored.ts'

/** The database's own migrations, so the queries are tried against the tables as they are. */
const MIGRATIONS = new URL('../../../../packages/db/site/migrations/', import.meta.url)

function sqlite(migrated = true): DatabaseSync {
  const db = new DatabaseSync(':memory:')
  if (migrated) for (const file of readdirSync(MIGRATIONS).sort()) if (file.endsWith('.sql')) db.exec(readFileSync(new URL(file, MIGRATIONS), 'utf8'))
  return db
}

/** D1's binding over an in-memory SQLite. */
function d1(db: DatabaseSync): Database {
  const prepare = (sql: string) => ({ all: async () => ({ results: db.prepare(sql).all() as Row[] }) })
  return { prepare, batch: (statements) => Promise.all(statements.map((statement) => statement.all())) }
}

test('before the migration the database cannot answer, and an empty one gives the page its own words', async () => {
  await assert.rejects(storedOwner(d1(sqlite(false))), (error) => isMissingTable(error))
  assert.deepEqual(await storedOwner(d1(sqlite())), OWNER)
})

test('the name is the CV person’s, and the role the newest position that goes on, at its employer', async () => {
  const db = sqlite()
  // As scripts/import-dump.ts writes them: the earlier positions at Fremtind, one that ended elsewhere, and the newest last.
  db.exec(`INSERT INTO cv_person (id, navn, tittel, arbeidsgiver, sted) VALUES (1, 'Navn fra CV-en', 'Senior frontend-utvikler', 'Fremtind Forsikring', 'Oslo');
    INSERT INTO cv_employer (id, navn, sted) VALUES (1, 'Fremtind', 'Oslo'), (2, 'NAV', 'Oslo');
    INSERT INTO cv_position (id, arbeidsgiver_id, fra, til, aar, tittel) VALUES
      (1, 1, '2024-05-01', NULL, 2024, 'Frontend-utvikler'),
      (2, 1, '2023-04-01', '2024-04-30', 2023, 'Interaksjonsdesigner'),
      (3, 2, '2025-01-01', '2025-03-31', 2025, 'Produktdesigner'),
      (6, 1, '2026-06-01', NULL, 2026, 'Senior frontend-utvikler');`)
  assert.deepEqual(await storedOwner(d1(db)), { name: 'Navn fra CV-en', role: 'Senior frontend-utvikler hos Fremtind' })
})

test('a person without a position that goes on keeps the page’s own role', async () => {
  const db = sqlite()
  db.exec(`INSERT INTO cv_person (id, navn) VALUES (1, 'Navn fra CV-en');
    INSERT INTO cv_employer (id, navn) VALUES (1, 'NAV');
    INSERT INTO cv_position (id, arbeidsgiver_id, fra, til, aar, tittel) VALUES (1, 1, '2021-11-01', '2023-03-31', 2021, 'Produktdesigner');`)
  assert.deepEqual(await storedOwner(d1(db)), { name: 'Navn fra CV-en', role: OWNER.role })
})
