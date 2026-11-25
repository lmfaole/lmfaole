import { episodeNumberWords, type EpisodeNumber } from "../../lib/episode-number"

/** INTERNAL (`List` row `episode`, `DetailHeader episode`): an episode's number, short for the eye («S2 E14»), whole for a screen reader. */
export function EpisodeMark({ episode }: { episode: EpisodeNumber }) {
  const words = episodeNumberWords(episode)
  if (words === null) return null
  return (
    <span className="tabular-nums">
      <span aria-hidden="true">{words.short}</span>
      <span className="sr-only">{words.spoken}</span>
    </span>
  )
}
