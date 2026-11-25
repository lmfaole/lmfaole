/**
 * What the pages read from the D1 database `site` (through `@lmfaole/web/d1`). The front page: who it is about, the name (`cv_person`) and the role, the title of the newest
 * position that goes on and its employer, «Senior frontend-utvikler hos Fremtind»; what the owner did on GitHub lately (`github_days`, `github_items`, which
 * `workers/catalog` keeps); and whether there is a glossary to link to. `/ordliste`: the glossary (`glossary_term`, from `scripts/import-dump.ts`). What the
 * database does not have yet is the page's own words (`profile.ts`), or nothing. Pure but for the database.
 */

import { type Database, num, readAll, type Row, str } from '@lmfaole/web/d1'

import { OWNER, type Owner } from './profile.ts'

/** How many of the latest merged pull requests the front page lists. */
export const LATEST_PULLS = 5
/** What «det siste året» is: the days and the merges this far back. */
const YEAR_MS = 365 * 86_400_000

export const SQL = {
  person: 'SELECT navn FROM cv_person ORDER BY id LIMIT 1',
  role: `SELECT position.tittel, employer.navn AS arbeidsgiver
    FROM cv_position AS position JOIN cv_employer AS employer ON employer.id = position.arbeidsgiver_id
    WHERE position.til IS NULL ORDER BY position.fra DESC, position.id DESC LIMIT 1`,
  /** GitHub's count of contributions on the days after `?` (YYYY-MM-DD). */
  contributions: 'SELECT COALESCE(SUM(contributions), 0) AS total FROM github_days WHERE day > ?',
  /** Pull requests the owner opened that were merged after `?` (seconds). */
  merged: "SELECT COUNT(*) AS total FROM github_items WHERE kind = 'pr' AND merged = 1 AND closed_at > ?",
  latestMerged: `SELECT repo, number, title, closed_at FROM github_items
    WHERE kind = 'pr' AND merged = 1 AND closed_at IS NOT NULL ORDER BY closed_at DESC, id DESC LIMIT ${LATEST_PULLS}`,
  hasGlossary: 'SELECT 1 AS found FROM glossary_term LIMIT 1',
  glossary: 'SELECT id, term, url FROM glossary_term',
} as const

/** The owner of the rows, each part the page's own where the rows have none. */
export function ownerOf(person: Row[], role: Row[], fallback: Owner = OWNER): Owner {
  const name = str(person[0]?.['navn'])
  const title = str(role[0]?.['tittel'])
  const employer = str(role[0]?.['arbeidsgiver'])
  return { name: name ?? fallback.name, role: title === null || employer === null ? fallback.role : `${title} hos ${employer}` }
}

/** A pull request the owner opened that was merged, with its address on GitHub. */
export interface MergedPull {
  key: string
  repo: string
  title: string
  href: string
  /** When it was merged (ISO). */
  mergedAt: string
}

/** What the owner did on GitHub in public: the counts of the last year (0 where GitHub has none) and the latest merged pull requests. */
export interface GithubActivity {
  contributions: number
  merged: number
  latest: MergedPull[]
}

const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/

/** The activity of the rows, or none where there is nothing to show (the catalog has not run). A row that cannot make a GitHub address is left out. */
export function githubOf(contributions: Row[], merged: Row[], latest: Row[]): GithubActivity | null {
  const pulls = latest.flatMap((row): MergedPull[] => {
    const repo = str(row['repo'])
    const number = num(row['number'])
    const title = str(row['title'])
    const closed = num(row['closed_at'])
    if (repo === null || !REPO.test(repo) || number === null || !Number.isInteger(number) || number <= 0 || title === null || closed === null) return []
    return [{ key: `${repo}#${number}`, repo, title, href: `https://github.com/${repo}/pull/${number}`, mergedAt: new Date(closed * 1000).toISOString() }]
  })
  const activity = { contributions: num(contributions[0]?.['total']) ?? 0, merged: num(merged[0]?.['total']) ?? 0, latest: pulls }
  return activity.contributions > 0 || activity.merged > 0 || pulls.length > 0 ? activity : null
}

/** What the front page shows from the database. */
export interface FrontPage {
  owner: Owner
  github: GithubActivity | null
  /** There is a glossary, so the front page links to `/ordliste`. */
  glossary: boolean
}

/** The front page before there is a database: the page's own words and nothing more. */
export const OWN_FRONT_PAGE: FrontPage = { owner: OWNER, github: null, glossary: false }

/** The front page from the database, in one round trip; «the last year» is the year before `now`. Throws where it cannot answer (a table not there yet). */
export async function storedFrontPage(db: Database, now: Date): Promise<FrontPage> {
  const since = now.getTime() - YEAR_MS
  const [person = [], role = [], contributions = [], merged = [], latest = [], glossary = []] = await readAll(db, [
    SQL.person,
    SQL.role,
    { sql: SQL.contributions, params: [new Date(since).toISOString().slice(0, 10)] },
    { sql: SQL.merged, params: [Math.floor(since / 1000)] },
    SQL.latestMerged,
    SQL.hasGlossary,
  ])
  return { owner: ownerOf(person, role), github: githubOf(contributions, merged, latest), glossary: glossary.length > 0 }
}

/** A word in the texts that links somewhere: the place it links to, and that place's host to show beside it («aksel.nav.no»). */
export interface GlossaryTerm {
  id: string
  term: string
  url: string
  host: string
}

const collator = new Intl.Collator('nb', { sensitivity: 'base' })

/** The glossary of the rows, in Norwegian alphabetical order. A term without a web address (`https:` or `http:`) is left out. */
export function glossaryOf(rows: Row[]): GlossaryTerm[] {
  return rows
    .flatMap((row): GlossaryTerm[] => {
      const id = str(row['id'])
      const term = str(row['term'])
      const url = URL.parse(str(row['url']) ?? '')
      if (id === null || term === null || url === null || (url.protocol !== 'https:' && url.protocol !== 'http:')) return []
      return [{ id, term, url: url.href, host: url.hostname.replace(/^www\./, '') }]
    })
    .toSorted((a, b) => collator.compare(a.term, b.term))
}

/** The glossary from the database. Throws where it cannot answer. */
export async function storedGlossary(db: Database): Promise<GlossaryTerm[]> {
  const [rows = []] = await readAll(db, [SQL.glossary])
  return glossaryOf(rows)
}
