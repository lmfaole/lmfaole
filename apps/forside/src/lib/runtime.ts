/**
 * The Worker's end of `stored.ts`: who the front page is about, from the D1 database `site` (the binding `SITE`), or, while it has no CV (the import has not run, the
 * migration is not applied) or cannot answer, the page's own words (`profile.ts`), so the page looks as it did before there was a database. Only ever reads.
 */

import { env } from 'cloudflare:workers'

import { asDatabase, isMissingTable } from './d1'
import { OWNER, type Owner } from './profile'
import { storedOwner } from './stored'

export async function currentOwner(): Promise<Owner> {
  const db = asDatabase(env['SITE'])
  if (db === null) return OWNER
  try {
    return await storedOwner(db)
  } catch (error) {
    // A table that is not there yet is the same as no CV; anything else is worth seeing in the Worker's logs.
    if (!isMissingTable(error)) console.error('site: the owner could not be read from D1', error)
    return OWNER
  }
}
