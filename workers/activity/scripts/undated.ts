/** Puts a Last.fm account's undated scrobbles (sent with seconds since 1970 as their time) into `undated_listens`.
 *  node scripts/undated.ts <source> <user.getrecenttracks page.json…>; running it again changes nothing. */

import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

interface Scrobble {
  name: string
  mbid?: string
  artist: { "#text": string }
  album: { "#text": string }
  date?: { uts: string }
}

const [source, ...files] = process.argv.slice(2)
if (source === undefined || files.length === 0) {
  console.error("usage: node scripts/undated.ts <source> <page.json…>")
  process.exit(2)
}

// Anything before ListenBrainz's earliest allowed time (October 2002) is not a real time.
const EARLIEST = 1033430400
const quote = (value: string | null | undefined): string => (value ? `'${value.replaceAll("'", "''")}'` : "NULL")
const scrobbles = files.flatMap((file) => (JSON.parse(readFileSync(file, "utf8")) as { recenttracks: { track: Scrobble[] } }).recenttracks.track)
const undated = scrobbles.filter((s) => s.date !== undefined && Number(s.date.uts) < EARLIEST)

const sql = undated
  .map((s) => `INSERT OR IGNORE INTO undated_listens (source, position, artist, track, album, mbid) VALUES (${quote(source)}, ${Number(s.date?.uts)}, ${quote(s.artist["#text"])}, ${quote(s.name)}, ${quote(s.album["#text"])}, ${quote(s.mbid)});`)
  .join("\n")
const file = join(mkdtempSync(join(tmpdir(), "undated-")), "undated.sql")
writeFileSync(file, sql)
console.log(`${undated.length} undated scrobbles from ${source}`)
execFileSync("npx", ["wrangler", "d1", "execute", "music", "--remote", "--file", file, "-y"], { stdio: "inherit" })
