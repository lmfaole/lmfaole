"use client"

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { AmbientBackdrop } from "./ambient-backdrop"
import { ChapterList } from "./chapter-list"
import { Icon } from "./icon"
import { PictureFrame } from "./internal/picture-frame"
import { chapterStep, currentChapter, formatClock, player, RATES, SKIP_BACK, SKIP_FORWARD, spokenTime } from "../lib/podcast-player"
import { usePlayer } from "../lib/use-player"
import { toRem } from "../lib/units"
import "../lib/css-variables"
import { HEAD_TITLE, titleStep } from "../lib/long-titles"

/** A round control of the player: a tint on hover, the ring on focus, at once when pressed. */
const ROUND =
  "hover:bg-foreground/10 focus-visible:ring-ring inline-flex shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 active:scale-95 transition-[scale] duration-(--motion-duration-instant) disabled:opacity-40 disabled:hover:bg-transparent"

/** How far down a drag must go to close the player, in CSS pixels (or a quick flick past `FLICK`). */
const DISMISS = 140
const FLICK = 48

/** The time line: a native range, drawn as a thin track filled up to where the episode is, with a round thumb. */
const TRACK =
  "h-11 w-full cursor-pointer appearance-none bg-transparent outline-none disabled:cursor-default " +
  "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-[linear-gradient(to_right,var(--foreground)_var(--fill),color-mix(in_oklch,var(--foreground)_22%,transparent)_var(--fill))] " +
  "[&::-webkit-slider-thumb]:-mt-[0.3125rem] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:transition-[scale] [&::-webkit-slider-thumb]:duration-(--motion-duration-fast) active:[&::-webkit-slider-thumb]:scale-125 " +
  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-foreground/20 [&::-moz-range-progress]:h-1.5 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-foreground " +
  "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-foreground " +
  "focus-visible:[&::-webkit-slider-thumb]:ring-2 focus-visible:[&::-webkit-slider-thumb]:ring-ring focus-visible:[&::-webkit-slider-thumb]:ring-offset-2 focus-visible:[&::-moz-range-thumb]:ring-2 focus-visible:[&::-moz-range-thumb]:ring-ring"

/** The scrubber: where the episode is, said in words; a drag seeks when it is let go, the arrows go 15 s back and 30 s forward. */
function Scrubber({ position, length, busy }: { position: number; length: number; busy: boolean }) {
  const [scrub, setScrub] = useState<number | undefined>(undefined)
  const shown = scrub ?? position
  const max = Math.max(length, 1)
  const fill = `${Math.min(100, Math.max(0, (shown / max) * 100))}%`

  const commit = (): void => {
    if (scrub !== undefined) player.seek(scrub)
    setScrub(undefined)
  }

  // The keys go in the player's steps (a second at a time is too little to hear).
  const keys = (event: KeyboardEvent<HTMLInputElement>): void => {
    const steps: Record<string, number> = { ArrowLeft: -SKIP_BACK, ArrowDown: -SKIP_BACK, ArrowRight: SKIP_FORWARD, ArrowUp: SKIP_FORWARD, PageDown: -300, PageUp: 300 }
    const step = steps[event.key]
    if (event.key === "Home") player.seek(0)
    else if (event.key === "End") player.seek(length)
    else if (step !== undefined) player.skip(step)
    else return
    event.preventDefault()
  }

  return (
    <div className="grid">
      <input
        type="range"
        aria-label="Tid"
        min={0}
        max={max}
        step={1}
        value={Math.min(shown, max)}
        aria-valuetext={`${spokenTime(shown)} av ${spokenTime(length)}`}
        onChange={(event) => setScrub(Number(event.currentTarget.value))}
        onPointerUp={commit}
        onKeyDown={keys}
        onKeyUp={commit}
        onBlur={commit}
        disabled={length <= 0}
        style={{ "--fill": fill }}
        className={TRACK}
      />
      <div aria-hidden="true" className="-mt-2 grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 text-xs tabular-nums">
        <span>{formatClock(shown)}</span>
        <span className="font-medium">{busy ? "Henter lyden …" : ""}</span>
        <span className="text-right">−{formatClock(Math.max(0, length - shown))}</span>
      </div>
    </div>
  )
}

