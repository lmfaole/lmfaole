import { Badge } from "./badge"
import { isNew } from "../lib/onboarding"

/**
 * «Nytt» beside something that has just come (a page in the navigation, a section) for a while: until `until`. `now` is passed in, as
 * for `Time`, so the server and the browser agree. Nothing is drawn when it is no longer new. Once the reader has seen it (the `seen`
 * cookie, read with `isSeen`; a `MarkSeen` on the new page records it), leave the badge out.
 */
export function NewBadge({ until, now }: { until: string; now: string }) {
  if (!isNew(until, now)) return null
  return (
    <Badge icon="new" tone="default">
      Nytt
    </Badge>
  )
}
