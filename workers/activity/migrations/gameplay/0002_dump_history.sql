-- The owner's game history from the old monorepo's data dump, written once by scripts/import-dump.ts, for what Steam and
-- RetroAchievements (`games`, `play_events`, `achievements` from the worker) don't cover: PlayStation, Xbox, Pokémon GO, Apple, RomM and the
-- hand-kept log. Achievements from those services go into `achievements` (source xbox, pokemongo, applegc).

-- A line of the log: a day played (PlayStation and Apple Arcade: one row a day) or a game begun or finished. `hours` is the time played as
-- the source says; `source` the service's own reference for the line (psn:<game>:<day>, xbox:<game>, …), none for a line written by hand;
-- `igdb_id` the game in IGDB.
CREATE TABLE game_log (
  id INTEGER PRIMARY KEY,
  on_date TEXT,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  hours REAL,
  platform TEXT,
  source TEXT,
  igdb_id INTEGER,
  note TEXT
);

-- The games owned (outside Steam, whose library is `games`).
CREATE TABLE game_collection (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  status TEXT NOT NULL,
  platform TEXT,
  added_on TEXT,
  source TEXT,
  igdb_id INTEGER
);

-- Where the player stood at a service on a day (a level, a score), so how it grew can be told.
CREATE TABLE profile (
  source TEXT NOT NULL,
  key TEXT NOT NULL,
  day TEXT NOT NULL,
  value REAL NOT NULL,
  PRIMARY KEY (source, key, day)
) WITHOUT ROWID;
