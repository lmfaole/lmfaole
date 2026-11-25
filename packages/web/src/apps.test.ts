// Every app that uses this package (`apps/*` with `@lmfaole/web` among its dependencies) is made the same way: its Worker as `conventions.ts` says, its Astro
// config `appConfig`, its tsconfig this package's, its Astro, React, Tailwind and TypeScript the versions this package is written for, and one wrangler for all.
// A change to one of them that leaves the others behind fails here.
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'

import { parseJsonc, wranglerProblems } from './conventions.ts'

const APPS = new URL('../../../apps/', import.meta.url)
const OWN = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as Manifest

interface Manifest {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}
const read = (app: string, file: string): string => readFileSync(new URL(`${app}/${file}`, APPS), 'utf8')

const apps = readdirSync(APPS).filter((app) => {
  if (!existsSync(new URL(`${app}/package.json`, APPS))) return false
  const { dependencies = {} } = JSON.parse(read(app, 'package.json')) as Manifest
  return '@lmfaole/web' in dependencies
})

test('there are apps that use the package', () => {
  assert.ok(apps.length > 0)
})

for (const app of apps) {
  test(`${app}: the Worker, the Astro config and the tsconfig are the shared ones`, () => {
    const config = read(app, 'astro.config.ts')
    assert.match(config, /export default appConfig\(/, 'astro.config.ts exports appConfig(…)')
    const base = /\bbase: '([^']+)'/.exec(config)?.[1] ?? ''
    assert.deepEqual(wranglerProblems(parseJsonc(read(app, 'wrangler.jsonc')) as Record<string, unknown>, base), [])
    assert.equal((JSON.parse(read(app, 'tsconfig.json')) as { extends?: string }).extends, '@lmfaole/web/tsconfig.app.json')
  })
}

test('every app has the versions of this package’s dependencies, and the same wrangler', () => {
  const wranglers = new Set<string | undefined>()
  for (const app of apps) {
    const manifest = JSON.parse(read(app, 'package.json')) as Manifest
    for (const kind of ['dependencies', 'devDependencies'] as const) {
      for (const [name, version] of Object.entries(OWN[kind] ?? {})) assert.equal(manifest[kind]?.[name], version, `${app}: ${kind}.${name}`)
    }
    wranglers.add(manifest.dependencies?.['wrangler'])
  }
  assert.equal(wranglers.size, 1, `one wrangler: ${[...wranglers].join(', ')}`)
})
