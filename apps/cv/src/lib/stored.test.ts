import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

import type { Cv } from './cv.ts'
import { type Database, isMissingTable, type Row } from './d1.ts'
import { storedCv } from './stored.ts'

/** The database's own migrations, so the queries are tried against the tables as they are. */
const MIGRATIONS = new URL('../../../../packages/db/site/migrations/', import.meta.url)
const SNAPSHOT = JSON.parse(readFileSync(new URL('../data/cv.json', import.meta.url), 'utf8')) as Cv

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

const insert = (db: DatabaseSync, table: string, row: Record<string, string | number | null>): void => {
  const columns = Object.keys(row)
  db.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`).run(...Object.values(row))
}

/** The rows `scripts/import-dump.ts` writes for the snapshot, written in the opposite order (so the order shown is the queries'), with a grunnskole row too. */
function importSnapshot(db: DatabaseSync, cv: Cv): void {
  let position = 0
  let project = 0
  const rows: [string, Record<string, string | number | null>][] = []
  rows.push(['cv_person', { id: 1, ...cv.person! }])
  cv.employers.forEach((employer, e) => {
    rows.push(['cv_employer', { id: e + 1, navn: employer.navn, sted: employer.sted }])
    for (const role of employer.roles) {
      const id = ++position
      rows.push(['cv_position', { id, arbeidsgiver_id: e + 1, fra: role.fra, til: role.til, aar: role.aar, tittel: role.tittel, beskrivelse: role.beskrivelse, kortbeskrivelse: null }])
      for (const p of role.projects) {
        rows.push(['cv_project', { id: ++project, stilling_id: id, fra: p.fra, til: p.til, aar: p.aar, navn: p.navn, tittel: p.tittel, url: p.url, beskrivelse: p.beskrivelse, kortbeskrivelse: null, repo: p.github?.repo ?? null }])
        if (p.github !== null) {
          const sha = p.github.commit.url.split('/').at(-1)!
          rows.push(['github_project_commits', { repo: p.github.repo, sha, message: p.github.commit.message, committed_at: Date.parse(p.github.commit.at) / 1000 }])
        }
      }
    }
  })
  cv.education.forEach((education, i) => rows.push(['cv_education', { id: i + 10, ...education, kortbeskrivelse: null }]))
  rows.push(['cv_education', { id: 1, fra: '2003-08-01', til: '2010-06-30', aar: 2010, grad: 'Grunnskole, 1.–7. trinn', institusjon: 'Barneskolen', beskrivelse: null, kortbeskrivelse: null }])
  cv.links.forEach((link, i) => rows.push(['cv_link', { id: i + 1, ...link }]))
  for (const [table, row] of rows.reverse()) insert(db, table, row)
}

test('before the migration the database cannot answer, and an empty one has no CV: the snapshot is shown in both cases', async () => {
  await assert.rejects(storedCv(d1(sqlite(false))), (error) => isMissingTable(error))
  assert.equal(await storedCv(d1(sqlite())), null)
  const onlyPerson = sqlite()
  insert(onlyPerson, 'cv_person', { id: 1, navn: 'Ole Jørgen Bakken', tittel: null, arbeidsgiver: null, sted: null })
  assert.equal(await storedCv(d1(onlyPerson)), null)
})

test('the imported rows give the snapshot back: the same shape, order and commits, without primary school', async () => {
  const db = sqlite()
  importSnapshot(db, SNAPSHOT)
  assert.deepEqual(await storedCv(d1(db)), SNAPSHOT)
})

test('a project without a public commit has no GitHub part; an employer without a role and a role-less project are left out', async () => {
  const db = sqlite()
  insert(db, 'cv_person', { id: 1, navn: 'Ole Jørgen Bakken', tittel: 'Utvikler', arbeidsgiver: 'Fremtind', sted: 'Oslo' })
  insert(db, 'cv_employer', { id: 1, navn: 'Fremtind', sted: 'Oslo' })
  insert(db, 'cv_employer', { id: 2, navn: 'Uten rolle', sted: null })
  insert(db, 'cv_position', { id: 1, arbeidsgiver_id: 1, fra: '2024-05-01', til: null, aar: 2024, tittel: 'Frontend-utvikler', beskrivelse: null })
  insert(db, 'cv_project', { id: 1, stilling_id: 1, fra: '2025-01-01', aar: 2025, navn: 'Jøkul', repo: 'fremtind/jokul' })
  insert(db, 'cv_project', { id: 2, stilling_id: 1, fra: '2024-06-01', aar: 2024, navn: 'Intern', repo: 'fremtind/privat' })
  insert(db, 'cv_project', { id: 3, stilling_id: 99, aar: 2020, navn: 'Borte' })
  insert(db, 'github_project_commits', { repo: 'fremtind/jokul', sha: 'abc123', message: 'fix: noe', committed_at: 1763384135 })
  const cv = await storedCv(d1(db))
  assert.deepEqual(cv?.employers.map((employer) => employer.navn), ['Fremtind'])
  assert.deepEqual(cv?.employers[0]?.roles[0]?.projects, [
    { aar: 2025, fra: '2025-01-01', til: null, navn: 'Jøkul', tittel: null, url: null, beskrivelse: null, github: { repo: 'fremtind/jokul', commit: { message: 'fix: noe', at: '2025-11-17T12:55:35Z', url: 'https://github.com/fremtind/jokul/commit/abc123' } } },
    { aar: 2024, fra: '2024-06-01', til: null, navn: 'Intern', tittel: null, url: null, beskrivelse: null, github: null },
  ])
  assert.deepEqual(cv?.education, [])
  assert.deepEqual(cv?.links, [])
})
