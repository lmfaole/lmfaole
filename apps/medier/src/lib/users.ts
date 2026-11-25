/**
 * Whose data is shown: the owner's usernames on Last.fm, Trakt, ListenBrainz, Steam and RetroAchievements, fixed and not secret, the `vars` `LASTFM_USER`, `TRAKT_USER`, `LISTENBRAINZ_USER`,
 * `STEAM_USER` and `RETROACHIEVEMENTS_USER` in `wrangler.jsonc`. Every visitor sees the same. A service whose username is empty has no part of the site. Pure, with a test.
 */

type Service = "lastfm" | "trakt" | "listenbrainz" | "steam" | "retroachievements"

/** The usernames, `null` for a service that has none. */
export interface Users {
  lastfm: string | null
  trakt: string | null
  /** The music's other source: used where there is no Last.fm username (`hasMusic`). */
  listenbrainz: string | null
  /** A Steam profile's custom name or its SteamID (17 digits). */
  steam: string | null
  /** A username on RetroAchievements: the old console games played in an emulator. */
  retroachievements: string | null
}

/** The setting each username is (`vars` in `wrangler.jsonc`). */
const USER_SETTING: Record<Service, string> = { lastfm: "LASTFM_USER", trakt: "TRAKT_USER", listenbrainz: "LISTENBRAINZ_USER", steam: "STEAM_USER", retroachievements: "RETROACHIEVEMENTS_USER" }

/** The usernames in the settings: trimmed, an empty or missing one none. */
export function usersFrom(env: Readonly<Partial<Record<string, string>>>): Users {
  const named = (service: Service): string | null => {
    const value = (env[USER_SETTING[service]] ?? "").trim()
    return value === "" ? null : value
  }
  return { lastfm: named("lastfm"), trakt: named("trakt"), listenbrainz: named("listenbrainz"), steam: named("steam"), retroachievements: named("retroachievements") }
}

/** Whether there is music to show: plays from Last.fm, or else from ListenBrainz. */
export const hasMusic = (users: Users): boolean => users.lastfm !== null || users.listenbrainz !== null
