import { PageHeader } from "@lmfaole/designsystem/components/page-header"
import { PageLayout } from "@lmfaole/designsystem/components/page-layout"
import { ErrorMessage } from "@lmfaole/designsystem/components/error-message"

export const metadata = { title: "Frakoblet · Startside" }

/** Shown by the service worker when there is no network and no earlier copy of the page. */
export default function Offline() {
  return (
    <PageLayout>
      <PageHeader title="Frakoblet" description="Startsiden trenger nett for å hente det som er nytt." />
      <ErrorMessage what="siden" error="Ingen nett. Prøv igjen når du er tilkoblet." retry />
    </PageLayout>
  )
}
