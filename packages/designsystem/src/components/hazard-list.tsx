import { cn } from "cn"

import { ExternalMark } from "./internal/external-mark"
import { Icon } from "./icon"
import { Text } from "./text"
import type { IconName } from "../lib/icons"
import { STRETCHED_LINK, STRETCHED_ROW } from "../lib/link-style"

/** The official awareness levels of a warning in Norway (MET, NVE/Varsom): yellow, orange and red. Green is no warning and is not shown. */
export type HazardLevel = "yellow" | "orange" | "red"

export interface Hazard {
  key: string
  level: HazardLevel
  /** What is coming, as the authority names it: «Kraftig snøfokk», «Jord- og flomskredfare». */
  title: string
  /** Where it is for: «Oslo og Akershus», «Tromsø». */
  area?: string
  /** When it is in force, in words the page writes: «i dag 12–i morgen 06». */
  when?: string
  /** What it means for the reader, one or two sentences; left out in a compact list. */
  description?: string
  /** Who warns, for the link and the credit: «MET», «Varsom». */
  source: string
  /** The full warning at its source, which the authority asks to be reachable. */
  href: string
  /** The kind of danger, by meaning (`wind`, `rain`, `snow`, `warning`); `warning` by default. */
  icon?: IconName
}

const LEVELS = {
  yellow: { label: "Gult nivå", box: "bg-(--hazard-yellow) text-(--hazard-yellow-foreground)" },
  orange: { label: "Oransje nivå", box: "bg-(--hazard-orange) text-(--hazard-orange-foreground)" },
  red: { label: "Rødt nivå", box: "bg-(--hazard-red) text-(--hazard-red-foreground)" },
} as const satisfies Record<HazardLevel, { label: string; box: string }>

/** The most serious first, then the soonest: the order a reader should take them in. */
const RANK: Record<HazardLevel, number> = { red: 0, orange: 1, yellow: 2 }

/** The level as its colour and its words, on the warning's own token (the official colours, never the brand). */
export function HazardLevelBadge({ level }: { level: HazardLevel }) {
  const look = LEVELS[level]
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${look.box}`}>{look.label}</span>
}

/**
 * Warnings from the authorities (farevarsler): MET's weather warnings and NVE's flood, landslide and avalanche warnings, each with its level in the
 * official colour and in words, what is coming, where and when, and a link to the full warning at its source. The most serious come first.
 * The link is the one link of its card, but the whole card is its target: a tap anywhere on the warning opens it in full.
 * `compact` leaves out the description, for a digest. Nothing is drawn for an empty list: no warning is no news.
 */
export function HazardList({ hazards, compact = false, footer }: { hazards: readonly Hazard[]; compact?: boolean; /** A line under the list, as the sources ask for their credit. */ footer?: string }) {
  if (hazards.length === 0) return null
  const sorted = hazards.toSorted((a, b) => RANK[a.level] - RANK[b.level])
  return (
    <div className="grid gap-3">
      <ul className="grid gap-3">
        {sorted.map((hazard) => (
          <li key={hazard.key} className={cn(STRETCHED_ROW, "flex items-start gap-3 rounded-lg border p-3")}>
            <span className="pt-0.5">
              <Icon name={hazard.icon ?? "warning"} tone={hazard.level === "red" ? "destructive" : "muted"} />
            </span>
            <div className="grid min-w-0 gap-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <HazardLevelBadge level={hazard.level} />
                <span className="font-medium">
                  {hazard.title}
                </span>
              </div>
              {hazard.area === undefined && hazard.when === undefined ? null : (
                <Text role="note">
                  {[hazard.area, hazard.when].filter((part) => part !== undefined && part !== "").join(" · ")}
                </Text>
              )}
              {compact || hazard.description === undefined ? null : <Text role="quiet">{hazard.description}</Text>}
              <Text role="quiet">
                <a href={hazard.href} rel="noopener noreferrer" data-stretched className={`underline underline-offset-4 ${STRETCHED_LINK}`}>
                  Hele varselet hos {hazard.source}
                  <ExternalMark />
                </a>
              </Text>
            </div>
          </li>
        ))}
      </ul>
      {footer === undefined ? null : (
        <Text role="note">
          {footer}
        </Text>
      )}
    </div>
  )
}
