import { getCloudflareContext } from "@opennextjs/cloudflare"

import type { GateEnv } from "./access-gate"
import type { D1 } from "./log-db"
import { KINDS, type LogDatabase, type LogKind } from "./log"

/** The Worker's bindings the log uses (wrangler.jsonc), as the app sees them: there are no Workers types here, so they are described by what is used. */
export type LogEnv = GateEnv & Partial<Record<LogDatabase, D1>>

/** The Worker's bindings, or none in `next dev` (no Worker, no D1: the log needs `npm run preview`). */
export function logEnv(): LogEnv {
  try {
    return getCloudflareContext().env as unknown as LogEnv
  } catch {
    return {}
  }
}

/** The database a kind is kept in, or `null` where the binding is missing. */
export function logDatabase(kind: LogKind, env: LogEnv = logEnv()): D1 | null {
  return env[KINDS[kind].db] ?? null
}

/** Why the database is not there, for «Detaljer» under the error. */
export const missingDatabase = (kind: LogKind): Error => new Error(`Ingen D1-binding ${KINDS[kind].db} (wrangler.jsonc). Lokalt trengs \`npm run preview\`, ikke \`next dev\`.`)
