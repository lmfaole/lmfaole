import assert from 'node:assert/strict'
import { test } from 'node:test'

import { movedTo } from './moved-paths.ts'

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
