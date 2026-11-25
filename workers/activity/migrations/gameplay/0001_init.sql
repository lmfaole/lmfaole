-- Every game seen on Steam or RetroAchievements, as it is now. `source` is 'steam' or 'ra'.
CREATE TABLE games (
  source TEXT NOT NULL,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  platform TEXT,
  minutes INTEGER,
  last_played INTEGER,
  achievements_total INTEGER,
  achievements_earned INTEGER,
  -- Steam: the `minutes` its achievements were last fetched at, so only games played since are asked again.
  achievements_checked INTEGER,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (source, game_id)
) WITHOUT ROWID;

-- What was seen being played. Steam: the total grew by `minutes_added` (at = Steam's «last played»); a game's first row is its total before tracking began (`baseline` 1). RetroAchievements: a new «last played» (no minutes: the service doesn't count them), with the rich presence if it was the game being played.
CREATE TABLE play_events (
  source TEXT NOT NULL,
  game_id TEXT NOT NULL,
  at INTEGER NOT NULL,
  minutes_total INTEGER,
  minutes_added INTEGER,
  baseline INTEGER NOT NULL DEFAULT 0,
  presence TEXT,
  PRIMARY KEY (source, game_id, at)
) WITHOUT ROWID;

CREATE TABLE achievements (
  source TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER,
  hardcore INTEGER NOT NULL DEFAULT 0,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY (source, achievement_id, hardcore)
) WITHOUT ROWID;

CREATE INDEX achievements_by_time ON achievements (unlocked_at);

-- Sessions: a game's events with less than three hours between them (one sync interval, plus a bit) are one session.
CREATE VIEW sessions AS
WITH marked AS (
  SELECT *, CASE WHEN at - LAG(at) OVER (PARTITION BY source, game_id ORDER BY at) <= 11400 THEN 0 ELSE 1 END AS starts
  FROM play_events WHERE baseline = 0
), numbered AS (
  SELECT *, SUM(starts) OVER (PARTITION BY source, game_id ORDER BY at) AS session FROM marked
)
SELECT source, game_id, MIN(at) AS first_seen, MAX(at) AS last_seen, SUM(minutes_added) AS minutes, COUNT(*) AS events
FROM numbered GROUP BY source, game_id, session;

CREATE TABLE state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
