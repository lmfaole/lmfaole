// Puts the built static files (.open-next/assets) into a module the Worker imports, so a deploy uploads one script and
// no separate assets: `worker.mjs` serves them. They are small (fonts, CSS and the Next chunks).
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { extname, join, relative } from "node:path"

const root = ".open-next/assets"
const TYPES = {
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
}

const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : [path]
  })

const assets = Object.fromEntries(
  files(root).map((path) => [
    `/${relative(root, path).split("\\").join("/")}`,
    { type: TYPES[extname(path)] ?? "application/octet-stream", body: readFileSync(path).toString("base64") },
  ]),
)
writeFileSync(".open-next/embedded-assets.mjs", `export default ${JSON.stringify(assets)}\n`)
console.log(`Embedded ${Object.keys(assets).length} static files`)
