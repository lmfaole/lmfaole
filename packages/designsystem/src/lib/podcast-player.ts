/**
 * The podcast player's state, outside React: one episode at a time, one `<audio>` for the whole app. `PodcastPlayer` (once, in the root
 * layout) draws the `<audio>` and gives it to the store (`player.attach`); everything else (a `PlayButton`, a `ChapterList`, the app's own
 * code) asks the store (`player.play(episode, at)`) and listens (`player.subscribe`, or `usePlayer` from `components/podcast-player`).
 * Asked before the player is there, the store keeps the wish and carries it out when the `<audio>` comes.
 *
 * Safe on the server and free of React: nothing here touches `window`, `document` or `localStorage` until it is called in the browser,
 * so a server component may import the types and the pure parts. The chosen speed is kept in `localStorage` (`ds-podcast-rate`), read
 * when the `<audio>` is attached. The pure parts (`currentChapter`, `chapterStep`, `formatClock`, `spokenTime`, `timeLeft`) are tested.
 */

/** A chapter of an episode (Podcasting 2.0 JSON chapters, Podlove Simple Chapters): where it starts, in seconds, and its name. */
export type Chapter = { start: number; title: string; href?: string; picture?: string }

/** One episode, as the player needs it. */
export type Episode = {
  /** The app's stable id of the episode. */
  id: string
  title: string
  /** The podcast's title. */
  show: string
  /** The audio's address; may be the app's own (`/api/lyd/<id>`). */
  src: string
  /** The artwork. */
  picture?: string
  /** The episode's page in the app. */
  href?: string
  /** Its length in seconds, as the feed says, until the audio says better. */
  duration?: number
  chapters?: Chapter[]
}

export type PlayerState = {
  episode?: Episode
  playing: boolean
  /** Where it is, in seconds. */
  position: number
  /** How long the episode is, in seconds: the audio's own once it knows, the feed's before (0 when neither knows). */
  duration: number
  /** The speed, one of `RATES`. */
  rate: number
  /** Waiting for data: it should play, but has nothing to play yet. */
  buffering: boolean
  /** The audio could not be loaded or played. `player.retry()` tries again where it was. */
  error?: boolean
}

/** The speeds a reader can choose, slowest first. */
export const RATES = [0.8, 1, 1.2, 1.5, 2] as const

/** How far the player's back and forward buttons (and the scrubber's arrow keys) go, in seconds. */
export const SKIP_BACK = 15
export const SKIP_FORWARD = 30

/** Where the chosen speed is kept in this browser. */
export const RATE_KEY = "ds-podcast-rate"

/** The state before anything is played, and on the server. */
export const INITIAL_PLAYER_STATE: PlayerState = Object.freeze({ playing: false, position: 0, duration: 0, rate: 1, buffering: false })

/** What the store needs of an `<audio>`: an `HTMLAudioElement` has it all (a test gives it a fake). */
export interface PlayerMedia extends EventTarget {
  src: string
  currentTime: number
  readonly duration: number
  readonly paused: boolean
  readonly readyState: number
  playbackRate: number
  defaultPlaybackRate: number
  play(): Promise<void>
  pause(): void
  load(): void
  removeAttribute(name: string): void
}

const finite = (value: number | undefined): number => (value !== undefined && Number.isFinite(value) && value > 0 ? value : 0)

/** The index of the chapter `position` is in: the last that starts at or before it, or -1 before the first (or with none). */
export function currentChapter(chapters: Chapter[] | undefined, position: number): number {
  if (chapters === undefined) return -1
  let found = -1
  let start = -Infinity
  chapters.forEach((chapter, index) => {
    if (chapter.start <= position && chapter.start >= start) {
      found = index
      start = chapter.start
    }
  })
  return found
}

/**
 * Where «previous» and «next» chapter go (the lock screen's track buttons), in seconds: the next chapter's start; for `-1` the start of
 * this chapter, or of the one before when it is less than 3 s in (as a music player's «previous»). `undefined` where there is nowhere to go.
 */
export function chapterStep(chapters: Chapter[] | undefined, position: number, step: -1 | 1): number | undefined {
  if (chapters === undefined || chapters.length === 0) return undefined
  const starts = chapters.map((chapter) => chapter.start).toSorted((a, b) => a - b)
  if (step === 1) return starts.find((start) => start > position + 0.5)
  const before = starts.filter((start) => start <= position)
  const here = before.at(-1)
  if (here === undefined) return undefined
  if (position - here >= 3) return here
  return before.at(-2) ?? here
}

const split = (seconds: number): [hours: number, minutes: number, seconds: number] => {
  const whole = Math.floor(finite(seconds))
  return [Math.floor(whole / 3600), Math.floor((whole % 3600) / 60), whole % 60]
}

