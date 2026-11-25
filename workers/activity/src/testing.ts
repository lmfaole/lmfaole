/** A D1 stand-in for the tests: SQLite in memory, made from the database's migrations. */

import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync, type SQLInputValue } from "node:sqlite"
import type { Database, Statement } from "./db.ts"

export function database(name: "music" | "gameplay" | "watching"): { db: Database; sqlite: DatabaseSync } {
  const sqlite = new DatabaseSync(":memory:")
  const dir = new URL(`../migrations/${name}/`, import.meta.url)
  for (const file of readdirSync(dir).sort()) sqlite.exec(readFileSync(new URL(file, dir), "utf8"))
  const statement = (sql: string, values: SQLInputValue[]): Statement => ({
    bind: (...next) => statement(sql, next as SQLInputValue[]),
    first: async <Row>() => (sqlite.prepare(sql).get(...values) ?? null) as Row | null,
    all: async <Row>() => ({ results: sqlite.prepare(sql).all(...values) as Row[] }),
    run: async () => sqlite.prepare(sql).run(...values),
  })
  return { sqlite, db: { prepare: (sql) => statement(sql, []), batch: async (all) => { for (const s of all) await s.run(); return [] } } }
}
