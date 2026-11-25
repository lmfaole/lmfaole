/** A new Astro app at https://lmfaole.party/<name>/, made as the others are (`@lmfaole/web`, `@lmfaole/designsystem`): `apps/<name>` with its config,
 *  Worker (`<name>`, the routes `lmfaole.party/<name>` and `lmfaole.party/<name>/*`), a front page and a 404, the security headers and their test, the
 *  design system's skills, its docs; its workflow `.github/workflows/<name>.yml` (which calls `astro-app.yml`) and its row in the README. Nothing is
 *  installed, built or deployed: `npm install` at the root next, then the app's own checks.
 *
 *  A name that is taken is refused: an app, package or Worker of that name, a workflow, a page of the front page, or a path another Worker's route takes
 *  (`/medier*` takes `/medierx` too).
 *
 *  node scripts/new-app.ts <name> [--description "…"] [--title "…"] */

import { execFileSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

import { COMPATIBILITY_DATE, parseJsonc, ZONE } from "@lmfaole/worker/conventions"
import { headersFile } from "@lmfaole/web/headers"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const WEB = join(ROOT, "packages/web")

export const NAME = /^[a-z][a-z0-9-]*$/

interface Manifest {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const readJson = <T>(file: string): T => JSON.parse(readFileSync(file, "utf8")) as T
const sorted = (record: Record<string, string>): Record<string, string> => Object.fromEntries(Object.entries(record).toSorted(([a], [b]) => a.localeCompare(b)))

/** A TypeScript string in single quotes. */
const quoted = (text: string): string => `'${text.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`

/** `notater` → `Notater`, `mine-lister` → `Mine lister`. */
export const titleOf = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1).replaceAll("-", " ")

/** Every `wrangler.jsonc` of the repository, but in `node_modules` and what is built. */
function wranglerConfigs(dir: string = ROOT): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "dist") continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...wranglerConfigs(path))
    else if (entry.name === "wrangler.jsonc") found.push(path)
  }
  return found
}

/** Whether a route's pattern takes an address: `*` at the end takes everything that begins with what is before it. */
export const routeTakes = (pattern: string, address: string): boolean => (pattern.endsWith("*") ? address.startsWith(pattern.slice(0, -1)) : address === pattern)

/** Why `name` cannot be a new app; none, it can. */
export function refusal(name: string): string | null {
  if (!NAME.test(name)) return `«${name}» is not a name: a lowercase letter, then lowercase letters, digits and hyphens ([a-z][a-z0-9-]*)`
  for (const dir of ["apps", "packages", "workers"]) if (existsSync(join(ROOT, dir, name))) return `${dir}/${name} is there already`
  if (existsSync(join(ROOT, ".github/workflows", `${name}.yml`))) return `.github/workflows/${name}.yml is there already`
  if (readdirSync(join(ROOT, "apps/forside/src/pages")).some((page) => page.replace(/\.(astro|ts)$/, "") === name)) return `/${name} is a page of the front page (apps/forside)`
  for (const file of wranglerConfigs()) {
    const config = parseJsonc(readFileSync(file, "utf8")) as { name?: string; routes?: ({ pattern?: string } | string)[] }
    const where = file.slice(ROOT.length + 1)
    if (config.name === name) return `the Worker ${name} is there already (${where})`
    for (const route of config.routes ?? []) {
      const pattern = typeof route === "string" ? route : (route.pattern ?? "")
      // `lmfaole.party/*` is the front page's, which every app's more specific routes win over.
      if (pattern === `${ZONE}/*` || !pattern.startsWith(`${ZONE}/`)) continue
      for (const address of [`${ZONE}/${name}`, `${ZONE}/${name}/`]) if (routeTakes(pattern, address)) return `${ZONE}/${name} is taken by the route ${pattern} (${where})`
    }
  }
  return null
}

