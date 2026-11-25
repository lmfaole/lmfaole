import { clock, delayMinutes, delayText, shownDelay, type TransitMode } from "../lib/departures"
import { STRETCHED_LINK, STRETCHED_ROW } from "../lib/link-style"
import { Icon } from "./icon"

/** One stop on a trip: its name, when the trip is there (ISO, in real time where known), and its page. */
export interface RouteStop {
  key: string
  name: string
  /** When the trip leaves the stop (at the last stop: arrives), in real time where known. */
  expected: string
  /** The timetable's time, for a delay. */
  aimed?: string
  cancelled?: boolean
  /** The stop's own page: the whole row is its target. */
  href?: string
}

export interface StopSequenceProps {
  stops: readonly RouteStop[]
  /** The index of the stop the trip is seen from («herfra»); the stops before it are folded away. */
  current: number
  /** The kind of line, which paints the rail in its colour. */
  mode: TransitMode
}

const RAIL: Readonly<Record<TransitMode, string>> = {
  bus: "bg-(--transit-bus)",
  tram: "bg-(--transit-tram)",
  metro: "bg-(--transit-metro)",
  rail: "bg-(--transit-rail)",
  ferry: "bg-(--transit-ferry)",
  other: "bg-(--transit-other)",
}

const RING: Readonly<Record<TransitMode, string>> = {
  bus: "border-(--transit-bus)",
  tram: "border-(--transit-tram)",
  metro: "border-(--transit-metro)",
  rail: "border-(--transit-rail)",
  ferry: "border-(--transit-ferry)",
  other: "border-(--transit-other)",
}

/** The halo round the stop seen from, and the tint of its row: the line's colour, faint. */
const HALO: Readonly<Record<TransitMode, string>> = {
  bus: "ring-(--transit-bus)/25",
  tram: "ring-(--transit-tram)/25",
  metro: "ring-(--transit-metro)/25",
  rail: "ring-(--transit-rail)/25",
  ferry: "ring-(--transit-ferry)/25",
  other: "ring-(--transit-other)/25",
}

const TINT: Readonly<Record<TransitMode, string>> = {
  bus: "bg-(--transit-bus)/8",
  tram: "bg-(--transit-tram)/8",
  metro: "bg-(--transit-metro)/8",
  rail: "bg-(--transit-rail)/8",
  ferry: "bg-(--transit-ferry)/8",
  other: "bg-(--transit-other)/8",
}

const BADGE: Readonly<Record<TransitMode, string>> = {
  bus: "bg-(--transit-bus) text-(--transit-bus-foreground)",
  tram: "bg-(--transit-tram) text-(--transit-tram-foreground)",
  metro: "bg-(--transit-metro) text-(--transit-metro-foreground)",
  rail: "bg-(--transit-rail) text-(--transit-rail-foreground)",
  ferry: "bg-(--transit-ferry) text-(--transit-ferry-foreground)",
  other: "bg-(--transit-other) text-(--transit-other-foreground)",
}

const ROW = "group/stop grid min-h-12 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg pr-3"
const QUIET = "bg-muted-foreground/30"
const MINUTE = 60_000

/**
 * Every stop on one trip of a line, in the order it calls, as the line's map above the door reads: a thick rail in the line's colour with a ring for
 * each stop, the stop's name and the time the trip is there, with a delay as the timetable's time struck. The stop the trip is seen from has a full dot
 * in a halo, a tinted row and a «Herfra» mark (`aria-current="location"`); each stop after it says how long the ride is («6 min»), and the end of the
 * line has a bar across the rail. The stops before it are folded away under one row («Vis 6 stopp før»), on a quieter rail. With `href` a stop's row is a
 * link to its page, and a tap anywhere on the row follows it. Rendered on the server with no script: the fold is a `<details>`.
 */
export function StopSequence({ stops, current, mode }: StopSequenceProps) {
  if (stops.length === 0) return null
  const from = Math.min(Math.max(current, 0), stops.length - 1)
  const before = stops.slice(0, from)
  const after = stops.slice(from)
  const leaves = Date.parse(after[0]?.expected ?? "")
  return (
    <div className="grid">
      {before.length === 0 ? null : (
        <details data-motion="disclosure" className="group">
          <summary className={`${ROW} hover:bg-muted/50 focus-visible:outline-ring cursor-pointer list-none focus-visible:outline-2 [&::-webkit-details-marker]:hidden`}>
            <Rail mode={mode} kind="fold" />
            <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm font-medium">
              <span className="transition-transform group-open:rotate-90 motion-reduce:transition-none">
                <Icon name="chevron-right" size="sm" />
              </span>
              <span className="group-open:hidden">Vis {before.length} stopp før</span>
              <span className="hidden group-open:inline">Skjul {before.length} stopp før</span>
            </span>
            <span />
          </summary>
          <ol className="grid">
            {before.map((stop) => (
              <Stop key={stop.key} stop={stop} mode={mode} kind="before" />
            ))}
          </ol>
        </details>
      )}
      <ol className="grid" start={from + 1}>
        {after.map((stop, index) => (
          <Stop
            key={stop.key}
            stop={stop}
            mode={mode}
            kind={index === 0 ? "here" : index === after.length - 1 ? "end" : "after"}
            first={index === 0 && before.length === 0}
            quietAbove={index === 0 && before.length > 0}
            ride={index === 0 ? null : Math.round((Date.parse(stop.expected) - leaves) / MINUTE)}
          />
        ))}
      </ol>
    </div>
  )
}

