/** The env files the scripts read (`.env`, `.dev.vars`): `NAME=value` lines, `export` allowed, `#` comments (a line, or after a space in an unquoted
 *  value), quotes taken off; later files win. For scripts run with node, never for a Worker. */

import { readFileSync } from "node:fs"

export function parseEnvFile(text: string): Map<string, string> {
  const values = new Map<string, string>()
  for (const line of text.split("\n")) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line)
    if (match === null) continue
    const [, name = "", raw = ""] = match
    values.set(name, /^(["']).*\1$/.test(raw) ? raw.slice(1, -1) : raw.replace(/\s+#.*$/, ""))
  }
  return values
}

export function readEnvFiles(files: readonly string[]): Map<string, string> {
  const values = new Map<string, string>()
  for (const file of files) for (const [name, value] of parseEnvFile(readFileSync(file, "utf8"))) values.set(name, value)
  return values
}

/** The named values, or the process ends saying which are missing (never what any value is). */
export function need<const Name extends string>(values: ReadonlyMap<string, string>, names: readonly Name[]): Record<Name, string> {
  const missing = names.filter((name) => (values.get(name) ?? "") === "")
  if (missing.length > 0) {
    console.error(`missing in the env files: ${missing.join(", ")}`)
    process.exit(2)
  }
  return Object.fromEntries(names.map((name) => [name, values.get(name) ?? ""])) as Record<Name, string>
}
