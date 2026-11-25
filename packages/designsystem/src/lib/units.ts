/**
 * A length measured in the browser (a pointer's travel, a box's height) as rem, so no length the design system writes is in pixels.
 * The root's font size is read each time, so the length stays right when the reader has set a larger text size; 16 outside a browser.
 */
export function toRem(measured: number, root: number = rootFontSize()): string {
  return `${Number((measured / root).toFixed(4))}rem`
}

function rootFontSize(): number {
  if (typeof document === "undefined") return 16
  const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(size) && size > 0 ? size : 16
}
