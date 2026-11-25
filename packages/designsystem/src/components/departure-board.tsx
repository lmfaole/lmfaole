import { clock, delayText, groupDepartures, MODE_NAMES, shownDelay, stopMeta, stripPosition, stripTicks, type BoardDeparture, type DepartureGroup, type TimedDeparture, type TransitMode, type WalkStatus } from "../lib/departures"
import { ENTITY_LINK, STRETCHED_LINK, STRETCHED_ROW } from "../lib/link-style"
import { Icon } from "./icon"
import { LineBadge } from "./line-badge"
import { ContinuationLink, type Continuation } from "./page-section"
import { osmLink, type LatLon, type TileSource } from "../lib/map-tiles"
import { MapThumb } from "./internal/map-thumb"
import { StatusLine } from "./status-line"
import { CardHeading, Text } from "./text"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

import type { ReactNode } from "react"

export type { BoardDeparture, TransitMode } from "../lib/departures"

export interface DepartureBoardProps {
  /** The stop's name: the card's heading. */
  stop: string
  /** The time now (ISO), from the server: the board never reads the clock, so it renders the same on the server and in the browser. */
  now: string
  departures: readonly BoardDeparture[]
  /** Minutes on foot to the stop: the board then says when to leave, and dims what cannot be reached. */
  walkMinutes?: number
  /** Metres to the stop, in the header. */
  distance?: number
  /** At most this many rows (a line to one destination each), the soonest you can catch first. */
  limit?: number
  /** Where the stop is: a map of the streets round it across the top of the card, with a pin on the stop, linked to openstreetmap.org. */
  at?: LatLon
  /** Where the reader is: a dot on the map when it falls inside it. */
  from?: LatLon
  /** Where the map's tiles come from; OpenStreetMap's own by default (`MapThumb`). */
  tiles?: TileSource
  /** The stop's own page, with all its departures (`DepartureList`): a link at the foot of the card, under all the rows («Se alle avganger fra Carl Berners plass»). */
  continues?: Continuation
  /** The page of one line from this stop: the row's destination becomes a link to it, named with the line («Buss 31 mot Fornebu»), and a tap anywhere on the row follows it. */
  lineHref?: (line: LineRef) => string
}

/** A line to one destination, as a row of the board or the list has it: what `lineHref` is given. */
export interface LineRef {
  line: string
  mode: TransitMode
  destination: string
}

/**
 * A line's destination, linked to the line's page when there is one: the link is named with the line, so it reads right on its own, and the badge beside it is left to the eye.
 * The link covers the whole row it is in (`STRETCHED_LINK`), so the row, given `STRETCHED_ROW`, is the target and not only the destination's text.
 */
export function LineDestination({ line, href, children }: { line: LineRef; href: string | undefined; children?: ReactNode }) {
  if (href === undefined) return children ?? line.destination
  return (
    <a href={href} data-stretched="" className={`${ENTITY_LINK} ${STRETCHED_LINK}`}>
      <span className="sr-only">
        {MODE_NAMES[line.mode]} {line.line} mot{" "}
      </span>
      {line.destination}
    </a>
  )
}

const DOTS: Readonly<Record<TransitMode, { full: string; hollow: string }>> = {
  bus: { full: "bg-(--transit-bus)", hollow: "border-(--transit-bus)" },
  tram: { full: "bg-(--transit-tram)", hollow: "border-(--transit-tram)" },
  metro: { full: "bg-(--transit-metro)", hollow: "border-(--transit-metro)" },
  rail: { full: "bg-(--transit-rail)", hollow: "border-(--transit-rail)" },
  ferry: { full: "bg-(--transit-ferry)", hollow: "border-(--transit-ferry)" },
  other: { full: "bg-(--transit-other)", hollow: "border-(--transit-other)" },
}

/** The hatched part of a strip: the minutes it takes to walk to the stop, which no departure in them can be caught. */
const HATCH = "bg-[repeating-linear-gradient(135deg,var(--muted-foreground)_0_0.0625rem,transparent_0.0625rem_0.3125rem)] opacity-60"

/** How many departures after the next a row names. */
const LATER = 2

/** The minutes the time strips cover, from now. */
const WINDOW = 60

