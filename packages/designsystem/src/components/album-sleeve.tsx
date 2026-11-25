"use client"

import { useEffect, useRef, useState } from "react"

import { effectsEnabled } from "../lib/effects"
import { acquireGlSlot } from "../lib/gl-budget"
import { loadCorsImage } from "../lib/cors-image"
import { lightStore } from "../lib/light"
import { acquireLightInput } from "../lib/light-input"
import { easeOut, paletteOf, type Rgb } from "../lib/palette"
import { DRAWN } from "../lib/picture-frames"
import { fallbackOf, type PictureSource } from "../lib/picture-sources"
import { attachSpin } from "../lib/spin"
import { createSleeveRenderer, sleeveFace, sleeveRatio, SLEEVE_SHAPES, type SleeveKind, type SleeveRenderer } from "../lib/sleeve-shader"
import { cn } from "../lib/utils"
import { PictureFrame } from "./internal/picture-frame"

/** The label of the record: the most vivid of the cover's four colours, so the record belongs to the cover. */
function labelOf(image: HTMLImageElement): Rgb {
  try {
    const small = document.createElement("canvas")
    small.width = 16
    small.height = 16
    const context = small.getContext("2d", { willReadFrequently: true })
    if (context === null) return [180, 60, 50]
    context.drawImage(image, 0, 0, 16, 16)
    const colours = paletteOf(context.getImageData(0, 0, 16, 16).data, 16)
    return colours.reduce((best, colour) => (Math.max(...colour) - Math.min(...colour) > Math.max(...best) - Math.min(...best) ? colour : best))
  } catch {
    return [180, 60, 50]
  }
}

/** How long the record takes to slide out of the sleeve when it is first drawn, in milliseconds. */
const SLIDE_MS = 900

/**
 * An album's sleeve in 3D (the main picture of the page of an album): the cover whole on a slab of plastic with a record pulled half out of it, that tilts toward the page's light (the pointer, and on a phone how it is
 * held) and catches it. It is the cover with something added (a record, a gleam), so it is for covers the app may alter (Last.fm's), never for Spotify's. Until WebGL is ready, and where it is not there or under
 * `prefers-reduced-motion`, it is the cover alone as a sharp square (`Picture`), in the same place, so nothing moves when it takes over: the record is inside the sleeve then, and slides out once (`SLIDE_MS`).
 * After that it is drawn when the light changes and at no other time: nothing loops.
 * With `kind="dvd"` it is a film's DVD case (the main picture of the page of a film): the poster under the clear sleeve of a black case, and a silver disc half out of it that splits the light into a spectrum. Until
 * WebGL is ready it is the poster alone (`ratio="poster"`), where the case's poster will be.
 * With `kind="cd"` it is an album's CD (for an album whose edition is a CD): the cover under the clear lid of a jewel case, the hinge on its left, and a CD half out of it whose tracks split the light into
 * more and narrower rainbows than a DVD's. Until WebGL is ready it is the cover alone, where the booklet will be in the case.
 * With `kind="cartridge"` it is a handheld's game (a game played most on a Steam Deck, say): the box picture under the clear sleeve of a slim black case, and a game card half out of it with the picture on its
 * glossy label. Until WebGL is ready it is the picture alone (`ratio="poster"`), where the case's will be.
 * The old consoles' games have their own: `nes`, `snes`, `n64`, `gameboy` and `gba` are the picture printed on a worn cardboard box with that console's cartridge half out of it (its plastic, outline, label
 * and grip), `genesis` a black clamshell with a black cartridge, and `psx` a jewel case with the first PlayStation's black disc (its picture square, as the booklet's).
 */
