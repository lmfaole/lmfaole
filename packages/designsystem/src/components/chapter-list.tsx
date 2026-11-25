"use client"

import { Icon } from "./icon"
import { currentChapter, formatClock, player, spokenTime, type Chapter, type Episode } from "../lib/podcast-player"
import { usePlayer } from "../lib/use-player"

/**
 * The chapters of an episode, in order, each with the time it starts: a tap goes there and plays (and starts the episode first, when it is
 * not the one in the player). The chapter that plays now is marked in words as well as by its ground and weight («spilles nå»,
 * `aria-current`). Without `episode` the chapters are the playing episode's (as in `PodcastPlayer`). A chapter's own link (`href`) stands
 * beside it and opens in a new tab, so the episode plays on.
 */
export function ChapterList({ chapters, episode }: { chapters: Chapter[]; /** The episode the chapters belong to; without it, the one in the player. */ episode?: Episode }) {
  const state = usePlayer()
  const mine = episode === undefined || state.episode?.id === episode.id
  const current = mine && state.episode !== undefined ? currentChapter(chapters, state.position) : -1

  const go = (start: number): void => {
    if (episode !== undefined && !mine) {
      player.play(episode, start)
      return
    }
    player.seek(start)
    if (state.episode !== undefined && !state.playing) player.play(state.episode)
  }

  return (
    <ol className="grid gap-0.5">
      {chapters.map((chapter, index) => {
        const isCurrent = index === current
        return (
          <li key={`${chapter.start}-${index}`} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => go(chapter.start)}
              aria-current={isCurrent ? "true" : undefined}
              className="hover:bg-muted/50 focus-visible:ring-ring aria-[current=true]:bg-brand-subtle flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm outline-none focus-visible:ring-2 aria-[current=true]:font-medium"
            >
              <span aria-hidden="true" className="text-muted-foreground w-14 shrink-0 tabular-nums">
                {formatClock(chapter.start)}
              </span>
              <span className="sr-only">{`${spokenTime(chapter.start)}: `}</span>
              <span className="line-clamp-2 min-w-0 flex-1 [overflow-wrap:anywhere]">{chapter.title}</span>
              {isCurrent ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs">
                  <Icon name="listen" size="sm" />
                  spilles nå
                </span>
              ) : null}
            </button>
            {chapter.href === undefined ? null : (
              <a
                href={chapter.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-muted/50 focus-visible:ring-ring inline-flex size-11 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2"
              >
                <Icon name="external" />
                <span className="sr-only">{`Lenke fra kapittelet «${chapter.title}» (eksternt nettsted, åpnes i ny fane)`}</span>
              </a>
            )}
          </li>
        )
      })}
    </ol>
  )
}