/** −15 and +30: the circling arrow of a media app, with the seconds in it. */
function SeekButton({ seconds }: { seconds: number }) {
  const back = seconds < 0
  return (
    <button type="button" onClick={() => player.skip(seconds)} aria-label={back ? `${-seconds} sekunder tilbake` : `${seconds} sekunder fram`} className={`${ROUND} relative size-14 [&_.ds-icon]:size-10 [&_.ds-icon]:stroke-[1.5]`}>
      <span className={back ? "inline-flex -scale-x-100" : "inline-flex"}>
        <Icon name="seek" />
      </span>
      <span aria-hidden="true" className="absolute inset-0 grid place-items-center pt-0.5 text-xs font-semibold tabular-nums">
        {Math.abs(seconds)}
      </span>
    </button>
  )
}

/**
 * The podcast player in full, over the whole screen: «Spilles nå», as in a media app (Apple Podcasts, Spotify, Pocket Casts). `PodcastPlayer` draws it and opens it
 * from its bar; it reads the same store (`player`), so it has nothing to keep of its own. From the top: a button that closes it (a chevron down) and the show; the
 * artwork, large and lit, on a ground of its own colours (`AmbientBackdrop`; a picture that may not be read keeps the plain tinted ground), a little smaller while
 * paused; the title (a link to the episode's page with `href`, which closes it) and the chapter playing (a tap goes to the chapters); the scrubber with the time gone and
 * the time left; −15 s, play and pause, +30 s, and with chapters the previous and next chapter; the speed; and the chapters, under the player on a phone and beside it
 * on a wide screen. It is a native modal `<dialog>` (`overlay.css`, `data-overlay="player"`): the page behind is inert and does not scroll, Esc, the back
 * button of an Android phone and a drag down close it, and so does a change of page (back or forward). Focus goes to play and pause, and back to what opened it.
 */

