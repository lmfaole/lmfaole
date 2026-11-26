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

/** A chart on the slide, as the .pptx has it: its type there, its categories and one series per row, with one value per category. */
export interface SlideChart {
  kind: string
  title?: string
  categories: readonly string[]
  series: readonly { name: string; values: readonly number[] }[]
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
  charts?: readonly SlideChart[]
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
  const lines = notes
    .replace(/\r\n?/g, '\n')
    .replace(/^\s*\[[^\]\n]*\]\s*\n/, '')
    .split('\n')
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

/**
 * The three ways a talk can be downloaded, by the ending of the file: what to call it on screen, and what it is sent as. `pdf` and `pptx`
 * are in the bucket (`scripts/export.sh` puts them there); `html` is made as the answer is written.
 */
export const DOWNLOADS = {
  pdf: { label: 'Last ned PDF', type: 'application/pdf' },
  pptx: { label: 'Last ned PowerPoint', type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
  html: { label: 'Last ned HTML', type: 'text/html; charset=utf-8' },
} as const

export type DownloadFormat = keyof typeof DOWNLOADS

/** A talk's file name in one of the formats: the .pptx's name, with that ending. */
export const deckFileName = (deck: Pick<Deck, 'file'>, format: DownloadFormat): string => `${deck.file.replace(/\.pptx$/i, '')}.${format}`

/** Each download of a talk: what to call it, and where it is (`/<slug>/<file>`, under `base`). */
export const talkDownloads = (deck: Pick<Deck, 'file'>, here: string): { label: string; href: string }[] =>
  Object.entries(DOWNLOADS).map(([format, { label }]) => ({ label, href: `${here}${deckFileName(deck, format as DownloadFormat)}` }))

/** What asks for the talk as a slideshow in the browser instead of the file to keep: `<file>.html?vis`. */
export const SHOW = 'vis'

/** Where a talk can be watched as a slideshow without keeping anything, and what to call that. */
export const talkView = (deck: Pick<Deck, 'file'>, here: string): { label: string; href: string } => ({
  label: 'Se som slideshow',
  href: `${here}${deckFileName(deck, 'html')}?${SHOW}`,
})

/**
 * The key of a talk's file (`<slug>/<file>.<format>`), for the address `/<slug>/<file>.<format>`: only a talk that is in `content/` and its
 * own file name in the format the endpoint serves, so no other key of the bucket, and no other format, can be asked for. `null` for
 * anything else. The format is the endpoint's own, never read off the address, so each endpoint hands out only what it is for.
 */
export function fileKey(talks: readonly Talk[], slug: string | undefined, file: string | undefined, format: DownloadFormat): string | null {
  const talk = talks.find((one) => one.slug === slug)
  if (talk === undefined || file === undefined) return null
  const name = deckFileName(talk.deck, format)
  return `${file}.${format}` === name ? `${talk.slug}/${name}` : null
}

/** What is done with a file: saved under its name, or shown by the browser as the answer to the address. */
export type Disposition = 'attachment' | 'inline'

/** A file under its own name, kept for an hour. A name that is not ASCII is sent both ways round, as RFC 6266 has it. */
function headers(file: string, format: DownloadFormat, more: Record<string, string>, disposition: Disposition = 'attachment'): Headers {
  const ascii = file.replace(/[^\x20-\x7e]|["\\]/g, '_')
  return new Headers({
    'Content-Type': DOWNLOADS[format].type,
    'Content-Disposition': `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file)}`,
    'Cache-Control': 'public, max-age=3600',
    ...more,
  })
}

/** The headers of a file from the bucket: its size and its ETag are the bucket's. */
export const downloadHeaders = (file: string, format: DownloadFormat, object: { httpEtag: string; size: number }): Headers =>
  headers(file, format, { 'Content-Length': String(object.size), ETag: object.httpEtag })

/**
 * The headers of a file made as the answer is written: no ETag, since nothing has one to compare with, and the length is the bytes of the
 * text, not its characters — one «ø» is two bytes, and a wrong `Content-Length` cuts the file off.
 */
export const textHeaders = (file: string, format: DownloadFormat, body: string, disposition?: Disposition): Headers =>
  headers(file, format, { 'Content-Length': String(new TextEncoder().encode(body).byteLength) }, disposition)