export function AlbumSleeve({ src, sources, size = "hero", kind = "record" }: { /** The cover (or the poster), as `Picture` takes it. */ src: string | null; sources?: readonly PictureSource[]; /** `feature`: as wide as its cell, the cover about two thirds of it (the large head of an album's page); `hero` the hero's height. */ size?: "hero" | "feature"; /** `dvd`: a film's poster in a DVD case with a disc, in place of a record's sleeve; `cd`: an album's CD in its jewel case; `cartridge`: a handheld game's case with its game card; `nes`, `snes`, `n64`, `gameboy`, `gba`, `genesis`, `psx`: an old console's game in its box with its cartridge (or disc). */ kind?: SleeveKind }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [lit, setLit] = useState(false)
  const dvd = sleeveRatio(kind) === "poster"
  // The old consoles' cases are placed by working out where the camera draws their picture; the others were set by hand.
  const worked = kind !== "record" && kind !== "dvd" && kind !== "cd" && kind !== "cartridge"
  const face = sleeveFace(kind)
  const cased = kind !== "record"
  const shown = src ?? (sources === undefined ? undefined : fallbackOf(sources, DRAWN[dvd ? "poster" : "square"][size])?.src)

  useEffect(() => {
    const target = canvas.current
    if (shown === undefined || target === null || !effectsEnabled(target) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const slot = acquireGlSlot()
    if (slot === null) return
    const release = acquireLightInput()
    let renderer: SleeveRenderer | null = null
    let loaded: { image: HTMLImageElement; label: Rgb } | null = null
    let raf = 0
    let cancelled = false
    // When the record began to slide out; `null` before it is first drawn. A context given back draws it out at once: the slide is shown once.
    let slideStart: number | null = null
    // A hand can turn it round: dragged, it spins, coasts and settles face on again.
    const spin = attachSpin(target, () => schedule())
    const draw = () => {
      raf = 0
      if (renderer === null) return
      slideStart ??= performance.now()
      const out = easeOut((performance.now() - slideStart) / SLIDE_MS)
      renderer.resize(Math.max(2, Math.round(target.clientHeight * Math.min(window.devicePixelRatio || 1, 2))))
      spin.step(performance.now())
      renderer.draw(lightStore.current, out, spin.state())
      // Frames go on only while the record slides out or a hand's spin is still moving, then it waits for the light again.
      if (out < 1 || spin.moving()) schedule()
    }
    const schedule = () => {
      if (raf === 0 && renderer !== null) raf = requestAnimationFrame(draw)
    }
    const build = () => {
      if (loaded === null || cancelled) return
      renderer = createSleeveRenderer(target, loaded.image, loaded.label, kind)
      if (renderer === null) return
      draw()
      setLit(true)
    }
    const stopLoading = loadCorsImage(shown, (image) => {
      loaded = { image, label: labelOf(image) }
      build()
    })
    const lost = (event: Event) => {
      event.preventDefault()
      renderer = null
      setLit(false)
    }
    lightStore.listeners.add(schedule)
    target.addEventListener("webglcontextlost", lost)
    target.addEventListener("webglcontextrestored", build)
    const observer = new ResizeObserver(schedule)
    observer.observe(target)
    return () => {
      cancelled = true
      stopLoading()
      lightStore.listeners.delete(schedule)
      target.removeEventListener("webglcontextlost", lost)
      target.removeEventListener("webglcontextrestored", build)
      observer.disconnect()
      spin.detach()
      if (raf !== 0) cancelAnimationFrame(raf)
      renderer?.dispose()
      release()
      slot()
      setLit(false)
    }
  }, [shown, kind])

  return (
    <div style={worked ? { aspectRatio: SLEEVE_SHAPES[kind].aspect } : undefined} className={cn("relative shrink-0", worked ? null : kind === "cartridge" ? "aspect-[828/1000]" : dvd ? "aspect-[1035/1000]" : kind === "cd" ? "aspect-[1616/1000]" : "aspect-[146/100]", size === "feature" ? "w-full" : "h-28 sm:h-32 @3xl:h-44 @5xl:h-56")}>
      {/* The cover is the sleeve's left 100/146 of the width, the record the rest; the poster is inside the case's rim, 64/103.5 of the width and 96 % of the height; the CD's booklet is right of the hinge, where the camera draws it at rest (the scene is 1.18 high in the canvas, so the booklet is 0.96 / 1.9 of the width); the game case's picture is worked out the same way, 0.633 of a scene 0.99 wide and 0.95 of one 1.19 high. */}
      {worked ? (
        // An old console's box is the shape of the real one (a GBA's square, an SNES's lying down), not a poster's: its picture fills that face, cropped about its middle as the case crops it.
        <div style={{ left: `${(face.left * 100).toFixed(2)}%`, top: `${(face.top * 100).toFixed(2)}%`, width: `${(face.width * 100).toFixed(2)}%`, height: `${(face.height * 100).toFixed(2)}%` }} className={cn("absolute overflow-hidden bg-muted", lit && "invisible")}>
          {shown === undefined ? null : <img src={shown} alt="" fetchPriority="high" decoding="async" className="size-full object-cover" />}
        </div>
      ) : (
        <div className={cn("absolute", kind === "cartridge" ? "top-[10.2%] left-[9.5%] w-[64.1%]" : dvd ? "top-[2%] left-[3.9%] w-[61.8%]" : kind === "cd" ? "top-[9.2%] left-[13.8%] w-[50.5%]" : "top-0 left-0", size === "feature" && !cased && "w-[68.5%]", lit && "invisible")}>
          <PictureFrame ratio={dvd ? "poster" : "square"} size={cased && size === "hero" ? "fill" : size} corners="sharp" priority src={src} {...(sources === undefined ? {} : { sources })} />
        </div>
      )}
      <canvas ref={canvas} aria-hidden="true" className={cn("absolute inset-0 size-full cursor-grab touch-pan-y active:cursor-grabbing", !lit && "hidden")} />
    </div>
  )
}
