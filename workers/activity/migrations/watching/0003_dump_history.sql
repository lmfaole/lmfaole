-- The owner's hand-kept film and TV logs from the old monorepo's data dump, written once by scripts/import-dump.ts. Most of the logs had
-- already been copied to Trakt, so only what Trakt (or Letterboxd) doesn't have is here; `id` is the log's own line number.

-- A film seen. `same_as` is 'trakt:<history id>' or 'letterboxd:<id>' when that viewing is already in `watches` or `letterboxd`:
-- such a row is here only for what the log adds (the cinema, the seat, a note) and is not another viewing.
CREATE TABLE film_log (
  id INTEGER PRIMARY KEY,
  watched_on TEXT,
  title TEXT NOT NULL,
  year INTEGER,
  tmdb_id INTEGER,
  cinema TEXT,
  seat TEXT,
  note TEXT,
  same_as TEXT
);

-- An episode seen that Trakt doesn't have. `watched_on` is none when the day is not known; `tmdb_id` is the series.
CREATE TABLE tv_log (
  id INTEGER PRIMARY KEY,
  watched_on TEXT,
  show TEXT NOT NULL,
  tmdb_id INTEGER,
  season INTEGER,
  episode INTEGER,
  episode_title TEXT
);

-- The cinemas of `film_log.cinema`. `country` is ISO 3166-1 alpha-2.
CREATE TABLE cinemas (
  name TEXT PRIMARY KEY,
  city TEXT,
  country TEXT NOT NULL,
  website TEXT
) WITHOUT ROWID;

-- What the Apple TV app says was watched (Apple's data export): one row per stretch watched, `watched_ms` long. A film has no season.
CREATE TABLE apple_tv (
  started_at INTEGER NOT NULL,
  show TEXT NOT NULL,
  season INTEGER,
  episode INTEGER,
  episode_title TEXT,
  watched_ms INTEGER,
  PRIMARY KEY (started_at, show)
) WITHOUT ROWID;
