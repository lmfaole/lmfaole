"use client"

import { Icon } from "./icon"
import { Button } from "./ui/button"
import { player, spokenTime, timeLeft, type Episode } from "../lib/podcast-player"
import { usePlayer } from "../lib/use-player"

/**
 * The button that plays an episode, on its page or in its row: «Spill av» from the start, «Fortsett» where the reader left off (`position`,
 * with what is left in words, «23 min igjen», and a thin bar of how far they came), and «Pause» while it is the one playing. It follows the
 * player (`lib/podcast-player`): every `PlayButton` of the episode changes when it starts or stops, wherever it is pressed. The episode's
 * title is in its name for a screen reader, so a list of them can be told apart.
 */
export function PlayButton({ episode, position }: { episode: Episode; /** Where the reader left off, in seconds (saved by the app from `PodcastPlayer`'s `onProgress`). */ position?: number }) {
  const state = usePlayer()
  const current = state.episode?.id === episode.id
  const playing = current && (state.playing || state.buffering)
  const at = current ? state.position : (position ?? 0)
  const duration = current && state.duration > 0 ? state.duration : (episode.duration ?? 0)
  const started = at > 0 && (duration === 0 || at < duration)
  const label = playing ? "Pause" : started ? "Fortsett" : "Spill av"
  const detail = started && duration > 0 ? timeLeft(at, duration) : !started && duration > 0 ? spokenTime(duration) : undefined
  const percent = duration > 0 ? Math.min(100, Math.max(0, (at / duration) * 100)) : 0

  return (
    <div className="grid justify-items-start gap-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button type="button" size="lg" onClick={() => (playing ? player.pause() : current ? player.play(episode) : player.play(episode, started ? at : 0))} aria-busy={current && state.buffering ? true : undefined}>
          <Icon name={playing ? "pause" : "play"} slot="start" />
          {label}
          <span className="sr-only">{`: ${episode.title}`}</span>
        </Button>
        {detail === undefined ? null : <span className="text-muted-foreground text-sm tabular-nums">{detail}</span>}
      </div>
      {started && duration > 0 ? (
        <div aria-hidden="true" className="bg-muted h-1 w-40 overflow-hidden rounded-full">
          <div className="bg-foreground h-full rounded-full" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
    </div>
  )
}
