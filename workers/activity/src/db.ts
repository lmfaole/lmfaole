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
