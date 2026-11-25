-- One row per play. The key is the play itself (when, who, what; case is ignored), so the same play can never be in twice.
-- ListenBrainz's own JSON is not kept: it can be fetched again, and the copy made when this database replaced `listens` is in R2 (raw/listenbrainz/<year>.ndjson.gz).
CREATE TABLE listens (
  listened_at INTEGER NOT NULL,
  artist TEXT NOT NULL COLLATE NOCASE,
  track TEXT NOT NULL COLLATE NOCASE,
  album TEXT,
  duration_ms INTEGER,
  spotify_id TEXT,
  recording_mbid TEXT,
  release_mbid TEXT,
  artist_mbids TEXT,
  client TEXT,
  recording_msid TEXT,
  inserted_at INTEGER,
  PRIMARY KEY (listened_at, artist, track)
) WITHOUT ROWID;

-- Plays with no real time (an old Last.fm account whose player sent seconds since 1970); `position` is the order they came in.
CREATE TABLE undated_listens (
  source TEXT NOT NULL,
  position INTEGER NOT NULL,
  artist TEXT NOT NULL,
  track TEXT NOT NULL,
  album TEXT,
  mbid TEXT,
  PRIMARY KEY (source, position)
) WITHOUT ROWID;

CREATE TABLE state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Every track loved on Last.fm (Spotify's likes reach it through likes-sync). A track is loved once: the key is the track, not the time.
CREATE TABLE loves (
  artist TEXT NOT NULL COLLATE NOCASE,
  track TEXT NOT NULL COLLATE NOCASE,
  loved_at INTEGER NOT NULL,
  track_mbid TEXT,
  artist_mbid TEXT,
  url TEXT,
  PRIMARY KEY (artist, track)
) WITHOUT ROWID;

CREATE INDEX loves_by_time ON loves (loved_at);
