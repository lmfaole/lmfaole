import type { ReactNode } from "react";

/** One of the few numbers that say most to the reader: the number, and what it counts. */
export interface KeyFigure {
  /** The number as it is read, formatted («10 903», «22 %», «08:32»). */
  value: string;
  /** What it counts, in a few words after the number («avspillinger», «soloppgang»). */
  label: string;
  /**
   * How the number moved, word-sized beside it: a `Sparkline`. A box of the sparkline's size is kept for it from the first paint, so one that comes later (a server island, the slot's
   * fallback empty) moves nothing.
   */
  trend?: ReactNode;
}

/** The figures, each its number above what it counts. A `<dl>`, so a screen reader hears what is counted before the number. */
export function FigureList({ figures, across }: { figures: readonly KeyFigure[]; across: boolean }) {
  return (
    <dl className={across ? "flex flex-wrap gap-x-8 gap-y-3" : "grid content-center gap-3 @xl:flex @xl:flex-wrap @xl:gap-x-8"}>
      {figures.map((figure) => (
        <div key={figure.label} className="flex min-w-0 flex-col-reverse gap-0.5">
          <dt className="text-sm [overflow-wrap:anywhere]">{figure.label}</dt>
          <dd className="font-heading flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-semibold tracking-tight tabular-nums @xl:text-3xl">
            <span>{figure.value}</span>
            {figure.trend === undefined || figure.trend === null ? null : <span className="inline-flex h-6 w-24 shrink-0 items-center">{figure.trend}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Two to four numbers that say most about a section, large and across, each above the few words of what it counts: the sunrise, the sunset and the
 * daylight; the price now and the cheapest hours. They stand first in their section, above the chart that shows the shape behind them, and take the
 * place of a sentence that would say the same («Sola står opp kl. 08:32 …»): a figure is read at a glance, a sentence is read along. Each number is
 * said here and not again in the section; the chart's summary and table say the rest.
 */
export function KeyFigures({ figures }: { figures: readonly KeyFigure[] }) {
  if (figures.length === 0) return null;
  return (
    <div className="@container">
      <FigureList figures={figures} across />
    </div>
  );
}
