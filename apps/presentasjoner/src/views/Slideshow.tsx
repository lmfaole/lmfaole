import { Markdown } from '@lmfaole/designsystem/components/markdown'
import { Inline, Stack } from '@lmfaole/designsystem/components/layout'
import { Text, TextLink } from '@lmfaole/designsystem/components/text'
import { renderToStaticMarkup } from 'react-dom/server'

import { slidePictureFiles } from '../lib/content'
import { boxText, isCredit, notesMarkdown, slideTitle, splitSlides, type Slide, type Talk } from '../lib/deck'
import type { ShowSlide } from '../lib/slideshow'
import { SlideText } from './SlideItem'
import { charts } from './TalkDocument'

/** The slide as it is shown: its text, its pictures in full with their alt text, its charts and credits, its videos in words and its links. The title is the slide's heading in the file (`slideshowDocument`). */
function SlideBody({ slug, slide }: { slug: string; slide: Slide }) {
  const boxes = slide.textboxes ?? []
  const texts = [...Object.values(slide.text ?? {}), ...boxes.filter((box) => !isCredit(box))].filter((paragraphs) => boxText(paragraphs) !== '')
  const links = slide.links ?? []
  return (
    <Stack>
      {texts.map((paragraphs, index) => (
        <SlideText key={index} paragraphs={paragraphs} />
      ))}
      {charts(slide)}
      {slidePictureFiles(slug, slide).map((picture) => (
        <img key={picture.src} src={picture.src} alt={picture.alt} />
      ))}
      {boxes.filter(isCredit).map((box, index) => (
        <Text key={index} role="note">
          {boxText(box)}
        </Text>
      ))}
      {(slide.media ?? []).map((media) => (
        <Text key={media.file} role="quiet">{`${media.kind === 'video' ? 'Video' : 'Lyd'}: ${media.alt}`}</Text>
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
}

/** The talk's slides for the slideshow: those shown in the talk, then the reserve ones, each as markup from the page's own components. */
export function showSlides({ slug, deck }: Talk): ShowSlide[] {
  const { shown, reserve } = splitSlides(deck.slides)
  const make = (slide: Slide, isReserve: boolean): ShowSlide => ({
    n: slide.n,
    title: slideTitle(slide),
    reserve: isReserve,
    body: renderToStaticMarkup(<SlideBody slug={slug} slide={slide} />),
    notes: slide.notes === undefined || notesMarkdown(slide.notes) === '' ? '' : renderToStaticMarkup(<Markdown source={notesMarkdown(slide.notes)} size="sm" from="h4" />),
  })
  return [...shown.map((slide) => make(slide, false)), ...reserve.map((slide) => make(slide, true))]
}