/** The files of the app, by their path in `apps/<name>`. */
export function appFiles(name: string, title: string, description: string): Record<string, string> {
  const web = readJson<Manifest>(join(WEB, "package.json"))
  // The apps have one wrangler (`apps.test.ts` in packages/web holds them to it): the new one takes theirs.
  const wrangler = readdirSync(join(ROOT, "apps"))
    .map((app) => join(ROOT, "apps", app, "package.json"))
    .filter((file) => existsSync(file))
    .map((file) => readJson<Manifest>(file))
    .find((manifest) => manifest.dependencies?.["@lmfaole/web"] !== undefined)?.dependencies?.["wrangler"]
  if (wrangler === undefined) throw new Error("no app uses @lmfaole/web, so there is no wrangler version to take")
  const manifest = {
    name,
    private: true,
    type: "module",
    description,
    engines: { node: ">=24" },
    scripts: {
      dev: "astro dev",
      build: "astro build",
      preview: "astro build && wrangler dev",
      deploy: "astro build && wrangler deploy",
      test: "node --test",
      typecheck: "tsc --noEmit",
      skills: "designsystem-skills",
      "skills:check": "designsystem-skills --check",
    },
    dependencies: sorted({ ...web.dependencies, "@lmfaole/web": "*", wrangler }),
    devDependencies: sorted({ ...web.devDependencies }),
  }
  const base = `/${name}`
  return {
    "package.json": `${JSON.stringify(manifest, null, 2)}\n`,
    "astro.config.ts": `import { appConfig } from '@lmfaole/web/config'

// ${title} at https://${ZONE}${base}/ on Cloudflare Workers (the routes \`${ZONE}${base}\` and \`${ZONE}${base}/*\` in wrangler.jsonc). The origin is shared with
// the other apps, so everything of the site is under the base \`${base}/\`; it has no cookies and no service worker.
export default appConfig({ base: '${base}' })
`,
    "wrangler.jsonc": `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "${name}",
  "compatibility_date": "${COMPATIBILITY_DATE}",
  "compatibility_flags": ["nodejs_compat"],
  // Only the zone's routes: no workers.dev or preview address, and no custom domain, so the site has one address.
  "workers_dev": false,
  "preview_urls": false,
  "observability": { "enabled": true },
  // Paths of ${ZONE}: \`forside\` owns \`${ZONE}/*\`, and these two are more specific, so they reach this Worker.
  "routes": [
    { "pattern": "${ZONE}${base}", "zone_name": "${ZONE}" },
    { "pattern": "${ZONE}${base}/*", "zone_name": "${ZONE}" }
  ]
}
`,
    "tsconfig.json": `{\n  "extends": "@lmfaole/web/tsconfig.app.json"\n}\n`,
    ".gitignore": "node_modules/\ndist/\n.astro/\n.dev.vars\n.wrangler/\n",
    "CLAUDE.md": "@AGENTS.md\n",
    "src/env.d.ts": `/// <reference types="@lmfaole/web/env" />\n`,
    "src/middleware.ts": `import { secured } from '@lmfaole/web/middleware'

/** Every answer of the Worker (the 404) gets the security headers; a built page has them from \`public/_headers\`. */
export const onRequest = secured((_context, next) => next())
`,
    "src/headers.test.ts": `import { testHeadersFile } from '@lmfaole/web/testing'

testHeadersFile(new URL('../public/_headers', import.meta.url), '${base}/*')
`,
    "src/pages/index.astro": `---
export const prerender = true
// \`${base}/\`: the front page of ${title}. Built ahead of time.
import { PageHeader } from '@lmfaole/designsystem/components/page-header'
import Document from '@lmfaole/web/Document.astro'

const TITLE = ${quoted(title)}
const DESCRIPTION = ${quoted(description)}
---

<Document title={TITLE} description={DESCRIPTION} url={new URL(import.meta.env.BASE_URL, Astro.site).href}>
  <PageHeader title={TITLE} description={DESCRIPTION} />
</Document>
`,
    "src/pages/404.astro": `---
// An address under \`${base}/\` that no page owns, back to the front page of the app.
import NotFound from '@lmfaole/web/NotFound.astro'
---

<NotFound app={${quoted(title)}} />
`,
    "public/_headers": headersFile(`${base}/*`, `The same security headers as the Worker's answers (\`@lmfaole/web/headers\`, checked by \`src/headers.test.ts\`). Only \`${base}\` and \`${base}/*\` reach this Worker.`),
    "AGENTS.md": `# AGENTS.md

${title} at <https://${ZONE}${base}/>, Astro on Cloudflare Workers. Read \`README.md\` first.

- UI follows the design system's skills in \`.claude/skills/\` (\`npm run skills\`, checked in CI): components and tokens only, no \`className\`, \`style\` or
  stylesheet of our own, Norwegian bokmål on screen.
- The Worker is named \`${name}\` and has the routes \`${ZONE}${base}\` and \`${ZONE}${base}/*\` only: never a custom domain.
- Everything of the site is under the base \`${base}/\` (\`import.meta.env.BASE_URL\`, never a hard-coded \`/…\`), on an origin shared with other apps: no cookies,
  no service worker.
- What every app shares is \`@lmfaole/web\` (\`packages/web\`): the Astro config, the document and the 404, the security headers, the middleware, the tsconfig.
  Change it there, for every app, not here; what is this app's own stays here.
- Security headers: \`@lmfaole/web/headers\` and \`public/_headers\` say the same (\`src/headers.test.ts\` checks it).
- Check before saying done: \`npm test\`, \`npm run typecheck\`, \`npm run build\`, and \`npm run preview\` to see the Worker as it runs.

## Git: work on main

- Everything is committed straight to \`main\` and pushed. Before a push, the checks above pass. Never \`--force\`.
- The design system is the workspace \`packages/designsystem\` of this repository (\`"@lmfaole/designsystem": "*"\`); after a change to its skills, \`npm run skills\` brings them in step.
`,
    "README.md": `# ${name}

${description}

- Astro på Cloudflare Workers. Workeren heter \`${name}\` og har rutene \`${ZONE}${base}\` og \`${ZONE}${base}/*\` (\`wrangler.jsonc\`). \`forside\` eier
  \`${ZONE}/*\`, men rutene her er mer spesifikke og vinner. Alt ligger under Astros \`base\` \`${base}\`.
- Oppsettet appene deler (Astro-konfigurasjonen, dokumentet og 404-siden, sikkerhetshodene, tsconfig) kommer fra \`@lmfaole/web\` (\`packages/web\`).
- Ingen informasjonskapsler og ingen service worker.
- Sikkerhetshodene står i \`@lmfaole/web/headers\` (Workerens svar) og \`public/_headers\` (de bygde filene). En test passer på at de er like.

## Utvikling

\`\`\`sh
npm install          # i roten av repoet
npm run dev          # astro dev
npm test             # node --test
npm run typecheck
npm run build
npm run preview      # bygger og kjører Workeren lokalt (wrangler dev)
\`\`\`

En push til \`main\` som rører appen, bygges og publiseres av \`.github/workflows/${name}.yml\` (stegene er \`astro-app.yml\` sine).
`,
  }
}

