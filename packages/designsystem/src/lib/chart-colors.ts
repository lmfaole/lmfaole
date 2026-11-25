/**
 * The grey steps of a chart: the foreground at falling strength, laid over the page, for what is not the point (the other columns beside a
 * picked-out one). Each step keeps 3:1 against the page and the card in light and dark (`theme-contrast.test.ts` checks it).
 */
export const GREY_STEPS = [100, 66, 44] as const

export const greyStep = (share: number): string => `color-mix(in oklab, var(--foreground) ${share}%, transparent)`

/** The strengths of the four heat steps: the lightest keeps 3:1 against the page like the other default steps, and no step is told apart by colour alone (a title, the table and the numbers say it). */
export const HEAT_SHADES = [44, 60, 80, 100] as const

/** The fill of a heat step; 0 is nothing and has no fill, only a faint edge. */
export const heatColour = (level: number): string | undefined => {
  const share = HEAT_SHADES[level - 1]
  return share === undefined ? undefined : greyStep(share)
}
