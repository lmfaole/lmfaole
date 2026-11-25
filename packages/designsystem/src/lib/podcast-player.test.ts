import { strict as assert } from "node:assert"
import { test } from "node:test"

import { chapterStep, createPlayer, currentChapter, formatClock, spokenTime, timeLeft, type Chapter, type Episode, type PlayerMedia } from "./podcast-player.ts"

const chapters: Chapter[] = [
  { start: 0, title: "Intro" },
  { start: 120, title: "Nyheter" },
  { start: 600, title: "Intervju" },
]

test("the current chapter is the last that has started; none before the first, or without chapters", () => {
  assert.equal(currentChapter(chapters, 0), 0)
  assert.equal(currentChapter(chapters, 119.9), 0)
  assert.equal(currentChapter(chapters, 120), 1)
  assert.equal(currentChapter(chapters, 5000), 2)
  assert.equal(currentChapter([{ start: 30, title: "Sent" }], 10), -1)
  assert.equal(currentChapter(undefined, 10), -1)
  assert.equal(currentChapter([], 10), -1)
  // Out of order in the feed: still the one that started last, by its index in the list.
  assert.equal(currentChapter(chapters.toReversed(), 300), 1)
})

test("previous and next chapter: next goes to the next start; previous to this chapter's start, or the one before in its first 3 s", () => {
  assert.equal(chapterStep(chapters, 130, 1), 600)
  assert.equal(chapterStep(chapters, 700, 1), undefined)
  assert.equal(chapterStep(chapters, 130, -1), 120)
  assert.equal(chapterStep(chapters, 121, -1), 0)
  assert.equal(chapterStep(chapters, 1, -1), 0)
  assert.equal(chapterStep(undefined, 1, 1), undefined)
})

test("a clock is m:ss under an hour and h:mm:ss from one; what is not a time is 0:00", () => {
  assert.equal(formatClock(0), "0:00")
  assert.equal(formatClock(7.9), "0:07")
  assert.equal(formatClock(725), "12:05")
  assert.equal(formatClock(3723), "1:02:03")
  assert.equal(formatClock(Number.NaN), "0:00")
  assert.equal(formatClock(-5), "0:00")
  assert.equal(formatClock(Infinity), "0:00")
})

test("a time in words leaves out what is zero, and the seconds from an hour up", () => {
  assert.equal(spokenTime(725), "12 min 5 s")
  assert.equal(spokenTime(3725), "1 t 2 min")
  assert.equal(spokenTime(3600), "1 t")
  assert.equal(spokenTime(60), "1 min")
  assert.equal(spokenTime(0), "0 s")
})

test("what is left is said by the minute, rounded up", () => {
  assert.equal(timeLeft(600, 1980), "23 min igjen")
  assert.equal(timeLeft(0, 3900), "1 t 5 min igjen")
  assert.equal(timeLeft(0, 3600), "1 t igjen")
  assert.equal(timeLeft(1950, 1980), "Under 1 min igjen")
  assert.equal(timeLeft(1980, 1980), "Ferdig")
})

/** An `<audio>` without a browser: it loads metadata when told and records what it is asked. */
class FakeAudio extends EventTarget implements PlayerMedia {
  src = ""
  currentTime = 0
  duration = Number.NaN
  paused = true
  readyState = 0
  playbackRate = 1
  defaultPlaybackRate = 1
  loads = 0
  play(): Promise<void> {
    this.paused = false
    this.dispatchEvent(new Event("play"))
    return Promise.resolve()
  }
  pause(): void {
    this.paused = true
    this.dispatchEvent(new Event("pause"))
  }
  load(): void {
    this.loads += 1
    this.readyState = 0
  }
  removeAttribute(): void {
    this.src = ""
  }
  /** The browser has read the file's head. */
  metadata(duration: number): void {
    this.duration = duration
    this.readyState = 1
    this.dispatchEvent(new Event("loadedmetadata"))
  }
}

const episode: Episode = { id: "e1", title: "Episode 1", show: "Podkast", src: "https://example.com/e1.mp3", duration: 1800, chapters }

test("play before the player is there waits for its audio, then loads, goes to where it was asked and plays", () => {
  const store = createPlayer()
  store.play(episode, 300)
  assert.equal(store.getState().episode?.id, "e1")
  assert.equal(store.getState().position, 300)
  assert.equal(store.getState().duration, 1800)
  const audio = new FakeAudio()
  store.attach(audio)
  assert.equal(audio.src, episode.src)
  assert.equal(audio.paused, false)
  assert.equal(store.getState().playing, true)
  audio.metadata(1790)
  assert.equal(audio.currentTime, 300)
  assert.equal(store.getState().duration, 1790)
})

test("load shows an episode paused; toggle plays and pauses; seek and skip stay inside it", () => {
  const store = createPlayer()
  const audio = new FakeAudio()
  store.attach(audio)
  store.load(episode, 100)
  assert.equal(audio.paused, true)
  audio.metadata(1800)
  store.toggle()
  assert.equal(store.getState().playing, true)
  store.toggle()
  assert.equal(store.getState().playing, false)
  store.skip(-500)
  assert.equal(audio.currentTime, 0)
  store.seek(5000)
  assert.equal(store.getState().position, 1800)
})

test("the same audio given again (a remount) is not loaded again; a new episode is", () => {
  const store = createPlayer()
  const audio = new FakeAudio()
  const release = store.attach(audio)
  store.play(episode)
  audio.metadata(1800)
  release()
  store.attach(audio)
  assert.equal(audio.loads, 1)
  store.play({ ...episode, id: "e2", src: "https://example.com/e2.mp3" })
  assert.equal(audio.loads, 2)
})

test("an error stops it and is said in the state; retry loads it again where it was", () => {
  const store = createPlayer()
  const audio = new FakeAudio()
  store.attach(audio)
  store.play(episode, 50)
  audio.dispatchEvent(new Event("error"))
  assert.equal(store.getState().error, true)
  assert.equal(store.getState().playing, false)
  store.retry()
  assert.equal(store.getState().error, false)
  assert.equal(audio.loads, 2)
  audio.metadata(1800)
  assert.equal(audio.currentTime, 50)
})

test("the speed is set on the audio and on the next one; close empties the player", () => {
  const store = createPlayer()
  const audio = new FakeAudio()
  store.attach(audio)
  store.setRate(1.5)
  assert.equal(audio.playbackRate, 1.5)
  store.play(episode)
  assert.equal(audio.defaultPlaybackRate, 1.5)
  const seen: (string | undefined)[] = []
  store.subscribe((state) => seen.push(state.episode?.id))
  store.close()
  assert.equal(store.getState().episode, undefined)
  assert.equal(audio.src, "")
  assert.deepEqual(seen.at(-1), undefined)
})
