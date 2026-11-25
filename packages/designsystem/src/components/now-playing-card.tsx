import type { ReactNode } from "react"

import type { PictureSource } from "../lib/picture-sources"
import { LiveDot } from "./live-dot"
import { PictureFrame } from "./internal/picture-frame"
import { Stage } from "./stage"
import { Text } from "./text"
import { TiltButton } from "./tilt-button"
import { HEAD_TITLE } from "../lib/long-titles"

/**
 * What plays now, large: the record as a disc that turns slowly under the page's light (`Picture disc`, drawn in WebGL, a tap pauses it), on a stage of the cover's own colours (`Stage`), the words «Spilles nå»
 * with the pulsing dot, the title and a line under it. The disc is lit by the pointer and, on a phone, by how it is held (`LightSource` is in the disc; the `TiltButton` here lets an iPhone switch it on, once).
 * When the song changes (the card is given another picture), the colours of the stage go over to the new cover's and settle, and the disc takes the new cover. Put it first on the page, once: it is the one
 * thing that moves. Text on the stage is the full text colour, never muted.
 */
export function NowPlayingCard({ picture, sources, title, detail, disc = true }: { /** The cover. */ picture?: string | null; sources?: readonly PictureSource[]; /** What plays: the song's name. */ title: string; /** Under the title: by whom, from which album. */ detail?: ReactNode; /** A disc (the default), or the cover as it is, sharp and still: for a cover that may not be cropped or have anything on it (Spotify's). */ disc?: boolean }) {
  return (
    <Stage picture={picture ?? null} {...(sources === undefined ? {} : { sources })}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 @3xl:gap-x-8">
        <PictureFrame ratio="square" size="hero" {...(disc ? { disc: true } : { corners: "sharp" as const })} src={picture ?? null} {...(sources === undefined ? {} : { sources })} />
        <div className="grid min-w-0 gap-1 [overflow-wrap:anywhere]">
          <div className="flex items-center gap-1">
            <LiveDot />
            <span className="text-sm font-medium">
              Spilles nå
            </span>
          </div>
          <p className={`${HEAD_TITLE} text-lg font-medium`}>
            {title}
          </p>
          {detail === undefined ? null : <Text role="quiet">{detail}</Text>}
          <TiltButton />
        </div>
      </div>
    </Stage>
  )
}
