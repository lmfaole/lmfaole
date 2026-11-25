/** A D1 stand-in for the tests: SQLite in memory, made from the database's migrations. */

import type { Database } from "@lmfaole/worker/d1"
import { migratedSqlite, sqliteD1 } from "@lmfaole/worker/testing"
import type { DatabaseSync } from "node:sqlite"

export function database(name: "music" | "gameplay" | "watching"): { db: Database; sqlite: DatabaseSync } {
  const sqlite = migratedSqlite(new URL(`../migrations/${name}/`, import.meta.url))
  return { sqlite, db: sqliteD1(sqlite) }
}
