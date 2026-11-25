"use client"

import { useEffect, useRef, useState } from "react"

import { Icon } from "./icon"
import { NowPlaying } from "./now-playing"
import { PictureFrame } from "./internal/picture-frame"
import { chapterStep, currentChapter, player, SKIP_BACK, SKIP_FORWARD, type Episode, type PlayerState } from "../lib/podcast-player"
import { READING_COLUMN } from "../lib/page-width"
import { usePlayer } from "../lib/use-player"
import { toRem } from "../lib/units"

export { usePlayer } from "../lib/use-player"
export { player, type Chapter, type Episode, type PlayerState } from "../lib/podcast-player"
export { NowPlaying } from "./now-playing"

const CONTROL =
  "hover:bg-muted focus-visible:ring-ring inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums outline-none focus-visible:ring-2 disabled:opacity-50"

/** The room the page leaves under the player (`--player-room`, `PageLayout`): the bar's own height, while it shows. */
function room(element: HTMLDivElement | null): (() => void) | undefined {
  if (element === null) return undefined
  const root = document.documentElement
  const measure = (): void => root.style.setProperty("--player-room", toRem(Math.ceil(element.getBoundingClientRect().height)))
  measure()
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : undefined
  observer?.observe(element)
  return () => {
    observer?.disconnect()
    root.style.removeProperty("--player-room")
  }
}

/** Tells the lock screen where the episode is (Media Session), where the browser knows how. */
function setPosition(state: PlayerState): void {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator) || typeof navigator.mediaSession.setPositionState !== "function") return
  try {
    if (state.episode === undefined || state.duration <= 0) navigator.mediaSession.setPositionState()
    else navigator.mediaSession.setPositionState({ duration: state.duration, playbackRate: state.rate, position: Math.min(state.position, state.duration) })
  } catch {
    // A position the browser does not take (a length not known yet): it shows none.
  }
}

/**
 * The app's one podcast player: the `<audio>` (`preload="metadata"`), a bar docked at the foot of the screen that plays on as the reader moves between pages, and
 * «Spilles nå» (`NowPlaying`), the player in full over the whole screen. Put it once in the root layout (or give it to `PageLayout` as `player`); it draws nothing
 * until an episode is played (`player.play` from `lib/podcast-player`, or a `PlayButton`). The bar sits above the `NavBar`'s bar on a phone and beside its rail
 * from tablet width, and the page leaves room under it. It is what a media app's bar is: the artwork, the title and the show (or the chapter playing), play and pause
 * (and +30 s where there is room), and a thin line along its top of how far it has come. A tap on it anywhere else opens «Spilles nå», which has the rest: the
 * scrubber, −15 s and +30 s, the chapters and the speed. The lock screen and a headset's buttons work through Media Session: play, pause, back and forward, a seek,
 * and «previous» and «next» as chapters. `onProgress` is how the app saves where the reader is: every `progressEvery` seconds while it plays, when it pauses or
 * ends (at the end, with the position at the length), when another episode takes over, and when the page is hidden or left.
 */
