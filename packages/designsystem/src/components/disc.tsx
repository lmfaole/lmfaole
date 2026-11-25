"use client"

import { useEffect, useRef, useState } from "react"

import { createDiscRenderer, type DiscRenderer } from "../lib/disc-shader"
import { effectsEnabled } from "../lib/effects"
import { acquireGlSlot } from "../lib/gl-budget"
import { loadCorsImage } from "../lib/cors-image"
import { FULL, measure, nextQuality, START, type Meter, type Quality } from "../lib/gl-quality"
import { coverTraits, NEUTRAL_TRAITS } from "../lib/palette"
import { lightStore } from "../lib/light"
import { acquireLightInput } from "../lib/light-input"
import { attachSpin } from "../lib/spin"
import { DRAWN, FRAMES, LIT_SIZES, type Size } from "../lib/picture-frames"
import { fallbackOf, srcSetOf, type PictureSource } from "../lib/picture-sources"
import { cn } from "../lib/utils"

/** What the cover is like (its hue, how vivid and how light), from a small copy of it: it shapes the reflections, so no two covers shine alike. Neutral where the copy may not be read. */
function traitsOf(image: HTMLImageElement) {
  try {
    const small = document.createElement("canvas")
    small.width = 16
    small.height = 16
    const context = small.getContext("2d", { willReadFrequently: true })
    if (context === null) return NEUTRAL_TRAITS
    context.drawImage(image, 0, 0, 16, 16)
    return coverTraits(context.getImageData(0, 0, 16, 16).data, 16)
  } catch {
    return NEUTRAL_TRAITS
  }
}

/** How long one turn takes, in milliseconds: the same as `--motion-duration-disc`. */
const TURN_MS = 12_000

/**
 * A record playing now. It is drawn in WebGL (the cover turns, the light does not: reflections follow the page's one light, `lib/light.ts`), and until that is ready, or where WebGL
 * is not there, in CSS (the cover turns under two bands of light that follow the same light). A tap stops the turning and starts it again: the one loop here that runs for more
 * than five seconds can be paused (WCAG 2.2.2). Under `prefers-reduced-motion` it does not turn and there is nothing to press. Decorative: say «playing now» in words beside it.
 * At the size of a row (2.5rem) its target reaches 0.125rem past its edge all round (2.75rem, a thumb's), into the room the row keeps around its picture; the disc looks the same.
 */
