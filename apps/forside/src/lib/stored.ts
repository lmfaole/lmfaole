/**
 * Who the front page is about, from the CV in the D1 database `site` (`d1.ts`): the name (`cv_person`) and the role, the title of the newest position that goes on
 * and its employer, «Senior frontend-utvikler hos Fremtind». What the database does not have yet is the page's own words (`profile.ts`). Pure but for the database.
 */

import { type Database, readAll, type Row, str } from './d1.ts'
import { OWNER, type Owner } from './profile.ts'

export const SQL = {
  person: 'SELECT navn FROM cv_person ORDER BY id LIMIT 1',
  role: `SELECT position.tittel, employer.navn AS arbeidsgiver
    FROM cv_position AS position JOIN cv_employer AS employer ON employer.id = position.arbeidsgiver_id
    WHERE position.til IS NULL ORDER BY position.fra DESC, position.id DESC LIMIT 1`,
} as const

/** The owner of the rows, each part the page's own where the rows have none. */
export function ownerOf(person: Row[], role: Row[], fallback: Owner = OWNER): Owner {
  const name = str(person[0]?.['navn'])
  const title = str(role[0]?.['tittel'])
  const employer = str(role[0]?.['arbeidsgiver'])
  return { name: name ?? fallback.name, role: title === null || employer === null ? fallback.role : `${title} hos ${employer}` }
}

/** The owner from the database, in one round trip. Throws where it cannot answer (a table not there yet). */
export async function storedOwner(db: Database): Promise<Owner> {
  const [person = [], role = []] = await readAll(db, [SQL.person, SQL.role])
  return ownerOf(person, role)
}
