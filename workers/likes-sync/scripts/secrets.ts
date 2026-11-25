/** `npm run secrets -- <env files> [--dry-run]`: the Worker's six secrets from the env files (later files win) to `wrangler secret bulk`, on stdin. It prints names only. */

import { spawnSync } from "node:child_process"

import { need, readEnvFiles, SECRETS } from "./env.ts"

const args = process.argv.slice(2)
const files = args.filter((arg) => !arg.startsWith("--"))
if (files.length === 0) {
  console.error("usage: npm run secrets -- <env files> [--dry-run]")
  process.exit(2)
}
const secrets = need(readEnvFiles(files), SECRETS)
console.log(`setting ${Object.keys(secrets).join(", ")}`)
if (!args.includes("--dry-run")) {
  const run = spawnSync("npx", ["wrangler", "secret", "bulk"], { input: JSON.stringify(secrets), stdio: ["pipe", "inherit", "inherit"] })
  process.exit(run.status ?? 1)
}
