import { CentralAction } from "./internal/action"
import { EmptyFrame } from "./internal/empty-frame"
import type { LinkTo } from "../lib/vocabulary"

/** The failure's own words, as a source gave them: an `Error`'s message, a string, or what it says when written out. */
function detail(error: unknown): string | undefined {
  if (error instanceof Error) return error.message === "" ? error.name : error.message
  if (typeof error === "string") return error === "" ? undefined : error
  if (error === undefined || error === null || typeof error === "boolean") return undefined
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

/**
 * What a page or a section shows when its data could not be fetched, the only way the design system says so. It shares the frame of
 * `EmptyState` (the same picture size, centred both ways, the whole page or a block of a section), with a warning in place of the picture,
 * the fixed title «Kunne ikke hente {what}» and the error's own words folded away under «Detaljer» (for the one who reports it, not
 * for the reader). `retry` is the one way on, «Prøv igjen»: `true` loads the same address again, a `LinkTo` goes where it says. It is
 * announced at once (`role="alert"`). A section whose source failed passes `what` and `error` to `PageSection`, which draws this for it.
 */
export function ErrorMessage({ what, error, retry }: { /** What could not be fetched, in the words of «Kunne ikke hente {what}» («været», «pull requests»). */ what: string; /** The failure, as the source returned it: its message is the detail. */ error: unknown; /** «Prøv igjen»: `true` reloads the page, a link goes to its address. */ retry?: LinkTo | true }) {
  const words = detail(error)
  const action = retry === undefined ? null : <CentralAction action={retry === true ? { href: "", label: "Prøv igjen", icon: "refresh" } : retry} />
  return (
    <EmptyFrame picture="failed" title={`Kunne ikke hente ${what}`} description="Det kan gå over av seg selv. Prøv igjen om litt." role="alert" action={action}>
      {words === undefined ? null : (
        <details className="text-muted-foreground mt-1 grid justify-items-center text-sm">
          <summary className="focus-visible:ring-ring cursor-pointer rounded-md px-2 py-2.5 focus-visible:ring-2 focus-visible:outline-none">Detaljer</summary>
          <p className="font-mono text-xs [overflow-wrap:anywhere]">{words}</p>
        </details>
      )}
    </EmptyFrame>
  )
}
