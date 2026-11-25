/**
 * The Worker's end of `stored.ts`: what the pages read from the D1 database `site` (the binding `SITE`). Where it has nothing yet (the import or the catalog has
 * not run, the migration is not applied) or cannot answer, the front page is the page's own words (`profile.ts`) and nothing more, so it looks as it did before
 * there was a database, and `/ordliste` has no terms (a 404). Only ever reads.
 */

import { env } from 'cloudflare:workers'

import { asDatabase, type Database, isMissingTable } from './d1'
import { type FrontPage, type GlossaryTerm, OWN_FRONT_PAGE, storedFrontPage, storedGlossary } from './stored'

async function read<T>(what: string, ask: (db: Database) => Promise<T>, fallback: T): Promise<T> {
  const db = asDatabase(env['SITE'])
  if (db === null) return fallback
  try {
    return await ask(db)
  } catch (error) {
    // A table that is not there yet is the same as no rows; anything else is worth seeing in the Worker's logs.
    if (!isMissingTable(error)) console.error(`site: ${what} could not be read from D1`, error)
    return fallback
  }
}

export const currentFrontPage = (now: Date): Promise<FrontPage> => read('the front page', (db) => storedFrontPage(db, now), OWN_FRONT_PAGE)

export const currentGlossary = (): Promise<GlossaryTerm[]> => read('the glossary', storedGlossary, [])
