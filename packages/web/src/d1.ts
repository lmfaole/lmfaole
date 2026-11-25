/**
 * Reading D1. The apps only read (`SELECT`, never a migration or a write), mostly in one batch; a test hands them an in-memory SQLite with the real
 * migration (`sqliteD1` in `testing.ts`). Pure, apart from `readOr`'s log line.
 */

export type Row = Record<string, unknown>
export type Param = string | number | null

/** As much of D1's binding as is used: statements, with their parameters bound, asked alone or together in one round trip. */
export interface Statement {
  bind(...values: Param[]): Statement
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
export type Query = string | { sql: string; params: readonly Param[] }

/** The rows of each query, in order. */
export async function readAll(db: Database, queries: readonly Query[]): Promise<Row[][]> {
  const answers = await db.batch(queries.map((query) => (typeof query === 'string' ? db.prepare(query) : db.prepare(query.sql).bind(...query.params))))
  return answers.map((answer) => answer.results)
}

/**
 * What `ask` reads from the database `binding` is, or `fallback` where it is not bound or cannot answer, so a page looks as it did before there was a
 * database. A table that is not there yet is the same as no rows; anything else is worth seeing in the Worker's logs, as «`what` could not be read from D1».
 */
export async function readOr<T>(binding: unknown, what: string, ask: (db: Database) => Promise<T>, fallback: T): Promise<T> {
  const db = asDatabase(binding)
  if (db === null) return fallback
  try {
    return await ask(db)
  } catch (error) {
    if (!isMissingTable(error)) console.error(`${what} could not be read from D1`, error)
    return fallback
  }
}

/** The rows of a table that may not be there yet (a migration not applied): none where it is not. Any other failure is thrown. */
export async function optional(rows: Promise<Row[]>): Promise<Row[]> {
  try {
    return await rows
  } catch (error) {
    if (isMissingTable(error)) return []
    throw error
  }
}

export const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : typeof value === 'bigint' ? Number(value) : null)
export const str = (value: unknown): string | null => (typeof value === 'string' && value !== '' ? value : null)
