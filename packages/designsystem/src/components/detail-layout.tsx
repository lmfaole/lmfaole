import type { ReactNode } from "react"

import type { FactValue } from "../lib/fact-values"
import type { LatLon, TileSource } from "../lib/map-tiles"
import type { LinkTo } from "../lib/vocabulary"
import { FactList } from "./fact-list"
import { MapThumb } from "./internal/map-thumb"
import { LinkButton } from "./link-button"
import { StateSteps, type StateStepsProps } from "./state-steps"
import { StatusLine, type Status } from "./status-line"
import { Text } from "./text"
import { Time } from "./time"

/** One fact of the rail: the term, and one value or several (`FactList`). */
export type DetailFact = readonly [string, FactValue<ReactNode>]

/** The place a page is of, as a map at the top of the rail: what it is centred on, the reader, and its name for a screen reader. */
export interface DetailMap {
  at: LatLon
  from?: LatLon
  /** «Kart over Carl Berners plass». */
  label: string
  tiles?: TileSource
}

export interface DetailLayoutProps {
  /** Where the thing stands now, at the top of the rail (`StatusLine`): «Merget», «Tester feilet». */
  status?: readonly Status[]
  /** The steps it goes through and where it is, under the status (`StateSteps`). */
  steps?: StateStepsProps
  /** The page's one row of actions on the thing (subscribe; download and play): `PendingButton`, `Button`, a form. */
  actions?: ReactNode
  /** What it is, term by term (`FactList`), never under a title of its own. */
  facts?: readonly DetailFact[]
  /** Where else it is: links out to other sites, under the facts (`LinkButton external`). */
  links?: readonly LinkTo[]
  /** The place it is of: a map across the top of the rail, OpenStreetMap's credit in its corner. */
  map?: DetailMap
  /** When it last changed («Sist endret …»), last in the rail; `now` as ISO, the same the page reads its other times by. */
  updated?: { at: string; now: string }
  /** The page's sections, read from top to bottom. */
  children: ReactNode
}

/**
 * The body of the page of one thing, under its head (`DetailHeader`, or the page's `PageHeader`): its sections, and a RAIL of what is
 * looked up about it, always in the same order: a map of its place, its status and steps, the one row of actions, its facts, its links out
 * and when it last changed. Every detail page has the same skeleton, so «open elsewhere» is always in the same place. The rail is a card;
 * a slot without data is left out, and with nothing in the rail the sections stand alone.
 *
 * On a wide page (the `expanded` width class, 56rem of room) the rail is at the end, beside the sections, and stays in view while they
 * scroll; the sections keep the reading column's 48rem. Below that it comes first, under the head and above the sections. Put it in a
 * `PageLayout width="pane"`; in the reading column there is never room, so it stays one column.
 */
export function DetailLayout({ status = [], steps, actions, facts = [], links = [], map, updated, children }: DetailLayoutProps) {
  const hasActions = actions !== undefined && actions !== null && actions !== false
  const rail = status.length > 0 || steps !== undefined || hasActions || facts.length > 0 || links.length > 0 || map !== undefined || updated !== undefined
  const main = <div className="grid min-w-0 content-start gap-6 @4xl:col-start-1 @4xl:row-start-1">{children}</div>
  if (!rail) return main
  return (
    <div className="@container min-w-0">
      <div className="grid min-w-0 items-start gap-8 @4xl:grid-cols-[minmax(0,48rem)_minmax(16rem,20rem)]">
        <aside aria-label="Fakta" className="grid min-w-0 content-start overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 @4xl:sticky @4xl:top-4 @4xl:col-start-2 @4xl:row-start-1">
          {map === undefined ? null : <MapThumb shape="banner" at={map.at} {...(map.from === undefined ? {} : { from: map.from })} label={map.label} {...(map.tiles === undefined ? {} : { tiles: map.tiles })} />}
          {map !== undefined && status.length === 0 && steps === undefined && !hasActions && facts.length === 0 && links.length === 0 && updated === undefined ? null : (
            <div className="grid min-w-0 content-start gap-4 p-4">
              {status.length === 0 ? null : <StatusLine items={status} />}
              {steps === undefined ? null : <StateSteps {...steps} />}
              {hasActions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
              {facts.length === 0 ? null : <FactList facts={facts} />}
              {links.length === 0 ? null : (
                <ul className="grid justify-items-start gap-2">
                  {links.map((link) => (
                    <li key={link.href}>
                      <LinkButton href={link.href} external {...(link.icon === undefined ? {} : { icon: link.icon })}>
                        {link.label}
                      </LinkButton>
                    </li>
                  ))}
                </ul>
              )}
              {updated === undefined ? null : (
                <Text role="note">
                  Sist endret <Time value={updated.at} now={new Date(updated.now)} format="datetime" />.
                </Text>
              )}
            </div>
          )}
        </aside>
        {main}
      </div>
    </div>
  )
}
