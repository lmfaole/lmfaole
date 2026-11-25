/**
 * The Worker's end of `stored.ts`: what the pages read from the D1 database `site` (the binding `SITE`). Where it has nothing yet (the import or the catalog has
 * not run, the migration is not applied) or cannot answer, the front page is the page's own words (`profile.ts`) and nothing more, so it looks as it did before
 * there was a database, and `/ordliste` has no terms (a 404). Only ever reads.
 */

import { env } from 'cloudflare:workers'

import { type Database, readOr } from '@lmfaole/web/d1'

import { type FrontPage, type GlossaryTerm, OWN_FRONT_PAGE, storedFrontPage, storedGlossary } from './stored'

const read = <T>(what: string, ask: (db: Database) => Promise<T>, fallback: T): Promise<T> => readOr(env['SITE'], `site: ${what}`, ask, fallback)

export const currentFrontPage = (now: Date): Promise<FrontPage> => read('the front page', (db) => storedFrontPage(db, now), OWN_FRONT_PAGE)

export const currentGlossary = (): Promise<GlossaryTerm[]> => read('the glossary', storedGlossary, [])
