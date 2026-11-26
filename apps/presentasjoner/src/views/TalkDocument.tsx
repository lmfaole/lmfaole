import { DetailLayout } from '@lmfaole/designsystem/components/detail-layout'
import { PageHeader } from '@lmfaole/designsystem/components/page-header'
import { PageLayout } from '@lmfaole/designsystem/components/page-layout'
import { PageSection } from '@lmfaole/designsystem/components/page-section'
import { Text } from '@lmfaole/designsystem/components/text'
import { renderToStaticMarkup } from 'react-dom/server'

import { slideCharts } from '../lib/chart'
import { splitSlides, type Slide, type Talk } from '../lib/deck'
import { SlideCharts } from './SlideCharts'
import { SlideItem } from './SlideItem'
import { talkFacts } from './TalkDetail'

/** The slide's charts, drawn where they stand and read as they are: the file has no script, so there is nothing to hydrate them with. */
export const charts = (slide: Slide) => {
  const plans = slideCharts(slide)
  return plans.length === 0 ? undefined : <SlideCharts plans={plans} />
}

/**
 * A talk as the file `<name>.html` has it: the same components the page is built from, so it reads as the page does. It stands apart from
 * `pages/[slug]/index.astro` because the page's pictures are an island (`MediaGallery client:visible`), which only Astro can put in; here
 * they are the alt text `SlideItem` gives them, like the videos. The downloads themselves are left out: the file is one of them.
 */
function TalkDocument({ talk: { deck } }: { talk: Talk }) {
  const { shown, reserve } = splitSlides(deck.slides)
  return (
    <PageLayout width="pane">
      <PageHeader title={deck.title} description={deck.summary} />
      <DetailLayout facts={talkFacts(deck)}>
        <PageSection id="innhold" title="Innhold" icon="chapters">
          {shown.map((slide) => (
            <SlideItem key={slide.n} slide={slide} charts={charts(slide)} />
          ))}
        </PageSection>
        {reserve.length === 0 ? null : (
          <PageSection id="reserveslides" title="Reserveslides" icon="hidden">
            <Text role="quiet">Slides som er skjult i presentasjonen og bare tas fram ved behov, for eksempel ved spørsmål.</Text>
            {reserve.map((slide) => (
              <SlideItem key={slide.n} slide={slide} charts={charts(slide)} />
            ))}
          </PageSection>
        )}
      </DetailLayout>
    </PageLayout>
  )
}

/** The talk's markup for the file, with no script and nothing to hydrate: it is read as it is sent. */
export const talkMarkup = (talk: Talk): string => renderToStaticMarkup(<TalkDocument talk={talk} />)
