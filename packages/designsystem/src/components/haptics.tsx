"use client"

import { useEffect } from "react"

import { listenForHaptics } from "../lib/haptics"

/**
 * Turns on the haptics of the controls marked `data-haptic="<kind>"` in the page (`listenForHaptics`, `lib/haptics`): put one in the app's
 * layout, once. Draws nothing, does nothing on the server, where the browser cannot vibrate, or where the reader has turned it off
 * («Vibrasjon» in `AppearanceSettings`). The design system's own components that buzz (`FirstRun`, `ReorderList`) do so without it.
 */
export function Haptics() {
  useEffect(() => listenForHaptics(document), [])
  return null
}
