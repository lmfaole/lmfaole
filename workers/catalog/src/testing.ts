/** Stand-ins for the tests: D1 as SQLite in memory, made from packages/db's migrations, the API answers in fixtures/, and fetch answering from a table of addresses. */

import type { Database } from "@lmfaole/worker/d1"
import { migratedSqlite, sqliteD1 } from "@lmfaole/worker/testing"
import { readFileSync } from "node:fs"
import type { DatabaseSync } from "node:sqlite"

export { type Call, fakeFetch } from "@lmfaole/worker/testing"

export function database(name: "site" | "library"): { db: Database; sqlite: DatabaseSync } {
  const sqlite = migratedSqlite(new URL(`../../../packages/db/${name}/migrations/`, import.meta.url))
  return { sqlite, db: sqliteD1(sqlite) }
}

export const fixture = (name: string): unknown => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"))
