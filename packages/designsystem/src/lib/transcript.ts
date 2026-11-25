/**
 * The pure parts of `Transcript`: which cue plays now, the speakers' turns, and the matches of a search, so they can be tested without React.
 * A cue is a line of a timed transcript (Podcasting 2.0 `podcast:transcript` as WebVTT, SRT or JSON): when it starts and ends, in seconds
 * from the start of the episode, what is said and, where the transcript has it, by whom.
 */

export interface TranscriptCue {
  /** When it is said, in seconds from the start of the episode. */
  start: number
  /** When it ends, in seconds. */
  end: number
  text: string
  /** Who says it («Anne Lindmo»), where the transcript names the speaker. */
  speaker?: string
}

/**
 * The cue that plays at `time`, by its index, or -1 before the first and after the last has ended. A pause between two cues belongs to the
 * one before, so the mark does not blink off between lines. The cues are in the order they are said; `start` is never after `end`.
 */
export function currentCue(cues: readonly TranscriptCue[], time: number): number {
  if (!Number.isFinite(time) || cues.length === 0) return -1
  let low = 0
  let high = cues.length - 1
  let found = -1
  while (low <= high) {
    const middle = (low + high) >> 1
    if ((cues[middle]?.start ?? Infinity) <= time) {
      found = middle
      low = middle + 1
    } else high = middle - 1
  }
  if (found < 0) return -1
  const cue = cues[found]
  if (cue === undefined) return -1
  return time < cue.end || found < cues.length - 1 ? found : -1
}

/** One speaker's turn: the cues said in a row by the same speaker, each with its index in the transcript. */
export interface TranscriptTurn {
  speaker: string | undefined
  cues: { cue: TranscriptCue; index: number }[]
}

/** The cues in turns: a new turn where the speaker changes. Without speakers it is one turn. */
export function cueTurns(cues: readonly TranscriptCue[]): TranscriptTurn[] {
  const turns: TranscriptTurn[] = []
  for (const [index, cue] of cues.entries()) {
    const speaker = cue.speaker?.trim() === "" ? undefined : cue.speaker?.trim()
    const last = turns.at(-1)
    if (last !== undefined && last.speaker === speaker) last.cues.push({ cue, index })
    else turns.push({ speaker, cues: [{ cue, index }] })
  }
  return turns
}

/** One match of a search: in which text (by its index) and where in it, from `from` up to `to`. */
export interface TranscriptMatch {
  item: number
  from: number
  to: number
}

const fold = (text: string): string => text.toLocaleLowerCase("nb")

/**
 * Every place `query` stands in `texts`, in reading order, without regard to case (and only where folding the case keeps the length, so
 * the places are those in the text as written). Leading and trailing space in the query is ignored; an empty query matches nothing.
 */
export function findMatches(texts: readonly string[], query: string): TranscriptMatch[] {
  const needle = fold(query.trim())
  if (needle === "") return []
  const matches: TranscriptMatch[] = []
  for (const [item, text] of texts.entries()) {
    const haystack = fold(text)
    if (haystack.length !== text.length) continue
    let at = haystack.indexOf(needle)
    while (at >= 0) {
      matches.push({ item, from: at, to: at + needle.length })
      at = haystack.indexOf(needle, at + needle.length)
    }
  }
  return matches
}

/** A text cut at its matches: the parts in order, each match with its number among all the matches of the search. */
export type TextPart = { text: string; match?: number }

/** `text` (the `item`th) cut into its plain parts and its matches from `matches` (`findMatches`), numbered as in that list. */
export function markParts(text: string, item: number, matches: readonly TranscriptMatch[]): TextPart[] {
  const parts: TextPart[] = []
  let at = 0
  for (const [number, match] of matches.entries()) {
    if (match.item !== item) continue
    if (match.from > at) parts.push({ text: text.slice(at, match.from) })
    parts.push({ text: text.slice(match.from, match.to), match: number })
    at = match.to
  }
  if (at < text.length || parts.length === 0) parts.push({ text: text.slice(at) })
  return parts
}

/** A transcript without times, as paragraphs: split at blank lines, each paragraph's lines joined by a space. */
export function paragraphsOf(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/g, " ").trim())
    .filter((paragraph) => paragraph !== "")
}

/** How many matches, in words: «Ingen treff», «1 treff», «Treff 2 av 5». */
export function matchWords(count: number, current: number): string {
  if (count === 0) return "Ingen treff"
  if (current < 0) return `${count} treff`
  return `Treff ${current + 1} av ${count}`
}
