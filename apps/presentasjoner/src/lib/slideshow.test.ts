import assert from 'node:assert/strict'
import { test } from 'node:test'

import { slideshowDocument, type ShowSlide } from './slideshow.ts'

const slides: ShowSlide[] = [
  { n: 1, title: 'Gamle <UU>-feil', reserve: false, body: '<p>Tekst</p>', notes: '' },
  { n: 2, title: 'Reserve', reserve: true, body: '', notes: '<p>Notat</p>' },
]
const file = slideshowDocument({ title: 'Tale', description: 'Om "UU"', css: '.a{}', slides, backHref: '/presentasjoner/tale/' })

test('every slide is a section with its number, its title escaped and its body', () => {
  assert.match(file, /<section class="show-slide" id="slide-1" data-n="1" data-reserve="false"/)
  assert.match(file, /<h2>Gamle &lt;UU&gt;-feil<\/h2>/)
  assert.match(file, /<p>Tekst<\/p>/)
})

test('a reserve slide says so, and has its notes; a slide without notes has no notes block', () => {
  assert.match(file, /data-reserve="true"[^>]*>.*Reserveslide/s)
  assert.equal(file.match(/class="show-notes"/g)?.length, 1)
})

test('the file is one: the stylesheet and the script inline, and a way back', () => {
  assert.match(file, /<style>\.a\{\}/)
  assert.match(file, /<script>[\s\S]*ArrowRight[\s\S]*<\/script>/)
  assert.match(file, /<a href="\/presentasjoner\/tale\/">Til oversikten<\/a>/)
  assert.doesNotMatch(file, /<link|src="http/)
  assert.match(file, /content="Om &quot;UU&quot;"/)
})
