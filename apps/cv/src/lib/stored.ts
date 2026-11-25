/**
 * The CV from the D1 database `site` (`d1.ts`), in the same shape as the snapshot `src/data/cv.json` (`cv.ts`), read by named columns, so a column added to a
 * table is not published until it is listed here (the person's source and the day it was fetched never are). As the old monorepo's `/api/cv.json` did:
 * education after primary school only (the grunnskole rows say where the owner grew up), each project inside the role it was done in, and the employers
 * ordered by their newest role. Pure but for the database that is passed in.
 */

import type { Cv, Education, Employer, Person, Project, Role } from './cv.ts'
import { type Database, num, readAll, type Row, str } from './d1.ts'

export const SQL = {
  person: 'SELECT navn, tittel, arbeidsgiver, sted FROM cv_person ORDER BY id LIMIT 1',
  employers: 'SELECT id, navn, sted FROM cv_employer ORDER BY id',
  positions: 'SELECT id, arbeidsgiver_id, aar, fra, til, tittel, beskrivelse FROM cv_position ORDER BY fra DESC, id DESC',
  education: "SELECT aar, fra, til, grad, institusjon, beskrivelse FROM cv_education WHERE grad NOT LIKE 'Grunnskole%' ORDER BY fra DESC, id DESC",
  // The latest commit is `workers/catalog`'s, which keeps only a public repository's.
  projects: `SELECT project.stilling_id, project.aar, project.fra, project.til, project.navn, project.tittel, project.url, project.beskrivelse,
      latest.repo AS commit_repo, latest.sha AS commit_sha, latest.message AS commit_message, latest.committed_at AS commit_at
    FROM cv_project AS project LEFT JOIN github_project_commits AS latest ON latest.repo = project.repo
    ORDER BY project.fra DESC, project.id DESC`,
  links: 'SELECT navn, url FROM cv_link ORDER BY id',
} as const

export interface CvRows {
  person: Row[]
  employers: Row[]
  positions: Row[]
  education: Row[]
  projects: Row[]
  links: Row[]
}

/** A time in seconds since 1970 as the snapshot writes it, «2026-11-17T12:55:35Z». */
export const isoSeconds = (at: number): string => new Date(at * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z')

function personOf(row: Row | undefined): Person | null {
  const navn = str(row?.['navn'])
  if (row === undefined || navn === null) return null
  return { navn, tittel: str(row['tittel']), arbeidsgiver: str(row['arbeidsgiver']), sted: str(row['sted']) }
}

/** A project as published: the commit's columns become one `github` part, there only with a whole commit. */
function projectOf(row: Row): Project | null {
  const aar = num(row['aar'])
  const navn = str(row['navn'])
  if (aar === null || navn === null) return null
  const repo = str(row['commit_repo'])
  const sha = str(row['commit_sha'])
  const message = str(row['commit_message'])
  const at = num(row['commit_at'])
  const github = repo !== null && sha !== null && message !== null && at !== null ? { repo, commit: { message, at: isoSeconds(at), url: `https://github.com/${repo}/commit/${sha}` } } : null
  return { aar, fra: str(row['fra']), til: str(row['til']), navn, tittel: str(row['tittel']), url: str(row['url']), beskrivelse: str(row['beskrivelse']), github }
}

function educationOf(row: Row): Education | null {
  const aar = num(row['aar'])
  const grad = str(row['grad'])
  if (aar === null || grad === null) return null
  return { aar, fra: str(row['fra']), til: str(row['til']), grad, institusjon: str(row['institusjon']), beskrivelse: str(row['beskrivelse']) }
}

/**
 * The employers, each with its roles (newest first, as the rows come) and each role with its projects, ordered by the newest role. A project of a role that is not
 * there, and an employer with no role, are not shown.
 */
function employersOf(employers: Row[], positions: Row[], projects: Row[]): Employer[] {
  const found: Employer[] = []
  for (const employer of employers) {
    const id = num(employer['id'])
    const navn = str(employer['navn'])
    if (id === null || navn === null) continue
    const roles = positions.flatMap((position): Role[] => {
      const aar = num(position['aar'])
      const tittel = str(position['tittel'])
      if (num(position['arbeidsgiver_id']) !== id || aar === null || tittel === null) return []
      const own = projects.filter((project) => num(project['stilling_id']) === num(position['id'])).flatMap((project) => projectOf(project) ?? [])
      return [{ aar, fra: str(position['fra']), til: str(position['til']), tittel, beskrivelse: str(position['beskrivelse']), projects: own }]
    })
    if (roles.length > 0) found.push({ navn, sted: str(employer['sted']), roles })
  }
  return found.toSorted((a, b) => (b.roles[0]?.fra ?? '').localeCompare(a.roles[0]?.fra ?? ''))
}

/** The CV of the rows; none while the database has no CV yet (no person, or no employer with a role), so the snapshot is shown instead. */
export function cvOf(rows: CvRows): Cv | null {
  const person = personOf(rows.person[0])
  const employers = employersOf(rows.employers, rows.positions, rows.projects)
  if (person === null || employers.length === 0) return null
  return {
    person,
    employers,
    education: rows.education.flatMap((row) => educationOf(row) ?? []),
    links: rows.links.flatMap((row) => {
      const navn = str(row['navn'])
      const url = str(row['url'])
      return navn === null || url === null ? [] : [{ navn, url }]
    }),
  }
}

/** The CV from the database, in one round trip; none while it has none. Throws where it cannot answer (a table not there yet). */
export async function storedCv(db: Database): Promise<Cv | null> {
  const [person = [], employers = [], positions = [], education = [], projects = [], links = []] = await readAll(db, [SQL.person, SQL.employers, SQL.positions, SQL.education, SQL.projects, SQL.links])
  return cvOf({ person, employers, positions, education, projects, links })
}
