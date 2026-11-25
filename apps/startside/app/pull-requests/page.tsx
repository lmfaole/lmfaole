import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { PullsSection } from "../../components/sections"
import { GITHUB, Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getPulls, githubLogin } from "../../lib/github"
import { settle } from "../../lib/settle"

export const dynamic = "force-dynamic"
export const metadata = { title: "Pull requests · Startside" }

/** The pull requests, asked for while the page is sent: the frame and the way back are there at once. */
async function Pulls({ user }: { user: string }) {
  const instant = now()
  return <PullsSection data={await settle(getPulls(user, "all"))} mode="full" instant={instant} />
}

/** Every open public pull request of the user, in groups by what needs them most: blocked, ready to merge, waiting for their review, and the rest. */
export default function Page() {
  return (
    <Shell current="github" trail={[GITHUB]} title="Pull requests" lead="Egne og de som venter på review, med det som haster mest først.">
      <StreamedSection title="Pull requests" icon="pull-request" lines={4}>
        <Pulls user={githubLogin()} />
      </StreamedSection>
    </Shell>
  )
}
