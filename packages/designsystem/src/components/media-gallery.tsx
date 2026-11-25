"use client"

import { useEffect, useId, useRef, useState } from "react"

import { fallbackOf, srcSetOf, type PictureSource } from "../lib/picture-sources"
import { Button } from "./button"
import { Icon } from "./icon"
import { CommandButton } from "./internal/command-button"
import { Overlay } from "./overlay"

export type { PictureSource } from "../lib/picture-sources"

/** One thing in a `MediaGallery`: a picture (a screenshot), or a video (a trailer) with its still. `label` is what it shows, in words. */
export type MediaItem =
  | { kind: "picture"; key: string; /** The full picture. */ src: string; /** The same picture in the widths its source offers (a small one for the thumbnail). */ sources?: readonly PictureSource[]; label: string }
  | { kind: "video"; key: string; /** The video (MP4 or WebM). */ src: string; /** Its still, shown before it plays and as the thumbnail. */ poster: string; label: string }

/** How many are shown before «Se alle». */
const FIRST = 6

const thumbOf = (item: MediaItem): { src: string; set: { srcSet: string; sizes: string } | null } =>
  item.kind === "video" ? { src: item.poster, set: null } : { src: (item.sources === undefined ? undefined : fallbackOf(item.sources, 320)?.src) ?? item.src, set: srcSetOf(item.sources, 320) }

/**
 * A game's screenshots and trailers (or any set of pictures and videos of one thing): a grid of 16:9 thumbnails, two across in a narrow
 * column and three from 40rem, the first six and «Se alle 24» for the rest. A tap opens one large in a dialog, with «Forrige» and
 * «Neste», the arrow keys, «3 av 24» and Esc to close. A video has its still until it is played, with the browser's own controls: it never
 * plays by itself and loads nothing before it is asked to (`preload="none"`), and it stops when the dialog closes or moves on. Thumbnails
 * load lazily; nothing moves under reduced motion. Nothing is drawn for no items.
 */
export function MediaGallery({ items, label = "Bilder og videoer" }: {
  items: readonly MediaItem[]
  /** What the set is, the dialog's title for a screen reader: «Bilder og videoer» by default. */
  label?: string
}) {
  const id = `media-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [at, setAt] = useState(0)
  const [all, setAll] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const total = useRef(items.length)
  total.current = items.length
  // In the dialog the arrows step through the items, wherever the focus is in it (but in a video's own controls, which seek with them);
  // a video stops when the dialog closes (Esc, a tap outside, the close button).
  useEffect(() => {
    const dialog = document.getElementById(id)
    if (dialog === null) return
    const stop = () => stage.current?.querySelectorAll("video").forEach((video) => video.pause())
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLVideoElement || total.current < 2) return
      const forward = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
      if (forward === 0) return
      event.preventDefault()
      const step = document.documentElement.dir === "rtl" ? -forward : forward
      setAt((index) => (index + step + total.current) % total.current)
    }
    dialog.addEventListener("close", stop)
    dialog.addEventListener("keydown", onKeyDown)
    return () => {
      dialog.removeEventListener("close", stop)
      dialog.removeEventListener("keydown", onKeyDown)
    }
  }, [id])
  if (items.length === 0) return null
  const count = items.length
  const current = items[Math.min(at, count - 1)] ?? items[0]
  if (current === undefined) return null
  const go = (step: number) => setAt((index) => (index + step + count) % count)
  const shown = all ? items : items.slice(0, FIRST)
  const large = current.kind === "picture" ? { src: current.src, set: srcSetOf(current.sources, 1152) } : null
  return (
    <div className="@container grid gap-3">
      <ul className="grid grid-cols-2 gap-2 @[40rem]:grid-cols-3">
        {shown.map((item, index) => {
          const thumb = thumbOf(item)
          return (
            <li key={item.key} className="min-w-0">
              <CommandButton command="show-modal" commandFor={id} look="zoom" label={`${item.kind === "video" ? "Spill av video" : "Vis bilde"}: ${item.label}`} onInvoke={() => setAt(index)}>
                <span className="relative block aspect-video overflow-hidden rounded-md bg-muted">
                  <img src={thumb.src} {...(thumb.set === null ? {} : { srcSet: thumb.set.srcSet, sizes: "(min-width: 40rem) 33vw, 50vw" })} alt="" loading="lazy" decoding="async" width={320} height={180} className="size-full object-cover" />
                  {item.kind === "video" ? (
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                      <span className="grid size-10 place-items-center rounded-full bg-background/85 text-foreground ring-1 ring-foreground/10">
                        <Icon name="play" />
                      </span>
                    </span>
                  ) : null}
                </span>
              </CommandButton>
            </li>
          )
        })}
      </ul>
      {all || count <= FIRST ? null : (
        <div>
          <Button icon="expand" onClick={() => setAll(true)}>{`Se alle ${count}`}</Button>
        </div>
      )}
      <Overlay id={id} variant="media" title={label} hideTitle>
        <div ref={stage} className="grid gap-3" role="group" aria-roledescription="bildeserie" aria-label={label}>
          <div className="grid aspect-video place-items-center overflow-hidden rounded-md bg-muted">
            {large !== null ? (
              <img key={current.key} src={large.src} {...(large.set === null ? {} : { srcSet: large.set.srcSet, sizes: "min(96vw, 72rem)" })} alt={current.label} decoding="async" className="size-full object-contain" />
            ) : current.kind === "video" ? (
              <video key={current.key} src={current.src} poster={current.poster} controls preload="none" playsInline className="size-full" aria-label={current.label} />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="min-w-0 text-sm [overflow-wrap:anywhere]" aria-live="polite">
              <span className="font-medium tabular-nums">{`${Math.min(at, count - 1) + 1} av ${count}`}</span>
              {` · ${current.label}`}
            </p>
            {count === 1 ? null : (
              <div className="flex gap-2">
                <Button icon="arrow-left" onClick={() => go(-1)}>Forrige</Button>
                <Button icon="arrow-right" onClick={() => go(1)}>Neste</Button>
              </div>
            )}
          </div>
        </div>
      </Overlay>
    </div>
  )
}
