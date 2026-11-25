/**
 * `npm run spotify:auth -- <env file>`: signs in to Spotify once, so the site can search Spotify (artist pictures, album and track links). The file has `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` and
 * `SPOTIFY_REDIRECT_URI` (a loopback address registered in the Spotify dashboard, `http://127.0.0.1:<port>/…`; `localhost` is not allowed): the monorepo's
 * `secrets/music-sync.env` has them. It prints the address to approve at, waits for the browser to come back to the redirect address, swaps the code for the refresh
 * token and writes it to `.spotify.env` (not committed, mode 600). It prints no token. The token lasts six months: run this again then.
 */

import { randomBytes } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"

import { parseEnvFile } from "../src/lib/settings.ts"
import { authorizeUrl, codeRequest, parseRefreshToken } from "../src/lib/spotify.ts"

const [file] = process.argv.slice(2)
if (file === undefined) {
  console.error("usage: node scripts/spotify-auth.ts <env file with SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI>")
  process.exit(2)
}
const values = parseEnvFile(readFileSync(file, "utf8"))
const clientId = values.get("SPOTIFY_CLIENT_ID") ?? ""
const secret = values.get("SPOTIFY_CLIENT_SECRET") ?? ""
const redirect = values.get("SPOTIFY_REDIRECT_URI") ?? ""
if (clientId === "" || secret === "" || redirect === "") {
  console.error("the file must have SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and SPOTIFY_REDIRECT_URI")
  process.exit(2)
}
const address = new URL(redirect)
if (address.hostname !== "127.0.0.1" && address.hostname !== "[::1]") {
  console.error("SPOTIFY_REDIRECT_URI must be a loopback address (127.0.0.1): Spotify does not allow localhost")
  process.exit(2)
}

const state = randomBytes(16).toString("hex")
console.log(`Open this address and approve:\n\n${authorizeUrl(clientId, redirect, state)}\n`)

const code = await new Promise<string>((resolve, reject) => {
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", redirect)
    if (url.pathname !== address.pathname) {
      response.writeHead(404).end()
      return
    }
    const got = url.searchParams.get("code")
    const ok = got !== null && url.searchParams.get("state") === state
    response.writeHead(ok ? 200 : 400, { "Content-Type": "text/plain; charset=utf-8" }).end(ok ? "Ferdig. Du kan lukke denne fanen." : "Noe gikk galt. Prøv igjen.")
    server.close()
    if (ok) resolve(got)
    else reject(new Error(url.searchParams.get("error") ?? "the answer did not carry the state we sent"))
  })
  server.listen(Number(address.port), address.hostname)
})

const request = codeRequest(clientId, secret, code, redirect)
const answer = await fetch(request.url, { method: request.method, headers: request.headers, body: request.body })
const token = parseRefreshToken(await answer.json())
if (!answer.ok || token === null) {
  console.error(`Spotify did not give a refresh token (${answer.status})`)
  process.exit(1)
}
writeFileSync(".spotify.env", `SPOTIFY_REFRESH_TOKEN=${token}\n`, { mode: 0o600 })
console.log("Written to .spotify.env. Next: npm run settings:push -- <the env files> .spotify.env")
