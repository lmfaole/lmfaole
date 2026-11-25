/**
 * A game's achievements as its page and its subpage show them: the unlocked, the last first; the rarest the visitor has, where they are not the ones already shown; and the ones still to
 * get, the most common first (the nearest to get). Pure, with a test.
 */

import type { Achievement } from "./steam.ts"

/** How many of the last unlocked the game's page shows; the rest are on its subpage. */
export const LATEST = 5

/** The unlocked, the last first. */
export const unlockedOf = (list: readonly Achievement[]): Achievement[] => list.filter((one) => one.unlocked !== null).sort((a, b) => (b.unlocked ?? 0) - (a.unlocked ?? 0))

/** The three rarest the visitor has, or none where every one of them is among the last unlocked already shown (the section would only repeat them). */
export function rarestBeyond(unlocked: readonly Achievement[], shown = LATEST): Achievement[] {
  const rarest = unlocked.filter((one) => one.percent !== null).sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0)).slice(0, 3)
  const latest = new Set(unlocked.slice(0, shown).map((one) => one.key))
  return rarest.every((one) => latest.has(one.key)) ? [] : rarest
}

/** The ones still to get, the most common first: what most players have is likely the nearest. */
export const lockedOf = (list: readonly Achievement[]): Achievement[] => list.filter((one) => one.unlocked === null).sort((a, b) => (b.percent ?? -1) - (a.percent ?? -1))
