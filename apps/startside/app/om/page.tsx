import { InstallSettings, SourcesSettings } from "@lmfaole/designsystem/components/app-settings"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"

import { SOURCES } from "../../components/credits"
import { Shell } from "../../components/shell"
import { env } from "../../lib/env"
import { githubLogin } from "../../lib/github"

export const metadata = { title: "Om · Startside" }

// The same for everyone and for every request but the configuration: drawn when asked, kept at the edge like the other pages (worker.mjs).
export const dynamic = "force-dynamic"

/** What the page is, what it shows and keeps (nothing), how the position is used, where the summaries come from, installing it, and the sources. */
export default function Page() {
  const user = githubLogin()
  const place = env("WEATHER_PLACE") ?? "Oslo"
  return (
    <Shell current="about" refresh={false} title="Om startsiden" lead="En åpen startside med offentlige data. Den er lik for alle, og den lagrer ingenting om deg.">
      <>
        <PageSection id="innhold" title="Hva siden viser" icon="home">
          <Stack gap="tight">
            <Text>
              Det som venter i de offentlige repoene til <TextLink external href={`https://github.com/${user}`}>{user}</TextLink> på GitHub, været, avgangene i nærheten og strømprisen. Hva forsiden viser, følger tiden på døgnet.
            </Text>
            <Text role="quiet">Siden har ingen innlogging og ingen innstillinger, og ingenting kan legges til eller endres her. Fra GitHub vises bare det som er offentlig.</Text>
          </Stack>
        </PageSection>
        <PageSection id="posisjon" title="Posisjon" icon="place">
          <Stack gap="tight">
            <Text>
              Deler du posisjonen, rundes den av til omtrent hundre meter og står i adressen til siden, så du kan lagre eller dele lenken. Den lagres ikke hos oss.
            </Text>
            <Text role="quiet">{`Uten posisjon viser siden været for ${place} og prisområdet der, og ingen avganger.`}</Text>
          </Stack>
        </PageSection>
        <PageSection id="oppsummeringer" title="Oppsummeringer" icon="idea">
          <Text role="quiet">Oppsummeringene av pull requests, issues og discussions er skrevet av KI. De lages jevnlig i bakgrunnen, ikke når du åpner en side, så de kan ligge litt etter og ha feil.</Text>
        </PageSection>
        <InstallSettings appName="Startside" cookiePath="/start" />
        <SourcesSettings sources={SOURCES} />
      </>
    </Shell>
  )
}
