// The queries of the log (Logg, lib/log.ts): one row read, written or deleted at a time, in the owner's D1 databases. Only the columns
// the form has are written; what the import brought besides (film_log.same_as, game_log.source and igdb_id, books.source and
// openlibrary_id) is left as it is. New rows get the next id, as the schema has it: SQLite's own for an `INTEGER PRIMARY KEY`, the
// highest in the list plus one for books and board games (their key is the list and the line). Tested in lib/log-db.test.ts.

import { KINDS, keyOf, type EntryKey, type LogKind, type Row, type Value } from "./log.ts"

/** The part of a D1 binding the log uses (there are no Workers types in the app). */
export interface D1Statement {
  bind(...values: Value[]): D1Statement
  all<T = Row>(): Promise<{ results: T[] }>
  first<T = Row>(): Promise<T | null>
  run(): Promise<{ meta: { changes?: number } }>
}

export interface D1 {
  prepare(query: string): D1Statement
  batch(statements: D1Statement[]): Promise<unknown[]>
}

/** The columns a kind's form writes, in its order. */
export function columnsOf(kind: LogKind): string[] {
  return KINDS[kind].fields.flatMap((field) => (field.name === "list:status" ? ["list", "status"] : [field.name]))
}

/** What a kind's list is searched in. */
const NAME: Record<LogKind, string> = { film: "title", tv: "show", spill: "title", boker: "title", brettspill: "title", kinoer: "name" }

/** Newest first: by the date, the rows without one last, then the latest written. */
const ORDER: Record<LogKind, string> = {
  film: "watched_on DESC NULLS LAST, id DESC",
  tv: "watched_on DESC NULLS LAST, id DESC",
  spill: "on_date DESC NULLS LAST, id DESC",
  boker: "on_date DESC NULLS LAST, list DESC, id DESC",
  brettspill: "list DESC, id DESC",
  kinoer: "name COLLATE NOCASE",
}

const where = (key: EntryKey): { clause: string; values: Value[] } =>
  "name" in key ? { clause: "name = ?", values: [key.name] } : "list" in key ? { clause: "list = ? AND id = ?", values: [key.list, key.id] } : { clause: "id = ?", values: [key.id] }

/** `%text%` for LIKE, with its own `%`, `_` and `\` taken as they are. */
const contains = (text: string): string => `%${text.replace(/[\\%_]/g, (char) => `\\${char}`)}%`

/** The latest rows of a kind, or those whose title (show, name) has `search` in it, at most `limit`. */
export async function latest(db: D1, kind: LogKind, { limit, search = "" }: { limit: number; search?: string }): Promise<Row[]> {
  const { table } = KINDS[kind]
  const filter = search.trim() === "" ? "" : ` WHERE ${NAME[kind]} LIKE ? ESCAPE '\\'`
  const statement = db.prepare(`SELECT * FROM ${table}${filter} ORDER BY ${ORDER[kind]} LIMIT ?`)
  const { results } = await (filter === "" ? statement.bind(limit) : statement.bind(contains(search.trim()), limit)).all()
  return results
}

/** How many rows a kind has. */
export async function count(db: D1, kind: LogKind): Promise<number> {
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM ${KINDS[kind].table}`).first<{ n: number }>()
  return row?.n ?? 0
}

/** One row, or `null`. */
export async function getEntry(db: D1, kind: LogKind, key: EntryKey): Promise<Row | null> {
  const { clause, values } = where(key)
  return db.prepare(`SELECT * FROM ${KINDS[kind].table} WHERE ${clause}`).bind(...values).first()
}

/** The names of the cinemas, for a film's form. */
export async function cinemaNames(db: D1): Promise<string[]> {
  const { results } = await db.prepare("SELECT name FROM cinemas ORDER BY name COLLATE NOCASE").all<{ name: string }>()
  return results.map((row) => row.name)
}

export type Written = { ok: true; key: string } | { ok: false; reason: "missing" | "taken" | "in-use"; count?: number }

/** Adds a row (checked by `checkEntry`) and gives its key; a cinema whose name is taken is not added. */
export async function createEntry(db: D1, kind: LogKind, row: Row): Promise<Written> {
  const { table } = KINDS[kind]
  const columns = columnsOf(kind)
  const values = columns.map((column) => row[column] ?? null)
  if (kind === "kinoer") {
    const added = await db.prepare(`INSERT OR IGNORE INTO cinemas (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`).bind(...values).run()
    return added.meta.changes === 0 ? { ok: false, reason: "taken" } : { ok: true, key: String(row.name) }
  }
  if (kind === "boker" || kind === "brettspill") {
    const rest = columns.filter((column) => column !== "list")
    const query = `INSERT INTO ${table} (list, id, ${rest.join(", ")}) SELECT ?, COALESCE(MAX(id), 0) + 1, ${rest.map(() => "?").join(", ")} FROM ${table} WHERE list = ? RETURNING list, id`
    const added = await db.prepare(query).bind(row.list ?? null, ...rest.map((column) => row[column] ?? null), row.list ?? null).first()
    return added === null ? { ok: false, reason: "missing" } : { ok: true, key: keyOf(kind, added) }
  }
  const added = await db.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${columns.map(() => "?").join(", ")}) RETURNING id`).bind(...values).first()
  return added === null ? { ok: false, reason: "missing" } : { ok: true, key: keyOf(kind, added) }
}

