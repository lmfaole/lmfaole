// The talks in `content/`, read when the site is built: each folder's `presentasjon.json`, and the pictures in its `bilder/` as the addresses
// Vite gives them (under the base, with a hash). The folder's name is the talk's address.
import type { MediaItem } from '@lmfaole/designsystem/components/media-gallery'
import { getImage } from 'astro:assets'

import { sortTalks, type Deck, type Slide, type Talk } from './deck'

const decks = import.meta.glob<Deck>('../../content/*/presentasjon.json', { eager: true, import: 'default' })
const pictures = import.meta.glob<ImageMetadata>('../../content/*/bilder/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG}', { eager: true, import: 'default' })

const slugOf = (path: string): string => path.split('/').at(-2) ?? path

/** Every talk, the newest first. */
export const TALKS: readonly Talk[] = sortTalks(Object.entries(decks).map(([path, deck]) => ({ slug: slugOf(path), deck })))

/** The widest a picture is sent: the originals (up to 1 MB each) are made into WebP of at most this width when the site is built. */
const WIDTH = 1280

/** A slide's pictures that show something (not the decorative ones), for a `MediaGallery`, named by their alt text. */
export async function slidePictures(slug: string, slide: Slide): Promise<MediaItem[]> {
  const items = await Promise.all(
    (slide.pictures ?? []).map(async (picture, index): Promise<MediaItem | null> => {
      const image = pictures[`../../content/${slug}/${picture.file}`]
      if (image === undefined || picture.decorative === true) return null
      const small = await getImage({ src: image, width: Math.min(WIDTH, image.width), format: 'webp' })
      return { kind: 'picture', key: `${slide.n}-${index}`, src: small.src, label: picture.alt }
    }),
  )
  return items.filter((item) => item !== null)
}

/** A slide's pictures that show something, as the files the build gives them (not made smaller: the slideshow is made as the answer is written, and the Worker has no image service), with their alt text. */
export function slidePictureFiles(slug: string, slide: Slide): { src: string; alt: string }[] {
  return (slide.pictures ?? []).flatMap((picture) => {
    const image = pictures[`../../content/${slug}/${picture.file}`]
    return image === undefined || picture.decorative === true ? [] : [{ src: image.src, alt: picture.alt }]
  })
}
