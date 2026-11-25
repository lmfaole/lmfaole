/** The bits of D1 this Worker uses, so the tests can stand in for it. */

export interface Statement {
  bind(...values: unknown[]): Statement
  first<Row = Record<string, unknown>>(): Promise<Row | null>
  all<Row = Record<string, unknown>>(): Promise<{ results: Row[] }>
  run(): Promise<unknown>
}

export interface Database {
  prepare(sql: string): Statement
  batch(statements: Statement[]): Promise<unknown[]>
}

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>

/** The rows a batch wrote, as D1 reports them (`meta.rows_written`, which counts index writes too); 0 from the test stand-in. */
export function rowsWritten(results: unknown[]): number {
  let sum = 0
  for (const result of results) {
    const meta = (result as { meta?: { rows_written?: unknown } } | null)?.meta
    if (typeof meta?.rows_written === "number") sum += meta.rows_written
  }
  return sum
}
