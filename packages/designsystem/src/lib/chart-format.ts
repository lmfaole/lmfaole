const NUMBER = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 2 })

/**
 * A value as a chart says it, in a tooltip, a table or a label: Norwegian grouping and decimal comma, and a real minus (U+2212). The locale is named,
 * never the runtime's, so the server and the browser agree and a tooltip agrees with the table.
 */
export function formatChartValue(value: number): string {
  return NUMBER.format(value)
}

/** The most labels an axis of categories shows; more, and every nth is labelled. */
const MOST_LABELS = 8

/** Which labels a category axis shows: every one up to eight, then every nth (24 hours: every 3rd, 12 months: every 2nd). Every value is in the table. */
export function labelStep(count: number): number {
  return Math.max(1, Math.ceil(count / MOST_LABELS))
}
