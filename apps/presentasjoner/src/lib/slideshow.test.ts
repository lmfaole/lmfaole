import assert from 'node:assert/strict'
import { test } from 'node:test'

import { slideshowDocument, type ShowSlide } from './slideshow.ts'

const slides: ShowSlide[] = [
  { n: 1, title: 'Gamle <UU>-feil', reserve: false, layout: 'content', kicker: 'Linje', body: '<p>Tekst</p>', side: '<svg></svg>', foot: '<p>Kilde</p>', notes: '' },
  { n: 2, title: 'Reserve', reserve: true, layout: 'section-dark', kicker: '', body: '', side: '', foot: '', notes: '<p>Notat</p>' },
]
const file = slideshowDocument({ title: 'Tale', description: 'Om "UU"', css: '.a{}', slides, backHref: '/presentasjoner/tale/' })

test('every slide is a section with its number, its title escaped and its body', () => {
  assert.match(file, /<section class="show-slide" id="slide-1" data-n="1" data-reserve="false"/)
  assert.match(file, /<h2>Gamle &lt;UU&gt;-feil<\/h2>/)
  assert.match(file, /<p>Tekst<\/p>/)
})

test('a reserve slide says so, and has its notes; a slide without notes has no notes block', () => {
  assert.match(file, /data-reserve="true"[^>]*>.*<p class="show-kicker">Reserve<\/p>/s)
  assert.equal(file.match(/class="show-notes"/g)?.length, 1)
})

test('the file is one: the stylesheet and the script inline, and a way back', () => {
  assert.match(file, /<style>\.a\{\}/)
  assert.match(file, /<script>[\s\S]*ArrowRight[\s\S]*<\/script>/)
  assert.match(file, /<a href="\/presentasjoner\/tale\/">Til oversikten<\/a>/)
  assert.doesNotMatch(file, /<link|src="http/)
  assert.match(file, /content="Om &quot;UU&quot;"/)
})

test('the overview lists every slide as an anchor, and the move respects reduced motion', () => {
  assert.match(file, /<dialog class="show-overview" data-overlay="wide"[\s\S]*<a href="#1"><small>1<\/small><span>Gamle &lt;UU&gt;-feil<\/span><\/a>[\s\S]*<a href="#2"><small>R2<\/small>/)
  assert.match(file, /scroll-snap-type:x mandatory/)
  assert.doesNotMatch(file, /view-transition/)
  assert.match(file, /@supports selector\(::scroll-button\(\*\)\)[\s\S]*scroll-marker-group:after[\s\S]*::scroll-button\(right\)/)
  assert.match(file, /prefers-reduced-motion:reduce/)
})

test('the slide is a 16:9 stage that scales with the window, and its parts rise into place without a fade', () => {
  assert.match(file, /aspect-ratio:16\/9/)
  assert.match(file, /html\.js\{font-size:max\(12px,calc\(min\(100vw,100dvh\*16\/9\)\/60\)\)\}/)
  assert.match(file, /<div class="show-stage" data-layout="content"><p class="show-kicker">Linje<\/p><h2>[\s\S]*<div class="show-content"><p>Tekst<\/p><\/div><div class="show-side"><svg><\/svg><\/div><footer class="show-foot"><p>Kilde<\/p><\/footer><\/div><\/section>/)
  assert.match(file, /@keyframes show-rise\{from\{transform:translateY\(1\.25rem\)\}\}/)
})
