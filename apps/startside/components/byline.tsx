import { Time } from "@lmfaole/designsystem/components/time"

import { GitHubPerson } from "./person"
import { now } from "../lib/day"
import type { Ref } from "../lib/links"

/** The line under the title of a thing on GitHub: where it lives, who made it (with their picture) and when. */
export function Byline({ at: where, author, created }: { at: Ref; author: string | null; created: string }) {
  return (
    <>
      {where.owner}/{where.repo} #{where.number}
      {author === null ? null : (
        <>
          {" · av "}
          <GitHubPerson login={author} />
        </>
      )}
      {" · opprettet "}
      <Time value={created} now={now()} />
    </>
  )
}