type Kind = "fold" | "before" | "here" | "after" | "end"

function Rail({ mode, kind, first = false, quietAbove = false }: { mode: TransitMode; kind: Kind; first?: boolean; quietAbove?: boolean }) {
  const quiet = kind === "before" || kind === "fold"
  const colour = quiet ? QUIET : RAIL[mode]
  const top = first || quietAbove ? "top-1/2" : "top-0"
  const bottom = kind === "end" ? "bottom-1/2" : "bottom-0"
  return (
    <span aria-hidden="true" className="relative flex h-full items-center justify-center self-stretch">
      {quietAbove ? <span className={`absolute top-0 bottom-1/2 w-1.5 ${QUIET}`} /> : null}
      {kind === "fold" ? (
        <span className="absolute inset-y-0 w-1.5 bg-[repeating-linear-gradient(to_bottom,var(--muted-foreground)_0_0.3125rem,transparent_0.3125rem_0.625rem)] opacity-30" />
      ) : (
        <span className={`absolute w-1.5 ${top} ${bottom} ${first ? "rounded-t-full" : ""} ${colour}`} />
      )}
      {kind === "fold" ? null : kind === "here" ? (
        <span className={`relative size-5 rounded-full ring-[0.375rem] ${RAIL[mode]} ${HALO[mode]}`}>
          <span className="bg-background absolute inset-1.5 rounded-full" />
        </span>
      ) : kind === "end" ? (
        <span className={`relative h-1.5 w-5 rounded-full ${RAIL[mode]}`} />
      ) : (
        <span className={`bg-background relative size-3.5 rounded-full border-[0.1875rem] transition-transform group-hover/stop:scale-125 motion-reduce:transition-none ${quiet ? "border-muted-foreground/30" : RING[mode]}`} />
      )}
    </span>
  )
}

function Stop({ stop, mode, kind, first = false, quietAbove = false, ride = null }: { stop: RouteStop; mode: TransitMode; kind: Kind; first?: boolean; quietAbove?: boolean; ride?: number | null }) {
  const cancelled = stop.cancelled === true
  const here = kind === "here"
  const quiet = kind === "before"
  const delay = delayMinutes(stop.expected, stop.aimed)
  const name = cancelled ? <s>{stop.name}</s> : stop.name
  return (
    <li className={`${ROW} ${here ? `${TINT[mode]}` : ""} ${stop.href === undefined ? "" : `${STRETCHED_ROW} rounded-lg`}`} {...(here ? { "aria-current": "location" as const } : {})}>
      <Rail mode={mode} kind={kind} first={first} quietAbove={quietAbove} />
      <span className="grid min-w-0 gap-0.5 py-2">
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`[overflow-wrap:anywhere] ${here || kind === "end" ? "font-semibold" : "font-medium"} ${quiet || cancelled ? "text-muted-foreground font-normal" : ""}`}>
            {stop.href === undefined ? (
              name
            ) : (
              <a href={stop.href} data-stretched="" className={`decoration-2 underline-offset-4 group-hover/stop:underline ${STRETCHED_LINK}`}>
                {name}
              </a>
            )}
          </span>
          {here ? <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] leading-none font-semibold tracking-wide uppercase ${BADGE[mode]}`}>Herfra</span> : null}
        </span>
        {ride !== null && ride > 0 && !cancelled ? (
          <span className="text-muted-foreground text-xs tabular-nums">
            {ride} min<span className="sr-only"> herfra</span>
          </span>
        ) : null}
      </span>
      <span className={`inline-flex items-center gap-2 whitespace-nowrap tabular-nums ${quiet ? "text-muted-foreground text-sm" : ""}`}>
        {cancelled ? (
          <span className="text-destructive text-xs font-medium">Innstilt</span>
        ) : shownDelay(delay) && stop.aimed !== undefined ? (
          <span className="inline-flex items-baseline gap-1">
            <span className="sr-only">Rutetid </span>
            <s className="text-muted-foreground text-xs">
              <time dateTime={stop.aimed}>{clock(stop.aimed)}</time>
            </s>
            <span className="sr-only">, {delay > 0 ? "forsinket" : "tidlig"} {delayText(delay)}, </span>
          </span>
        ) : null}
        <time dateTime={stop.expected} className={cancelled ? "text-muted-foreground line-through" : here ? "text-base font-bold" : "text-sm font-medium"}>
          {clock(stop.expected)}
        </time>
        {stop.href === undefined || quiet ? null : (
          <span aria-hidden="true" className="text-muted-foreground/50 group-hover/stop:text-foreground -mr-1 transition-colors">
            <Icon name="chevron-right" size="sm" />
          </span>
        )}
      </span>
    </li>
  )
}
