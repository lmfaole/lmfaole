/**
 * A new key for the relay and the apps that ask it, with no ask refused on the way (`src/rotation.ts`, README «Nøkkelen»):
 *
 *   npm run rotate-key -w workers/relay [-- --dry-run] [--also <worker>]…
 *
 * `--also` gives the key to one more Worker, after the apps (the old relay `startside-upstream`, while the deployed startside still asks it).
 * The key is made here and goes to `wrangler secret put` on stdin: it is never printed, written to a file or put on a command line. `wrangler` is signed in
 * (`npx wrangler login`, or `CLOUDFLARE_API_TOKEN`). A step that fails stops the rest; run it again for a new key (every step only needs the new one).
 */

import { execFileSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { setTimeout as sleep } from "node:timers/promises"

import { CLIENTS, rotation } from "../src/rotation.ts"

/** Long enough for a new version of a Worker to be the one that answers everywhere. */
const SETTLE_MS = 20_000

const args = process.argv.slice(2)
const dry = args.includes("--dry-run")
const also = args.flatMap((word, i) => (word === "--also" && args[i + 1] !== undefined ? [args[i + 1] as string] : []))
const key = randomBytes(32).toString("hex")
const config = new URL("../wrangler.jsonc", import.meta.url).pathname

for (const step of rotation([...CLIENTS, ...also])) {
  if (step.do === "wait") {
    console.log(`wait ${SETTLE_MS / 1000} s`)
    if (!dry) await sleep(SETTLE_MS)
    continue
  }
  const where = step.worker === null ? ["--config", config] : ["--name", step.worker]
  console.log(`${step.do} ${step.secret} on ${step.worker ?? "the relay"}${dry ? " (dry run)" : ""}`)
  if (dry) continue
  execFileSync("npx", ["wrangler", "secret", step.do, step.secret, ...where], { input: step.do === "put" ? key : "y\n", stdio: ["pipe", "ignore", "inherit"] })
}
