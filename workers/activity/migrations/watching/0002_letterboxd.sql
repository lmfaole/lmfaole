-- Letterboxd's diary as its RSS feed shows it: one row per diary entry, keyed by Letterboxd's own id.
CREATE TABLE letterboxd (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  watched_on TEXT NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  rating REAL,
  rewatch INTEGER NOT NULL,
  liked INTEGER NOT NULL,
  tmdb_id INTEGER,
  review TEXT,
  link TEXT NOT NULL,
  poster TEXT,
  published_at INTEGER NOT NULL,
  raw TEXT NOT NULL
) WITHOUT ROWID;

CREATE INDEX letterboxd_by_day ON letterboxd (watched_on);
