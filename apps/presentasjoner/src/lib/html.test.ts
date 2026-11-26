import assert from 'node:assert/strict'
import { test } from 'node:test'

import { escapeHtml, htmlDocument } from './html.ts'

test('text of ours is never read as markup', () => {
  assert.equal(escapeHtml('<script>«Må vi?» & "ja"'), '&lt;script&gt;«Må vi?» &amp; &quot;ja&quot;')
})

test('the document is one file: the head, the stylesheet inline and the markup', () => {
  const file = htmlDocument({ title: 'Gamle UU-feil', description: 'Om KI og UU', css: '.text-sm{font-size:1rem}', body: '<h1>Gamle UU-feil</h1>' })
  assert.match(file, /^<!doctype html>\n<html lang="nb">\n/)
  assert.match(file, /<title>Gamle UU-feil<\/title>/)
  assert.match(file, /<meta name="description" content="Om KI og UU">/)
  assert.match(file, /<style>\.text-sm\{font-size:1rem\}<\/style>/)
  assert.match(file, /<body><h1>Gamle UU-feil<\/h1><\/body>/)
  assert.doesNotMatch(file, /<link|<script/)
})

test('a talk without a summary has no description', () => {
  assert.doesNotMatch(htmlDocument({ title: 'Tale', css: '', body: '' }), /description/)
})
