import { LiveRegion } from "@lmfaole/designsystem/components/live-region"
import { useEffect, useState } from "react"

import { cloudflareImages } from "../lib/cloudflare-images.ts"
import { transformImages } from "../lib/image-sources.ts"
import { type Playing, parsePlaying, samePlaying } from "../lib/now.ts"
import { NowPlayingSection } from "./sections.tsx"

/** How often the front page asks what plays, in milliseconds: as often as the Worker keeps its answer, so a song is on the page within a few seconds of its start. */
const EVERY = 15_000
/** How many answers in a row must say nothing plays before the card goes: a gap between two songs is not an end. */
const MISSES = 2

/**
 * What plays now, and it keeps up: the card is asked for again every fifteen seconds while the page is open and visible (nothing is asked while the tab is hidden, and it asks at once when it is back),
 * and a new song changes it: the card is given the new song (not made again), so the disc takes the new cover and the colours of its stage go over to the cover's in one move. The region is on the page before anything plays, so a screen reader is told when a song starts or changes, politely (WCAG 4.1.3). An island: `client:load`.
 */
export function NowPlayingLive({ initial, endpoint, transforms }: { initial: Playing | null; endpoint: string; /** `IMAGE_TRANSFORMS`, as the server drew the card: the island draws its covers the same way. */ transforms: boolean }) {
  transformImages(cloudflareImages(transforms))
  const [now, setNow] = useState<Playing | null>(initial)

  useEffect(() => {
    let timer = 0
    let misses = 0
    let alive = true
    const ask = async () => {
      try {
        const response = await fetch(endpoint, { headers: { Accept: "application/json" } })
        if (!response.ok || !alive) return
        const next = parsePlaying(await response.json())
        if (next !== null) {
          misses = 0
          setNow((before) => (samePlaying(before, next) ? before : next))
        } else {
          misses += 1
          if (misses >= MISSES) setNow(null)
        }
      } catch {
        // Offline or a hiccup: the card stays as it was, and the next ask tries again.
      }
    }
    const schedule = () => {
      window.clearTimeout(timer)
      if (document.hidden || !alive) return
      timer = window.setTimeout(async () => {
        await ask()
        schedule()
      }, EVERY)
    }
    const visibility = () => {
      if (document.hidden) window.clearTimeout(timer)
      else {
        void ask()
        schedule()
      }
    }
    schedule()
    document.addEventListener("visibilitychange", visibility)
    return () => {
      alive = false
      window.clearTimeout(timer)
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [endpoint])

  return <LiveRegion>{now === null ? null : <NowPlayingSection now={now} />}</LiveRegion>
}