export function Disc({ src, sources, size = "row" }: { src: string | null | undefined; sources?: readonly PictureSource[]; size?: Size }) {
  const drawn = DRAWN.square[size]
  const set = srcSetOf(sources, drawn)
  const shown = src ?? (sources === undefined ? undefined : fallbackOf(sources, drawn)?.src)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [lit, setLit] = useState(false)
  const frame = useRef<HTMLElement | null>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const pausedNow = useRef(false)
  pausedNow.current = paused

  useEffect(() => acquireLightInput(), [])

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const change = () => setReduced(query.matches)
    query.addEventListener("change", change)
    return () => query.removeEventListener("change", change)
  }, [])

  useEffect(() => {
    const target = canvas.current
    // Read here, not from state: the state is set in an effect of its own, after this one has run once.
    // Effects off (`data-effects="off"`): the CSS disc, and no context.
    if (reduced || shown === undefined || target === null || !effectsEnabled(target) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const slot = acquireGlSlot()
    if (slot === null) return
    let renderer: DiscRenderer | null = null
    let loaded: { image: HTMLImageElement; traits: ReturnType<typeof traitsOf> } | null = null
    let raf = 0
    let last = 0
    let turn = 0
    let frames = 0
    let onScreen = true
    let cancelled = false
    let quality: Quality = FULL
    let meter: Meter = START
    const stop = () => {
      if (raf !== 0) cancelAnimationFrame(raf)
      raf = 0
    }
    const loop = (now: number) => {
      raf = 0
      if (renderer === null) return
      const elapsed = last === 0 ? 0 : Math.min(now - last, 100)
      // A machine that cannot keep up is asked for less: fewer pixels, then every other frame (`lib/gl-quality.ts`).
      const timed = measure(meter, last === 0 ? 0 : (now - last) / quality.every)
      meter = timed.meter
      if (timed.average !== null) quality = nextQuality(quality, timed.average)
      last = now
      if (!pausedNow.current) turn += (elapsed / TURN_MS) * Math.PI * 2
      frames += 1
      spin.step(now)
      if (frames % quality.every === 0) {
        renderer.resize(Math.max(1, Math.round(target.clientWidth * Math.min(window.devicePixelRatio || 1, quality.pixelRatio))))
        renderer.draw(turn, lightStore.current, spin.state())
      }
      if (onScreen && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf === 0 && renderer !== null && onScreen && !document.hidden) {
        last = 0
        raf = requestAnimationFrame(loop)
      }
    }
    // Made once the cover is there, and again when the browser gives a lost context back.
    // A hand can turn it over: dragged, it spins round, coasts and settles face on again; a drag is not a click, so it does not stop the record too.
    const spin = attachSpin(frame.current ?? target, start)
    const build = () => {
      if (loaded === null || cancelled) return
      renderer = createDiscRenderer(target, loaded.image, loaded.traits)
      if (renderer === null) return
      setLit(true)
      start()
    }
    const stopLoading = loadCorsImage(shown, (image) => {
      loaded = { image, traits: traitsOf(image) }
      build()
    })
    const observer = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting)
      if (onScreen) start()
      else stop()
    })
    if (frame.current !== null) observer.observe(frame.current)
    const visibility = () => (document.hidden ? stop() : start())
    const lost = (event: Event) => {
      event.preventDefault()
      stop()
      renderer = null
      setLit(false)
    }
    document.addEventListener("visibilitychange", visibility)
    target.addEventListener("webglcontextlost", lost)
    target.addEventListener("webglcontextrestored", build)
    return () => {
      cancelled = true
      stopLoading()
      stop()
      observer.disconnect()
      spin.detach()
      document.removeEventListener("visibilitychange", visibility)
      target.removeEventListener("webglcontextlost", lost)
      target.removeEventListener("webglcontextrestored", build)
      renderer?.dispose()
      slot()
      setLit(false)
    }
  }, [shown, reduced])

  // The clip is on the body, not the frame: a `::after` on the button can then reach past the round edge without being cut off.
  const body = (
    <span className="absolute inset-0 overflow-hidden rounded-full">
      <span className={cn("absolute inset-0", lit ? "hidden" : !reduced && "motion-disc", paused && "[animation-play-state:paused]")}>
        {shown ? <img src={shown} {...(set === null ? {} : { srcSet: set.srcSet, sizes: set.sizes })} alt="" loading="lazy" decoding="async" width={SIZES_PX[size]} height={SIZES_PX[size]} className="size-full object-cover object-top" /> : null}
        <span className="bg-background ring-foreground/25 absolute top-1/2 left-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1" />
      </span>
      <span aria-hidden="true" className={cn("light-sheen absolute inset-0 rounded-full", lit && "hidden")} />
      <canvas ref={canvas} aria-hidden="true" className={cn("absolute inset-0 size-full", !lit && "hidden")} />
    </span>
  )
  const shape = cn("relative shrink-0 rounded-full", !lit && "bg-muted", FRAMES.square[size], LIT_SIZES.includes(size) && "lit-frame")
  if (reduced) {
    return (
      <span ref={(node) => { frame.current = node }} aria-hidden="true" className={shape}>
        {body}
      </span>
    )
  }
  return (
    <button ref={(node) => { frame.current = node }} type="button" aria-label={paused ? "Start snurringen" : "Stopp snurringen"} onClick={() => setPaused((now) => !now)} className={cn(shape, size === "row" && "after:absolute after:-inset-0.5 after:rounded-full after:content-['']", "focus-visible:ring-ring cursor-pointer touch-pan-y p-0 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none")}>
      {body}
    </button>
  )
}

const SIZES_PX = { row: 40, hero: 112, feature: 320, fill: 200 } as const