/**
 * Changes a row's own columns and gives its key, which changes with a book's or a board game's list (it gets the next line in the new
 * one) and a cinema's name (the films seen there follow it). Not there: `missing`; a cinema renamed to one that is taken: `taken`.
 */
export async function updateEntry(db: D1, kind: LogKind, key: EntryKey, row: Row): Promise<Written> {
  const { table } = KINDS[kind]
  const { clause, values: keyValues } = where(key)
  if (kind === "kinoer" && "name" in key) {
    const name = String(row.name)
    if (name !== key.name && (await getEntry(db, kind, { name })) !== null) return { ok: false, reason: "taken" }
    const columns = columnsOf(kind)
    const [changed] = (await db.batch([
      db.prepare(`UPDATE cinemas SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE name = ?`).bind(...columns.map((column) => row[column] ?? null), key.name),
      db.prepare("UPDATE film_log SET cinema = ? WHERE cinema = ?").bind(name, key.name),
    ])) as [{ meta: { changes?: number } }]
    return changed.meta.changes === 0 ? { ok: false, reason: "missing" } : { ok: true, key: name }
  }
  if ((kind === "boker" || kind === "brettspill") && "list" in key) {
    const rest = columnsOf(kind).filter((column) => column !== "list")
    const moved = row.list !== key.list
    const set = [...(moved ? ["list = ?", `id = (SELECT COALESCE(MAX(id), 0) + 1 FROM ${table} WHERE list = ?)`] : []), ...rest.map((column) => `${column} = ?`)]
    const values = [...(moved ? [row.list ?? null, row.list ?? null] : []), ...rest.map((column) => row[column] ?? null)]
    const changed = await db.prepare(`UPDATE ${table} SET ${set.join(", ")} WHERE ${clause} RETURNING list, id`).bind(...values, ...keyValues).first()
    return changed === null ? { ok: false, reason: "missing" } : { ok: true, key: keyOf(kind, changed) }
  }
  const columns = columnsOf(kind)
  const changed = await db.prepare(`UPDATE ${table} SET ${columns.map((column) => `${column} = ?`).join(", ")} WHERE ${clause} RETURNING id`).bind(...columns.map((column) => row[column] ?? null), ...keyValues).first()
  return changed === null ? { ok: false, reason: "missing" } : { ok: true, key: keyOf(kind, changed) }
}

/** Deletes a row. A cinema films were seen at stays (`in-use`, with how many), so no film is left naming a cinema that is not there. */
export async function deleteEntry(db: D1, kind: LogKind, key: EntryKey): Promise<Written> {
  if (kind === "kinoer" && "name" in key) {
    const used = await db.prepare("SELECT COUNT(*) AS n FROM film_log WHERE cinema = ?").bind(key.name).first<{ n: number }>()
    if ((used?.n ?? 0) > 0) return { ok: false, reason: "in-use", count: used?.n ?? 0 }
  }
  const { clause, values } = where(key)
  const removed = await db.prepare(`DELETE FROM ${KINDS[kind].table} WHERE ${clause}`).bind(...values).run()
  return removed.meta.changes === 0 ? { ok: false, reason: "missing" } : { ok: true, key: "" }
}
