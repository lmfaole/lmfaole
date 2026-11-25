/**
 * An episode's place in its podcast (`itunes:season`, `itunes:episode`, `itunes:episodeType`), in the same words everywhere: short for the
 * eye («S2 E14»), whole for a screen reader («Sesong 2, episode 14»), and a word for an episode that is not an ordinary one («Trailer», «Bonus»).
 */

/** What the feed says of an episode's place: its season, its number and its type. Any of them may be missing. */
export interface EpisodeNumber {
  season?: number | null | undefined
  number?: number | null | undefined
  /** `full` (the feed's default) is an ordinary episode and has no word. */
  type?: "full" | "trailer" | "bonus" | null | undefined
}

const counted = (value: number | null | undefined): value is number => typeof value === "number" && Number.isInteger(value) && value > 0

/** The episode's number for the eye and for the ear, or `null` when the feed gives neither a season nor a number. */
export function episodeNumberWords({ season, number }: EpisodeNumber): { short: string; spoken: string } | null {
  const parts = [counted(season) ? { short: `S${season}`, spoken: `Sesong ${season}` } : null, counted(number) ? { short: `E${number}`, spoken: counted(season) ? `episode ${number}` : `Episode ${number}` } : null].filter((part) => part !== null)
  if (parts.length === 0) return null
  return { short: parts.map((part) => part.short).join(" "), spoken: parts.map((part) => part.spoken).join(", ") }
}

/** The word for an episode that is not an ordinary one: «Trailer», «Bonus»; `null` for an ordinary one. */
export function episodeTypeWord(type: EpisodeNumber["type"]): "Trailer" | "Bonus" | null {
  return type === "trailer" ? "Trailer" : type === "bonus" ? "Bonus" : null
}
