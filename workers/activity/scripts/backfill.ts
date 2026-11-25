/** Fills `listens` in D1 `music` from ListenBrainz faster than the cron does, from this machine: oldest first from the stored cursor, in files of 10,000 rows.
 *  D1's free plan writes 100,000 rows a day, so it stops after `--max <rows>` (80,000 by default) and carries on where it stopped next time.
 *  node scripts/backfill.ts [--max 80000] [--user lmfaole] */

import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { parseArgs } from "node:util"
import { listensAfter, row } from "../src/listenbrainz.ts"
import { UPSERT } from "../src/music.ts"

const { values } = parseArgs({ options: { max: { type: "string", default: "80000" }, user: { type: "string", default: "lmfaole" } } })
const max = Number(values.max)
const dir = mkdtempSync(join(tmpdir(), "listens-"))

const d1 = (...args: string[]): string => execFileSync("npx", ["wrangler", "d1", "execute", "music", "--remote", "-y", ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
const literal = (value: unknown): string => (value === null || value === undefined ? "NULL" : typeof value === "number" ? String(value) : `'${String(value).replaceAll("'", "''")}'`)
const parts = `${UPSERT};`.split("?")
const insert = (values: unknown[]): string => parts.reduce((sql, part, i) => sql + part + (i < values.length ? literal(values[i]) : ""), "")
const setCursor = (cursor: number) => `INSERT INTO state (key, value) VALUES ('cursor', '${cursor}') ON CONFLICT (key) DO UPDATE SET value = excluded.value;`

const stored = JSON.parse(d1("--json", "--command", "SELECT value FROM state WHERE key = 'cursor'")) as { results: { value: string }[] }[]
let cursor = Number(stored[0]?.results[0]?.value ?? 0)
let minTs = cursor
let written = 0
let pending: string[] = []

const flush = (): void => {
  if (pending.length === 0) return
  const file = join(dir, `${written}.sql`)
  writeFileSync(file, [...pending, setCursor(cursor)].join("\n"))
  d1("--file", file)
  written += pending.length
  pending = []
  console.log(`${written} written, cursor ${new Date(cursor * 1000).toISOString()}`)
}

while (written + pending.length < max) {
  const listens = await listensAfter(values.user, minTs, Math.min(1000, max - written - pending.length), fetch)
  if (listens.length === 0) break
  for (const listen of listens) pending.push(insert(row(listen)))
  const newest = Math.max(...listens.map((listen) => listen.listened_at))
  cursor = Math.max(cursor, newest)
  minTs = newest - 1 > minTs ? newest - 1 : newest
  if (pending.length >= 10_000) flush()
  if (listens.length < 1000 && written + pending.length < max) break
}
flush()
console.log(written >= max ? `stopped at --max ${max}; run again tomorrow` : "up to date")
