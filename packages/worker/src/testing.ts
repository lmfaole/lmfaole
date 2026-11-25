/** Stand-ins for the tests (`node --test`), never for a Worker: they read files and use `node:sqlite`. D1 as SQLite in memory made from the real
 *  migrations, and fetch answering from a table of addresses. */

import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync, type SQLInputValue } from "node:sqlite"

import type { Row } from "./d1.ts"
import type { Fetch } from "./fetch.ts"

/** An in-memory SQLite with every migration (`*.sql`) in `migrations` applied in order (none with `migrated` false: the database before the migration). */
export function migratedSqlite(migrations: URL, migrated = true): DatabaseSync {
  const db = new DatabaseSync(":memory:")
  if (migrated) for (const file of readdirSync(migrations).toSorted()) if (file.endsWith(".sql")) db.exec(readFileSync(new URL(file, migrations), "utf8"))
  return db
}

/** What D1 answers for each statement of a batch: the rows it read, and the rows it wrote (changed rows, here; D1 counts index writes too). */
export interface BatchResult {
  results: Row[]
  meta: { rows_written: number }
}

export interface SqliteStatement {
  bind(...values: unknown[]): SqliteStatement
  first<R = Row>(): Promise<R | null>
  all<R = Row>(): Promise<{ results: R[] }>
  run(): Promise<{ changes: number | bigint; lastInsertRowid: number | bigint }>
}

/** D1's binding over a SQLite: a `Database` of `@lmfaole/worker/d1` and of `@lmfaole/web/d1`. */
export interface SqliteD1 {
  prepare(sql: string): SqliteStatement
  /** Like D1: in order, all or nothing. */
  batch(statements: SqliteStatement[]): Promise<BatchResult[]>
}

export function sqliteD1(db: DatabaseSync): SqliteD1 {
  const sources = new WeakMap<SqliteStatement, { sql: string; params: SQLInputValue[] }>()
  const statement = (sql: string, params: SQLInputValue[] = []): SqliteStatement => {
    const s: SqliteStatement = {
      bind: (...values) => statement(sql, values as SQLInputValue[]),
      first: async <R>() => (db.prepare(sql).get(...params) ?? null) as R | null,
      all: async <R>() => ({ results: db.prepare(sql).all(...params) as R[] }),
      run: async () => db.prepare(sql).run(...params),
    }
    sources.set(s, { sql, params })
    return s
  }
  const result = (s: SqliteStatement): BatchResult => {
    const source = sources.get(s)
    if (source === undefined) throw new Error("a statement of another database in the batch")
    const { sql, params } = source
    const prepared = db.prepare(sql)
    if (prepared.columns().length > 0) return { results: prepared.all(...params) as Row[], meta: { rows_written: 0 } }
    return { results: [], meta: { rows_written: Number(prepared.run(...params).changes) } }
  }
  return {
    prepare: (sql) => statement(sql),
    batch: async (statements) => {
      db.exec("BEGIN")
      try {
        const results = statements.map(result)
        db.exec("COMMIT")
        return results
      } catch (error) {
        db.exec("ROLLBACK")
        throw error
      }
    },
  }
}

/** A call `fakeFetch` was made: its address, its JSON body (a GraphQL query and its variables, for the APIs that take one) and its headers. */
export interface Call {
  url: string
  body?: { query: string; variables: Record<string, unknown> }
  headers: Record<string, string>
}

/** A fetch whose answer is the first route whose test matches the call (a `Response`, or anything else as JSON); a call no route matches fails the test. */
export function fakeFetch(routes: [(call: Call) => boolean, (call: Call) => Response | unknown][]): { fetch: Fetch; calls: Call[] } {
  const calls: Call[] = []
  const fetch: Fetch = async (input, init) => {
    const call: Call = {
      url: input,
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
      headers: (init?.headers ?? {}) as Record<string, string>,
    }
    calls.push(call)
    const route = routes.find(([test]) => test(call))
    if (route === undefined) throw new Error(`no route for ${input} ${init?.body ?? ""}`)
    const answer = await route[1](call)
    return answer instanceof Response ? answer : Response.json(answer)
  }
  return { fetch, calls }
}
