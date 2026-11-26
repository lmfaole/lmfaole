// Puts each talk's generic deck and PDF (content/<slug>/nedlasting/) in public/_nedlasting/<slug>/, which the build ships with the site as static
// files. The Worker reads them from there (src/lib/download.ts) and sends them as downloads; the R2 bucket is only the fallback.
// Run before every build (package.json). public/_nedlasting/ is a copy and is ignored by git.
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const target = join(root, 'public', '_nedlasting')
rmSync(target, { recursive: true, force: true })

let count = 0
for (const slug of readdirSync(join(root, 'content'))) {
  const from = join(root, 'content', slug, 'nedlasting')
  if (!existsSync(from)) continue
  cpSync(from, join(target, slug), { recursive: true })
  count += readdirSync(from).length
}
console.log(`downloads: ${count} files in public/_nedlasting/`)
