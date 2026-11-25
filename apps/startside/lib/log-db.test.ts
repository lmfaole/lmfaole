import { strict as assert } from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync, type SQLInputValue } from "node:sqlite"
import { test } from "node:test"

import { cinemaNames, count, createEntry, deleteEntry, getEntry, latest, updateEntry, type D1, type D1Statement } from "./log-db.ts"
import type { Value } from "./log.ts"

/** A database with the migrations of the real one, behind the part of D1's API the log uses. */
function database(dir: string): D1 {
  const sqlite = new DatabaseSync(":memory:")
  const migrations = new URL(dir, import.meta.url)
  for (const file of readdirSync(migrations).filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(new URL(file, migrations), "utf8"))
  const statement = (query: string, values: Value[] = []): D1Statement => ({
    bind: (...more) => statement(query, [...values, ...more]),
    all: async <T,>() => ({ results: sqlite.prepare(query).all(...(values as SQLInputValue[])) as T[] }),
    first: async <T,>() => (sqlite.prepare(query).get(...(values as SQLInputValue[])) ?? null) as T | null,
    run: async () => ({ meta: { changes: Number(sqlite.prepare(query).run(...(values as SQLInputValue[])).changes) } }),
  })
  return {
    prepare: (query) => statement(query),
    batch: async (statements) => {
      sqlite.exec("BEGIN")
      try {
        const results = []
        for (const one of statements) results.push(await one.run())
        sqlite.exec("COMMIT")
        return results
      } catch (error) {
        sqlite.exec("ROLLBACK")
        throw error
      }
    },
  }
}

const watching = () => database("../../../workers/activity/migrations/watching/")
const gameplay = () => database("../../../workers/activity/migrations/gameplay/")
const library = () => database("../../../packages/db/library/migrations/")

test("a film gets the next id and keeps what the import brought when it is changed", async () => {
  const db = watching()
  await db.prepare("INSERT INTO film_log (id, title, same_as) VALUES (41, 'Old', 'trakt:9')").run()
  const added = await createEntry(db, "film", { watched_on: "2026-11-24", title: "Flow", year: 2024, tmdb_id: null, cinema: null, seat: null, note: null })
  assert.deepEqual(added, { ok: true, key: "42" })
  const changed = await updateEntry(db, "film", { id: 41 }, { watched_on: null, title: "Old, seen again", year: null, tmdb_id: 5, cinema: null, seat: null, note: "x" })
  assert.deepEqual(changed, { ok: true, key: "41" })
  assert.equal((await getEntry(db, "film", { id: 41 }))?.same_as, "trakt:9")
  assert.deepEqual((await latest(db, "film", { limit: 5 })).map((row) => row.id), [42, 41])
  assert.deepEqual((await latest(db, "film", { limit: 5, search: "seen" })).map((row) => row.id), [41])
  assert.deepEqual(await latest(db, "film", { limit: 5, search: "100%" }), [])
  assert.deepEqual(await deleteEntry(db, "film", { id: 42 }), { ok: true, key: "" })
  assert.deepEqual(await deleteEntry(db, "film", { id: 42 }), { ok: false, reason: "missing" })
  assert.deepEqual(await updateEntry(db, "film", { id: 42 }, { title: "Gone" }), { ok: false, reason: "missing" })
  assert.equal(await count(db, "film"), 1)
})

test("an episode and a game are written and read", async () => {
  const tv = watching()
  assert.deepEqual(await createEntry(tv, "tv", { watched_on: "2026-11-24", show: "Severance", season: 2, episode: 7, episode_title: null, tmdb_id: null }), { ok: true, key: "1" })
  const games = gameplay()
  await games.prepare("INSERT INTO game_log (id, title, status, source, igdb_id) VALUES (3, 'Hades', 'playing', 'steam:1145360', 113112)").run()
  assert.deepEqual(await updateEntry(games, "spill", { id: 3 }, { on_date: "2026-11-20", title: "Hades", status: "done", hours: 40.5, platform: "steam", note: null }), { ok: true, key: "3" })
  const hades = await getEntry(games, "spill", { id: 3 })
  assert.equal(hades?.status, "done")
  assert.equal(hades?.source, "steam:1145360")
  assert.equal(hades?.igdb_id, 113112)
})

test("a book gets the next line of its list, and a new one when it moves to the other", async () => {
  const db = library()
  await db.prepare("INSERT INTO books (list, id, title, status, source) VALUES ('log', 7, 'Old', 'done', 'hardcover:1')").run()
  const book = { list: "collection", status: "want", title: "Ny", year: null, on_date: null, rating: null, format: null }
  assert.deepEqual(await createEntry(db, "boker", book), { ok: true, key: "collection-1" })
  assert.deepEqual(await createEntry(db, "boker", { ...book, list: "log", status: "reading" }), { ok: true, key: "log-8" })
  assert.deepEqual(await updateEntry(db, "boker", { list: "collection", id: 1 }, { ...book, list: "log", status: "done", rating: 4.5 }), { ok: true, key: "log-9" })
  assert.equal(await getEntry(db, "boker", { list: "collection", id: 1 }), null)
  assert.equal((await getEntry(db, "boker", { list: "log", id: 9 }))?.rating, 4.5)
  assert.deepEqual(await updateEntry(db, "boker", { list: "log", id: 7 }, { list: "log", status: "dropped", title: "Old", year: 1999, on_date: null, rating: null, format: null }), { ok: true, key: "log-7" })
  assert.equal((await getEntry(db, "boker", { list: "log", id: 7 }))?.source, "hardcover:1")
  assert.deepEqual(await createEntry(db, "brettspill", { title: "Azul", list: "log", status: "played", format: "fysisk" }), { ok: true, key: "log-1" })
  assert.deepEqual(await deleteEntry(db, "brettspill", { list: "log", id: 1 }), { ok: true, key: "" })
})

test("a cinema's name is its key: a rename takes its films along, and one with films is not deleted", async () => {
  const db = watching()
  const vega = { name: "Vega kino", city: "Oslo", country: "NO", website: null }
  assert.deepEqual(await createEntry(db, "kinoer", vega), { ok: true, key: "Vega kino" })
  assert.deepEqual(await createEntry(db, "kinoer", vega), { ok: false, reason: "taken" })
  await createEntry(db, "kinoer", { ...vega, name: "Saga" })
  await createEntry(db, "film", { title: "Flow", cinema: "Vega kino" })
  assert.deepEqual(await updateEntry(db, "kinoer", { name: "Vega kino" }, { ...vega, name: "Saga" }), { ok: false, reason: "taken" })
  assert.deepEqual(await updateEntry(db, "kinoer", { name: "Vega kino" }, { ...vega, name: "Vega" }), { ok: true, key: "Vega" })
  assert.equal((await getEntry(db, "film", { id: 1 }))?.cinema, "Vega")
  assert.deepEqual(await cinemaNames(db), ["Saga", "Vega"])
  assert.deepEqual(await deleteEntry(db, "kinoer", { name: "Vega" }), { ok: false, reason: "in-use", count: 1 })
  assert.deepEqual(await deleteEntry(db, "kinoer", { name: "Saga" }), { ok: true, key: "" })
})
