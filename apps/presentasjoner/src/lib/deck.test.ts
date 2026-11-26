import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  deckFileName,
  downloadHeaders,
  fileKey,
  formatDate,
  isCredit,
  notesMarkdown,
  paragraphsMarkdown,
  plainText,
  sortTalks,
  talkDownloads,
  talkView,
  textHeaders,
  type Deck,
  type Talk,
} from './deck.ts'

const deck = (title: string, date?: string): Deck => ({ title, file: 'tale.pptx', aspect: '16:9', slides: [], ...(date === undefined ? {} : { date }) })

test('paragraphs become a nested list, and a jump of two levels is one', () => {
  assert.equal(
    paragraphsMarkdown(['Melde skade', ['på mobil', 1], ['ofte stresset', 3], ' ', ['Kjøpe', 0]]),
    '- Melde skade\n  - på mobil\n    - ofte stresset\n- Kjøpe',
  )
})

test('the words of a slide are never read as Markdown', () => {
  assert.equal(paragraphsMarkdown(['1. *Zoom* 200 % [lenke](x)']), '- 1\\. \\*Zoom\\* 200 \\% \\[lenke\\]\\(x\\)')
})

test('one paragraph at the outermost level is plain words, more is a list', () => {
  assert.equal(plainText(['Ole Jørgen Bakken, Fremtind', '']), 'Ole Jørgen Bakken, Fremtind')
  assert.equal(plainText([['Innrykket', 1]]), null)
  assert.equal(plainText(['En', 'To']), null)
})

test('a credit of a picture is told from the other text boxes', () => {
  assert.equal(isCredit(['Foto: Santeri Viinamäki, CC BY-SA 4.0']), true)
  assert.equal(isCredit(['95,9 %', 'av forsidene']), false)
})

test('the notes leave out their time, keep their points and mark their labels', () => {
  assert.equal(
    notesMarkdown('[0:40–1:10]\nHOVEDPOENG: Det som teller.\nTALL OG KILDE: WebAIM\n- «Må vi?» Ja.\n- Nei'),
    '**HOVEDPOENG:** Det som teller\\.\n\n**TALL OG KILDE:** WebAIM\n\n- «Må vi\\?» Ja\\.\n- Nei',
  )
})

test('a day is written out in Norwegian', () => {
  assert.equal(formatDate('2026-11-27'), '27. november 2026')
})

test('the newest talk comes first, one without a day last', () => {
  const talks: Talk[] = [
    { slug: 'a', deck: deck('Uten dag') },
    { slug: 'b', deck: deck('Eldre', '2025-03-01') },
    { slug: 'c', deck: deck('Nyere', '2026-11-27') },
  ]
  assert.deepEqual(
    sortTalks(talks).map((talk) => talk.slug),
    ['c', 'b', 'a'],
  )
})

test('a talk has the same name in every format', () => {
  assert.equal(deckFileName({ file: 'tale.pptx' }, 'pdf'), 'tale.pdf')
  assert.equal(deckFileName({ file: 'tale.pptx' }, 'pptx'), 'tale.pptx')
  assert.equal(deckFileName({ file: 'tale.pptx' }, 'html'), 'tale.html')
})

test('the three downloads are every format, under the talk’s address', () => {
  assert.deepEqual(talkDownloads({ file: 'tale.pptx' }, '/presentasjoner/2026-frempa/'), [
    { label: 'Last ned PDF', href: '/presentasjoner/2026-frempa/tale.pdf' },
    { label: 'Last ned PowerPoint', href: '/presentasjoner/2026-frempa/tale.pptx' },
    { label: 'Last ned HTML', href: '/presentasjoner/2026-frempa/tale.html' },
  ])
})

test('only a talk in the content and its own file can be asked for', () => {
  const talks: Talk[] = [{ slug: '2026-frempa', deck: deck('Frempå') }]
  assert.equal(fileKey(talks, '2026-frempa', 'tale', 'pdf'), '2026-frempa/tale.pdf')
  assert.equal(fileKey(talks, '2026-frempa', 'tale', 'pptx'), '2026-frempa/tale.pptx')
  assert.equal(fileKey(talks, '2026-frempa', 'annen', 'pdf'), null)
  assert.equal(fileKey(talks, '..', 'tale', 'pdf'), null)
})

test('an endpoint hands out its own format only, whatever the address asks for', () => {
  const talks: Talk[] = [{ slug: '2026-frempa', deck: deck('Frempå') }]
  // `/2026-frempa/tale.pdf.pptx` is the .pptx endpoint asked for a PDF key: the name it builds is `tale.pdf.pptx`, which is no talk's.
  assert.equal(fileKey(talks, '2026-frempa', 'tale.pdf', 'pptx'), null)
  assert.equal(fileKey(talks, '2026-frempa', 'tale.pptx', 'pdf'), null)
})

test('a file from the bucket is a download under its own name, also with letters outside ASCII', () => {
  const headers = downloadHeaders('løsninger.pdf', 'pdf', { httpEtag: '"abc"', size: 42 })
  assert.equal(headers.get('Content-Disposition'), `attachment; filename="l_sninger.pdf"; filename*=UTF-8''l%C3%B8sninger.pdf`)
  assert.equal(headers.get('Content-Type'), 'application/pdf')
  assert.equal(headers.get('Content-Length'), '42')
  assert.equal(headers.get('ETag'), '"abc"')
})

test('a made file is as long as its bytes, not its characters', () => {
  const headers = textHeaders('løsninger.html', 'html', '<p>Løsninger</p>')
  assert.equal(headers.get('Content-Length'), '17')
  assert.equal(headers.get('Content-Type'), 'text/html; charset=utf-8')
  assert.equal(headers.get('ETag'), null)
})

test('a file is saved unless it is asked for to be read here, and then it is the same file under the same name', () => {
  const saved = textHeaders('løsninger.html', 'html', '<p>Løsninger</p>')
  const shown = textHeaders('løsninger.html', 'html', '<p>Løsninger</p>', 'inline')
  assert.match(saved.get('Content-Disposition') ?? '', /^attachment; filename="l_sninger.html"/)
  assert.match(shown.get('Content-Disposition') ?? '', /^inline; filename="l_sninger.html"/)
  assert.equal(shown.get('Content-Length'), saved.get('Content-Length'))
  assert.equal(shown.get('Content-Type'), saved.get('Content-Type'))
})

test('reading a talk in the browser is the HTML file itself, asked for with ?vis', () => {
  assert.deepEqual(talkView({ file: 'tale.pptx' }, '/presentasjoner/2026-frempa/'), {
    label: 'Se som slideshow',
    href: '/presentasjoner/2026-frempa/tale.html?vis',
  })
})
