/**
 * `npm run auth -- <env files> [--only spotify|lastfm]`: signs in once to Spotify (to read the liked songs) and Last.fm (to love tracks), and writes the refresh token and the
 * session key to `.sync.env` (not committed, mode 600). It prints no token. The files have SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI (a loopback address
 * registered in the Spotify dashboard, `http://127.0.0.1:<port>/…`), LASTFM_API_KEY and LASTFM_API_SECRET (https://www.last.fm/api/accounts).
 */

import { randomBytes } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { createServer } from "node:http"

import { API_URL, authUrl, errorCode, signedBody } from "../src/lastfm.ts"
import { authorizeUrl, codeRequest, parseToken } from "../src/spotify.ts"
import { need, parseEnvFile, readEnvFiles } from "./env.ts"

const args = process.argv.slice(2)
const onlyAt = args.indexOf("--only")
const only = onlyAt === -1 ? null : args[onlyAt + 1]
const files = args.filter((arg, at) => !arg.startsWith("--") && (onlyAt === -1 || at !== onlyAt + 1))
if (files.length === 0) {
  console.error("usage: npm run auth -- <env files> [--only spotify|lastfm]")
  process.exit(2)
}
const values = readEnvFiles(files)
const out = existsSync(".sync.env") ? parseEnvFile(readFileSync(".sync.env", "utf8")) : new Map<string, string>()
/** After each sign-in, so one that fails later does not lose the other's token. */
const save = (): void => writeFileSync(".sync.env", `${[...out].map(([name, value]) => `${name}=${value}`).join("\n")}\n`, { mode: 0o600 })

async function spotify(): Promise<void> {
  const env = need(values, ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REDIRECT_URI"])
  const address = new URL(env.SPOTIFY_REDIRECT_URI)
  if (address.hostname !== "127.0.0.1" && address.hostname !== "[::1]") {
    console.error("SPOTIFY_REDIRECT_URI must be a loopback address (127.0.0.1): Spotify does not allow localhost")
    process.exit(2)
  }
  const state = randomBytes(16).toString("hex")
  console.log(`Spotify: open this address and approve:\n\n${authorizeUrl(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_REDIRECT_URI, state)}\n`)
  const code = await new Promise<string>((resolve, reject) => {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", env.SPOTIFY_REDIRECT_URI)
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
  const request = codeRequest(env.SPOTIFY_CLIENT_ID, env.SPOTIFY_CLIENT_SECRET, code, env.SPOTIFY_REDIRECT_URI)
  const answer = await fetch(request.url, { method: request.method, headers: request.headers, body: request.body })
  const token = parseToken(await answer.json())
  if (!answer.ok || token?.refreshToken == null) throw new Error(`Spotify gave no refresh token (${answer.status})`)
  out.set("SPOTIFY_REFRESH_TOKEN", token.refreshToken)
  console.log("Spotify: done.")
}

async function lastfmCall(params: Record<string, string>, secret: string): Promise<Record<string, unknown>> {
  const answer = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: signedBody(params, secret) })
  return (await answer.json()) as Record<string, unknown>
}

/** Last.fm's desktop sign-in: a token, approved in the browser, swapped for a session key that does not run out. */
async function lastfm(): Promise<void> {
  const env = need(values, ["LASTFM_API_KEY", "LASTFM_API_SECRET"])
  const got = await lastfmCall({ method: "auth.getToken", api_key: env.LASTFM_API_KEY }, env.LASTFM_API_SECRET)
  const token = typeof got["token"] === "string" ? got["token"] : ""
  if (token === "") throw new Error(`Last.fm gave no token (error ${errorCode(got) ?? "none"})`)
  console.log(`Last.fm: open this address and approve (waiting up to ten minutes):\n\n${authUrl(env.LASTFM_API_KEY, token)}\n`)
  for (let tries = 0; tries < 200; tries++) {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    const answer = await lastfmCall({ method: "auth.getSession", api_key: env.LASTFM_API_KEY, token }, env.LASTFM_API_SECRET)
    const session = answer["session"] as { key?: unknown } | undefined
    if (typeof session?.key === "string") {
      out.set("LASTFM_SESSION_KEY", session.key)
      console.log("Last.fm: done.")
      return
    }
    // 14: not approved yet. Anything else (15: the token ran out) ends it.
    if (errorCode(answer) !== 14) throw new Error(`Last.fm gave no session (error ${errorCode(answer) ?? "none"})`)
  }
  throw new Error("Last.fm: not approved in ten minutes")
}

if (only !== "lastfm") {
  await spotify()
  save()
}
if (only !== "spotify") {
  await lastfm()
  save()
}
console.log("Written to .sync.env. Next: npm run secrets -- <the env files> .sync.env")
