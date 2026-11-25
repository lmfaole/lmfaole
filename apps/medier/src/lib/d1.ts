/**
 * The D1 databases the activity Worker (`workers/activity`) fills every three hours: `music` (the listens, from ListenBrainz), `watching` (Trakt's history) and `games` (Steam and
 * RetroAchievements). The site only reads them, through a `Query` (`runtime.ts`) that keeps each answer for a while, as `get` does; a test hands it an in-memory SQLite. Pure.
 * The rows and their values are read with `@lmfaole/web/d1`, as every app reads D1.
 */

import type { Param, Row } from "@lmfaole/web/d1"

/** The databases, by the binding's name in `wrangler.jsonc`. */
export const DATABASES = { music: "MUSIC", watching: "WATCHING", games: "GAMES" } as const
export type Store = keyof typeof DATABASES

/** Asks a database and gives the rows, kept for `ttl` seconds. Throws where the database is not bound or the query fails (a table that is not there yet). */
export type Query = (store: Store, sql: string, params: readonly Param[], ttl: number) => Promise<Row[]>

/** A time rounded down to a step, in seconds: a query asked with it is the same query (and so kept) for the whole step. */
export const floorTo = (seconds: number, step: number): number => Math.floor(seconds / step) * step
