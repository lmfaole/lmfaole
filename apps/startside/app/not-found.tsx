import { NotFoundPage } from "@lmfaole/designsystem/components/not-found-page"
import { PageLayout } from "@lmfaole/designsystem/components/page-layout"

import { withBase } from "../lib/links"

export const metadata = { title: "Siden finnes ikke · Startside" }

/** Every address under the base path with no page: the design system's 404, with the way back to the start page, not the site's root. */
export default function NotFound() {
  return (
    <PageLayout>
      <NotFoundPage home={withBase("/")} />
    </PageLayout>
  )
}
