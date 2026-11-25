"use client"

import { useEffect } from "react"

import { listenForPendingForms } from "../lib/pending-forms"

/**
 * Turns on the waiting state of the page's native forms (`listenForPendingForms`, `lib/pending-forms`): their `PendingButton` shows
 * `pendingLabel` while the server answers. Put one in the app's layout, once; draws nothing.
 */
export function PendingForms() {
  useEffect(() => listenForPendingForms(document), [])
  return null
}
