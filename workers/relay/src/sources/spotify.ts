// Spotify, for both apps: the Web API with the access token that comes with the ask, and the one POST that gets one (`accounts.spotify.com/api/token`, a form
// with the client's own sign-in: a refresh token or a code swapped for an access token). The relay holds no key of Spotify's; the app's sign-in passes through.

import { MEDIER_AGENT, type Source } from "../source.ts"

const SIGN_IN = ["authorization", "content-type"] as const

export const SPOTIFY: Readonly<Record<string, Source>> = {
  "api.spotify.com": { for: "medier, startside", agent: MEDIER_AGENT, forward: SIGN_IN },
  "accounts.spotify.com": { for: "medier, startside", agent: MEDIER_AGENT, forward: SIGN_IN, post: { "api/token": "form" }, postOnly: true },
}
