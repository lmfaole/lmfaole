/**
 * The D1 database `site` (the binding `SITE` in `wrangler.jsonc`), which `scripts/import-dump.ts` fills with the CV (the same rows `apps/cv` shows) and the glossary,
 * and `workers/catalog` with the owner's public GitHub. The site only reads it, in one batch of `SELECT`s; a test hands it an in-memory SQLite with the real
 * migration. Pure.
 */

export type Row = Record<string, unknown>

/** As much of D1's binding as is used: statements, with their parameters bound, asked together in one round trip. */
export interface Statement {
  bind(...values: (string | number)[]): Statement
  all(): Promise<{ results: Row[] }>
}
export interface Database {
  prepare(sql: string): Statement
  batch(statements: Statement[]): Promise<{ results: Row[] }[]>
}

export const asDatabase = (value: unknown): Database | null =>
  typeof value === 'object' && value !== null && typeof (value as { prepare?: unknown }).prepare === 'function' && typeof (value as { batch?: unknown }).batch === 'function'
    ? (value as Database)
    : null

/** The error of a table that is not there (D1: «D1_ERROR: no such table: cv_person: SQLITE_ERROR»): the migration is not applied. */
export const isMissingTable = (error: unknown): boolean => /no such table/i.test(error instanceof Error ? error.message : String(error))

/** A query: its SQL alone, or with the values of its `?`s. */
export type Query = string | { sql: string; params: readonly (string | number)[] }

/** The rows of each query, in order. */
export async function readAll(db: Database, queries: readonly Query[]): Promise<Row[][]> {
  const answers = await db.batch(queries.map((query) => (typeof query === 'string' ? db.prepare(query) : db.prepare(query.sql).bind(...query.params))))
  return answers.map((answer) => answer.results)
}

export const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'bigint' ? Number(value) : null)
export const str = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null)
