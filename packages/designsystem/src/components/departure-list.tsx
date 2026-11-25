import { STRETCHED_ROW } from "../lib/link-style"
import { departureTimeline, shownDelay, type BoardDeparture, type TimedDeparture } from "../lib/departures"
import { DepartureDelay, LineDestination, type LineRef } from "./departure-board"
import { Icon } from "./icon"
import { LineBadge } from "./line-badge"
import { StatusLine } from "./status-line"
import { Text } from "./text"

export interface DepartureListProps {
  departures: readonly BoardDeparture[]
  /** The time now (ISO), from the server, as for `DepartureBoard`. */
  now: string
  /** What to say when nothing leaves. */
  emptyMessage?: string
  /** The page of one line from the stop: each departure's destination links to it, and the whole row is its target, as on `DepartureBoard`. */
  lineHref?: (line: LineRef) => string
}

const HOUR = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" })

/** The departures by the Oslo hour they leave in, in order. */
function byHour(departures: readonly TimedDeparture[]): { hour: string; departures: TimedDeparture[] }[] {
  const hours: { hour: string; departures: TimedDeparture[] }[] = []
  for (const departure of departures) {
    const hour = HOUR.format(new Date(departure.expected))
    const last = hours.at(-1)
    if (last?.hour === hour) last.departures.push(departure)
    else hours.push({ hour, departures: [departure] })
  }
  return hours
}

/**
 * Every departure from a stop in the order they leave, as a printed timetable at the stop is read but with the real-time times: the stop's own page,
 * where `DepartureBoard` (the next few of each line) links to. Under a heading for each hour («kl. 14», an `<h3>` under a page's section), a row for each departure: the time (a count
 * while it is near and known in real time, else the clock), the line's badge and the destination, and under them the platform, the delay with the
 * timetable's time struck, «Rutetid» for a time that is not real time, «Innstilt» struck, and a deviation. Rendered on the server with no script.
 * With `lineHref` each row is a link to its line's page: the destination is the one link a screen reader hears, but a tap anywhere on the row follows it.
 * To narrow it to a line, filter the departures (`FilterChips` above it, one chip per line).
 */
export function DepartureList({ departures, now, emptyMessage = "Ingen avganger den nærmeste tiden.", lineHref }: DepartureListProps) {
  const hours = byHour(departureTimeline(departures, Date.parse(now)))
  if (hours.length === 0)
    return (
      <Text role="quiet">
        {emptyMessage}
      </Text>
    )
  return (
    <div className="grid gap-6">
      {hours.map(({ hour, departures: inHour }, index) => (
        <div key={`${index}-${hour}`} className="grid gap-1">
          <h3 className="text-muted-foreground border-b pb-1 text-sm font-semibold tabular-nums">
            kl. {hour}
          </h3>
          <ol className="divide-border grid grid-cols-[auto_auto_minmax(0,1fr)] gap-x-3 divide-y">
            {inHour.map((departure) => (
              <Departure key={departure.key} departure={departure} href={lineHref?.(departure)} />
            ))}
          </ol>
        </div>
      ))}
    </div>
  )
}

function Departure({ departure, href }: { departure: TimedDeparture; href: string | undefined }) {
  const cancelled = departure.cancelled === true
  const time = (
    <time dateTime={departure.expected} className="font-semibold tabular-nums">
      {departure.label}
    </time>
  )
  const meta = [departure.quay === undefined || departure.quay === "" ? null : `${departure.mode === "rail" ? "Spor" : "Plattform"} ${departure.quay}`, departure.realtime ? null : "Rutetid"].filter((part) => part !== null)
  return (
    <li className={`col-span-full grid grid-cols-subgrid items-baseline gap-y-1 py-2.5 ${href === undefined ? "" : STRETCHED_ROW}`}>
      <span className="min-w-[3.25rem] text-right">{cancelled ? <s className="text-muted-foreground">{time}</s> : time}</span>
      <span className="self-start" {...(href === undefined ? {} : { "aria-hidden": true })}>
        <LineBadge line={departure.line} mode={departure.mode} size="sm" />
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span className={`line-clamp-2 font-medium [overflow-wrap:anywhere] ${cancelled ? "text-muted-foreground" : ""}`}>
          <LineDestination line={departure} href={href}>
            <span className="sr-only">mot </span>
            {departure.destination}
          </LineDestination>
        </span>
        {cancelled || meta.length > 0 || shownDelay(departure.delay) ? (
          <span className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
            {cancelled ? (
              <span className="text-destructive inline-flex items-center gap-1 font-medium">
                <Icon name="cancelled" size="sm" tone="destructive" />
                Innstilt
              </span>
            ) : null}
            {!cancelled && shownDelay(departure.delay) && departure.aimed !== undefined ? <DepartureDelay departure={departure} /> : null}
            {meta.map((part) => (
              <span key={part}>{part}</span>
            ))}
          </span>
        ) : null}
        {departure.notice === undefined || departure.notice === "" ? null : <StatusLine items={[{ text: departure.notice, icon: "warning" }]} />}
      </span>
    </li>
  )
}
