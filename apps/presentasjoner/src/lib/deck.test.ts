import assert from 'node:assert/strict'
import { test } from 'node:test'

import { formatDate, isCredit, notesMarkdown, paragraphsMarkdown, pdfHeaders, pdfKey, plainText, sortTalks, type Deck, type Talk } from './deck.ts'

const deck = (title: string, date?: string): Deck => ({ title, file: 'tale.pptx', aspect: '16:9', slides: [], ...(date === undefined ? {} : { date }) })

test('paragraphs become a nested list, and a jump of two levels is one', () => {
  assert.equal(paragraphsMarkdown(['Melde skade', ['på mobil', 1], ['ofte stresset', 3], ' ', ['Kjøpe', 0]]), '- Melde skade\n  - på mobil\n    - ofte stresset\n- Kjøpe')
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
  assert.deepEqual(sortTalks(talks).map((talk) => talk.slug), ['c', 'b', 'a'])
})

test('only a talk in the content and its own PDF can be asked for', () => {
  const talks: Talk[] = [{ slug: '2026-frempa', deck: deck('Frempå') }]
  assert.equal(pdfKey(talks, '2026-frempa', 'tale.pdf'), '2026-frempa/tale.pdf')
  assert.equal(pdfKey(talks, '2026-frempa', 'annen.pdf'), null)
  assert.equal(pdfKey(talks, '2026-frempa', 'tale.pptx'), null)
  assert.equal(pdfKey(talks, '..', 'tale.pdf'), null)
})

test('the PDF is a download under its own name, also with letters outside ASCII', () => {
  const headers = pdfHeaders('løsninger.pdf', { httpEtag: '"abc"', size: 42 })
  assert.equal(headers.get('Content-Disposition'), `attachment; filename="l_sninger.pdf"; filename*=UTF-8''l%C3%B8sninger.pdf`)
  assert.equal(headers.get('Content-Type'), 'application/pdf')
  assert.equal(headers.get('ETag'), '"abc"')
})
