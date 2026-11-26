import assert from 'node:assert/strict'
import { test } from 'node:test'

import { slideCharts } from './chart.ts'
import type { Slide, SlideChart } from './deck.ts'

const slide = (charts: SlideChart[], title: string | null = 'De vanligste feilene'): Slide => ({ n: 6, layout: 'Innhold', title, charts })

const six: SlideChart = {
  kind: 'column',
  categories: ['Alt-tekst', 'Kontrast', 'Tomme lenker', 'Skjemaetiketter', 'Tomme knapper', 'Språk'],
  series: [{ name: 'Andel forsider', values: [83.9, 66.1, 48.2, 44.6, 28.2, 13.5] }],
}

test('a slide with no charts plans nothing', () => {
  assert.deepEqual(slideCharts({ n: 1, layout: 'Forside', title: 'Tittel' }), [])
})

test('categories enough to compare become columns, named by the series', () => {
  assert.deepEqual(slideCharts(slide([six])), [
    {
      look: 'column',
      title: 'Andel forsider',
      valueLabel: 'Andel forsider',
      ordered: false,
      data: [
        { label: 'Alt-tekst', value: 83.9 },
        { label: 'Kontrast', value: 66.1 },
        { label: 'Tomme lenker', value: 48.2 },
        { label: 'Skjemaetiketter', value: 44.6 },
        { label: 'Tomme knapper', value: 28.2 },
        { label: 'Språk', value: 13.5 },
      ],
    },
  ])
})

test('a chart the author drew as a line is an area, and reads as a movement', () => {
  const [plan] = slideCharts(slide([{ ...six, kind: 'line' }]))
  assert.equal(plan?.look, 'area')
  assert.equal(plan?.look === 'area' && plan.ordered, true)
})

test('columns over years read as a movement too', () => {
  const [plan] = slideCharts(slide([{ kind: 'column', categories: ['2019', '2022', '2026'], series: [{ name: 'Feil', values: [1, 2, 3] }] }]))
  assert.equal(plan?.look, 'column')
  assert.equal(plan?.look === 'column' && plan.ordered, true)
})

test('every series gets a chart of its own, called by the chart and by itself', () => {
  const plans = slideCharts(
    slide([
      {
        kind: 'column',
        title: 'Feil per forside',
        categories: ['2019', '2022', '2026'],
        series: [
          { name: 'Med ARIA', values: [51, 56.1, 59.1] },
          { name: 'Uten ARIA', values: [40, 41, 42] },
        ],
      },
    ]),
  )
  assert.deepEqual(
    plans.map((plan) => (plan.look === 'figures' ? null : plan.title)),
    ['Feil per forside, Med ARIA', 'Feil per forside, Uten ARIA'],
  )
})

test('too few categories to compare are read as themselves, not drawn', () => {
  assert.deepEqual(slideCharts(slide([{ kind: 'pie', categories: ['Funnet', 'Oversett'], series: [{ name: 'Barrierer', values: [101, 42] }] }])), [
    {
      look: 'figures',
      figures: [
        { label: 'Funnet', value: 101 },
        { label: 'Oversett', value: 42 },
      ],
    },
  ])
})

test('a number is called by both the category and the series when both tell them apart', () => {
  const plans = slideCharts(
    slide([
      {
        kind: 'bar',
        categories: ['2019', '2026'],
        series: [
          { name: 'Med ARIA', values: [51, 59.1] },
          { name: 'Uten ARIA', values: [40, 42] },
        ],
      },
    ]),
  )
  assert.deepEqual(plans[0]?.look === 'figures' ? plans[0].figures.map((figure) => figure.label) : null, [
    '2019, Med ARIA',
    '2026, Med ARIA',
    '2019, Uten ARIA',
    '2026, Uten ARIA',
  ])
})

test('one number alone is called what the chart is, or the slide', () => {
  assert.deepEqual(slideCharts(slide([{ kind: 'other', title: 'Barrierer i alt', categories: ['Alle'], series: [{ name: '', values: [143] }] }])), [
    { look: 'figures', figures: [{ label: 'Barrierer i alt', value: 143 }] },
  ])
  assert.deepEqual(slideCharts(slide([{ kind: 'other', categories: ['Alle'], series: [{ name: '', values: [143] }] }])), [
    { look: 'figures', figures: [{ label: 'De vanligste feilene', value: 143 }] },
  ])
})

test('more numbers than are read at a glance, but too few categories to draw, give nothing', () => {
  const chart: SlideChart = {
    kind: 'column',
    categories: ['Før', 'Etter'],
    series: [
      { name: 'En', values: [1, 2] },
      { name: 'To', values: [3, 4] },
      { name: 'Tre', values: [5, 6] },
    ],
  }
  assert.deepEqual(slideCharts(slide([chart])), [])
})

test('a chart past the design system’s limits is not drawn, so the slide keeps its picture', () => {
  const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']
  const series = (name: string) => ({ name, values: years.map(() => 1) })
  assert.deepEqual(slideCharts(slide([{ kind: 'line', categories: years, series: ['En', 'To', 'Tre', 'Fire', 'Fem', 'Seks'].map(series) }])), [])
  assert.deepEqual(slideCharts(slide([{ kind: 'column', categories: [...years, '2027', '2028', '2029'], series: [series('En')] }])), [])
})

test('a layout stands in for a slide with no title', () => {
  const plans = slideCharts(slide([{ kind: 'column', categories: ['A', 'B', 'C'], series: [{ name: '', values: [1, 2, 3] }] }], null))
  assert.deepEqual(
    plans.map((plan) => (plan.look === 'figures' ? null : [plan.title, plan.valueLabel])),
    [['Innhold', 'Verdi']],
  )
})