export function PodcastPlayer({
  onProgress,
  progressEvery = 15,
  defaultOpen = false,
}: {
  /** Where the reader is in an episode, to save («Fortsett å lytte»). */
  onProgress?: (episode: Episode, position: number, duration: number) => void
  /** How often `onProgress` is called while it plays, in seconds. */
  progressEvery?: number
  /** Opens «Spilles nå» at once, once there is an episode (a story, or an app that returns to the player). */
  defaultOpen?: boolean
}) {
  const state = usePlayer()
  const audio = useRef<HTMLAudioElement>(null)
  const opener = useRef<HTMLButtonElement>(null)
  const report = useRef(onProgress)
  const [open, setOpen] = useState(defaultOpen)
  const episode = state.episode
  // Nothing to show when the player is emptied: it opens closed next time.
  if (episode === undefined && open) setOpen(false)

  useEffect(() => {
    report.current = onProgress
  })

  useEffect(() => {
    const element = audio.current
    return element === null ? undefined : player.attach(element)
  }, [])

  // Progress: at every change of episode (for the one before), at a pause and at the end, on a timer while it plays, and when the page goes.
  useEffect(() => {
    const send = (from: PlayerState): void => {
      if (from.episode !== undefined) report.current?.(from.episode, from.position, from.duration)
    }
    let last = player.getState()
    const unsubscribe = player.subscribe((next) => {
      if (last.episode !== undefined && last.episode.id !== next.episode?.id) send(last)
      else if (last.playing && !next.playing && next.episode !== undefined) send(next)
      last = next
    })
    const hide = (): void => {
      if (document.visibilityState === "hidden") send(player.getState())
    }
    const leave = (): void => send(player.getState())
    document.addEventListener("visibilitychange", hide)
    window.addEventListener("pagehide", leave)
    return () => {
      unsubscribe()
      document.removeEventListener("visibilitychange", hide)
      window.removeEventListener("pagehide", leave)
    }
  }, [])

  useEffect(() => {
    if (!state.playing) return
    const timer = setInterval(() => {
      const now = player.getState()
      if (now.episode !== undefined) report.current?.(now.episode, now.position, now.duration)
    }, Math.max(1, progressEvery) * 1000)
    return () => clearInterval(timer)
  }, [state.playing, progressEvery])


  // Media Session: what plays, for the lock screen, and its buttons.
  const chapterIndex = currentChapter(episode?.chapters, state.position)
  const chapter = episode?.chapters?.[chapterIndex]
  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    if (episode === undefined || typeof MediaMetadata !== "function") {
      navigator.mediaSession.metadata = null
      return
    }
    const artwork = chapter?.picture ?? episode.picture
    navigator.mediaSession.metadata = new MediaMetadata({ title: episode.title, artist: episode.show, album: chapter?.title ?? episode.show, artwork: artwork === undefined ? [] : [{ src: artwork }] })
  }, [episode, chapter])

  useEffect(() => {
    if (!("mediaSession" in navigator) || episode === undefined) return
    const chapters = episode.chapters !== undefined && episode.chapters.length > 1 ? episode.chapters : undefined
    const toChapter = (step: -1 | 1) => () => {
      const to = chapterStep(chapters, player.getState().position, step)
      if (to !== undefined) player.seek(to)
    }
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", () => player.play(episode)],
      ["pause", () => player.pause()],
      ["seekbackward", (details) => player.skip(-(details.seekOffset ?? SKIP_BACK))],
      ["seekforward", (details) => player.skip(details.seekOffset ?? SKIP_FORWARD)],
      ["seekto", (details) => (details.seekTime === undefined ? undefined : player.seek(details.seekTime))],
      // Without chapters, no track buttons: the lock screen then shows back and forward instead.
      ["previoustrack", chapters === undefined ? null : toChapter(-1)],
      ["nexttrack", chapters === undefined ? null : toChapter(1)],
    ]
    for (const [action, handler] of handlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      } catch {
        // An action this browser does not have.
      }
    }
    return () => {
      for (const [action] of handlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null)
        } catch {
          // As above.
        }
      }
    }
  }, [episode])

  const { playing, duration, rate } = state
  useEffect(() => {
    if (!("mediaSession" in navigator)) return
    navigator.mediaSession.playbackState = episode === undefined ? "none" : playing ? "playing" : "paused"
    setPosition({ ...player.getState(), episode, playing, duration, rate })
  }, [episode, playing, duration, rate])

  useEffect(() => {
    const element = audio.current
    if (element === null) return
    const seeked = (): void => setPosition(player.getState())
    element.addEventListener("seeked", seeked)
    return () => element.removeEventListener("seeked", seeked)
  }, [])

  const fraction = state.duration > 0 ? Math.min(1, Math.max(0, state.position / state.duration)) : 0
  const busy = state.buffering

  return (
    <>
      <audio ref={audio} preload="metadata" />
      {episode === undefined ? null : (
        <section
          aria-label="Avspiller"
          data-podcast-player=""
          className="bg-background/95 fixed right-0 bottom-(--nav-bar-room) left-(--nav-rail-room) z-30 border-t pr-(--safe-right) pl-(--safe-left) backdrop-blur"
        >
          <div aria-hidden="true" className="bg-muted absolute inset-x-0 -top-px h-0.5 overflow-hidden">
            <div className="bg-foreground h-full origin-left" style={{ scale: `${fraction} 1` }} />
          </div>
          <div ref={room} className={`${READING_COLUMN} flex items-center gap-1 px-2 pt-1.5 pb-[calc(--spacing(1.5)+var(--dock-safe-bottom))] sm:px-4`}>
            <button
              ref={opener}
              type="button"
              aria-haspopup="dialog"
              onClick={() => setOpen(true)}
              className="hover:bg-muted/60 focus-visible:ring-ring flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-lg p-1 *:first:shrink-0 text-left outline-none focus-visible:ring-2"
            >
              <PictureFrame ratio="square" corners="normal" src={episode.picture} />
              <span className="grid min-w-0 flex-1 text-sm">
                <span className="sr-only">Åpne avspilleren: </span>
                <span className="line-clamp-2 font-medium [overflow-wrap:anywhere]">{episode.title}</span>
                <span className="sr-only">, </span>
                {state.error ? (
                  <span className="text-destructive flex min-w-0 items-center gap-1 font-medium">
                    <Icon name="failure" size="sm" />
                    <span className="truncate">Kunne ikke spille av</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground truncate">{chapter?.title ?? episode.show}</span>
                )}
              </span>
            </button>
            {state.error ? (
              <p role="alert" className="sr-only">
                Kunne ikke spille av episoden. Sjekk nettet og prøv igjen.
              </p>
            ) : null}
            <button type="button" onClick={() => player.skip(SKIP_FORWARD)} aria-label={`${SKIP_FORWARD} sekunder fram`} className={`${CONTROL.replace("inline-flex ", "")} hidden sm:inline-flex`}>
              <span aria-hidden="true">+{SKIP_FORWARD}</span>
            </button>
            {state.error ? (
              <button type="button" onClick={() => player.retry()} className={`${CONTROL} bg-primary text-primary-foreground hover:bg-primary/80`}>
                <Icon name="refresh" />
                <span className="sr-only">Prøv igjen</span>
              </button>
            ) : (
              <button
                type="button"
                data-haptic="selection"
                onClick={() => player.toggle()}
                aria-busy={busy ? true : undefined}
                className={`${CONTROL} bg-primary text-primary-foreground hover:bg-primary/80 relative [&_.ds-icon]:fill-current`}
              >
                {busy ? (
                  <span aria-hidden="true" className="absolute inset-1 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
                ) : null}
                <Icon name={state.playing ? "pause" : "play"} />
                <span className="sr-only">{state.playing ? "Pause" : "Spill av"}</span>
              </button>
            )}
          </div>
        </section>
      )}
      {episode === undefined ? null : (
        <NowPlaying
          open={open}
          onClose={() => {
            setOpen(false)
            opener.current?.focus()
          }}
        />
      )}
    </>
  )
}
