-- Books and board games: the owner's log (read, played) and collection (owned, wanted), from the old monorepo's data dump
-- (scripts/import-dump.ts). Only what is needed to show a line; the rest is in Open Library or Hardcover.
-- `list` is 'log' or 'collection'; `id` the line in that list.

-- `status`: log done, reading or dropped; collection owned or want. `rating` 0.5–5. `source` the service's own reference
-- (hardcover:<book>, applebooks:<id>, mail:audible:<title>, goodreads:title:<title>); `openlibrary_id` the work in Open Library.
CREATE TABLE books (
  list TEXT NOT NULL,
  id INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  status TEXT NOT NULL,
  on_date TEXT,
  rating REAL,
  format TEXT,
  source TEXT,
  openlibrary_id TEXT,
  PRIMARY KEY (list, id)
) WITHOUT ROWID;

-- `status`: log played; collection owned.
CREATE TABLE boardgames (
  list TEXT NOT NULL,
  id INTEGER NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  format TEXT,
  PRIMARY KEY (list, id)
) WITHOUT ROWID;
