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

/**
 * The body of a talk's page: the outline (`children`), and beside it the downloads and the facts. The three are equal ways to the same
 * talk, so each is the same quiet `LinkButton`, and the labels are short: the rail is 16–20rem wide and they stand under each other in it.
 * Reading the same file here rather than keeping it is the last of them, and the only one that is not a download: its icon says so.
 */
export function TalkDetail({
  deck,
  downloads,
  view,
  children,
}: {
  deck: Deck
  /** Each format, as `talkDownloads` has it. */ downloads: readonly { label: string; href: string }[]
  /** The same HTML, read in the browser, as `talkView` has it. */ view: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <DetailLayout
      actions={[
        ...downloads.map(({ label, href }) => (
          <LinkButton key={href} href={href} icon="download">
            {label}
          </LinkButton>
        )),
        <LinkButton key={view.href} href={view.href} icon="view">
          {view.label}
        </LinkButton>,
      ]}
      facts={talkFacts(deck)}
    >
      {children}
    </DetailLayout>
  )
}
