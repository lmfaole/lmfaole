import { CentralAction } from "./internal/action"
import { ClearSearch } from "./internal/clear-search"
import { EmptyFrame } from "./internal/empty-frame"
import type { ActionTo, LinkTo } from "../lib/vocabulary"

/** The one way on from an empty frame: a link (`LinkTo`), or, in a client component, something done here (`ActionTo`). */
export type EmptyAction = LinkTo | ActionTo

/** Why there is nothing, which decides the picture, the words and whether there is an action (see `EmptyState`). */
export type EmptyReason = "first-run" | "nothing-yet" | "no-results" | "all-done"

type EmptyStateProps =
  | { reason: "first-run"; what: string; /** What this app gathers and how it starts, in the app's words: a first run always explains itself. */ description: string; /** The way to fill it («Finn podkaster», «Legg til kilde»): a first run always has one. */ action: EmptyAction; query?: never }
  | { reason: "nothing-yet"; what: string; description?: string; action?: EmptyAction; query?: never }
  | { reason: "no-results"; what: string; /** What the reader searched for: the title quotes it, and «Tøm søket» is added when there is no `action`. */ query?: string; description?: string; action?: EmptyAction }
  | { reason: "all-done"; what: string; description?: string; /** Nothing to do is the message: an all-done state has no action. */ action?: never; query?: never }

/**
 * Where a page or a section has nothing to show, after Apple's `ContentUnavailableView`: a picture, a title, a line under it and at most one
 * central action, filling the room it stands in, centred both ways. The app says why (`reason`) and what would be here (`what`, a plural
 * noun: «podkaster», «pull requests»); the picture, the words, the size and the action's look follow from that, so every empty place in
 * every app reads the same:
 *
 * | `reason` | title | line under it | action |
 * | --- | --- | --- | --- |
 * | `first-run` | «Ingen {what} ennå» | the app's own, required | required: the way to fill it |
 * | `nothing-yet` | «Ingen {what} ennå» | «De dukker opp her når det kommer noe.» | optional |
 * | `no-results` | «Ingen treff for «{query}»» / «Ingen treff» | «Sjekk stavemåten eller prøv et annet søk.» | optional; «Tøm søket» by default with a `query` |
 * | `all-done` | «Ingen {what}» | «Alt er behandlet.» | none |
 *
 * Straight in a page it fills the rest of the screen; in a `PageSection` it is a calm block of its own height, so several empty sections on
 * one page look alike. It replaces the whole empty structure (no table with headers over no rows). It is never a failure: what could not be
 * fetched is an `ErrorMessage`, which shares this frame with a warning.
 */
export function EmptyState(props: EmptyStateProps) {
  const { reason, what, description, action } = props
  const query = props.reason === "no-results" ? props.query : undefined
  const words = WORDS[reason](what, query)
  const anchor = action === undefined ? (reason === "no-results" && query !== undefined && query !== "" ? <ClearSearch /> : null) : <CentralAction action={action} />
  return <EmptyFrame picture={reason} title={words.title} description={description ?? words.description} action={anchor} />
}

const WORDS: Record<EmptyReason, (what: string, query: string | undefined) => { title: string; description: string | undefined }> = {
  "first-run": (what) => ({ title: `Ingen ${what} ennå`, description: undefined }),
  "nothing-yet": (what) => ({ title: `Ingen ${what} ennå`, description: "De dukker opp her når det kommer noe." }),
  "no-results": (what, query) =>
    query === undefined || query === ""
      ? { title: "Ingen treff", description: `Ingen ${what} passer det du har valgt. Prøv færre filtre.` }
      : { title: `Ingen treff for «${query}»`, description: "Sjekk stavemåten eller prøv et annet søk." },
  "all-done": (what) => ({ title: `Ingen ${what}`, description: "Alt er behandlet." }),
}
