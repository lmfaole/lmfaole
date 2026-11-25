import { StreamedSection } from "@lmfaole/designsystem/components/streamed-section"

import { DiscussionsSection } from "../../components/sections"
import { GITHUB, Shell } from "../../components/shell"
import { getDiscussions, githubLogin } from "../../lib/github"
import { settle } from "../../lib/settle"

export const dynamic = "force-dynamic"
export const metadata = { title: "Discussions · Startside" }

/** The discussions, asked for while the page is sent: the frame and the way back are there at once. */
async function Discussions({ user }: { user: string }) {
  return <DiscussionsSection data={await settle(getDiscussions(user))} mode="full" />
}

/** The discussions of the watched repositories, in groups: the ones the user is in, the unanswered questions, and what moved lately. */
export default function Page() {
  return (
    <Shell current="github" trail={[GITHUB]} title="Discussions" lead="Samtaler i de fulgte repoene, spørsmål uten svar, og det som har rørt seg.">
      <StreamedSection title="Discussions" icon="discussion" lines={4}>
        <Discussions user={githubLogin()} />
      </StreamedSection>
    </Shell>
  )
}
