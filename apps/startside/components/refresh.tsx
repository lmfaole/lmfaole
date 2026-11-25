"use client"

import { useRouter } from "next/navigation"
import { startTransition, useEffect } from "react"

/**
 * Keeps the page fresh while it is open: it asks the server for the page again every `everySeconds`, and at once when the
 * window comes back into view after a while, so the lists change under the reader's eyes without a reload. Nothing runs
 * while the window is hidden or the device is offline; what is on the page stays until the new page has arrived.
 */
export function Refresh({ everySeconds }: { everySeconds: number }) {
  const router = useRouter()

  useEffect(() => {
    let last = Date.now()
    const refresh = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return
      last = Date.now()
      startTransition(() => router.refresh())
    }
    const timer = setInterval(refresh, everySeconds * 1000)
    const comeBack = () => {
      if (document.visibilityState === "visible" && Date.now() - last > (everySeconds * 1000) / 2) refresh()
    }
    // A page restored from the back/forward cache or on resuming the app may be hours old, and `visibilitychange` need not fire for it.
    const restored = (event: PageTransitionEvent) => event.persisted && refresh()
    document.addEventListener("visibilitychange", comeBack)
    window.addEventListener("online", comeBack)
    window.addEventListener("pageshow", restored)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", comeBack)
      window.removeEventListener("online", comeBack)
      window.removeEventListener("pageshow", restored)
    }
  }, [everySeconds, router])

  return null
}
