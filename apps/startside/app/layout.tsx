import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"

import { Haptics } from "@lmfaole/designsystem/components/haptics"
import { WebAnalytics } from "@lmfaole/designsystem/components/web-analytics"
import { brandAttributes } from "@lmfaole/designsystem/lib/brand"
import { transitionAttributes } from "@lmfaole/designsystem/lib/motion"
import { DEFAULT_PREFS, htmlAttributes } from "@lmfaole/designsystem/lib/preferences"

import { env } from "../lib/env"
import { PageTransition } from "../components/page-transition"
import { ServiceWorker } from "../components/service-worker"
import "./globals.css"

export const metadata: Metadata = {
  title: "Startside",
  applicationName: "Startside",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Start", statusBarStyle: "default" },
  formatDetection: { telephone: false },
}

// The brand, teal, light and dark (--brand under [data-brand="teal"] in theme.css, as hex from `designsystem-app-icons`'
// brandColours("teal")), for the browser's and the app's bar.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#087c77" },
    { media: "(prefers-color-scheme: dark)", color: "#28a6a0" },
  ],
  viewportFit: "cover",
}

// The default look (the system's light or dark, effects on: there are no settings, and no cookie is read, so a page is the same for
// everyone) is on <html> from the first frame, and the app's hue (guide «Foundations / Brand»): teal, with the glyph `sunrise` in the NavBar and the icons; the hue also
// sets the motion accent, calm and rising. `transitionAttributes()` names the NavBar's current place and <main>, so they move as the page
// changes (guide «Foundations / Motion» §9; `PageTransition` for a change of page inside Next). `Haptics` plays the controls marked
// `data-haptic` (guide «Foundations / Haptics»). `WebAnalytics` is Cloudflare's
// beacon (no cookies), on only with the site token `CF_BEACON_TOKEN`.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb-NO" {...htmlAttributes(DEFAULT_PREFS)} {...brandAttributes("teal")} {...transitionAttributes()}>
      <body>
        <PageTransition>{children}</PageTransition>
        <ServiceWorker />
        <Haptics />
        <WebAnalytics token={env("CF_BEACON_TOKEN")} />
      </body>
    </html>
  )
}
