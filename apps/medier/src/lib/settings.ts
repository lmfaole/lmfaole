/**
 * Every setting the site needs, in one list. The sources' keys, Spotify's sign-in and the key the site shares with its relay are **secrets of the Worker**
 * (`wrangler secret put`); the two Cloudflare tokens the deploy uses are **secrets of this GitHub repository**. Nothing of it is ever in a file here.
 * `npm run settings:push` sets each from env files kept elsewhere (the private monorepo's `secrets/`), the value on stdin, never on a command line. Whose data is shown is not a setting: it is the
 * visitor's usernames, from their cookies (`users.ts`). What is not secret is a `var` in `wrangler.jsonc` (`IMAGE_TRANSFORMS`, `CF_BEACON_TOKEN`), and a binding is no setting at all.
 */

export interface Setting {
  name: string
  /** `worker` for the site's Worker (and its relay for the key they share), `github` for the repository's Actions secrets. */
  where: "worker" | "github"
  /** What it is and where to get one. */
  about: string
  /** The site works without it: the part that needs it is left out. */
  optional?: boolean
  /** Kept as a secret of this GitHub repository, and uploaded with the deploy as the Worker's (`.github/workflows/medier.yml` at the repository's root), not with `wrangler secret put`. */
  deploy?: true
}

export const SETTINGS: readonly Setting[] = [
  { name: "LASTFM_API_KEY", where: "worker", about: "Last.fm API key: https://www.last.fm/api/account/create" },
  { name: "TRAKT_CLIENT_ID", where: "worker", about: "Trakt app Client ID: https://trakt.tv/oauth/applications (the profile must be public)" },
  { name: "TMDB_API_KEY", where: "worker", optional: true, about: "TMDB API key or read access token, for the posters: https://www.themoviedb.org/settings/api" },
  { name: "SPOTIFY_CLIENT_ID", where: "worker", optional: true, about: "Spotify app Client ID, for the artists' pictures and the links to albums and tracks: https://developer.spotify.com/dashboard" },
  { name: "SPOTIFY_CLIENT_SECRET", where: "worker", optional: true, about: "Spotify app Client Secret (same place)" },
  { name: "SPOTIFY_REFRESH_TOKEN", where: "worker", optional: true, about: "made by `npm run spotify:auth`: the sign-in the site's searches are made with; it lasts six months" },
  { name: "SETLISTFM_API_KEY", where: "worker", deploy: true, optional: true, about: "setlist.fm API key, for an artist's concerts and setlists: https://www.setlist.fm/settings/api" },
  { name: "STEAM_API_KEY", where: "worker", deploy: true, optional: true, about: "Steam Web API key, for the games: https://steamcommunity.com/dev/apikey (the profile's game details must be public)" },
  { name: "RETROACHIEVEMENTS_API_KEY", where: "worker", deploy: true, optional: true, about: "RetroAchievements web API key, for the old console games: https://retroachievements.org/controlpanel.php (Keys)" },
  { name: "COOKIE_SECRET", where: "worker", deploy: true, optional: true, about: "the key the username cookies are signed with (`signed-cookie.ts`), a long random string (`openssl rand -base64 48`); without it a cookie made by hand is taken as a username" },
  { name: "UPSTREAM_URL", where: "worker", optional: true, about: "a relay's address (medier-upstream has no workers.dev address of its own), only where the Worker has no `UPSTREAM` binding to it (`wrangler.jsonc`; a Worker on this zone cannot reach Last.fm, Trakt, TMDB, Spotify or MusicBrainz itself)" },
  { name: "UPSTREAM_KEY", where: "worker", about: "the key the site and the relay share; made when it is not in the files, and set on both" },
  { name: "CLOUDFLARE_API_TOKEN", where: "github", about: "a Cloudflare API token that may edit Workers: https://dash.cloudflare.com/profile/api-tokens (the deploy uses it)" },
  { name: "CLOUDFLARE_ACCOUNT_ID", where: "github", about: "the Cloudflare account's id (the dashboard's sidebar)" },
]

/** `KEY=value` lines, as the env files are written: comments and blank lines skipped, one pair of quotes around a value taken off. */
export function parseEnvFile(text: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const line of text.split("\n")) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line)
    if (match === null || line.trimStart().startsWith("#")) continue
    const [, name = "", raw = ""] = match
    values.set(name, raw.replace(/^(['"])(.*)\1$/, "$2"))
  }
  return values
}

/** The settings found in the given values (later files win), and the ones not found: what `push` sets and what it says is missing. */
export function plan(settings: readonly Setting[], values: ReadonlyMap<string, string>): { set: { setting: Setting; value: string }[]; missing: Setting[] } {
  const set: { setting: Setting; value: string }[] = []
  const missing: Setting[] = []
  for (const setting of settings) {
    const value = values.get(setting.name)
    if (value === undefined || value === "") missing.push(setting)
    else set.push({ setting, value })
  }
  return { set, missing }
}

/** The settings that are neither in the files nor optional: what a push cannot do and says so. */
export function required(missing: readonly Setting[]): Setting[] {
  return missing.filter((setting) => setting.optional !== true && setting.name !== "UPSTREAM_KEY")
}
