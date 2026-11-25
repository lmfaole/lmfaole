-- What lmfaole.party (the front page) and lmfaole.party/cv show: the CV, the glossary, page previews and GitHub activity, from the old
-- monorepo's data dump (scripts/import-dump.ts). Times are seconds since 1970; days are YYYY-MM-DD.

-- The CV, in the CV app's own (Norwegian) words. `aar` is the year a line is shown under (the start of a position or a project, the end
-- of an education). `fra`/`til` are YYYY-MM-DD, `til` none while it goes on.
CREATE TABLE cv_person (
  id INTEGER PRIMARY KEY,
  navn TEXT NOT NULL,
  tittel TEXT,
  arbeidsgiver TEXT,
  sted TEXT
);

CREATE TABLE cv_employer (
  id INTEGER PRIMARY KEY,
  navn TEXT NOT NULL,
  sted TEXT
);

CREATE TABLE cv_position (
  id INTEGER PRIMARY KEY,
  arbeidsgiver_id INTEGER NOT NULL,
  fra TEXT,
  til TEXT,
  aar INTEGER NOT NULL,
  tittel TEXT NOT NULL,
  beskrivelse TEXT,
  kortbeskrivelse TEXT
);

CREATE TABLE cv_education (
  id INTEGER PRIMARY KEY,
  fra TEXT,
  til TEXT,
  aar INTEGER NOT NULL,
  grad TEXT NOT NULL,
  institusjon TEXT,
  beskrivelse TEXT,
  kortbeskrivelse TEXT
);

-- `repo` is the project's repository on GitHub (owner/name), whose latest commit is `github_project_commits`.
CREATE TABLE cv_project (
  id INTEGER PRIMARY KEY,
  stilling_id INTEGER NOT NULL,
  fra TEXT,
  til TEXT,
  aar INTEGER NOT NULL,
  navn TEXT NOT NULL,
  tittel TEXT,
  url TEXT,
  beskrivelse TEXT,
  kortbeskrivelse TEXT,
  repo TEXT
);

CREATE TABLE cv_link (
  id INTEGER PRIMARY KEY,
  navn TEXT NOT NULL,
  url TEXT NOT NULL
);

-- A word in the text that links somewhere.
CREATE TABLE glossary_term (
  id TEXT PRIMARY KEY,
  term TEXT NOT NULL,
  url TEXT NOT NULL
) WITHOUT ROWID;

-- A page's preview (Open Graph) and heading. `id` is '<app>:<path>'.
CREATE TABLE og_page (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  heading TEXT,
  lead TEXT,
  image TEXT
) WITHOUT ROWID;

-- The owner's public repositories (a private one is never here).
CREATE TABLE github_repos (
  full_name TEXT PRIMARY KEY,
  description TEXT,
  language TEXT,
  stars INTEGER NOT NULL DEFAULT 0,
  fork INTEGER NOT NULL DEFAULT 0,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER,
  pushed_at INTEGER
) WITHOUT ROWID;

-- Pull requests and issues the owner opened in public repositories; the link is https://github.com/<repo>/pull|issues/<number>.
CREATE TABLE github_items (
  id INTEGER PRIMARY KEY,
  kind TEXT NOT NULL,
  repo TEXT NOT NULL,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  state TEXT NOT NULL,
  merged INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  closed_at INTEGER
);

-- GitHub's contribution calendar: a day with none has no row.
CREATE TABLE github_days (
  day TEXT PRIMARY KEY,
  contributions INTEGER NOT NULL
) WITHOUT ROWID;

-- The owner's latest commit in a CV project's public repository; the link is https://github.com/<repo>/commit/<sha>.
CREATE TABLE github_project_commits (
  repo TEXT PRIMARY KEY,
  sha TEXT NOT NULL,
  message TEXT NOT NULL,
  committed_at INTEGER NOT NULL
) WITHOUT ROWID;