/** The episode's title in the dialog is never cut: a step smaller when it is long (`titleStep`). */
const DIALOG_TITLE_SIZES = ["text-xl", "text-lg", "text-base"] as const
export function NowPlaying({ open, onClose }: { /** Whether it is open: the dialog opens and closes with it. */ open: boolean; /** Called when the reader closes it (the button, Esc, a drag, a tap outside on a wide screen, a change of page). */ onClose: () => void }) {
  const state = usePlayer()
  const dialog = useRef<HTMLDialogElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLElement>(null)
  const drag = useRef<{ y: number; time: number; id: number } | null>(null)
  const [pull, setPull] = useState(0)
  const label = useId()
  const title = useId()
  const listTitle = useId()
  const episode = state.episode

  useEffect(() => {
    const element = dialog.current
    if (element === null) return
    if (open && !element.open) {
      element.showModal()
      // Focus on play and pause (or «Prøv igjen»), the control a reader came for.
      element.querySelector<HTMLElement>("[data-start]")?.focus()
    }
    if (!open && element.open) element.close()
  }, [open])

  // A change of page (back or forward) closes it: it never stays over a page it was not opened on.
  useEffect(() => {
    if (!open) return
    const close = (): void => dialog.current?.close()
    window.addEventListener("popstate", close)
    return () => window.removeEventListener("popstate", close)
  }, [open])

  if (episode === undefined) return null

  const chapters = episode.chapters ?? []
  const stepping = chapters.length > 1 ? chapters : undefined
  const index = currentChapter(chapters, state.position)
  const chapter = chapters[index]
  const previous = chapterStep(stepping, state.position, -1)
  const next = chapterStep(stepping, state.position, 1)
  const busy = state.buffering
  const close = (): void => dialog.current?.close()

  const toChapters = (): void => {
    const section = list.current
    if (section === null) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    section.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    const target = section.querySelector<HTMLButtonElement>('button[aria-current="true"]') ?? section.querySelector<HTMLButtonElement>("button")
    target?.focus({ preventScroll: true })
  }

  // A drag down from the top of the player closes it, on touch (a mouse closes it with the button, Esc or a click outside).
  const grab = (event: PointerEvent<HTMLElement>): void => {
    if (event.pointerType === "mouse" || (body.current?.scrollTop ?? 0) > 0) return
    drag.current = { y: event.clientY, time: event.timeStamp, id: event.pointerId }
  }
  const move = (event: PointerEvent<HTMLElement>): void => {
    const from = drag.current
    if (from === null || from.id !== event.pointerId) return
    const down = Math.max(0, event.clientY - from.y)
    if (down > 4 && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId)
    setPull(down)
  }
  const release = (event: PointerEvent<HTMLElement>): void => {
    const from = drag.current
    drag.current = null
    if (from === null || from.id !== event.pointerId) return
    const down = Math.max(0, event.clientY - from.y)
    const speed = down / Math.max(1, event.timeStamp - from.time)
    setPull(0)
    if (event.type === "pointerup" && (down > DISMISS || (down > FLICK && speed > 0.6))) close()
  }
  const dragging = { onPointerDown: grab, onPointerMove: move, onPointerUp: release, onPointerCancel: release }

  return (
    <dialog
      ref={dialog}
      data-overlay="player"
      {...(chapters.length > 0 ? { "data-chapters": "" } : {})}
      {...(pull > 0 ? { "data-dragging": "" } : {})}
      closedby="any"
      aria-labelledby={`${label} ${title}`}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
      style={pull > 0 ? { translate: `0 ${toRem(pull)}` } : undefined}
      className="@container isolate [--muted-foreground:var(--foreground)]"
    >
      <AmbientBackdrop src={episode.picture ?? null} />
      <div ref={body} className="h-full overflow-y-auto overscroll-contain @3xl:grid @3xl:grid-cols-2 @3xl:overflow-hidden">
        <div className="flex min-h-full flex-col pr-(--safe-right) pb-[calc(var(--safe-bottom)+--spacing(4))] pl-(--safe-left) @3xl:h-full @3xl:min-h-0 @3xl:overflow-y-auto">
          <header {...dragging} className="grid shrink-0 touch-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2 pt-[calc(var(--safe-top)+--spacing(2))]">
            <button type="button" onClick={close} className={`${ROUND} size-12 [&_.ds-icon]:size-6`}>
              <Icon name="chevron-down" />
              <span className="sr-only">Lukk</span>
            </button>
            <div className="grid min-w-0 text-center">
              <span id={label} className="text-xs font-medium">
                Spilles nå
              </span>
              <span className="truncate text-sm">{episode.show}</span>
            </div>
            <span aria-hidden="true" className="size-12" />
          </header>

          <div {...dragging} className="flex flex-1 touch-none items-center justify-center px-8 py-6">
            <div
              data-playing={state.playing ? "" : undefined}
              className="w-full max-w-[min(22rem,38dvh)] scale-[0.9] transition-[scale] duration-(--motion-duration-enter) ease-(--motion-ease-standard) data-playing:scale-100 *:first:rounded-xl"
            >
              <PictureFrame ratio="square" size="feature" corners="normal" src={episode.picture} />
            </div>
          </div>

          <div className="mx-auto grid w-full max-w-md shrink-0 gap-4 px-4 min-[24rem]:px-6">
            <div className="grid min-w-0 gap-1">
              <h2 id={title} className={`${HEAD_TITLE} leading-tight font-semibold ${DIALOG_TITLE_SIZES[titleStep(episode.title)]}`}>
                {episode.href === undefined ? (
                  episode.title
                ) : (
                  <a href={episode.href} onClick={close} className="focus-visible:ring-ring rounded-sm outline-none hover:underline focus-visible:ring-2">
                    {episode.title}
                  </a>
                )}
              </h2>
              {chapter === undefined ? null : (
                <button type="button" onClick={toChapters} className="focus-visible:ring-ring flex min-h-11 min-w-0 items-center gap-1.5 justify-self-start rounded-md text-left text-sm outline-none hover:underline focus-visible:ring-2">
                  <Icon name="chapters" size="sm" />
                  <span className="line-clamp-2 min-w-0 [overflow-wrap:anywhere]">{chapter.title}</span>
                  <span className="sr-only">{`, kapittel ${index + 1} av ${chapters.length}. Vis kapitlene`}</span>
                </button>
              )}
            </div>

            {state.error ? (
              <p role="alert" className="flex min-h-11 items-center gap-1.5 text-sm font-medium [&_.ds-icon]:text-destructive">
                <Icon name="failure" size="sm" />
                Kunne ikke spille av episoden. Sjekk nettet og prøv igjen.
              </p>
            ) : (
              <Scrubber position={state.position} length={state.duration} busy={busy} />
            )}
            <p role="status" className="sr-only">
              {busy ? "Henter lyden …" : ""}
            </p>

            <div className="flex items-center justify-center gap-1 min-[22rem]:gap-2 sm:gap-4">
              {stepping === undefined ? null : (
                <button type="button" onClick={() => previous !== undefined && player.seek(previous)} disabled={previous === undefined} className={`${ROUND} size-12 [&_.ds-icon]:size-6 [&_.ds-icon]:fill-current`}>
                  <Icon name="previous" />
                  <span className="sr-only">Forrige kapittel</span>
                </button>
              )}
              <SeekButton seconds={-SKIP_BACK} />
              {state.error ? (
                <button type="button" data-start="" onClick={() => player.retry()} className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring inline-flex size-18 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2 [&_.ds-icon]:size-8">
                  <Icon name="refresh" />
                  <span className="sr-only">Prøv igjen</span>
                </button>
              ) : (
                <button
                  type="button"
                  data-start=""
                  data-haptic="selection"
                  onClick={() => player.toggle()}
                  aria-busy={busy ? true : undefined}
                  className="bg-primary text-primary-foreground hover:bg-primary/85 focus-visible:ring-ring relative inline-flex size-18 items-center justify-center rounded-full shadow-lg outline-none transition-[scale] duration-(--motion-duration-instant) focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95 [&_.ds-icon]:size-8 [&_.ds-icon]:fill-current"
                >
                  {busy ? <span aria-hidden="true" className="absolute inset-1 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" /> : null}
                  <span className={state.playing ? "inline-flex" : "inline-flex translate-x-0.5"}>
                    <Icon name={state.playing ? "pause" : "play"} />
                  </span>
                  <span className="sr-only">{state.playing ? "Pause" : "Spill av"}</span>
                </button>
              )}
              <SeekButton seconds={SKIP_FORWARD} />
              {stepping === undefined ? null : (
                <button type="button" onClick={() => next !== undefined && player.seek(next)} disabled={next === undefined} className={`${ROUND} size-12 [&_.ds-icon]:size-6 [&_.ds-icon]:fill-current`}>
                  <Icon name="next" />
                  <span className="sr-only">Neste kapittel</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <label className="relative inline-flex items-center">
                <span aria-hidden="true" className="pointer-events-none absolute left-3 inline-flex">
                  <Icon name="speed" />
                </span>
                <span className="sr-only">Hastighet</span>
                <select
                  value={String(state.rate)}
                  onChange={(event) => player.setRate(Number(event.currentTarget.value))}
                  className="hover:bg-foreground/10 focus-visible:ring-ring bg-foreground/10 h-11 appearance-none rounded-full border border-transparent pr-4 pl-9 text-sm font-medium tabular-nums outline-none focus-visible:ring-2"
                >
                  {RATES.map((speed) => (
                    <option key={speed} value={String(speed)} className="bg-[Canvas] text-[CanvasText]">
                      {`${speed.toLocaleString("nb-NO")}×`}
                    </option>
                  ))}
                </select>
              </label>
              {chapters.length === 0 ? null : (
                <button type="button" onClick={toChapters} className="bg-foreground/10 hover:bg-foreground/15 focus-visible:ring-ring inline-flex h-11 items-center gap-2 rounded-full border border-transparent px-4 text-sm font-medium outline-none focus-visible:ring-2 @3xl:hidden">
                  <Icon name="chapters" />
                  Kapitler
                </button>
              )}
            </div>
          </div>
        </div>

        {chapters.length === 0 ? null : (
          <section ref={list} aria-labelledby={listTitle} className="scroll-mt-2 px-4 pr-[calc(var(--safe-right)+--spacing(4))] pb-[calc(var(--safe-bottom)+--spacing(6))] pl-[calc(var(--safe-left)+--spacing(4))] @3xl:overflow-y-auto @3xl:border-l @3xl:pt-[calc(var(--safe-top)+--spacing(4))]">
            <h3 id={listTitle} className="px-2 pt-4 pb-2 text-base font-semibold @3xl:pt-2">
              Kapitler
            </h3>
            <ChapterList chapters={chapters} />
          </section>
        )}
      </div>
    </dialog>
  )
}
