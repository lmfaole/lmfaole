// Whether a cron expression (minute hour day-of-month month day-of-week, in UTC) matches a time. Fields take `*`, `*/n`, `a`, `a-b`, `a-b/n`
// and lists of those; Sunday is 0 or 7.

const FIELDS = [
  { min: 0, max: 59, of: (at: Date) => at.getUTCMinutes() },
  { min: 0, max: 23, of: (at: Date) => at.getUTCHours() },
  { min: 1, max: 31, of: (at: Date) => at.getUTCDate() },
  { min: 1, max: 12, of: (at: Date) => at.getUTCMonth() + 1 },
  { min: 0, max: 7, of: (at: Date) => at.getUTCDay() },
] as const

function values(field: string, min: number, max: number): Set<number> {
  const out = new Set<number>()
  for (const part of field.split(",")) {
    const match = /^(\*|(\d+)(?:-(\d+))?)(?:\/(\d+))?$/.exec(part)
    if (match === null) throw new SyntaxError(`not a cron field: ${field}`)
    const [, all, from, to, step] = match
    const start = all === "*" ? min : Number(from)
    const end = all === "*" || (step !== undefined && to === undefined) ? max : Number(to ?? from)
    if (start < min || end > max || start > end || step === "0") throw new RangeError(`out of range: ${field}`)
    for (let value = start; value <= end; value += Number(step ?? 1)) out.add(value)
  }
  return out
}

export function matches(expression: string, at: Date): boolean {
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5) throw new SyntaxError(`not a cron expression: ${expression}`)
  const [minute, hour, day, month, weekday] = fields.map((field, i) => {
    const { min, max } = FIELDS[i]!
    return values(field, min, max)
  }) as [Set<number>, Set<number>, Set<number>, Set<number>, Set<number>]
  if (weekday.has(7)) weekday.add(0)
  const time = minute.has(at.getUTCMinutes()) && hour.has(at.getUTCHours()) && month.has(at.getUTCMonth() + 1)
  // As in cron: with both days restricted, either may match.
  const dayRestricted = fields[2] !== "*", weekdayRestricted = fields[4] !== "*"
  const dayOk = day.has(at.getUTCDate()), weekdayOk = weekday.has(at.getUTCDay())
  return time && (dayRestricted && weekdayRestricted ? dayOk || weekdayOk : dayOk && weekdayOk)
}
