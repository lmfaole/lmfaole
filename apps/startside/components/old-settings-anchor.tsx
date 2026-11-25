"use client"

import { useEffect } from "react"

import { SETTINGS_PAGE } from "../lib/settings"

/** The one long settings page's anchors, and the subpage (and place on it) each part is on now. */
const MOVED: Record<string, string> = {
  github: "konto",
  repos: "repoer",
  posisjon: "posisjon",
  forside: "forside",
  rekkefolge: "forside#rekkefolge",
  tider: "tid/deler#tider",
  tema: "utseende#tema",
  effekter: "utseende#effekter",
  lys: "utseende#lys",
  installer: "app#installer",
}

/** A link to the old long page's part (`/innstillinger#tider`) goes on to the subpage. The anchor never reaches the server, so this is the browser's. */
export function OldSettingsAnchor() {
  useEffect(() => {
    const follow = () => {
      const moved = MOVED[window.location.hash.slice(1)]
      if (moved !== undefined) window.location.replace(`${SETTINGS_PAGE}/${moved}`)
    }
    follow()
    window.addEventListener("hashchange", follow)
    return () => window.removeEventListener("hashchange", follow)
  }, [])
  return null
}
