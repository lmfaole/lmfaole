"use client"

import { useId, useMemo, useRef, useState, useEffect, type KeyboardEvent } from "react"

import { currentCue, cueTurns, findMatches, markParts, matchWords, paragraphsOf, type TranscriptCue, type TranscriptMatch } from "../lib/transcript"
import { formatClock, player, spokenTime, type Episode } from "../lib/podcast-player"
import { usePlayer } from "../lib/use-player"
import type { LinkTo } from "../lib/vocabulary"
import { Button } from "./button"
import { EmptyState } from "./empty-state"
import { ErrorMessage } from "./error-message"

export type { TranscriptCue } from "../lib/transcript"

const reducedMotion = (): boolean => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/**
 * Scrolls `box` (not the page) so `item` stands a third down it. Gently: an item already well inside the box is left where it is, unless
 * `always`; smoothly, unless the reader asks for less motion.
 */
function bringIntoView(box: HTMLElement, item: HTMLElement, always: boolean): void {
  const outer = box.getBoundingClientRect()
  const inner = item.getBoundingClientRect()
  if (!always && inner.top >= outer.top + outer.height * 0.1 && inner.bottom <= outer.top + outer.height * 0.75) return
  box.scrollTo({ top: box.scrollTop + inner.top - outer.top - outer.height / 3, behavior: reducedMotion() ? "auto" : "smooth" })
}

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "])

/** A cue's or a paragraph's words, its matches marked; the current match stronger. */
function Marked({ text, item, matches, current }: { text: string; item: number; matches: readonly TranscriptMatch[]; current: number }) {
  return markParts(text, item, matches).map((part, index) =>
    part.match === undefined ? (
      <span key={index}>{part.text}</span>
    ) : (
      <mark key={index} data-match={part.match} className={`rounded-sm ${part.match === current ? "bg-primary text-primary-foreground" : "bg-primary/20 text-foreground"}`}>
        {part.text}
      </mark>
    ),
  )
}

/**
 * The transcript of an episode, read along with it. A timed transcript (`cues`, Podcasting 2.0 `podcast:transcript` as WebVTT, SRT or JSON)
 * marks the line said now (`currentTime`), keeps it in view with a gentle scroll of its own box (never the page; at once, without the
 * glide, for a reader who asks for less motion), and goes there on a tap (`onSeek`). The lines are grouped in turns under the speaker's
 * name where the transcript names them. When the reader scrolls the box themselves it stops following, and «Følg avspillingen» brings it
 * back. A transcript without times (`text`) is paragraphs to read. Both can be searched: every match is marked, «Forrige» and «Neste» go
 * between them, and the count is said.
 *
 * Without `currentTime` and `onSeek`, give `episode`: it follows the design system's player (`PodcastPlayer`) when that episode plays, and a
 * tap starts it there. With neither cues nor text it is an `EmptyState`; with `error` (the transcript could not be fetched) an `ErrorMessage`.
 */
