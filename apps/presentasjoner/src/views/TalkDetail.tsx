import { DetailLayout, type DetailFact } from '@lmfaole/designsystem/components/detail-layout'
import { LinkButton } from '@lmfaole/designsystem/components/link-button'
import { formatDuration } from '@lmfaole/designsystem/lib/timeline'
import type { ReactNode } from 'react'

import { formatDate, splitSlides, type Deck } from '../lib/deck'

/** The facts of a talk, term by term: where and when it is held, how long it is, and its slides. */
export function talkFacts(deck: Deck): DetailFact[] {
  const { shown, reserve } = splitSlides(deck.slides)
  return [
    ['Arrangement', deck.event ?? ''],
    ['Dato', deck.date === undefined ? '' : formatDate(deck.date)],
    ['Varighet', deck.duration === undefined ? '' : formatDuration(deck.duration * 60_000)],
    ['Slides', String(shown.length)],
    ['Reserveslides', reserve.length === 0 ? '' : String(reserve.length)],
  ]
}

/** The body of a talk's page: the outline (`children`), and beside it the download of the PDF and the facts. */
export function TalkDetail({ deck, pdf, children }: { deck: Deck; /** The PDF's address. */ pdf: string; children: ReactNode }) {
  return (
    <DetailLayout
      actions={
        <LinkButton href={pdf} icon="download">
          Last ned presentasjonen (PDF)
        </LinkButton>
      }
      facts={talkFacts(deck)}
    >
      {children}
    </DetailLayout>
  )
}
