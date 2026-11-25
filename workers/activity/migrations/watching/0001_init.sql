-- Trakt's watch history: one row per entry, keyed by Trakt's own history id, so an entry can't be in twice.
CREATE TABLE watches (
  id INTEGER PRIMARY KEY,
  watched_at INTEGER NOT NULL,
  action TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  show TEXT,
  season INTEGER,
  episode INTEGER,
  trakt_id INTEGER,
  show_trakt_id INTEGER,
  tmdb_id INTEGER,
  imdb_id TEXT,
  raw TEXT NOT NULL
);

CREATE INDEX watches_by_time ON watches (watched_at);

-- What is rated now (1–10); a new rating of the same thing replaces the old.
CREATE TABLE ratings (
  type TEXT NOT NULL,
  trakt_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  rated_at INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  raw TEXT NOT NULL,
  PRIMARY KEY (type, trakt_id)
) WITHOUT ROWID;

CREATE TABLE state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
