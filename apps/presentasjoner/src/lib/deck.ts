/**
 * A talk as `content/<slug>/presentasjon.json` has it (`presentasjon.schema.json`, made by `scripts/pptx_to_json.py`), and the pure
 * functions the pages draw it with. Nothing here reads a file or the runtime, so `deck.test.ts` runs it as it is.
 */

/** One paragraph of a text: the words, or the words and how far in they are (0 is the outermost). */
export type Paragraph = string | readonly [string, number]

export interface SlidePicture {
  file: string
  placeholder?: number
  alt: string
  decorative?: boolean
}

export interface SlideMedia {
  kind: string
  name: string
  file: string
  alt: string
}

export interface SlideLink {
  text: string
  url: string
}

export interface Slide {
  n: number
  layout: string
  hidden?: boolean
  title: string | null
  time?: string
  /** The placeholders' text, by the placeholder's number. */
  text?: Readonly<Record<string, readonly Paragraph[]>>
  textboxes?: readonly (readonly Paragraph[])[]
  pictures?: readonly SlidePicture[]
  media?: readonly SlideMedia[]
  links?: readonly SlideLink[]
  notes?: string
}

export interface Deck {
  title: string
  file: string
  aspect: string
  summary?: string
  event?: string
  /** The day it is held, `2026-11-27`. */
  date?: string
  /** Minutes. */
  duration?: number
  slides: readonly Slide[]
}

/** A talk: its folder's name (the address) and its content. */
export interface Talk {
  slug: string
  deck: Deck
}

/** The slide's title, or the name of its layout where it has none («Siste side»). */
export const slideTitle = (slide: Slide): string => slide.title ?? slide.layout

/** The slides shown in the talk, and the hidden ones kept in reserve. */
export function splitSlides(slides: readonly Slide[]): { shown: Slide[]; reserve: Slide[] } {
  return { shown: slides.filter((slide) => slide.hidden !== true), reserve: slides.filter((slide) => slide.hidden === true) }
}

const textOf = (paragraph: Paragraph): string => (typeof paragraph === 'string' ? paragraph : paragraph[0])
const levelOf = (paragraph: Paragraph): number => (typeof paragraph === 'string' ? 0 : paragraph[1])

/** Text written by someone else, safe in Markdown: every ASCII punctuation mark is escaped, so it is read as the words it is. */
export const escapeMarkdown = (text: string): string => text.replace(/[!-/:-@[-`{-~]/g, (mark) => `\\${mark}`)

/**
 * A text's paragraphs as one Markdown list, nested by their levels. A level is never more than one deeper than the one before it
 * (a jump from 0 to 2 is read as 1), so the list is always well formed. Empty paragraphs are left out.
 */
export function paragraphsMarkdown(paragraphs: readonly Paragraph[]): string {
  const lines: string[] = []
  let depth = -1
  for (const paragraph of paragraphs) {
    const text = textOf(paragraph).trim()
    if (text === '') continue
    depth = Math.min(Math.max(levelOf(paragraph), 0), depth + 1)
    lines.push(`${'  '.repeat(depth)}- ${escapeMarkdown(text)}`)
  }
  return lines.join('\n')
}

/** A text of one paragraph at the outermost level is plain words; any other is a list (`paragraphsMarkdown`). */
export function plainText(paragraphs: readonly Paragraph[]): string | null {
  const filled = paragraphs.filter((paragraph) => textOf(paragraph).trim() !== '')
  const only = filled[0]
  return filled.length === 1 && only !== undefined && levelOf(only) === 0 ? textOf(only).trim() : null
}

/** The texts of a text box, joined, as one line. */
export const boxText = (paragraphs: readonly Paragraph[]): string =>
  paragraphs
    .map((paragraph) => textOf(paragraph).trim())
    .filter((text) => text !== '')
    .join(' ')

/** A text box that credits a picture («Foto: …»): shown with the pictures, not as the slide's text. */
export const isCredit = (paragraphs: readonly Paragraph[]): boolean => /^(foto|bilde|illustrasjon|video|grafikk)\s*:/i.test(boxText(paragraphs))

/**
 * The speaker's notes as Markdown: the time the notes start with («[0:40–1:10]», the slide has it already) is left out, a line «- …»
 * is a point of a list, and a line that starts with a word in capitals and a colon («HOVEDPOENG: …») has that word in bold.
 */
export function notesMarkdown(notes: string): string {
  const lines = notes.replace(/\r\n?/g, '\n').replace(/^\s*\[[^\]\n]*\]\s*\n/, '').split('\n')
  const blocks: string[] = []
  let list: string[] = []
  const flush = (): void => {
    if (list.length > 0) blocks.push(list.join('\n'))
    list = []
  }
  for (const raw of lines) {
    const line = raw.trim()
    if (line === '') {
      flush()
      continue
    }
    const point = /^[-•–]\s+(.*)$/.exec(line)
    if (point !== null) {
      list.push(`- ${escapeMarkdown(point[1] ?? '')}`)
      continue
    }
    flush()
    const label = /^([A-ZÆØÅ][A-ZÆØÅ ]*[A-ZÆØÅ]):\s*(.*)$/.exec(line)
    blocks.push(label === null ? escapeMarkdown(line) : `**${escapeMarkdown(label[1] ?? '')}:** ${escapeMarkdown(label[2] ?? '')}`)
  }
  flush()
  return blocks.join('\n\n')
}

const DAY = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Oslo' })

/** «27. november 2026», for the day `2026-11-27`. The day is read at noon in UTC, so it is the same day in Oslo. */
export const formatDate = (date: string): string => DAY.format(new Date(`${date}T12:00:00Z`))

/** «21 slides», «1 slide». */
export const slideCount = (count: number): string => `${count} ${count === 1 ? 'slide' : 'slides'}`

/** The talks, the newest first; one without a day last, and by title where they are as new. */
export function sortTalks(talks: readonly Talk[]): Talk[] {
  return talks.toSorted((one, other) => (other.deck.date ?? '').localeCompare(one.deck.date ?? '') || one.deck.title.localeCompare(other.deck.title, 'nb'))
}

/** The PDF's file name: the .pptx's, as PDF. */
export const pdfName = (deck: Pick<Deck, 'file'>): string => deck.file.replace(/\.pptx$/i, '.pdf')

/**
 * The R2 key of a talk's PDF (`<slug>/<file>.pdf`), for the address `/<slug>/<file>.pdf`: only a talk that is in `content/` and its own
 * file name, so no other key of the bucket can be asked for. `null` for anything else.
 */
export function pdfKey(talks: readonly Talk[], slug: string | undefined, file: string | undefined): string | null {
  const talk = talks.find((one) => one.slug === slug)
  if (talk === undefined || file === undefined || pdfName(talk.deck) !== file) return null
  return `${talk.slug}/${file}`
}

/** The headers of a PDF from the bucket: a download under its own name, kept for an hour, with its ETag. */
export function pdfHeaders(file: string, object: { httpEtag: string; size: number }): Headers {
  const ascii = file.replace(/[^\x20-\x7e]|["\\]/g, '_')
  return new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file)}`,
    'Content-Length': String(object.size),
    ETag: object.httpEtag,
    'Cache-Control': 'public, max-age=3600',
  })
}