/**
 * One stop's departures, as the real-time signs at a stop show them: a card with the stop's name as an `<h3>` under a page's section (and the walk and distance to it), and a
 * row for each line to one destination, with the line's badge, the destination and the next departure large at the right («nå», «3 min»,
 * the clock from 20 minutes on or when the time is the timetable's) and the next two smaller. Under each row a strip of the next hour
 * puts a dot at each departure, with the walk hatched at its start. With `walkMinutes` each row says when to leave («Gå om 4 min»,
 * «Gå nå», «Rekker ikke») and what cannot be reached is dimmed; the rows come in the order you can catch them. A delay shows the timetable's
 * time struck and «+3 min», a cancelled departure is struck with «Innstilt», and a deviation is a line under the row. Rendered on the server
 * with no script; `now` is passed in. Say how fresh the data is with `Freshness` beside it. With `at` a map of the stop's streets runs across
 * the top of the card (`MapThumb shape="banner"`, with OpenStreetMap's credit in its corner), and `from` puts the reader on it. With `continues`
 * the card ends in a link under all the rows to the stop's own page, where `DepartureList` shows every departure, not only the next of each
 * line (as `PageSection continues` does); with `lineHref` each row's destination links to that line's page, and the whole row is the link's target
 * (the badge, the times and the strip too), with one link a screen reader hears per row.
 */
export function DepartureBoard({ stop, now, departures, walkMinutes, distance, limit, at, from, tiles, continues, lineHref }: DepartureBoardProps) {
  const groups = groupDepartures(departures, Date.parse(now), { ...(walkMinutes === undefined ? {} : { walkMinutes }), ...(limit === undefined ? {} : { limit }) })
  const meta = stopMeta(walkMinutes, distance)
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <CardHeading level={3}>
            {stop}
          </CardHeading>
        </CardTitle>
        {meta === "" ? null : (
          <CardDescription>
            <span className="inline-flex items-center gap-1">
              <Icon name={walkMinutes === undefined ? "place" : "walk"} size="sm" />
              {meta}
            </span>
          </CardDescription>
        )}
      </CardHeader>
      {at === undefined ? null : (
        // After the heading for a screen reader, on top of the card to the eye: edge to edge, into the card's padding.
        <div className="order-first -mt-(--card-spacing)">
          <MapThumb shape="banner" at={at} {...(from === undefined ? {} : { from })} {...(tiles === undefined ? {} : { tiles })} label={`Kart over ${stop}, på OpenStreetMap`} href={osmLink(at)} />
        </div>
      )}
      <CardContent>
        {groups.length === 0 ? (
          <Text role="quiet">
            Ingen avganger den nærmeste tiden.
          </Text>
        ) : (
          <div className="@container grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-2">
            <ul className="col-span-full grid grid-cols-subgrid divide-y divide-border">
              {groups.map((group) => (
                <DepartureRow key={group.key} group={group} walkMinutes={walkMinutes} href={lineHref?.(group)} />
              ))}
            </ul>
            <Axis window={WINDOW} walkMinutes={walkMinutes} />
          </div>
        )}
      </CardContent>
      {continues === undefined ? null : (
        <CardFooter className="bg-transparent p-0">
          <ContinuationLink continues={continues} edge="w-full rounded-b-xl" />
        </CardFooter>
      )}
    </Card>
  )
}

/** A row takes the board's columns (the widest badge, the destination, the times), so the destinations and the strips line up. */
const ROW = "col-span-full grid grid-cols-subgrid"

function DepartureRow({ group, walkMinutes, href }: { group: DepartureGroup; walkMinutes: number | undefined; href: string | undefined }) {
  const [next, ...rest] = group.departures
  if (next === undefined) return null
  const later = rest.slice(0, LATER)
  return (
    <li className={`${ROW} gap-y-1 py-3 first:pt-1 ${href === undefined ? "" : STRETCHED_ROW}`}>
      <span className="row-span-2 self-start pt-0.5" {...(href === undefined ? {} : { "aria-hidden": true })}>
        <LineBadge line={group.line} mode={group.mode} />
      </span>
      <span className="min-w-0 self-baseline font-medium [overflow-wrap:anywhere]">
        <LineDestination line={group} href={href} />
      </span>
      <span className="self-baseline text-right">
        <BigTime departure={next} />
      </span>
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
        {next.cancelled === true ? (
          <span className="inline-flex items-center gap-1 font-medium text-destructive">
            <Icon name="cancelled" size="sm" tone="destructive" />
            Innstilt
          </span>
        ) : null}
        {group.walk === null ? null : <Walk status={group.walk} />}
        {next.cancelled !== true && shownDelay(next.delay) && next.aimed !== undefined ? <DepartureDelay departure={next} /> : null}
        {next.realtime ? null : <span>Rutetid</span>}
        {group.quay === undefined ? null : <span>{group.mode === "rail" ? "Spor" : "Plattform"} {group.quay}</span>}
      </span>
      <span className="text-right text-xs whitespace-nowrap text-muted-foreground tabular-nums">
        {later.length === 0 ? null : (
          <>
            <span className="sr-only">Deretter </span>
            {later.map((departure, index) => (
              <span key={departure.key}>
                {index > 0 ? " · " : null}
                <LaterTime departure={departure} />
              </span>
            ))}
          </>
        )}
      </span>
      <Strip group={group} window={WINDOW} walkMinutes={walkMinutes} />
      {group.notices.length === 0 ? null : (
        <span className="col-start-2 col-end-4 pt-1">
          <StatusLine items={group.notices.map((text) => ({ text, icon: "warning" as const }))} />
        </span>
      )}
    </li>
  )
}

