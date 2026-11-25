import type { SubPage } from "../components/sub-pages"
import type { Prefs, Theme } from "./preferences"

/*
 * The rows every app's settings overview (`SubPages`) starts with, with the same words, icons and order in every app: «Utseende»
 * (`AppearanceSettings`), then «App» (`InstallSettings`). `SubPages` puts them first whatever order they are passed in.
 */

const THEME_WORD: Readonly<Record<Theme, string>> = { system: "Som enheten", light: "Lyst", dark: "Mørkt" }

/** The look in words, the value of «Utseende» in the overview: «Mørkt · effekter av · fast lys». */
export function appearanceSummary(prefs: Pick<Prefs, "theme" | "effects" | "tilt">): string {
  return [THEME_WORD[prefs.theme], prefs.effects === "on" ? "effekter på" : "effekter av", prefs.tilt === "on" ? "lyset følger telefonen" : "fast lys"].join(" · ")
}

/** The overview's row for the appearance subpage (`AppearanceSettings`), with what is chosen now. */
export function appearancePage(href: string, prefs: Pick<Prefs, "theme" | "effects" | "tilt">): SubPage {
  return { href, label: "Utseende", icon: "sun", value: appearanceSummary(prefs), description: "Tema, effekter, lyset og vibrasjon." }
}

/** The overview's row for the app subpage (`InstallSettings`). */
export function appPage(href: string, appName: string): SubPage {
  return { href, label: "App", icon: "device", description: `Legg ${appName} på hjemskjermen.` }
}
