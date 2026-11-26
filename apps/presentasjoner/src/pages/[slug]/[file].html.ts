// `/presentasjoner/<slug>/<file>.html`: the talk as one file to keep, or to read here with `?vis`, made as the answer is written. The markup is the page's own
// components (`views/TalkDocument.tsx`) and the stylesheet is the site's own, compiled by Vite and put inline (`?inline`), so the file is
// the page and not a second telling of it. Nothing is in the bucket for this one, and only a talk in `content/` can be asked for.
import css from '@lmfaole/web/styles.css?inline'
import type { APIRoute } from 'astro'

import { TALKS } from '../../lib/content'
import { deckFileName, SHOW, textHeaders } from '../../lib/deck'
import { htmlDocument } from '../../lib/html'
import { talkMarkup } from '../../views/TalkDocument'

export const prerender = false

const answer =
  (head: boolean): APIRoute =>
  async ({ params, rewrite, url }) => {
    const talk = TALKS.find((one) => one.slug === params.slug)
    if (talk === undefined || `${params.file}.html` !== deckFileName(talk.deck, 'html')) return rewrite(`${import.meta.env.BASE_URL}404/`)
    const file = htmlDocument({ title: `${talk.deck.title} – Presentasjoner`, description: talk.deck.summary, css, body: talkMarkup(talk) })
    // `?vis` reads it here instead of keeping it: the same file, shown by the browser rather than saved (`talkView`).
    const headers = textHeaders(deckFileName(talk.deck, 'html'), 'html', file, url.searchParams.has(SHOW) ? 'inline' : 'attachment')
    return new Response(head ? null : file, { headers })
  }

export const GET = answer(false)
export const HEAD = answer(true)
