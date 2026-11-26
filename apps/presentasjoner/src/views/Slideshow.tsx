import { Markdown } from '@lmfaole/designsystem/components/markdown'
import { Inline, Stack } from '@lmfaole/designsystem/components/layout'
import { Text, TextLink } from '@lmfaole/designsystem/components/text'
import { renderToStaticMarkup } from 'react-dom/server'

import { slidePictureFiles } from '../lib/content'
import { boxText, isCredit, notesMarkdown, slideTitle, splitSlides, type Slide, type Talk } from '../lib/deck'
import type { ShowLayout, ShowSlide } from '../lib/slideshow'
import { SlideText } from './SlideItem'
import { charts } from './TalkDocument'

/** The fixed layout a slide has in the show, from the name of its layout in the .pptx: the same arrangements as there, in the same places. */
export function showLayout(slide: Slide): ShowLayout {
  const name = slide.layout.toLowerCase()
  if (name.startsWith('forside')) return 'cover'
  if (name.startsWith('siste side')) return 'closing'
  if (name.startsWith('skilleark')) return name.includes('beige') ? 'section-light' : 'section-dark'
  if (name.startsWith('bilde i kant')) return 'picture-edge'
  if (name.startsWith('bilde')) return name.includes('(høyre)') ? 'picture-right' : 'picture-left'
  return 'content'
}

const paragraphsOf = (slide: Slide, placeholder: string) => (slide.text ?? {})[placeholder] ?? []

/** The slide as it is shown, in the parts its layout has places for: a kicker over the title, the text, the figures (charts and pictures) beside it, and the foot with the source and the credits. */
function slideParts({ slug, slide }: { slug: string; slide: Slide }, layout: ShowLayout): Pick<ShowSlide, 'kicker' | 'body' | 'side' | 'foot'> {
  const boxes = slide.textboxes ?? []
  const cover = layout === 'cover' || layout === 'closing'
  // The Fremtind layouts keep the kicker in placeholder 28, the body in 25 or 26, the source in 27 and the lines of the cover in 14 and 20.
  const kicker = boxText(paragraphsOf(slide, '28'))
  const bodyTexts = cover
    ? [paragraphsOf(slide, '14'), paragraphsOf(slide, '20')]
    : [paragraphsOf(slide, '25'), paragraphsOf(slide, '26'), ...boxes.filter((box) => !isCredit(box))]
  const foot = [paragraphsOf(slide, '27'), ...boxes.filter(isCredit)].filter((paragraphs) => boxText(paragraphs) !== '')
  const links = slide.links ?? []
  const pictures = slidePictureFiles(slug, slide)
  const chartElement = charts(slide)
  const figures = [
    ...(chartElement === undefined ? [] : [<div key="charts">{chartElement}</div>]),
    ...pictures.map((picture) => <img key={picture.src} src={picture.src} alt={picture.alt} />),
  ]
  const media = slide.media ?? []
  const body = (
    <Stack>
      {bodyTexts
        .filter((paragraphs) => boxText(paragraphs) !== '')
        .map((paragraphs, index) => (
          <SlideText key={index} paragraphs={paragraphs} />
        ))}
      {media.map((item) => (
        <Text key={item.file} role="quiet">{`${item.kind === 'video' ? 'Video' : 'Lyd'}: ${item.alt}`}</Text>
      ))}
      {links.length === 0 ? null : (
        <Inline
          label={`Lenker på slide ${slide.n}`}
          items={links.map((link) => (
            <TextLink key={link.url} href={link.url} external>
              {link.text}
            </TextLink>
          ))}
        />
      )}
    </Stack>
  )
  const empty = bodyTexts.every((paragraphs) => boxText(paragraphs) === '') && media.length === 0 && links.length === 0
  return {
    kicker,
    body: empty ? '' : renderToStaticMarkup(body),
    side: figures.length === 0 ? '' : renderToStaticMarkup(<Stack>{figures}</Stack>),
    foot: foot.length === 0 ? '' : renderToStaticMarkup(<Stack gap="tight">{foot.map((paragraphs, index) => <Text key={index} role="note">{boxText(paragraphs)}</Text>)}</Stack>),
  }
}

/** The talk's slides for the slideshow: those shown in the talk, then the reserve ones, each as markup from the page's own components. */
export function showSlides({ slug, deck }: Talk): ShowSlide[] {
  const { shown, reserve } = splitSlides(deck.slides)
  const make = (slide: Slide, isReserve: boolean): ShowSlide => ({
    n: slide.n,
    title: slideTitle(slide),
    reserve: isReserve,
    layout: showLayout(slide),
    ...slideParts({ slug, slide }, showLayout(slide)),
    notes: slide.notes === undefined || notesMarkdown(slide.notes) === '' ? '' : renderToStaticMarkup(<Markdown source={notesMarkdown(slide.notes)} size="sm" from="h4" />),
  })
  return [...shown.map((slide) => make(slide, false)), ...reserve.map((slide) => make(slide, true))]
}
