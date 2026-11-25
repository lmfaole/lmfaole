/**
 * The D1 databases the activity Worker (`workers/activity`) fills every three hours: `music` (the listens, from ListenBrainz), `watching` (Trakt's history) and `games` (Steam and
 * RetroAchievements). The site only reads them, through a `Query` (`runtime.ts`) that keeps each answer for a while, as `get` does; a test hands it an in-memory SQLite. Pure.
 */

/** The databases, by the binding's name in `wrangler.jsonc`. */
export const DATABASES = { music: "MUSIC", watching: "WATCHING", games: "GAMES" } as const
export type Store = keyof typeof DATABASES

export type Row = Record<string, unknown>
export type Param = string | number | null

/** Asks a database and gives the rows, kept for `ttl` seconds. Throws where the database is not bound or the query fails (a table that is not there yet). */
export type Query = (store: Store, sql: string, params: readonly Param[], ttl: number) => Promise<Row[]>

/** As much of D1's binding as is used. */
export interface Database {
  prepare(sql: string): { bind(...values: Param[]): { all(): Promise<{ results: Row[] }> } }
}

export const asDatabase = (value: unknown): Database | null => (typeof value === "object" && value !== null && typeof (value as { prepare?: unknown }).prepare === "function" ? (value as Database) : null)

/** The error of a table that is not there (D1: «D1_ERROR: no such table: film_log: SQLITE_ERROR»). */
export const isMissingTable = (error: unknown): boolean => /no such table/i.test(error instanceof Error ? error.message : String(error))

/** The rows of a table that may not be there yet (a migration not applied): none where it is not. Any other failure is thrown. */
export async function optional(rows: Promise<Row[]>): Promise<Row[]> {
  try {
    return await rows
  } catch (error) {
    if (isMissingTable(error)) return []
    throw error
  }
}

export const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : typeof value === "bigint" ? Number(value) : null)
export const str = (value: unknown): string | null => (typeof value === "string" && value !== "" ? value : null)

/** A time rounded down to a step, in seconds: a query asked with it is the same query (and so kept) for the whole step. */
export const floorTo = (seconds: number, step: number): number => Math.floor(seconds / step) * step
