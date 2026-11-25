/**
 * Why a thing is recommended, in fixed words: a podcast's makers recommend it (Podcasting 2.0 `podcast:podroll`), the reader follows one
 * like it, or someone they know of is in it. `List` draws it as a line of its own under a row's meta, the same on a podcast's page
 * («Anbefalt av skaperne») and on the front page («Anbefalt for deg»).
 */

/** Why a row is recommended: by whom (`by`), because of what the reader follows (`follows`), or who is in it (`with`). */
export type ListReason = { by: string } | { follows: string } | { with: string | readonly string[] }

/** Names in a sentence: «A», «A og B», «A, B og C». */
export function namesInWords(names: readonly string[]): string {
  const shown = names.map((name) => name.trim()).filter((name) => name !== "")
  if (shown.length <= 1) return shown[0] ?? ""
  return `${shown.slice(0, -1).join(", ")} og ${shown.at(-1) ?? ""}`
}

/** The words of a reason: «Anbefalt av Ekko», «Fordi du følger Ekko», «Med Anne og Per»; `null` when it names no one. */
export function reasonWords(reason: ListReason): string | null {
  if ("by" in reason) return reason.by.trim() === "" ? null : `Anbefalt av ${reason.by.trim()}`
  if ("follows" in reason) return reason.follows.trim() === "" ? null : `Fordi du følger ${reason.follows.trim()}`
  const names = namesInWords(typeof reason.with === "string" ? [reason.with] : reason.with)
  return names === "" ? null : `Med ${names}`
}