/** The app's workflow: when it runs, and the steps of `astro-app.yml`. */
export const workflow = (name: string, title: string): string => {
  const paths = `[apps/${name}/**, packages/designsystem/**, packages/web/**, packages/worker/**, package-lock.json, .github/workflows/${name}.yml, .github/workflows/astro-app.yml]`
  return `name: ${name}

# Every push that touches the app is tested, type-checked and built; a push to the default branch, or a manual run, is also deployed to
# Cloudflare Workers (the Worker \`${name}\`, ${ZONE}/${name} and ${ZONE}/${name}/*: ${title}). The steps are \`astro-app.yml\`'s.
on:
  push:
    paths: ${paths}
  pull_request:
    paths: ${paths}
  workflow_dispatch:

concurrency:
  group: ${name}-\${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  build:
    uses: ./.github/workflows/astro-app.yml
    with:
      app: apps/${name}
    secrets: inherit
`
}

/** The README with a row for the app in its table, among the other apps in order. */
export function withReadmeRow(readme: string, name: string, description: string): string {
  const lines = readme.split("\n")
  const row = `| \`apps/${name}\` | ${description} (Astro on Workers) | ${ZONE}/${name} |`
  const apps = lines.flatMap((line, i) => (line.startsWith("| `apps/") ? [i] : []))
  if (apps.length === 0) throw new Error("README.md has no row of an app to put the new one next to")
  const after = apps.filter((i) => (lines[i] ?? "") < row).at(-1)
  lines.splice(after === undefined ? apps[0]! : after + 1, 0, row)
  return lines.join("\n")
}

function main(): void {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: { description: { type: "string" }, title: { type: "string" } } })
  const name = positionals[0]
  if (name === undefined || positionals.length > 1) {
    console.error('node scripts/new-app.ts <name> [--description "…"] [--title "…"]')
    process.exit(2)
  }
  const why = refusal(name)
  if (why !== null) {
    console.error(`new-app: ${why}`)
    process.exit(1)
  }
  const title = values.title ?? titleOf(name)
  const description = values.description ?? `${title} på ${ZONE}/${name}/`
  const app = join(ROOT, "apps", name)
  for (const [path, text] of Object.entries(appFiles(name, title, description))) {
    mkdirSync(dirname(join(app, path)), { recursive: true })
    writeFileSync(join(app, path), text)
  }
  copyFileSync(join(WEB, "assets/favicon.ico"), join(app, "public/favicon.ico"))
  writeFileSync(join(ROOT, ".github/workflows", `${name}.yml`), workflow(name, title))
  writeFileSync(join(ROOT, "README.md"), withReadmeRow(readFileSync(join(ROOT, "README.md"), "utf8"), name, description))
  // The design system's skills, as every app has them (`npm run skills:check` in CI).
  execFileSync("npm", ["run", "skills", "--silent"], { cwd: app, stdio: "inherit" })
  console.log(`apps/${name}: made, with .github/workflows/${name}.yml and a row in README.md.

Next: npm install (at the root), then in apps/${name}: npm test, npm run typecheck, npm run build, npm run preview.
The first deploy is the workflow's, on a push to main; ${ZONE}/${name} is the Worker's from then on.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
