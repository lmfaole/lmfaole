/**
 * When a source is next fetched, from the scheduler's crons (`workers/scheduler/src/jobs.ts`), which are in UTC; shown in Norwegian time.
 * Pure, so the page can run it in the browser with the reader's clock.
 */

/** `hours` (UTC) at `minute` every day, or on one `weekday` (UTC, 0 is Sunday) only. */
export interface Schedule {
  hours: readonly number[]
  minute: number
  weekday?: number
}

const EVERY_THREE_HOURS = [0, 3, 6, 9, 12, 15, 18, 21] as const
/** Every third hour, on the hour or at `minute` past (the activity cron). */
export const everyThreeHours = (minute: number): Schedule => ({ hours: EVERY_THREE_HOURS, minute })
/** One run a week, on `weekday` at `hour`:`minute` (UTC). */
export const weekly = (weekday: number, hour: number, minute: number): Schedule => ({ hours: [hour], minute, weekday })

const ZONE = 'Europe/Oslo'
const DAY = new Intl.DateTimeFormat('en-CA', { timeZone: ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
const WEEKDAY = new Intl.DateTimeFormat('nb-NO', { timeZone: ZONE, weekday: 'long' })
const CLOCK = new Intl.DateTimeFormat('nb-NO', { timeZone: ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })

/** The first run after `now`, searching a week and a day ahead. */
export function nextRun(schedule: Schedule, now: Date): Date {
  for (let offset = 0; offset <= 8; offset++) {
    const day = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset)
    if (schedule.weekday !== undefined && new Date(day).getUTCDay() !== schedule.weekday) continue
    for (const hour of schedule.hours) {
      const at = new Date(day + (hour * 60 + schedule.minute) * 60_000)
      if (at.getTime() > now.getTime()) return at
    }
  }
  throw new Error('a schedule has no run in the next nine days')
}

/** «i dag 04:15», «i morgen 04:15» or «mandag 06:00», in Norwegian time. */
export function describeNext(next: Date, now: Date): string {
  const tomorrow = new Date(now.getTime() + 86_400_000)
  const day = DAY.format(next)
  const when = day === DAY.format(now) ? 'i dag' : day === DAY.format(tomorrow) ? 'i morgen' : WEEKDAY.format(next)
  return `${when} ${CLOCK.format(next)}`
}
