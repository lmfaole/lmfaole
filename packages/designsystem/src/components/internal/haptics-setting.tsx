"use client"

import { useEffect, useId, useState, type ChangeEvent } from "react"

import { browserStorage } from "../../lib/light-preference"
import { haptic, hapticsSupported, readHapticsPreference, writeHapticsPreference } from "../../lib/haptics"
import { Text } from "../text"

/** `switch` is not in React's types yet; on Safari 17.4+ it draws a native switch, which also gives the tap of a switch on an iPhone. */
const SWITCH: Record<string, string> = { switch: "" }

/**
 * INTERNAL (`AppearanceSettings`, under «Effekter»): the reader's own off switch for vibration (guide «Foundations / Haptics»), for an app's settings page: a switch «Vibrasjon» with a
 * sentence on what it does. It applies at once and is kept in this browser (`localStorage` `ds-haptics`), since a phone vibrates and an
 * account does not; it sends nothing with a form. Turning it on gives one tap, so the reader feels what they chose. Where the browser cannot
 * vibrate (Safari and iOS, Firefox) the switch is disabled and says so. The label is the target and it covers the sentence under it too, with 0.5rem
 * above and below: a tap anywhere on the setting flips the switch. The sentence is still read as its description, not as part of its name.
 */
export function HapticsSetting() {
  const id = useId()
  const [on, setOn] = useState(true)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(hapticsSupported())
    setOn(readHapticsPreference(browserStorage()) !== "off")
  }, [])

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.currentTarget.checked
    setOn(checked)
    writeHapticsPreference(browserStorage(), checked ? "on" : "off")
    if (checked) haptic("selection", { from: event.currentTarget })
  }

  return (
    <div className="relative grid gap-1">
      <label htmlFor={id} className="has-focus-visible:ring-ring flex cursor-pointer items-center justify-between gap-3 rounded-lg after:absolute after:-inset-y-2 after:inset-x-0 after:content-[''] has-focus-visible:ring-2 has-disabled:cursor-default">
        <span className="font-medium">Vibrasjon</span>
        <input {...SWITCH} id={id} type="checkbox" role="switch" checked={supported && on} disabled={!supported} onChange={change} aria-describedby={`${id}-description`} className="accent-primary size-5 shrink-0" />
      </label>
      <Text role="quiet" id={`${id}-description`}>
        {supported ? "Korte vibrasjoner når du velger noe, er ferdig eller noe går galt." : "Nettleseren din lar ikke nettsider vibrere."}
      </Text>
    </div>
  )
}
