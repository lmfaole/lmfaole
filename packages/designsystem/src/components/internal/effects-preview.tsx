"use client"

import { useEffect, useRef, useState } from "react"

import { sampleCover } from "../../lib/sample-cover"
import { AlbumSleeve } from "../album-sleeve"
import { Stage } from "../stage"

type Choice = "on" | "off"

/** The cover on its stage, as the effects `choice` draws it; the live one waits for `visible`. */
function Sample({ choice, cover, visible }: { choice: Choice; cover: string | null; visible: boolean }) {
  const waiting = cover === null || (choice === "on" && !visible)
  return (
    <div data-effects={choice} aria-hidden="true" className="@container">
      <Stage picture={waiting ? null : cover}>
        <div className="flex justify-center">{waiting ? <div className="bg-muted aspect-[146/100] h-28 rounded-sm sm:h-32" /> : <AlbumSleeve key={cover} src={cover} />}</div>
      </Stage>
    </div>
  )
}

/**
 * INTERNAL (`EffectsChoice`, `AppearanceSettings`): the effects (WebGL) as a picture to choose by, one sample for an option's `preview`. `mode="on"` is the same `Stage` and `AlbumSleeve` live, drawn only once
 * it is on the screen and even where the page has the effects off, since it is a preview; `mode="off"` is what a visitor who turns them off gets, flat and still (`data-effects="off"`). Under
 * `prefers-reduced-motion` the live one stands still too, and says so. The cover is a made-up one, drawn in the theme's colours.
 */
export function EffectsPreview({ mode }: { mode: Choice }) {
  const root = useRef<HTMLDivElement>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const element = root.current
    if (element === null) return
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    setCover(sampleCover(element))
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={root} className="relative">
      <Sample choice={mode} cover={cover} visible={visible} />
      {mode === "on" && still ? <span className="bg-background/80 text-muted-foreground absolute start-2 bottom-2 rounded-sm px-1.5 py-0.5 text-xs font-medium">Står stille: enheten ber om mindre bevegelse</span> : null}
    </div>
  )
}
