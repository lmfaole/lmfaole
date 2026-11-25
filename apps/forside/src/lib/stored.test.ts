import assert from 'node:assert/strict'
import type { DatabaseSync } from 'node:sqlite'
import { test } from 'node:test'

import { isMissingTable } from '@lmfaole/web/d1'
import { migratedSqlite, sqliteD1 as d1 } from '@lmfaole/web/testing'

import { OWNER } from './profile.ts'
import { OWN_FRONT_PAGE, storedFrontPage, storedGlossary } from './stored.ts'

/** The database's own migrations, so the queries are tried against the tables as they are. */
const MIGRATIONS = new URL('../../../../packages/db/site/migrations/', import.meta.url)

const sqlite = (migrated = true): DatabaseSync => migratedSqlite(MIGRATIONS, migrated)

const NOW = new Date('2026-11-25T12:00:00Z')
const at = (iso: string): number => Date.parse(iso) / 1000

test('before the migration the database cannot answer, and an empty one gives the front page its own words and nothing more', async () => {
  await assert.rejects(storedFrontPage(d1(sqlite(false)), NOW), (error) => isMissingTable(error))
  await assert.rejects(storedGlossary(d1(sqlite(false))), (error) => isMissingTable(error))
  assert.deepEqual(await storedFrontPage(d1(sqlite()), NOW), OWN_FRONT_PAGE)
  assert.deepEqual(await storedGlossary(d1(sqlite())), [])
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
  assert.deepEqual((await storedFrontPage(d1(db), NOW)).owner, { name: 'Navn fra CV-en', role: 'Senior frontend-utvikler hos Fremtind' })
})

test('a person without a position that goes on keeps the page’s own role', async () => {
  const db = sqlite()
  db.exec(`INSERT INTO cv_person (id, navn) VALUES (1, 'Navn fra CV-en');
    INSERT INTO cv_employer (id, navn) VALUES (1, 'NAV');
    INSERT INTO cv_position (id, arbeidsgiver_id, fra, til, aar, tittel) VALUES (1, 1, '2021-11-01', '2023-03-31', 2021, 'Produktdesigner');`)
  assert.deepEqual((await storedFrontPage(d1(db), NOW)).owner, { name: 'Navn fra CV-en', role: OWNER.role })
})

test('GitHub: the last year’s contributions and merges, and the latest merged pull requests first', async () => {
  const db = sqlite()
  // As workers/catalog writes them: the calendar by day, and what the owner opened, times in seconds.
  db.exec(`INSERT INTO github_days (day, contributions) VALUES ('2025-11-25', 40), ('2025-11-26', 3), ('2026-06-01', 10), ('2026-11-24', 2);`)
  const items = db.prepare('INSERT INTO github_items (id, kind, repo, number, title, state, merged, created_at, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
  items.run(1, 'pr', 'navikt/aksel', 1798, 'Ikon label og tekstendringer', 'closed', 1, at('2023-02-09T13:00:00Z'), at('2023-02-09T13:29:23Z'))
  items.run(2, 'pr', 'fremtind/jokul', 6844, 'feat(portal): skru på autocapture i Mixpanel', 'closed', 1, at('2026-11-17T12:53:03Z'), at('2026-11-17T14:27:14Z'))
  items.run(3, 'pr', 'fremtind/jokul', 6850, 'fix(text-area): bruk field-sizing', 'open', 0, at('2026-11-18T10:16:44Z'), null)
  items.run(4, 'pr', 'fremtind/jokul', 6700, 'chore: lukket uten merge', 'closed', 0, at('2026-10-01T10:00:00Z'), at('2026-10-02T10:00:00Z'))
  items.run(5, 'issue', 'fremtind/jokul', 6849, 'Støtte for span i Title og Text', 'closed', 0, at('2026-11-18T09:57:19Z'), at('2026-11-19T09:57:19Z'))
  items.run(6, 'pr', 'fremtind/jokul', 6845, 'chore(portal): fjern manuelle klikk-events', 'closed', 1, at('2026-11-17T12:56:42Z'), at('2026-11-18T08:00:00Z'))
  items.run(7, 'pr', 'not a repo', 1, 'Uten adresse', 'closed', 1, at('2026-11-20T08:00:00Z'), at('2026-11-20T09:00:00Z'))
  const { github } = await storedFrontPage(d1(db), NOW)
  assert.equal(github?.contributions, 15)
  assert.equal(github?.merged, 3)
  assert.deepEqual(
    github?.latest.map((pull) => [pull.href, pull.title, pull.repo, pull.mergedAt]),
    [
      ['https://github.com/fremtind/jokul/pull/6845', 'chore(portal): fjern manuelle klikk-events', 'fremtind/jokul', '2026-11-18T08:00:00.000Z'],
      ['https://github.com/fremtind/jokul/pull/6844', 'feat(portal): skru på autocapture i Mixpanel', 'fremtind/jokul', '2026-11-17T14:27:14.000Z'],
      ['https://github.com/navikt/aksel/pull/1798', 'Ikon label og tekstendringer', 'navikt/aksel', '2023-02-09T13:29:23.000Z'],
    ],
  )
})

test('GitHub with nothing merged and no calendar shows nothing', async () => {
  const db = sqlite()
  db.exec(`INSERT INTO github_repos (full_name, language) VALUES ('lmfaole/lmfaole', 'TypeScript');
    INSERT INTO github_items (id, kind, repo, number, title, state, merged, created_at) VALUES (1, 'issue', 'fremtind/jokul', 1, 'Et issue', 'open', 0, 1763000000);`)
  assert.equal((await storedFrontPage(d1(db), NOW)).github, null)
})

test('the glossary, in Norwegian alphabetical order, links only to the web, and the front page links to it', async () => {
  const db = sqlite()
  // As scripts/import-dump.ts copies them from the old site's glossary.
  db.exec(`INSERT INTO glossary_term (id, term, url) VALUES
    ('vipps', 'Vipps', 'https://vipps.no'),
    ('aksel', 'Aksel', 'https://aksel.nav.no'),
    ('jokul', 'Jøkul', 'https://jokul.fremtind.no'),
    ('hoyskolen-kristiania', 'Høyskolen Kristiania', 'https://www.kristiania.no'),
    ('nav', 'NAV', 'https://www.nav.no'),
    ('skript', 'Skript', 'javascript:alert(1)');`)
  assert.deepEqual(
    (await storedGlossary(d1(db))).map((term) => [term.term, term.url, term.host]),
    [
      ['Aksel', 'https://aksel.nav.no/', 'aksel.nav.no'],
      ['Høyskolen Kristiania', 'https://www.kristiania.no/', 'kristiania.no'],
      ['Jøkul', 'https://jokul.fremtind.no/', 'jokul.fremtind.no'],
      ['NAV', 'https://www.nav.no/', 'nav.no'],
      ['Vipps', 'https://vipps.no/', 'vipps.no'],
    ],
  )
  assert.equal((await storedFrontPage(d1(db), NOW)).glossary, true)
})
