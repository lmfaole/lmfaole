/** The env files the scripts read, as every script in the repository reads them (`@lmfaole/worker/env`), and the secrets this Worker needs. */

export { need, parseEnvFile, readEnvFiles } from "@lmfaole/worker/env"

export const SECRETS = ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN", "LASTFM_API_KEY", "LASTFM_API_SECRET", "LASTFM_SESSION_KEY"] as const
