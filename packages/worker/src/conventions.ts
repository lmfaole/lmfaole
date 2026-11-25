/**
 * What every Worker on lmfaole.party is, an app's or a cron Worker's, and what `npm run new-app` writes: an app is a path of lmfaole.party and nothing
 * else, so the site has one address per page and the apps cannot drift apart; a cron Worker has no address of its own and is called by the one Worker
 * with a cron. The tests hold them to it (`packages/web/src/apps.test.ts` the apps, `scripts/conventions.test.ts` everything). A newer compatibility
 * date is the same change in every Worker at once: here, then in each `wrangler.jsonc`. Pure.
 */

export const ZONE = "lmfaole.party"
export const COMPATIBILITY_DATE = "2026-11-01"
/** The only Worker that may have Cron Triggers (the free plan has five for the account): it calls the others' `scheduled` (workers/scheduler). */
export const CRON_WORKER = "scheduler"

/** JSON with comments (`wrangler.jsonc`): the comments and trailing commas are taken out, the strings (`"…/*"` in a route) are left as they are. */
export function parseJsonc(text: string): unknown {
  const plain = outsideStrings(text, (i) => {
    if (text.startsWith("//", i)) {
      const end = text.indexOf("\n", i)
      return ["", end < 0 ? text.length : end]
    }
    if (text.startsWith("/*", i)) {
      const end = text.indexOf("*/", i + 2)
      return [" ", end < 0 ? text.length : end + 2]
    }
    return [text[i] ?? "", i + 1]
  })
  return JSON.parse(outsideStrings(plain, (i) => [plain[i] === "," && /^\s*[}\]]/.test(plain.slice(i + 1)) ? "" : (plain[i] ?? ""), i + 1]))
}

/** `text` with `step` applied outside its strings: `step` gives what to write for position `i` and where to go on from. */
function outsideStrings(text: string, step: (i: number) => [string, number]): string {
  let out = ""
  for (let i = 0; i < text.length; ) {
    if (text[i] === '"') {
      let j = i + 1
      while (j < text.length && text[j] !== '"') j += text[j] === "\\" ? 2 : 1
      out += text.slice(i, j + 1)
      i = j + 1
    } else {
      const [emit, next] = step(i)
      out += emit
      i = next
    }
  }
  return out
}

/** The routes an app at `base` (`/cv`; empty for the origin's root) may have: its path with and without what is under it, or (the root) the whole origin and `www.`. */
export function allowedRoutes(base: string): string[] {
  return base === "" ? [`${ZONE}/*`, `www.${ZONE}/*`] : [`${ZONE}${base}`, `${ZONE}${base}/*`, `${ZONE}${base}*`]
}

/** What every Worker's `wrangler.jsonc` must say: the shared compatibility date, no preview address, observability on. */
function commonProblems(config: Record<string, unknown>): string[] {
  const problems: string[] = []
  if (config["compatibility_date"] !== COMPATIBILITY_DATE) problems.push(`compatibility_date is not ${COMPATIBILITY_DATE}`)
  if (config["preview_urls"] !== false) problems.push("preview_urls is not false (a preview address)")
  if ((config["observability"] as { enabled?: unknown } | undefined)?.enabled !== true) problems.push("observability is not enabled")
  return problems
}

/** What in an app's `wrangler.jsonc` is not as the conventions say; none, it is. */
export function wranglerProblems(config: Record<string, unknown>, base: string): string[] {
  const problems = commonProblems(config)
  if (!Array.isArray(config["compatibility_flags"]) || !config["compatibility_flags"].includes("nodejs_compat")) problems.push("compatibility_flags has no nodejs_compat")
  if (config["workers_dev"] !== false) problems.push("workers_dev is not false (a workers.dev address)")
  const routes = Array.isArray(config["routes"]) ? (config["routes"] as unknown[]) : []
  const allowed = allowedRoutes(base)
  for (const route of routes) {
    const { pattern, zone_name, custom_domain } = (typeof route === "object" && route !== null ? route : { pattern: route }) as Record<string, unknown>
    if (custom_domain !== undefined) problems.push(`${String(pattern)} is a custom domain`)
    if (zone_name !== ZONE) problems.push(`${String(pattern)} is not in the zone ${ZONE}`)
    if (typeof pattern !== "string" || !allowed.includes(pattern)) problems.push(`${String(pattern)} is not one of ${allowed.join(", ")}`)
  }
  // Every page of the app must reach it, not only its front page.
  const everything = base === "" ? `${ZONE}/*` : `${ZONE}${base}`
  if (!routes.some((route) => typeof route === "object" && route !== null && String((route as { pattern?: unknown }).pattern).startsWith(everything) && String((route as { pattern?: unknown }).pattern).endsWith("*"))) {
    problems.push(`no route takes everything under ${everything}`)
  }
  return problems
}

/**
 * What in a cron Worker's `wrangler.jsonc` (`workers/<name>`) is not as the conventions say; none, it is. It is named after its directory, has no
 * route, says whether it has a workers.dev address (activity's read-only API has one, the others none), and only `CRON_WORKER` has crons: the
 * others say `"crons": []`, so a deploy takes away a cron set by hand in the dashboard.
 */
export function workerProblems(config: Record<string, unknown>, name: string): string[] {
  const problems = commonProblems(config)
  if (config["name"] !== name) problems.push(`name is not ${name}`)
  if (typeof config["workers_dev"] !== "boolean") problems.push("workers_dev is not said (true or false)")
  if (config["routes"] !== undefined || config["route"] !== undefined) problems.push("it has a route (a cron Worker has no address on the zone)")
  const crons = (config["triggers"] as { crons?: unknown } | undefined)?.crons
  if (!Array.isArray(crons)) problems.push('triggers.crons is not said ("crons": [] takes away a cron set elsewhere)')
  else if (name === CRON_WORKER ? crons.length === 0 : crons.length > 0) {
    problems.push(name === CRON_WORKER ? `${CRON_WORKER} has no cron` : `it has a cron (only ${CRON_WORKER} has crons; it calls this one's scheduled)`)
  }
  return problems
}