/** A time on a player's clock: «1:02:03», «12:05», «0:07». */
export function formatClock(seconds: number): string {
  const [hours, minutes, rest] = split(seconds)
  const ss = String(rest).padStart(2, "0")
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}` : `${minutes}:${ss}`
}

/** A time in words, for a screen reader and for a length: «12 min 5 s», «1 t 2 min» (no seconds from an hour up), «0 s». */
export function spokenTime(seconds: number): string {
  const [hours, minutes, rest] = split(seconds)
  const parts = hours > 0 ? [`${hours} t`, minutes > 0 ? `${minutes} min` : ""] : [minutes > 0 ? `${minutes} min` : "", rest > 0 || minutes === 0 ? `${rest} s` : ""]
  return parts.filter((part) => part !== "").join(" ")
}

/** What is left of an episode, in words, by the minute rounded up: «23 min igjen», «1 t 5 min igjen», «Under 1 min igjen», «Ferdig». */
export function timeLeft(position: number, duration: number): string {
  const left = finite(duration) - finite(position)
  if (left <= 0) return "Ferdig"
  if (left < 60) return "Under 1 min igjen"
  const minutes = Math.ceil(left / 60)
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${[hours > 0 ? `${hours} t` : "", rest > 0 ? `${rest} min` : ""].filter((part) => part !== "").join(" ")} igjen`
}

function readRate(): number | undefined {
  try {
    const stored = Number(globalThis.localStorage?.getItem(RATE_KEY))
    return RATES.find((rate) => rate === stored)
  } catch {
    return undefined
  }
}

function writeRate(rate: number): void {
  try {
    globalThis.localStorage?.setItem(RATE_KEY, String(rate))
  } catch {
    // Private mode or storage turned off: the speed holds for this visit.
  }
}

const errorName = (error: unknown): string | undefined => (typeof error === "object" && error !== null && "name" in error ? String(error.name) : undefined)

