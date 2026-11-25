/** Asks Hardcover for the owner's shelves and writes what changed into `books`. Daily is plenty: it is a few calls and, most days, no writes. */

import { type Database, type Fetch, rowsWritten } from "./db.ts"
import { type Change, type Line, parseShelves, plan, SHELVES_QUERY, type Shelved } from "./hardcover.ts"

export interface HardcoverOptions {
  token: string
  fetch: Fetch
  log: (message: string) => void
  pageSize?: number
  maxPages?: number
}

const ENDPOINT = "https://api.hardcover.app/v1/graphql"

// The line number is the next in its list; in a batch each insert sees the one before.
const INSERT = `INSERT INTO books (list, id, title, year, status, on_date, rating, source)
SELECT ?1, COALESCE(MAX(id), 0) + 1, ?2, ?3, ?4, ?5, ?6, ?7 FROM books WHERE list = ?1`

export async function shelves(options: HardcoverOptions): Promise<{ shelved: Shelved[]; whole: boolean }> {
  const token = options.token.trim().replace(/^Bearer\s+/i, "")
  const size = options.pageSize ?? 500
  const shelved: Shelved[] = []
  for (let page = 0; page < (options.maxPages ?? 4); page++) {
    const response = await options.fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", "user-agent": "lmfaole-catalog (+https://lmfaole.party)" },
      body: JSON.stringify({ query: SHELVES_QUERY, variables: { limit: size, offset: page * size } }),
    })
    if (!response.ok) throw new Error(`hardcover: answered ${response.status} ${(await response.text()).slice(0, 200)}`)
    const answer = parseShelves(await response.json())
    shelved.push(...answer.shelved)
    if (answer.count < size) return { shelved, whole: true }
  }
  return { shelved, whole: false }
}

export async function syncHardcover(db: Database, options: HardcoverOptions): Promise<void> {
  const { shelved, whole } = await shelves(options)
  const lines = (await db.prepare("SELECT list, id, status, rating, on_date, source FROM books WHERE source LIKE 'hardcover:%'").all<Line>()).results
  const changes = plan(shelved, lines)
  const statement = (change: Change) => {
    switch (change.op) {
      case "insert": {
        const b = change.book
        return db.prepare(INSERT).bind(change.list, b.title, b.year, b.status, b.onDate, b.rating, b.source)
      }
      case "update":
        return db.prepare("UPDATE books SET status = ?, rating = ?, on_date = ? WHERE list = ? AND id = ?").bind(change.status, change.rating, change.onDate, change.list, change.id)
      case "delete":
        return db.prepare("DELETE FROM books WHERE list = ? AND id = ?").bind(change.list, change.id)
    }
  }
  const written = changes.length === 0 ? 0 : rowsWritten(await db.batch(changes.map(statement)))
  const count = (op: Change["op"]) => changes.filter((c) => c.op === op).length
  options.log(
    `hardcover: ${shelved.length} shelved${whole ? "" : " (not all)"}, ${count("insert")} added, ${count("update")} changed, ${count("delete")} left the want list, ${written} rows`,
  )
}
