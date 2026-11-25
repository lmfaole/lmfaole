"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import { createPortal } from "react-dom"

import { DEFAULT_LIGHT, lightFromPointer } from "../../lib/light"
import { acquireLightInput, aimLight, requestTilt, tiltSupport } from "../../lib/light-input"
import { sampleCover } from "../../lib/sample-cover"
import { Icon } from "../icon"

type Support = ReturnType<typeof tiltSupport>
type Status = "idle" | "asking" | "on" | "denied"

/** Sets the radio `name` of `form` to `value`, and tells the form, as a click on it would; marked as ours (a `CustomEvent`), so it does not ask again. */
const choose = (form: HTMLFormElement | null, name: string, value: "on" | "off"): void => {
  const field = form?.elements.namedItem(name)
  const radios = field instanceof RadioNodeList ? [...field] : field instanceof HTMLInputElement ? [field] : []
  const radio = radios.find((one) => one instanceof HTMLInputElement && one.value === value)
  if (!(radio instanceof HTMLInputElement) || radio.checked) return
  radio.checked = true
  radio.dispatchEvent(new CustomEvent("change", { bubbles: true }))
}

const WORDS: Record<Support, string> = {
  ask: "Telefonen spør deg først. Trykk på knappen og svar «Tillat».",
  free: "Vipp telefonen, så flytter lyset seg.",
  none: "Bevegelse er ikke støttet på denne enheten. Her følger lyset pekeren i stedet.",
  still: "Enheten din ber om mindre bevegelse, så lyset står stille.",
}

/** Asks for the tilt, says how it went, and sets the form's radio to the answer. */
async function askTilt(form: HTMLFormElement | null, name: string, setStatus: (status: Status) => void) {
  setStatus("asking")
  const granted = await requestTilt()
  setStatus(granted ? "on" : "denied")
  choose(form, name, granted ? "on" : "off")
}

/** What the light does in the card, said on the card itself (the picture is hidden from a screen reader, which hears it from the status region). */
const TAGS: Record<Support, string> = {
  ask: "Telefonen spør deg når du velger dette",
  free: "Vipp telefonen",
  none: "Simulering med peker",
  still: "Står stille: enheten ber om mindre bevegelse",
}

/** The radio the choice is made with, in the same form: `on` for «Følg telefonen», `off` for «Fast lys». */
const NAME = "tilt"

/**
 * INTERNAL (`TiltChoice`, `AppearanceSettings`): the light following how a phone is held, as a picture to choose by: one sample for an option's `preview` (two cards «Følg telefonen» and «Fast lys», the radio
 * named `tilt`):
 *
 * - `mode="follow"`: a lit surface whose pool of light, sun and cover shadow follow the tilt. Choosing the radio `tilt` of its form with the value `on` asks the phone (iOS asks the
 *   visitor, and it must come from that tap or key, which it does); a no sets the radio back to `off`. What happened is said in a status region for a screen reader. On a desktop the pointer over
 *   the surface moves the light instead, labelled «Simulering med peker».
 * - `mode="still"`: the same surface with the light where it stands when nothing moves it.
 *
 * Under `prefers-reduced-motion` nothing moves. The cover is a made-up one, drawn in the theme's colours.
 */
export function TiltPreview({ mode }: { mode: "follow" | "still" }) {
  const root = useRef<HTMLDivElement>(null)
  const [support, setSupport] = useState<Support>("none")
  const [status, setStatus] = useState<Status>("idle")
  const [cover, setCover] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const element = root.current
    if (element === null) return
    setSupport(tiltSupport())
    setCover(sampleCover(element))
    setMounted(true)
    if (mode === "still") return
    const release = acquireLightInput()
    const form = element.closest("form")
    const change = (event: Event) => {
      const target = event.target
      if (event instanceof CustomEvent || !(target instanceof HTMLInputElement) || target.name !== NAME || !target.checked || target.value !== "on") return
      const can = tiltSupport()
      if (can === "ask" || can === "free") void askTilt(form, NAME, setStatus)
    }
    form?.addEventListener("change", change)
    return () => {
      form?.removeEventListener("change", change)
      release()
    }
  }, [mode])

  const simulated = support === "none" && mode !== "still"
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!simulated) return
    // The page's pointer would put the light by the whole screen: here the surface is the screen.
    event.stopPropagation()
    const box = event.currentTarget.getBoundingClientRect()
    aimLight(lightFromPointer(event.clientX - box.left, event.clientY - box.top, box.width, box.height))
  }

  const said = status === "on" ? "Lyset følger nå telefonen." : status === "denied" ? "Du sa nei, så lyset står stille. Du kan endre det i nettleserens innstillinger for nettstedet." : WORDS[support]
  const tag = mode === "still" ? null : status === "denied" ? "Du sa nei: lyset står stille" : status === "on" ? "Lyset følger telefonen" : TAGS[support]
  return (
    <div
      ref={root}
      onPointerMove={move}
      onPointerLeave={() => simulated && aimLight(DEFAULT_LIGHT)}
      className={`light-spot bg-muted/30 relative grid h-44 place-items-center overflow-hidden ${mode === "still" ? "[--light-x:-0.5] [--light-y:-0.7]" : ""}`}
    >
      <span aria-hidden="true" className="light-dot text-foreground">
        <Icon name="sun" size="lg" />
      </span>
      <span aria-hidden="true" className="lit-frame bg-muted block size-24 overflow-hidden rounded-md">
        {cover === null ? null : <img src={cover} alt="" className="size-full object-cover" />}
      </span>
      {tag === null ? null : <span className="bg-background/80 text-muted-foreground absolute start-2 bottom-2 rounded-sm px-1.5 py-0.5 text-xs font-medium">{tag}</span>}
      {mode === "follow" && mounted && status !== "idle"
        ? createPortal(
            <p role="status" className="sr-only">
              {said}
            </p>,
            document.body,
          )
        : null}
    </div>
  )
}
