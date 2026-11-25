import { strict as assert } from "node:assert"
import { test } from "node:test"

import { parseEnvFile, plan, required, SETTINGS } from "./settings.ts"

test("an env file is read as the sync tools write it", () => {
  const values = parseEnvFile('# keys\nLASTFM_API_KEY=abc\nexport TRAKT_CLIENT_ID="c1d"\n  \nBROKEN LINE\nEMPTY=\n')
  assert.deepEqual([...values], [["LASTFM_API_KEY", "abc"], ["TRAKT_CLIENT_ID", "c1d"], ["EMPTY", ""]])
})

test("push sets what it finds and names what it lacks; nothing else in the files is taken", () => {
  const { set, missing } = plan(SETTINGS, new Map([["LASTFM_API_KEY", "k"], ["DISCOGS_KEY", "not ours"], ["TRAKT_CLIENT_ID", ""]]))
  assert.deepEqual(set.map(({ setting, value }) => [setting.name, value]), [["LASTFM_API_KEY", "k"]])
  assert.ok(missing.some((setting) => setting.name === "TRAKT_CLIENT_ID"))
  assert.ok(!missing.some((setting) => setting.name === "DISCOGS_KEY"))
})

test("what is optional (Spotify, the posters, the relay's address beside its binding) or made by the push (the relay's key) is not required of the files", () => {
  const names = required(SETTINGS).map((setting) => setting.name)
  assert.ok(!names.some((name) => name.startsWith("SPOTIFY_") || name === "TMDB_API_KEY" || name === "UPSTREAM_KEY" || name === "UPSTREAM_URL"))
  assert.ok(names.includes("LASTFM_API_KEY") && names.includes("CLOUDFLARE_API_TOKEN"))
})
