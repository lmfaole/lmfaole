import { InstallPrompt } from "@lmfaole/designsystem/components/install-prompt"
import { isSeen, parseSeen, SEEN_COOKIE } from "@lmfaole/designsystem/lib/onboarding"
import { useEffect, useState } from "react"

/**
 * The offer to install the app, once: «Ikke nå» or an install puts it away for good, in the design system's `seen` cookie under the site's base (`/medier/`, never the origin's root, whose
 * other paths are other apps'). The cookie is read here, in the browser, and never by the server: the page is the same for every visitor, so a shared cache can keep it.
 */
export function InstallOffer() {
  const [seen, setSeen] = useState(true)
  useEffect(() => {
    const value = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${SEEN_COOKIE}=`))
      ?.slice(SEEN_COOKIE.length + 1)
    setSeen(isSeen(parseSeen(value), "install"))
  }, [])
  return <InstallPrompt appName="Medier" seen={seen} cookiePath={import.meta.env.BASE_URL} />
}
