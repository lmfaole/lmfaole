/** Every scheduled job on the account: the Worker (its service binding in wrangler.jsonc) and when, in UTC. The Worker's `scheduled` gets this cron and the tick's time. */

export const JOBS = [
  // ListenBrainz, Last.fm, Steam, RetroAchievements, Trakt, Letterboxd into D1; Sundays at 03:00 the weekly backup instead.
  { binding: "ACTIVITY", cron: "0 */3 * * *" },
  // Spotify's new liked songs loved on Last.fm, Mondays.
  { binding: "LIKES_SYNC", cron: "0 5 * * 1" },
  // The shared sources into the start page's snapshot.
  { binding: "STARTSIDE", cron: "*/15 * * * *" },
] as const

export type Binding = (typeof JOBS)[number]["binding"]
