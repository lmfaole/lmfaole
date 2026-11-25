/**
 * `npm run backfill -- <env files>`: loves every liked song on Last.fm from this machine (no limit of 50 subrequests), then leaves the cursor in the deployed Worker's KV, so its
 * weekly runs go on from there. Run it once, after the first deploy. Without the remote cursor it starts from the oldest liked song; with it, it does what a run does, unlimited.
 */

import { spawnSync } from "node:child_process"

import { sync, type Store } from "../src/sync.ts"
import { need, readEnvFiles, SECRETS } from "./env.ts"

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error("usage: npm run backfill -- <env files>")
  process.exit(2)
}
const env = need(readEnvFiles(files), SECRETS)

const wrangler = (args: string[], quiet = false): { status: number | null; stdout: string } => {
  const run = spawnSync("npx", ["wrangler", "kv", "key", ...args, "--binding", "STATE", "--remote"], { encoding: "utf8", stdio: ["ignore", "pipe", quiet ? "ignore" : "inherit"] })
  return { status: run.status, stdout: run.stdout }
}

/** The deployed Worker's KV namespace, through wrangler. A key that is not there is a 404, so a read says nothing. */
const remote: Store = {
  async get(key) {
    const run = wrangler(["get", key, "--text"], true)
    const value = run.stdout.trim()
    return run.status !== 0 || value === "" || value === "Value not found" ? null : value
  },
  async put(key, value) {
    if (wrangler(["put", key, value]).status !== 0) throw new Error(`could not write ${key} to the Worker's KV`)
  },
}

const result = await sync(env, remote, { limit: Infinity, noCursor: "all", maxPages: 1000, pause: 250, fetch, log: console.log })
console.log(`cursor now ${result.cursor ?? "none"}`)
