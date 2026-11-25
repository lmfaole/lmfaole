import { fallbackOf, srcSetOf, type PictureSource } from '../../lib/picture-sources'
import { Disc } from '../disc'
import { LightSource } from '../light-source'
import { CORNERS, DRAWN, FRAMES, LIT_SIZES, type PictureCorners, type Ratio, SIZES, type Size } from '../../lib/picture-frames'
import { cn } from '../../lib/utils'

export { type PictureCorners, type Ratio as PictureRatio } from '../../lib/picture-frames'

/**
 * The frame's ratio and size together. A wide picture (a game's banner) is only ever in front of a row or a tile of a gallery: never
 * the hero of a page, which is a poster's or a square's.
 */
type PictureFrame = { ratio?: Exclude<Ratio, 'wide'>; size?: Size } | { ratio: 'wide'; size?: 'row' | 'fill' }

/**
 * INTERNAL: the frame a picture is drawn in, by ratio, size and corners. Apps draw a picture with `Picture` (`kind` and `context`) or through
 * the component that holds it (`List`, `Tiles`, `DetailHeader`); the components of this package that need a size or a shape `Picture` does
 * not give (a sleeve's `fill`, a disc, the large `feature`) draw this.
 *
 * The picture of one thing in a frame of its own. The frame is always there, so the rows of a list stay level when there is
 * no picture or it fails to load: it is then just not drawn in it, with no script to find out. Decorative: the name beside it
 * says what it is. `src` is the address as the browser asks for it; resolving it (a base path, a CDN) is the project's.
 */
export function PictureFrame({ src, sources, priority = false, ratio = 'poster', size = 'row', corners = 'normal', disc = false }: PictureFrame & {
  src: string | null | undefined
  /** The same picture in the widths its source offers: the browser takes the smallest that is sharp here (`srcset`), not the largest. */
  sources?: readonly PictureSource[]
  /** The one picture that is the page's largest thing on load (the hero of a detail page): fetched at once and first, never lazily. */
  priority?: boolean
  /** What kind of thing it is, as a shape (see `PictureCorners`). */
  corners?: PictureCorners
  /** A record playing now: round with a hole in the middle, and drawn in WebGL, it turns slowly for as long as it plays (12 s a turn) under the page's one light (`LightSource`), and a tap pauses it; in CSS where WebGL is not there; still under reduced motion. Needs `ratio="square"`; always with the words «playing now» beside it. */
  disc?: boolean
}) {
  const [width, height] = SIZES[ratio][size]
  const drawn = DRAWN[ratio][size]
  const set = srcSetOf(sources, drawn)
  const shown = src ?? (sources === undefined ? undefined : fallbackOf(sources, drawn)?.src)
  const shape = corners === 'round' && ratio !== 'square' ? 'soft' : corners
  const lit = LIT_SIZES.includes(size)
  if (disc && ratio === 'square') return <Disc src={src} {...(sources === undefined ? {} : { sources })} size={size} />
  const frame = (
    <div aria-hidden="true" className={cn('shrink-0 overflow-hidden bg-muted', CORNERS[shape], FRAMES[ratio][size], lit && 'lit-frame')}>
      {shown ? (
        <img
          src={shown}
          {...(set === null ? {} : { srcSet: set.srcSet, sizes: set.sizes })}
          alt=""
          loading={priority ? 'eager' : 'lazy'}
          {...(priority ? { fetchPriority: 'high' as const } : {})}
          decoding="async"
          width={width}
          height={height}
          className={cn('size-full object-cover', shape === 'round' && 'object-top')}
        />
      ) : null}
    </div>
  )
  // The page's main picture is lit, and carries the light's source with it: a page needs nothing of its own for the light to follow the pointer.
  return lit ? (
    <>
      {frame}
      <LightSource />
    </>
  ) : (
    frame
  )
}
