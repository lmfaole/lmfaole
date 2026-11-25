/**
 * The site's settings (`src/lib/settings.ts`).
 *
 *   npm run settings:push -- <env file>… [--dry-run]   sets each setting found in the files: a Worker's with `wrangler secret put` (the site's Worker; the relay's too for the
 *                                         key they share), a repository's with the GitHub CLI (`gh`). The value goes in on stdin, never on the command line, and is never printed.
 *
 * The files are the private monorepo's, e.g. `secrets/music-sync.env` and `secrets/film-sync.env`, and `.spotify.env` from `npm run spotify:auth`: only the names listed there are taken.
 * The Worker must exist before it has secrets: deploy once first (the workflow does it on a push to main), then push the settings. `wrangler` is signed in with
 * `CLOUDFLARE_API_TOKEN` in the environment, or `npx wrangler login`.
 */

import { execFileSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import { readFileSync } from "node:fs"

import { parseEnvFile, plan, required, SETTINGS } from "../src/lib/settings.ts"

const REPOSITORY = process.env["GITHUB_REPOSITORY"] ?? "lmfaole/medier"
const [command, ...rest] = process.argv.slice(2)
const dry = rest.includes("--dry-run")
const files = rest.filter((word) => word !== "--dry-run")

function put(name: string, value: string, where: "worker" | "github", config?: string): void {
  if (dry) return
  const [program, args] =
    where === "github" ? (["gh", ["secret", "set", name, "--repo", REPOSITORY]] as const) : (["npx", ["wrangler", "secret", "put", name, ...(config === undefined ? [] : ["--config", config])]] as const)
  execFileSync(program, args, { input: value, stdio: ["pipe", "ignore", "inherit"] })
}

if (command === "push" && files.length > 0) {
  const values = new Map(files.flatMap((file) => [...parseEnvFile(readFileSync(file, "utf8"))]))
  const { set, missing } = plan(SETTINGS, values)
  if (!values.has("UPSTREAM_KEY")) {
    values.set("UPSTREAM_KEY", randomBytes(32).toString("hex"))
    console.log("UPSTREAM_KEY: made, and set on the site and on the relay")
  }
  for (const { setting, value } of set) {
    const where = setting.deploy === true ? "github" : setting.where
    put(setting.name, value, where)
    console.log(`${where} ${setting.name}: ${dry ? "would be set" : "set"}`)
    if (setting.name === "UPSTREAM_KEY") put(setting.name, value, "worker", "upstream/wrangler.jsonc")
  }
  const made = values.get("UPSTREAM_KEY")
  if (made !== undefined && !set.some(({ setting }) => setting.name === "UPSTREAM_KEY")) {
    put("UPSTREAM_KEY", made, "worker")
    put("UPSTREAM_KEY", made, "worker", "upstream/wrangler.jsonc")
  }
  for (const setting of missing) if (setting.name !== "UPSTREAM_KEY") console.log(`${setting.where} ${setting.name}: not in the files${setting.optional === true ? ", and optional" : ""} (${setting.about})`)
  if (required(missing).length > 0) process.exitCode = 1
} else {
  console.error("usage: node scripts/settings.ts push <env file>… [--dry-run]")
  process.exit(2)
}
