import assert from 'node:assert/strict'
import { test } from 'node:test'

import { canonicalUrl, movedTo } from './moved-paths.ts'

test('an old path goes to its app under /medier/', () => {
  assert.equal(movedTo('/media'), '/medier/')
  assert.equal(movedTo('/alle-apper/'), '/medier/')
  assert.equal(movedTo('/musikk'), '/medier/musikk/')
  assert.equal(movedTo('/musikk/charts'), '/medier/musikk/')
  assert.equal(movedTo('/film/film/t10138-9fc97556'), '/medier/film/')
})

test('a path that never moved, or went away, is left alone', () => {
  for (const pathname of ['/', '/kilder', '/cv', '/musikken', '/filmer', '/podkast', '/rss', '/about']) assert.equal(movedTo(pathname), null, pathname)
})

test('www goes to the same address on lmfaole.party, and lmfaole.party is left alone', () => {
  assert.equal(canonicalUrl(new URL('https://www.lmfaole.party/')), 'https://lmfaole.party/')
  assert.equal(canonicalUrl(new URL('https://www.lmfaole.party/cv/?a=1')), 'https://lmfaole.party/cv/?a=1')
  assert.equal(canonicalUrl(new URL('https://lmfaole.party/')), null)
})
