import { meterText, percentOf } from "../lib/progress"
import { Text } from "./text"

/**
 * A value against a goal or a limit: a listening goal, a disk, a backlog read. The label is always visible and so is the value, in words, so the bar
 * never stands alone and colour is not used. A bar, never a round gauge. It is read as a meter (`role="meter"` with its value and range). Not for a task that is
 * waiting (`Skeleton`, or text) and not for several parts of a whole (`SummaryBar`).
 */
export function Progress({ label, value, max = 100, valueText }: { label: string; value: number; max?: number; /** The value in words, as it is shown («93 % full», «12 av 40»). Without it the percentage is shown. */ valueText?: string }) {
  const clamped = Math.min(Math.max(value, 0), max)
  const percent = percentOf(value, max)
  const words = meterText(valueText, value, max, undefined)
  return (
    <div className="grid gap-1">
      <div className="flex items-baseline justify-between gap-4">
        <Text role="quiet">{label}</Text>
        <p className="text-muted-foreground min-w-0 text-sm tabular-nums">
          {words}
        </p>
      </div>
      <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={clamped} aria-valuetext={words} className="bg-muted h-2 rounded-full">
        <div className="bg-foreground h-full rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
