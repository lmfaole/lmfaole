import { formatChartValue } from "../lib/chart-format"
import type { ChartRow } from "../lib/chart-rows"
import { Disclosure } from "./disclosure"

/**
 * The exact values a chart only draws, as a table anyone can open («Vis tallene»): the chart itself takes no keyboard focus and a tooltip
 * is for a pointer, so the numbers are there for a screen reader and for a reader who has no pointer (a phone). Always there under every
 * chart; the W3C asks that the long description is for everyone.
 */
export function ChartTable({ caption, columns, rows }: { caption: string; columns: readonly string[]; rows: readonly ChartRow[] }) {
  return (
    <Disclosure summary="Vis tallene">
      <table className="w-full border-collapse text-left text-sm tabular-nums">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="text-muted-foreground py-1 pr-4 text-xs font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <th scope="row" className="py-1 pr-4 font-normal">
                {row[0]}
              </th>
              {row.slice(1).map((value, column) => (
                <td key={column} className="py-1 pr-4">
                  {typeof value === "number" ? formatChartValue(value) : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Disclosure>
  )
}
