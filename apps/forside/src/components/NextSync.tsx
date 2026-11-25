// The next time a source is fetched, worked out with the reader's clock: nothing before the page has mounted, so the first
// render is the same on the server and in the browser, and a reader without scripts sees the rhythm beside it.
import { useEffect, useState } from 'react'

import { describeNext, nextRun, type Schedule } from '../lib/next-sync'

/** The reader's clock, read once after the page has mounted; none before. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => setNow(new Date()), [])
  return now
}

/** The time of the next fetch of a schedule, «i morgen 04:00»; a dash for a source asked only when a page is shown, and nothing before the clock is read. */
export function nextText(schedule: Schedule | null, now: Date | null): string | null {
  if (schedule === null) return '–'
  return now === null ? null : describeNext(nextRun(schedule, now), now)
}

/** The nearest next time of several schedules, with the instant for ordering; none before the clock is read. */
export function nearest(schedules: readonly Schedule[], now: Date | null): { text: string | null; at: number } {
  if (now === null || schedules.length === 0) return { text: schedules.length === 0 ? '–' : null, at: Infinity }
  const next = schedules.map((schedule) => nextRun(schedule, now)).reduce((first, time) => (time < first ? time : first))
  return { text: describeNext(next, now), at: next.getTime() }
}
