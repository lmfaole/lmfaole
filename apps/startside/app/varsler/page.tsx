import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { AlertsSection } from "../../components/sections"
import { GITHUB, Shell } from "../../components/shell"
import { now } from "../../lib/day"
import { getCiFailures, getDependabot, getReplies, githubLogin } from "../../lib/github"
import { settle } from "../../lib/settle"

export const dynamic = "force-dynamic"
export const metadata = { title: "Varsler · Startside" }

/**
 * The alerts, asked for while the page is sent: the frame and the way back are there at once. All of it public, from searches and
 * repositories (never GitHub's notifications, which are the token's own and private).
 */
async function Alerts({ user }: { user: string }) {
  const instant = now()
  const [ci, replies, dependabot] = await Promise.all([settle(getCiFailures(user)), settle(getReplies(user, instant)), settle(getDependabot(user))])
  return <AlertsSection data={{ ci, replies, dependabot }} mode="full" instant={instant} />
}

/** What wants a look: public repositories whose default branch is red, replies and reviews from others on what the user is in, and Dependabot's open pull requests. */
export default function Page() {
  return (
    <Shell current="github" trail={[GITHUB]} title="Varsler" lead="Det som er rødt, det som er nytt fra andre, og det Dependabot venter på.">
      <StreamedSection title="Varsler" icon="notification" lines={4}>
        <Alerts user={githubLogin()} />
      </StreamedSection>
    </Shell>
  )
}
