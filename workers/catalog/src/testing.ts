/** Stand-ins for the tests: D1 as SQLite in memory, made from packages/db's migrations, and fetch answering from a table of addresses. */

import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync, type SQLInputValue } from "node:sqlite"
import type { Database, Fetch, Statement } from "./db.ts"

export function database(name: "site" | "library"): { db: Database; sqlite: DatabaseSync } {
  const sqlite = new DatabaseSync(":memory:")
  const dir = new URL(`../../../packages/db/${name}/migrations/`, import.meta.url)
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) sqlite.exec(readFileSync(new URL(file, dir), "utf8"))
  const statement = (sql: string, values: SQLInputValue[]): Statement => ({
    bind: (...next) => statement(sql, next as SQLInputValue[]),
    first: async <Row>() => (sqlite.prepare(sql).get(...values) ?? null) as Row | null,
    all: async <Row>() => ({ results: sqlite.prepare(sql).all(...values) as Row[] }),
    run: async () => sqlite.prepare(sql).run(...values),
  })
  return {
    sqlite,
    db: {
      prepare: (sql) => statement(sql, []),
      // Like D1: each statement's meta.rows_written (changes, here), and all or nothing.
      batch: async (all) => {
        sqlite.exec("BEGIN")
        try {
          const results = []
          for (const s of all) results.push({ meta: { rows_written: Number(((await s.run()) as { changes: number | bigint }).changes) } })
          sqlite.exec("COMMIT")
          return results
        } catch (error) {
          sqlite.exec("ROLLBACK")
          throw error
        }
      },
    },
  }
}

export const fixture = (name: string): unknown => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"))

export interface Call {
  url: string
  body?: { query: string; variables: Record<string, unknown> }
  headers: Record<string, string>
}

/** A fetch whose answer is the first route whose test matches the call; a call no route matches fails the test. */
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
