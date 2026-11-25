"use client"

import { useEffect } from "react"

/** Registers the service worker (app/sw.js), which keeps the built files and the last copy of the page for offline use. */
export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/start/sw.js", { scope: "/start" }).catch(() => {})
  }, [])
  return null
}