export function Transcript({ cues, text, currentTime, onSeek, episode, error, retry }: {
  /** The timed lines, in the order they are said. */
  cues?: readonly TranscriptCue[]
  /** A transcript without times, as plain text; paragraphs are split at blank lines. Used when there are no `cues`. */
  text?: string
  /** Where the episode is now, in seconds: the line said then is marked. */
  currentTime?: number
  /** Goes to a time (seconds) when a line is tapped, and plays. */
  onSeek?: (seconds: number) => void
  /** The episode it belongs to, to follow the design system's player instead of `currentTime` and `onSeek`. */
  episode?: Episode
  /** The transcript could not be fetched: «Kunne ikke hente transkripsjonen». */
  error?: unknown
  /** «Prøv igjen» with `error`. */
  retry?: LinkTo | true
}) {
  const state = usePlayer()
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState("")
  const [current, setCurrent] = useState(-1)
  const [following, setFollowing] = useState(true)
  const [focused, setFocused] = useState<number | null>(null)

  const timed = cues !== undefined && cues.length > 0
  const paragraphs = useMemo(() => (timed || text === undefined ? [] : paragraphsOf(text)), [timed, text])
  const texts = useMemo(() => (timed ? cues.map((cue) => cue.text) : paragraphs), [timed, cues, paragraphs])
  const matches = useMemo(() => findMatches(texts, query), [texts, query])

  const mine = episode !== undefined && state.episode?.id === episode.id
  const time = currentTime ?? (mine ? state.position : undefined)
  const seek =
    onSeek ??
    (episode === undefined
      ? undefined
      : (seconds: number) => {
          if (!mine) {
            player.play(episode, seconds)
            return
          }
          player.seek(seconds)
          if (!state.playing) player.play(episode)
        })
  const active = timed && time !== undefined ? currentCue(cues, time) : -1

  useEffect(() => {
    const element = box.current
    if (!following || active < 0 || element === null) return
    const item = element.querySelector<HTMLElement>(`[data-cue="${active}"]`)
    if (item !== null) bringIntoView(element, item, false)
  }, [active, following])

  useEffect(() => {
    const element = box.current
    if (current < 0 || current >= matches.length || element === null) return
    const mark = element.querySelector<HTMLElement>(`[data-match="${current}"]`)
    if (mark !== null) bringIntoView(element, mark, true)
  }, [current, matches])

  if (error !== undefined) return <ErrorMessage what="transkripsjonen" error={error} {...(retry === undefined ? {} : { retry })} />
  if (!timed && paragraphs.length === 0) return <EmptyState reason="nothing-yet" what="transkripsjon" description="Episoden har ingen transkripsjon." />

  const stopFollowing = () => {
    if (timed) setFollowing(false)
  }
  const goTo = (step: 1 | -1) => {
    if (matches.length === 0) return
    stopFollowing()
    setCurrent((at) => (at < 0 ? (step === 1 ? 0 : matches.length - 1) : (at + step + matches.length) % matches.length))
  }
  const follow = () => {
    setFollowing(true)
    const element = box.current
    const item = element?.querySelector<HTMLElement>(`[data-cue="${active}"]`)
    if (element !== null && element !== undefined && item !== null && item !== undefined) bringIntoView(element, item, true)
  }
  const stop = focused ?? (active >= 0 ? active : 0)
  const move = (event: KeyboardEvent<HTMLElement>) => {
    if (!timed) return
    const keys: Record<string, number> = { ArrowDown: stop + 1, ArrowUp: stop - 1, Home: 0, End: cues.length - 1 }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    const target = Math.min(Math.max(next, 0), cues.length - 1)
    stopFollowing()
    setFocused(target)
    box.current?.querySelector<HTMLElement>(`[data-cue="${target}"] button`)?.focus()
  }

  const line = (cue: TranscriptCue, index: number) => {
    const isActive = index === active
    const body = (
      <>
        <span aria-hidden="true" className={`pt-0.5 text-sm tabular-nums ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
          {formatClock(cue.start)}
        </span>
        <span className="sr-only">{`${spokenTime(cue.start)}: `}</span>
        <span className="min-w-0 [overflow-wrap:anywhere]">
          <Marked text={cue.text} item={index} matches={matches} current={current} />
        </span>
      </>
    )
    const look = "grid w-full min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-3 rounded-lg border-s-4 border-transparent px-2 py-1.5 text-left aria-[current=true]:border-primary aria-[current=true]:bg-brand-subtle"
    return (
      <li key={`${cue.start}-${index}`} data-cue={index}>
        {seek === undefined ? (
          <p aria-current={isActive ? "true" : undefined} className={look}>
            {body}
          </p>
        ) : (
          <button
            type="button"
            tabIndex={index === stop ? 0 : -1}
            aria-current={isActive ? "true" : undefined}
            onFocus={() => setFocused(index)}
            onClick={() => {
              seek(cue.start)
              setFollowing(true)
            }}
            className={`${look} hover:bg-muted/50 focus-visible:ring-ring min-h-11 outline-none focus-visible:ring-2`}
          >
            {body}
          </button>
        )}
      </li>
    )
  }

  const turns = timed ? cueTurns(cues) : []
  const withSpeakers = turns.some((turn) => turn.speaker !== undefined)

  return (
    <div className="grid min-w-0 gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid min-w-0 flex-[1_1_14rem] gap-1">
          <label htmlFor={id} className="text-sm font-medium">
            Søk i transkripsjonen
          </label>
          <input
            id={id}
            type="search"
            value={query}
            onChange={(event) => {
              const value = event.target.value
              setQuery(value)
              const found = findMatches(texts, value).length > 0
              setCurrent(found ? 0 : -1)
              if (found) stopFollowing()
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return
              event.preventDefault()
              goTo(event.shiftKey ? -1 : 1)
            }}
            className="border-muted-foreground bg-background focus-visible:ring-ring h-9 min-w-0 rounded-md border px-3 text-base focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
        {query.trim() === "" ? null : (
          <div className="flex flex-wrap items-center gap-2">
            <Button icon="arrow-up" ariaLabel="Forrige treff" disabled={matches.length === 0} onClick={() => goTo(-1)}>
              Forrige
            </Button>
            <Button icon="arrow-down" ariaLabel="Neste treff" disabled={matches.length === 0} onClick={() => goTo(1)}>
              Neste
            </Button>
          </div>
        )}
        {timed && !following && active >= 0 ? (
          <Button icon="listen" onClick={follow}>
            Følg avspillingen
          </Button>
        ) : null}
      </div>
      <p aria-live="polite" className="text-muted-foreground min-h-5 text-sm">
        {query.trim() === "" ? "" : matchWords(matches.length, current)}
      </p>
      <div
        ref={box}
        role="region"
        aria-label="Transkripsjon"
        tabIndex={timed && seek !== undefined ? undefined : 0}
        onWheel={stopFollowing}
        onTouchMove={stopFollowing}
        onPointerDown={(event) => {
          if (event.target === event.currentTarget) stopFollowing()
        }}
        onKeyDown={(event) => {
          if (event.target === event.currentTarget && SCROLL_KEYS.has(event.key)) stopFollowing()
          else move(event)
        }}
        className="focus-visible:ring-ring max-h-[min(70dvh,40rem)] min-w-0 overflow-y-auto overscroll-contain rounded-xl p-2 ring-1 ring-foreground/10 outline-none focus-visible:ring-2"
      >
        {timed ? (
          withSpeakers ? (
            <ol className="grid gap-4">
              {turns.map((turn) => (
                <li key={turn.cues[0]?.index ?? 0} className="grid gap-1">
                  {turn.speaker === undefined ? null : <p className="min-w-0 px-3 text-sm font-semibold [overflow-wrap:anywhere]">{turn.speaker}</p>}
                  <ol className="grid gap-0.5">{turn.cues.map(({ cue, index }) => line(cue, index))}</ol>
                </li>
              ))}
            </ol>
          ) : (
            <ol className="grid gap-0.5">{cues.map(line)}</ol>
          )
        ) : (
          <div className="grid max-w-prose gap-4 px-2 py-1">
            {paragraphs.map((paragraph, index) => (
              <p key={index} data-cue={index} className="min-w-0 [overflow-wrap:anywhere]">
                <Marked text={paragraph} item={index} matches={matches} current={current} />
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
