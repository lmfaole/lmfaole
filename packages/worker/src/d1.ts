/** As much of D1's binding as the Workers use, so the tests can stand in for it (`sqliteD1` in `testing.ts`). The apps read through the narrower
 *  `@lmfaole/web/d1`; a `Database` here is one there too. Pure. */

export type Row = Record<string, unknown>

export interface Statement {
  bind(...values: unknown[]): Statement
  first<R = Row>(): Promise<R | null>
  all<R = Row>(): Promise<{ results: R[] }>
  run(): Promise<unknown>
}

export interface Database {
  prepare(sql: string): Statement
  batch(statements: Statement[]): Promise<unknown[]>
}

/** The rows a batch wrote, as D1 reports them (`meta.rows_written`, which counts index writes too; the stand-in counts changed rows). */
export function rowsWritten(results: unknown[]): number {
  let sum = 0
  for (const result of results) {
    const meta = (result as { meta?: { rows_written?: unknown } } | null)?.meta
    if (typeof meta?.rows_written === "number") sum += meta.rows_written
  }
  return sum
}
