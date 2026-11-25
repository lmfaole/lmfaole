/**
 * The Worker's end of `stored.ts`: the CV from the D1 database `site` (the binding `SITE`), or, while it has none (the import has not run, the migration is not applied)
 * or cannot answer, the checked-in snapshot `src/data/cv.json`, so the page looks as it did before there was a database. Only ever reads.
 */

import { env } from 'cloudflare:workers'

import snapshot from '../data/cv.json'
import type { Cv } from './cv'
import { asDatabase, isMissingTable } from './d1'
import { storedCv } from './stored'

export async function currentCv(): Promise<Cv> {
  const db = asDatabase(env['SITE'])
  if (db !== null) {
    try {
      const stored = await storedCv(db)
      if (stored !== null) return stored
    } catch (error) {
      // A table that is not there yet is the same as no CV; anything else is worth seeing in the Worker's logs.
      if (!isMissingTable(error)) console.error('site: the CV could not be read from D1', error)
    }
  }
  return snapshot
}