/** The next departure, large: struck when cancelled, dimmed when it cannot be reached. */
function BigTime({ departure }: { departure: TimedDeparture }) {
  const time = (
    <time dateTime={departure.expected} className="text-lg leading-tight font-semibold tabular-nums">
      {departure.label}
    </time>
  )
  if (departure.cancelled === true) return <s className="text-muted-foreground">{time}</s>
  return <span className={departure.reachable ? "" : "text-muted-foreground"}>{time}</span>
}

function LaterTime({ departure }: { departure: TimedDeparture }) {
  const time = <time dateTime={departure.expected}>{departure.label}</time>
  if (departure.cancelled === true)
    return (
      <>
        <s>{time}</s>
        <span className="sr-only"> innstilt</span>
      </>
    )
  return departure.reachable ? <span className="text-foreground">{time}</span> : time
}

/** The timetable's time struck and the delay («+3 min»), as a screen reader hears it: «Rutetid 14:32, forsinket +3 min». */
export function DepartureDelay({ departure }: { departure: TimedDeparture }) {
  return (
    <span className="inline-flex items-baseline gap-1 tabular-nums">
      <span className="sr-only">Rutetid </span>
      <s>
        <time dateTime={departure.aimed}>{clock(departure.aimed ?? "")}</time>
      </s>
      <span className="font-medium text-(--transit-late)">
        <span className="sr-only">{departure.delay > 0 ? "forsinket " : "tidlig "}</span>
        {delayText(departure.delay)}
      </span>
    </span>
  )
}

function Walk({ status }: { status: WalkStatus }) {
  if (status.kind === "missed")
    return (
      <span className="inline-flex items-center gap-1">
        <Icon name="blocked" size="sm" tone="muted" />
        {status.text}
      </span>
    )
  return (
    <span className={`inline-flex items-center gap-1 ${status.kind === "now" ? "font-semibold text-foreground" : "text-foreground"}`}>
      <Icon name="walk" size="sm" />
      {status.text}
    </span>
  )
}

/** The departures of a row on the next `window` minutes: a dot at each, hollow when cancelled and faint when out of reach. */
function Strip({ group, window, walkMinutes }: { group: DepartureGroup; window: number; walkMinutes: number | undefined }) {
  const walk = walkMinutes === undefined || walkMinutes <= 0 ? null : Math.min(1, walkMinutes / window)
  const dots = DOTS[group.mode]
  return (
    // No pointer events: the strip's dots are positioned, and would otherwise sit above a linked row's cover and swallow its clicks.
    <span aria-hidden="true" className="pointer-events-none col-start-2 col-end-4 block px-1.5 pt-1">
      <span className="relative block h-3">
        {walk === null ? null : <span className={`absolute inset-y-0 left-0 rounded-xs ${HATCH}`} style={{ width: `${walk * 100}%` }} />}
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        {stripTicks(window).map((minute) => (
          <span key={minute} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-border" style={{ left: `${(minute / window) * 100}%` }} />
        ))}
        {group.departures.map((departure, index) => {
          const position = stripPosition(departure.exact, window)
          if (position === null) return null
          const look = departure.cancelled === true ? `border-2 bg-card ${dots.hollow}` : dots.full
          const size = index === 0 ? "size-3" : "size-2.5"
          return <span key={departure.key} className={`absolute top-1/2 -translate-1/2 rounded-full ${size} ${look} ${departure.reachable || departure.cancelled === true ? "" : "opacity-40"}`} style={{ left: `${position * 100}%` }} />
        })}
      </span>
    </span>
  )
}

/** The scale under the strips: «nå», the ticks, the end; and what the hatching means when there is a walk. */
function Axis({ window, walkMinutes }: { window: number; walkMinutes: number | undefined }) {
  return (
    <div aria-hidden="true" className={`${ROW} text-xs text-muted-foreground tabular-nums`}>
      <span className="col-start-2 col-end-4 grid gap-1 px-1.5">
        <span className="relative block h-4">
          <span className="absolute left-0">nå</span>
          {stripTicks(window).map((minute) => (
            <span key={minute} className="absolute -translate-x-1/2" style={{ left: `${(minute / window) * 100}%` }}>
              {minute}
            </span>
          ))}
          <span className="absolute right-0">
            {window}
            <span className="hidden @sm:inline"> min</span>
          </span>
        </span>
        {walkMinutes === undefined || walkMinutes <= 0 ? null : (
          <span className="inline-flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-4 rounded-xs ${HATCH}`} />
            Rekker ikke fram til fots
          </span>
        )}
      </span>
    </div>
  )
}

