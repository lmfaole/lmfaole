-- The owner's own music history from the old monorepo's data dump, written once by scripts/import-dump.ts (the dump stays in the archived
-- repository). Only what was the owner's own doing; what Spotify, Apple, Discogs or setlist.fm can give again is not kept.

-- Tracks saved ("liked") on Spotify. Several artists are joined with ", ".
CREATE TABLE spotify_saved (
  spotify_id TEXT PRIMARY KEY,
  saved_at INTEGER NOT NULL,
  artist TEXT NOT NULL,
  track TEXT NOT NULL,
  album TEXT
) WITHOUT ROWID;

CREATE TABLE spotify_saved_albums (
  spotify_id TEXT PRIMARY KEY,
  saved_at INTEGER NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL
) WITHOUT ROWID;

CREATE TABLE spotify_followed (
  spotify_id TEXT PRIMARY KEY,
  artist TEXT NOT NULL
) WITHOUT ROWID;

-- Apple Music's loves and dislikes. `kind` is Song, Album, Artist or Playlist; `item_ref` Apple's library, catalogue or playlist id;
-- `preference` LIKE, DISLIKE or NEUTRAL; `description` Apple's own «Artist - Title».
CREATE TABLE apple_favorites (
  kind TEXT NOT NULL,
  item_ref TEXT NOT NULL,
  preference TEXT NOT NULL,
  description TEXT,
  modified_at INTEGER,
  PRIMARY KEY (kind, item_ref)
) WITHOUT ROWID;

-- The records owned or wanted. `format` is cd, vinyl, … ('' when not known); `discogs_release_id` is the release in Discogs, where
-- the rest (label, catalogue number, genres) can be fetched.
CREATE TABLE collection (
  artist TEXT NOT NULL COLLATE NOCASE,
  title TEXT NOT NULL COLLATE NOCASE,
  format TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL,
  status TEXT NOT NULL,
  year INTEGER,
  added_on TEXT,
  discogs_release_id INTEGER,
  PRIMARY KEY (artist, title, format)
) WITHOUT ROWID;

-- The concerts been to: the day, the event as the ticket names it, the venue and (from the ticket) the time it began, HH:MM.
CREATE TABLE concerts (
  on_date TEXT NOT NULL,
  title TEXT NOT NULL,
  venue TEXT,
  at_time TEXT,
  PRIMARY KEY (on_date, title)
) WITHOUT ROWID;

-- The artists seen at a concert. `billing` is headliner, support or none; `setlist_url` the setlist on setlist.fm, which has the songs.
CREATE TABLE concert_acts (
  on_date TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  billing TEXT,
  setlist_url TEXT,
  PRIMARY KEY (on_date, title, artist)
) WITHOUT ROWID;

-- Where a venue is, corrected by hand: matched to `concerts.venue` by its text.
CREATE TABLE venues (
  venue TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lon REAL NOT NULL
) WITHOUT ROWID;