/** A store of its own (tests); an app uses `player`. Its methods may be passed around on their own (`onClick={player.toggle}`). */
export function createPlayer() {
  let state: PlayerState = INITIAL_PLAYER_STATE
  const listeners = new Set<(state: PlayerState) => void>()
  /** The `<audio>`s attached, the last the one in use. */
  const media: PlayerMedia[] = []
  /** Where to go once the audio knows its length. */
  let pendingSeek: number | undefined
  /** Whether the reader asked it to play (and has not paused since). */
  let wantsPlay = false
  let rateRead = false

  const audio = (): PlayerMedia | undefined => media.at(-1)

  const set = (patch: Partial<PlayerState>): void => {
    const next: PlayerState = { ...state, ...patch }
    if (Object.entries(patch).every(([key, value]) => Object.is(value, Object.getOwnPropertyDescriptor(state, key)?.value))) return
    state = next
    for (const listener of listeners) listener(state)
  }

  const durationOf = (element: PlayerMedia | undefined): number => finite(element?.duration) || finite(state.episode?.duration)

  const start = (element: PlayerMedia): void => {
    wantsPlay = true
    // `play()` is refused without a tap (autoplay rules), or interrupted when the source changes: then it simply does not play.
    element.play()?.catch((error: unknown) => {
      if (errorName(error) === "AbortError") return
      wantsPlay = false
      set({ playing: false, buffering: false, ...(errorName(error) === "NotSupportedError" ? { error: true } : {}) })
    })
  }

  /** The episode each `<audio>` holds, so one given again (React's strict mode, a remount) is not loaded again from the start. */
  const holds = new WeakMap<PlayerMedia, Episode>()

  /** Puts the current episode in the `<audio>` (from `pendingSeek`, or where it was), and plays it if asked. `again` loads it anew. */
  const fill = (element: PlayerMedia, again = false): void => {
    const episode = state.episode
    if (episode === undefined) return
    if (again || holds.get(element)?.id !== episode.id || element.readyState === 0) {
      pendingSeek ??= state.position
      holds.set(element, episode)
      element.src = episode.src
      element.load()
    } else if (pendingSeek !== undefined) {
      element.currentTime = pendingSeek
      pendingSeek = undefined
    }
    element.playbackRate = state.rate
    element.defaultPlaybackRate = state.rate
    if (wantsPlay) start(element)
  }

  const handlers = (element: PlayerMedia): Record<string, () => void> => ({
    loadedmetadata: () => {
      element.playbackRate = state.rate
      if (pendingSeek !== undefined) {
        const length = finite(element.duration)
        element.currentTime = length > 0 ? Math.min(pendingSeek, length) : pendingSeek
        pendingSeek = undefined
      }
      set({ duration: durationOf(element), position: element.currentTime })
    },
    durationchange: () => set({ duration: durationOf(element) }),
    timeupdate: () => {
      if (pendingSeek === undefined) set({ position: element.currentTime })
    },
    play: () => set({ playing: true, error: false }),
    playing: () => set({ playing: true, buffering: false, error: false }),
    pause: () => set({ playing: false, buffering: false, position: pendingSeek ?? element.currentTime }),
    waiting: () => set({ buffering: true }),
    canplay: () => set({ buffering: false }),
    seeked: () => set({ position: element.currentTime }),
    ended: () => {
      wantsPlay = false
      set({ playing: false, buffering: false, position: durationOf(element) })
    },
    error: () => {
      // An `<audio>` emptied by `close()` reports an error too: it is not one.
      if (state.episode === undefined) return
      wantsPlay = false
      set({ playing: false, buffering: false, error: true })
    },
  })

  function seek(seconds: number): void {
    if (state.episode === undefined) return
    const element = audio()
    const length = durationOf(element)
    const to = Math.max(0, length > 0 ? Math.min(seconds, length) : seconds)
    if (element !== undefined && element.readyState >= 1) {
      element.currentTime = to
      pendingSeek = undefined
    } else {
      pendingSeek = to
    }
    set({ position: to })
  }

  function load(episode: Episode, at?: number): void {
    const element = audio()
    if (state.episode?.id !== episode.id) {
      pendingSeek = finite(at)
      set({ episode, position: finite(at), duration: finite(episode.duration), buffering: false, error: false, playing: false })
      if (element !== undefined) fill(element)
      return
    }
    if (episode !== state.episode) set({ episode })
    if (at !== undefined) seek(at)
    if (element === undefined) return
    if (state.error) fill(element, true)
    else if (wantsPlay && element.paused) start(element)
  }

  function play(episode: Episode, at?: number): void {
    wantsPlay = true
    set({ error: false })
    load(episode, at)
  }

  function pause(): void {
    wantsPlay = false
    audio()?.pause()
    set({ playing: false, buffering: false })
  }

  return {
    /** Starts `episode` from `at` seconds (where it is, if it is the one in the player). Before the player is there, it starts when it comes. */
    play,
    /** Puts `episode` in the player, paused, at `at` seconds: to show where a reader left off without playing it. */
    load,
    toggle(): void {
      if (state.episode === undefined) return
      if (state.playing || wantsPlay) pause()
      else play(state.episode)
    },
    pause,
    /** Goes to `seconds`, kept inside the episode. */
    seek,
    /** Moves `delta` seconds back (negative) or forward. */
    skip(delta: number): void {
      seek(state.position + delta)
    },
    /** One of `RATES`; kept in this browser for the next episode and the next visit. */
    setRate(rate: number): void {
      rateRead = true
      for (const element of media) {
        element.playbackRate = rate
        element.defaultPlaybackRate = rate
      }
      writeRate(rate)
      set({ rate })
    },
    /** After an error: loads the episode again where it was, and plays it. */
    retry(): void {
      if (state.episode === undefined) return
      pendingSeek = state.position
      wantsPlay = true
      set({ error: false })
      const element = audio()
      if (element !== undefined) fill(element, true)
    },
    /** Stops and empties the player: it draws nothing until the next `play` or `load`. */
    close(): void {
      wantsPlay = false
      pendingSeek = undefined
      set({ episode: undefined, playing: false, position: 0, duration: 0, buffering: false, error: false })
      const element = audio()
      if (element === undefined) return
      element.pause()
      element.removeAttribute("src")
      element.load()
    },
    getState(): PlayerState {
      return state
    },
    /** The state on the server and in the first render in the browser, so the two match. */
    getServerState(): PlayerState {
      return INITIAL_PLAYER_STATE
    },
    subscribe(listener: (state: PlayerState) => void): () => void {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    /**
     * Gives the store its `<audio>` (`PodcastPlayer` does): it takes the speed kept in this browser and what was asked for before it came.
     * Returns the way to let go of it.
     */
    attach(element: PlayerMedia): () => void {
      if (!rateRead) {
        rateRead = true
        const stored = readRate()
        if (stored !== undefined) set({ rate: stored })
      }
      const own = handlers(element)
      for (const [type, handler] of Object.entries(own)) element.addEventListener(type, handler)
      media.push(element)
      fill(element)
      return () => {
        for (const [type, handler] of Object.entries(own)) element.removeEventListener(type, handler)
        const index = media.indexOf(element)
        if (index !== -1) media.splice(index, 1)
        const left = media.at(-1)
        if (left === undefined) set({ playing: false, buffering: false })
        else fill(left)
      }
    },
  }
}

export type Player = ReturnType<typeof createPlayer>

/** The app's one player. */
export const player: Player = createPlayer()
