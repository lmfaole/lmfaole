/**
 * What form the design system gives the numbers of a slide's chart. Pure, like `deck.ts`: the decision is here so `chart.test.ts` can hold it
 * to the rules, and the drawing is `src/views/SlideCharts.tsx`.
 *
 * The ladder is the design system's own (`designsystem-accessibility`, Charts) and the dataviz skill's «Is it even a chart?»: a handful of
 * headline numbers is no chart but `KeyFigures`; three to ten categories are columns, an area where the author drew a line or an area; over
 * five series or ten categories is past the limit and is not drawn at all, so the slide keeps the picture it has. Several series over the
 * same categories become one chart each, never one chart of several colours: the charts here carry one accent colour and no legend.
 */

import { slideTitle, type Slide, type SlideChart } from './deck.ts'

/** One category and its value, as the design system's charts take them. */
export interface ChartPoint {
  label: string
  value: number
}

/** A chart to draw: one series over its categories, in a card of its own. */
export interface DrawnChart {
  look: 'column' | 'area'
  /** The card's title. */
  title: string
  /** What a value counts: the tooltip's row, the table's value column and the summary's subject. */
  valueLabel: string
  /** The categories run in order (years), so the summary says how it moved and not only which is highest. */
  ordered: boolean
  data: readonly ChartPoint[]
}

/** Numbers too few to draw: each read as itself, with what it counts. */
export interface DrawnFigures {
  look: 'figures'
  figures: readonly ChartPoint[]
}

export type ChartPlan = DrawnChart | DrawnFigures

/** The design system's limits for a chart (Primer, through `designsystem-accessibility`): ten bars, five series. */
const MOST = { categories: 10, series: 5 }

/** Under this many categories the numbers are read one by one, not drawn (the dataviz skill: a handful of headline numbers is no chart). */
const FEWEST_CATEGORIES = 3

/** The most numbers `KeyFigures` holds. */
const MOST_FIGURES = 4

const YEAR = /^(?:19|20)\d{2}$/

const words = (parts: readonly (string | undefined)[]): string => parts.filter((part) => part !== undefined && part !== '').join(', ')

const planOne = (chart: SlideChart, slide: Slide): ChartPlan[] => {
  const { categories, series } = chart
  const name = (one: { name: string }): string => one.name.trim()
  if (series.length > MOST.series || categories.length > MOST.categories) return []
  if (categories.length < FEWEST_CATEGORIES) {
    const figures = series.flatMap((one) =>
      one.values.map((value, index) => ({
        value,
        // What tells the numbers apart: the categories, the series, or both. One number alone is called what the chart or the slide is.
        label: words([categories.length > 1 ? categories[index] : undefined, series.length > 1 ? name(one) : undefined]) || chart.title || slideTitle(slide),
      })),
    )
    // More than four numbers are no longer read at a glance, and too few categories to draw: then the slide keeps the picture it has.
    return figures.length > MOST_FIGURES ? [] : [{ look: 'figures', figures }]
  }
  const look = chart.kind === 'line' || chart.kind === 'area' ? 'area' : 'column'
  return series.map((one) => ({
    look,
    title: words([chart.title, series.length > 1 ? name(one) : undefined]) || name(one) || slideTitle(slide),
    valueLabel: name(one) || 'Verdi',
    ordered: look === 'area' || categories.every((category) => YEAR.test(category)),
    data: categories.map((label, index) => ({ label, value: one.values[index] ?? 0 })),
  }))
}

/** Every chart of the slide, in the order they stand there, each as the form it is drawn in. A chart past the limits gives nothing. */
export const slideCharts = (slide: Slide): ChartPlan[] => (slide.charts ?? []).flatMap((chart) => planOne(chart, slide))
