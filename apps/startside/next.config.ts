import type { NextConfig } from "next"

const config: NextConfig = {
  // Served at lmfaole.party/start, next to the static front page.
  basePath: "/start",
  // The design system ships as TypeScript source, so Next has to compile it.
  transpilePackages: ["@lmfaole/designsystem"],
  // The departures page became Transport; Ny musikk (Spotify) is gone. The base path is put in front of both sides.
  async redirects() {
    return [
      { source: "/avganger", destination: "/transport", permanent: true },
      { source: "/musikk", destination: "/", permanent: false },
      { source: "/brukernavn", destination: "/innstillinger/konto", permanent: true },
    ]
  },
}

export default config
