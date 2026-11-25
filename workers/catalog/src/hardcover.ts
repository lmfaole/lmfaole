/** The owner's shelves on Hardcover, laid over the `books` of the `library` database as the old books sync did: Hardcover wins. A line of the
 *  log for a Hardcover book (`source` hardcover:<book>) takes its status, rating and day; a book the log lacks is added; a book on the
 *  want-to-read shelf is a line of the collection, and leaves it when it is started. Titles, years and formats already there are kept, and a
 *  book taken off Hardcover stays. This file parses and plans; `hardcover-sync.ts` asks and writes. */

export const SHELVES_QUERY =
  "query Shelves($limit: Int!, $offset: Int!) { me { user_books(limit: $limit, offset: $offset, order_by: [{ id: asc }]) { status_id rating date_added book { id title release_year } user_book_reads(order_by: [{ id: asc }]) { started_at finished_at } } } }"

export type Status = "want" | "reading" | "done" | "dropped"

export interface Shelved {
  source: string
  title: string
  year: number | null
  status: Status
  rating: number | null
  onDate: string | null
}

type Json = Record<string, unknown>

/** The log's status for a Hardcover shelf; 4 (paused) is reading, and 6 (ignored) is not a book the owner has anything to do with. */
export function statusOf(shelf: unknown): Status | null {
  switch (shelf) {
    case 1:
      return "want"
    case 2:
    case 4:
      return "reading"
    case 3:
      return "done"
    case 5:
      return "dropped"
    default:
      return null
  }
}

/** Hardcover rates in quarters from 0 to 5; the log has half steps from 0.5, and none for an unrated book. */
export function ratingOf(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  const half = Math.round(value * 2) / 2
  return half >= 0.5 ? Math.min(half, 5) : null
}

const dayOf = (value: unknown): string | null => (typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : null)

/** A page of the shelves (`me` is a list of one user, or the user), and whether there was anything on it. */
export function parseShelves(json: unknown): { shelved: Shelved[]; count: number } {
  const answer = (json ?? {}) as Json
  if (Array.isArray(answer.errors) && answer.errors.length > 0) {
    throw new Error(`hardcover: answered with errors: ${answer.errors.map((e) => String((e as Json | null)?.message ?? "an error")).join("; ")}`)
  }
  const data = answer.data as Json | undefined
  const me = (Array.isArray(data?.me) ? data.me[0] : data?.me) as Json | undefined
  if (me === undefined || me === null || !Array.isArray(me.user_books)) throw new Error("hardcover: the answer has no me.user_books (has the token expired?)")
  const shelved = me.user_books.flatMap((entry): Shelved[] => {
    const userBook = entry as Json
    const book = userBook.book as Json | null | undefined
    const status = statusOf(userBook.status_id)
    if (status === null || typeof book?.id !== "number" || typeof book.title !== "string" || book.title.trim() === "") return []
    const reads = Array.isArray(userBook.user_book_reads) ? (userBook.user_book_reads as Json[]) : []
    const latest = reads.at(-1)
    const added = dayOf(userBook.date_added)
    const onDate =
      status === "done" || status === "dropped" ? (dayOf(latest?.finished_at) ?? added) : status === "reading" ? (dayOf(latest?.started_at) ?? added) : null
    return [
      {
        source: `hardcover:${book.id}`,
        title: book.title.trim(),
        year: typeof book.release_year === "number" ? book.release_year : null,
        status,
        rating: ratingOf(userBook.rating),
        onDate,
      },
    ]
  })
  return { shelved, count: me.user_books.length }
}

/** A line of `books` with a Hardcover source, as it stands. */
export interface Line {
  list: string
  id: number
  status: string
  rating: number | null
  on_date: string | null
  source: string
}

export type Change =
  | { op: "insert"; list: "log" | "collection"; book: Shelved }
  | { op: "update"; list: "log" | "collection"; id: number; status: string; rating: number | null; onDate: string | null }
  | { op: "delete"; list: "collection"; id: number }

/** What has to change for the lines to say what Hardcover says; nothing when they already do. */
export function plan(shelves: Shelved[], lines: Line[]): Change[] {
  const changes: Change[] = []
  const of = (list: string, source: string) => lines.filter((line) => line.list === list && line.source === source)
  // A book shelved twice counts once, as its last shelving.
  for (const book of new Map(shelves.map((b) => [b.source, b])).values()) {
    const wanted = of("collection", book.source)
    if (book.status === "want") {
      if (wanted.length === 0) changes.push({ op: "insert", list: "collection", book })
      for (const line of wanted) {
        if (line.rating !== book.rating) changes.push({ op: "update", list: "collection", id: line.id, status: line.status, rating: book.rating, onDate: line.on_date })
      }
      continue
    }
    for (const line of wanted) if (line.status === "want") changes.push({ op: "delete", list: "collection", id: line.id })
    const logged = of("log", book.source)
    if (logged.length === 0) changes.push({ op: "insert", list: "log", book })
    for (const line of logged) {
      if (line.status !== book.status || line.rating !== book.rating || line.on_date !== book.onDate) {
        changes.push({ op: "update", list: "log", id: line.id, status: book.status, rating: book.rating, onDate: book.onDate })
      }
    }
  }
  return changes
}
