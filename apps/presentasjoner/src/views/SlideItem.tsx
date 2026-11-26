import { Disclosure } from '@lmfaole/designsystem/components/disclosure'
import { Inline, Stack } from '@lmfaole/designsystem/components/layout'
import { Markdown } from '@lmfaole/designsystem/components/markdown'
import { Heading, Text, TextLink } from '@lmfaole/designsystem/components/text'
import type { ReactNode } from 'react'

import { boxText, isCredit, notesMarkdown, paragraphsMarkdown, plainText, slideTitle, type Paragraph, type Slide } from '../lib/deck'

/** A text of the slide: plain words where it is one paragraph, else a list nested as on the slide. */
function SlideText({ paragraphs }: { paragraphs: readonly Paragraph[] }) {
  const plain = plainText(paragraphs)
  return plain === null ? <Markdown source={paragraphsMarkdown(paragraphs)} /> : <Text>{plain}</Text>
}

/**
 * One slide of the outline: its number and title, when in the talk it comes, its text, its charts (`charts`) and its pictures (`gallery`),
 * both islands the page puts in, with their credits, its videos in words, its links and the speaker's notes. The notes are behind a
 * `Disclosure`, or (`notes="shown"`, for a slide that is already inside one) under a quiet label, since a disclosure is never nested.
 */
export function SlideItem({ slide, charts, gallery, notes = 'folded' }: { slide: Slide; charts?: ReactNode; gallery?: ReactNode; notes?: 'folded' | 'shown' }) {
  const boxes = slide.textboxes ?? []
  const texts = [...Object.values(slide.text ?? {}), ...boxes.filter((box) => !isCredit(box))].filter((paragraphs) => boxText(paragraphs) !== '')
  const credits = boxes.filter(isCredit)
  const links = slide.links ?? []
  const notesText = slide.notes === undefined ? '' : notesMarkdown(slide.notes)
  return (
    <Stack id={`slide-${slide.n}`}>
      <Stack gap="tight">
        <Heading level={3} look="section">{`${slide.n}. ${slideTitle(slide)}`}</Heading>
        {slide.time === undefined ? null : <Text role="quiet">{`Tidspunkt: ${slide.time}`}</Text>}
      </Stack>
      {texts.map((paragraphs, index) => (
        <SlideText key={index} paragraphs={paragraphs} />
      ))}
      {charts}
      {gallery}
      {credits.map((box, index) => (
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
      {notesText === '' ? null : notes === 'folded' ? (
        <Disclosure summary="Notater">
          <Markdown source={notesText} size="sm" from="h4" />
        </Disclosure>
      ) : (
        <Stack gap="tight">
          <Text role="quiet">Notater</Text>
          <Markdown source={notesText} size="sm" from="h4" />
        </Stack>
      )}
    </Stack>
  )
}
