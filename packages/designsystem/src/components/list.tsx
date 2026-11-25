import { Fragment, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react"

import type { IconName } from "../lib/icons"
import { ENTITY_LINK, LINKED_ROW, STRETCHED_LINK } from "../lib/link-style"
import type { LatLon, TileSource } from "../lib/map-tiles"
import { shapeOf, type PictureKind } from "../lib/picture-kinds"
import type { PictureSource } from "../lib/picture-sources"
import { barPercents, changeWords, type RankChange } from "../lib/ranked"
import type { Tone } from "../lib/vocabulary"
import { Badge } from "./badge"
import { Icon } from "./icon"
import { EpisodeMark } from "./internal/episode-mark"
import { PictureFrame } from "./internal/picture-frame"
import { LiveDot } from "./live-dot"
import { MapCredit, MapThumb } from "./internal/map-thumb"
import { NewBadge } from "./new-badge"
import { SrTableHead } from "./sr-table-head"
import { StatusLine, type Status } from "./status-line"
import { ROW_META, ROW_TITLE } from "../lib/long-titles"
import { episodeNumberWords, episodeTypeWord, type EpisodeNumber } from "../lib/episode-number"
import { groupByRole, type PersonRole } from "../lib/people"
import { reasonWords, type ListReason } from "../lib/recommendations"
import { NEWS_WORDS, priceWords, type GamePrice, type NewsKind } from "../lib/games"
import { cn } from "../lib/utils"

export type { RankChange } from "../lib/ranked"
export type { Status } from "./status-line"
export type { EpisodeNumber } from "../lib/episode-number"
export type { PersonRole } from "../lib/people"
export type { ListReason } from "../lib/recommendations"
export type { GamePrice, NewsKind } from "../lib/games"

/** A row's price in a store (a game on a wishlist, a DLC): in the currency's smallest unit, with what it cost before a sale. */
export interface ListPrice extends GamePrice {
  /** It came on sale since the reader last looked (`newSales`): «Nytt tilbud» beside the title. */
  newSale?: boolean
}

/** A link in a row's line under the title (an artist, an album, «Åpne i Spotify»): its own target, beside the row's. */
export interface ListLink {
  label: string
  href: string
  /** Another site: marked as such, and opened without `window.opener`. */
  external?: boolean
}

/** One part of the line under a title: words, a number, a `Time`, or a link. Empty parts (`null`, `undefined`, `false`, `""`) are left out. */
export type ListMeta = string | number | ReactElement | ListLink | null | undefined | false

/** A row's picture: the address, or the same picture in the widths its source offers (the browser takes the smallest that is sharp). */
export interface ListPicture {
  src?: string | null | undefined
  sources?: readonly PictureSource[] | undefined
}

/** One short word about the row beside its title («Utkast», «Feilet»): the words carry the meaning, the icon repeats it. */
export interface ListBadge {
  label: string
  icon?: IconName
  /** `destructive` only for what stops something. */
  tone?: Tone
}

/** One row of a `List`. The row says what it is; the list decides how it looks. */
export interface ListRow {
  key: string
  /** What it is: always words. With `href` it is the row's link, and the whole row is its target. */
  title: string
  /** Where the row goes: the thing's own page. None, and the row is not a link (or its map is, see `map`). */
  href?: string
  /** `href` is another site: the title is marked as a link out. */
  external?: boolean
  /** The line under the title, its parts joined by « · »: by whom, a year, a time, how much is left. */
  meta?: readonly ListMeta[]
  /** Short statuses on a line of their own under the meta, each with an icon (`StatusLine`): a pull request's checks and age. */
  status?: readonly Status[]
  /** What it has, at the end: a count, a time, a temperature. Leave it out where the time is in `meta`; the column is drawn only when a row has one. */
  value?: ReactNode
  /** One word beside the title. */
  badge?: ListBadge
  /** «Nytt» beside the title until `until` (`NewBadge`); `now` is passed in so the server and the browser agree. */
  isNew?: { until: string; now: string }
  /** Playing now: the picture is a turning disc, and the value is «Spilles nå» with a dot. Needs a square `kind`. */
  live?: boolean
  /** The picture in front, in the shape of the list's `kind`. A list with a `kind` draws a frame in front of every row, empty where there is none. */
  picture?: ListPicture
  /** This row's kind where it differs from the list's: a song among albums. */
  kind?: PictureKind
  /** A place: a small map in front (a city bike station). In a row without `href`, the map's link is the row's target. */
  map?: { at: LatLon; from?: LatLon; label: string; /** Where the tiles come from (OpenStreetMap's own by default). */ tiles?: TileSource }
  /** The kind of a row that is not media (a pull request, a kind of weather), as an icon in front. */
  icon?: IconName
  /** What the icon means to a screen reader («Pull request»), where the kind is not in the words; without it the icon is hidden. */
  iconLabel?: string
  /** `destructive` for a kind that stops something, `primary` for one that stands out (rain on its way). Never the only sign. */
  iconTone?: "destructive" | "primary"
  /** In a `ranked` list: how the place moved since the list before (in words first in the meta, «Opp 3», «Ny»). */
  change?: RankChange | null
  /** In a `ranked` list: the score as a number. A bar under the row shows it as a share of the largest. */
  amount?: number
  /** How much of it is done, from 0 to 1 (an episode heard so far): a thin bar under the row. Say it in words in `meta` too. */
  progress?: number
  /** The row's own action at the end (Spill av, Abonner, Slett): a button or a form of the app's. It stays its own target. */
  action?: ReactNode
  /** An episode's place in its podcast: «S2 E14» first in the meta (whole words to a screen reader), and «Trailer» or «Bonus» as its badge. */
  episode?: EpisodeNumber
  /** Why it is recommended, on a line of its own under the meta: «Anbefalt av Ekko», «Fordi du følger Ekko», «Med Anne Lindmo». */
  reason?: ListReason
  /** What a person is to the podcast or the episode (`kind="person"`): the list is grouped by role, under «Verter», «Gjester» …, in a fixed order. */
  role?: PersonRole
  /** What it costs (a game on a wishlist, a DLC), in the value column: the price, and on a sale «−40 %» with the price before struck through. Not with `value`. */
  price?: ListPrice
  /** A news item that is more than news: «Oppdatering» (the developer's patch notes) or «Hendelse» as its badge. */
  news?: NewsKind
}

/** What the columns are called for a screen reader, which hears them with every cell: «Navn», «Antall» and «Handling» by default. */
export interface ListColumns {
  name?: string
  value?: string
  action?: string
}

const isLink = (part: ListMeta): part is ListLink => typeof part === "object" && part !== null && !isValidElement(part) && "href" in part

/** What says a link leaves the site: the symbol for the eye, the words for a screen reader. */
function OutMark() {
  return (
    <>
      <span className="ml-1 inline-block align-text-bottom">
        <Icon name="external" size="sm" tone="muted" />
      </span>
      <span className="sr-only"> (eksternt nettsted)</span>
    </>
  )
}

function MetaLink({ link }: { link: ListLink }) {
  return (
    <a href={link.href} className={ENTITY_LINK} {...(link.external === true ? { rel: "noopener noreferrer" } : {})}>
      {link.label}
      {link.external === true ? <OutMark /> : null}
    </a>
  )
}

/** The parts that are there, joined by « · ». */
function Meta({ parts }: { parts: readonly ListMeta[] }) {
  const present = parts.filter((part) => part !== null && part !== undefined && part !== false && part !== "")
  return present.map((part, index) => (
    <Fragment key={index}>
      {index === 0 ? null : " · "}
      {isLink(part) ? <MetaLink link={part} /> : part}
    </Fragment>
  ))
}

/** The words of a change, with a small arrow where it moved: the arrow is a hint, the words are the meaning. */
function ChangeNote({ change }: { change: RankChange }) {
  const moved = (change.kind === "up" || change.kind === "down") && Math.round(change.by) >= 1
  return (
    <span className="inline-flex items-center gap-1">
      {moved ? <Icon name={change.kind === "up" ? "trend-up" : "trend-down"} size="sm" /> : null}
      {changeWords(change)}
    </span>
  )
}

function Bar({ percent, tone }: { percent: number; tone: "score" | "progress" }) {
  return (
    <div aria-hidden="true" className="mt-1.5 h-1 rounded-full bg-muted">
      <div className={`h-full rounded-full ${tone === "score" ? "bg-foreground/70" : "bg-primary"}`} style={{ width: `${percent}%` }} />
    </div>
  )
}

type Lead = "picture" | "map" | "icon" | null

/**
 * Every list of things that link somewhere, in one row shape: what leads the row (a picture in the shape of `kind`, a map, an icon), the
 * title as the row's one link, the line under it, and what it has at the end. The rows are data; the list decides the look, so a podcast
 * row in one app is the same as in another, and a top list the same as a setlist.
 *
 * - The lead follows from the data: `kind` (pictures), else a row's `map` (with OpenStreetMap's credit once under the list), else a row's `icon`, else nothing.
 * - `ranked`: a top list. The places are counted from the order of the rows, each row's `change` leads its meta, and `amount` draws a bar.
 * - A row with `href` is that link's target whole: a tap anywhere follows it, the row is tinted under a pointer and ringed under focus.
 *   Links in `meta` and the row's `action` stay their own targets.
 * - An episode's `episode` puts its number first in the meta («S2 E14») and «Trailer» or «Bonus» beside the title; a recommendation's
 *   `reason` is a line of its own under the meta («Anbefalt av Ekko»).
 * - People with a `role` (`kind="person"`) are grouped by it, one table per role under its words («Verter», «Gjester»), in a fixed order.
 *
 * A table for a screen reader (the title is the row header, so what a row has is heard with its name); the layout is a grid.
 */
export function List({ rows, kind, ranked = false, label, columns }: {
  rows: readonly ListRow[]
  /** What kind of thing the list is of: every row has a picture in front, in that kind's shape. */
  kind?: PictureKind
  /** A top list: the place of each row, counted from the order. */
  ranked?: boolean
  /** What the list is, for a screen reader (a caption): «Toppartister». */
  label?: string
  columns?: ListColumns
}) {
  if (rows.length === 0) return null
  const lead: Lead = kind !== undefined ? "picture" : rows.some((row) => row.map !== undefined) ? "map" : rows.some((row) => row.icon !== undefined) ? "icon" : null
  const withValue = rows.some((row) => row.live === true || row.price !== undefined || (row.value !== undefined && row.value !== null && row.value !== ""))
  const withAction = rows.some((row) => row.action !== undefined && row.action !== null)
  const bars = ranked ? barPercents(rows.map((row) => row.amount)) : rows.map(() => null)
  const areas = [ranked ? "rank" : null, lead === null ? null : "lead", "main", withValue ? "value" : null, withAction ? "action" : null].filter((area) => area !== null)
  const sizes: Record<string, string> = { rank: "1.75rem", lead: lead === "icon" ? "1rem" : "auto", main: "minmax(0,1fr)", value: "auto", action: "auto" }
  const grid: CSSProperties = {
    gridTemplateColumns: areas.map((area) => sizes[area]).join(" "),
    gridTemplateAreas: `"${areas.map((area) => (area === "main" ? "title" : area)).join(" ")}" "${areas.map((area) => (area === "main" ? "detail" : area)).join(" ")}"`,
  }
  const heads = [ranked ? "Plass" : null, lead === "picture" ? "Bilde" : lead === "map" ? "Kart" : lead === "icon" ? "Type" : null, columns?.name ?? "Navn", "Detaljer", withValue ? (columns?.value ?? "Antall") : null, withAction ? (columns?.action ?? "Handling") : null].filter((head) => head !== null)
  const drawRow = (row: ListRow, index: number) => {
    const bar = bars[index] ?? null
    const progress = row.progress === undefined ? null : Math.round(Math.min(Math.max(row.progress, 0), 1) * 100)
    const numbered = row.episode !== undefined && episodeNumberWords(row.episode) !== null ? [<EpisodeMark key="episode" episode={row.episode} />] : []
    const meta = [...(ranked && row.change !== undefined && row.change !== null ? [<ChangeNote key="change" change={row.change} />] : []), ...numbered, ...(row.meta ?? [])]
    const typeWord = row.episode === undefined ? null : episodeTypeWord(row.episode.type)
    const badge: ListBadge | undefined = row.badge ?? (typeWord !== null ? { label: typeWord } : row.news !== undefined ? NEWS_WORDS[row.news] : row.price?.newSale === true ? { label: "Nytt tilbud", icon: "new" as const } : undefined)
    const reason = row.reason === undefined ? null : reasonWords(row.reason)
    return (
      <tr role="row" key={row.key} style={grid} className={`grid items-center gap-x-3 ${LINKED_ROW}`}>
        {ranked ? (
          <td role="cell" className={`text-lg font-semibold tabular-nums [grid-area:rank] ${index === 0 ? "" : "text-muted-foreground"}`}>
            {index + 1}
          </td>
        ) : null}
        {lead === null ? null : (
          <td role="cell" className={`[grid-area:lead] ${lead === "icon" ? "self-start pt-0.5" : ""}`}>
            <Lead row={row} lead={lead} kind={row.kind ?? kind} />
          </td>
        )}
        {/* The badge goes under the title where both do not fit on a line, so a narrow screen does not cut the title to a word. */}
        <td role="rowheader" className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 self-end font-medium [grid-area:title]">
          <span className={ROW_TITLE}>
            {row.href === undefined ? (
              row.title
            ) : (
              <a href={row.href} className={cn(ENTITY_LINK, "inline", STRETCHED_LINK)} data-stretched="" {...(row.external === true ? { rel: "noopener noreferrer" } : {})}>
                {row.title}
                {row.external === true ? <OutMark /> : null}
              </a>
            )}
          </span>
          {badge === undefined ? null : (
            <span className="shrink-0">
              <Badge {...(badge.icon === undefined ? {} : { icon: badge.icon })} {...(badge.tone === undefined ? {} : { tone: badge.tone })}>
                {badge.label}
              </Badge>
            </span>
          )}
          {row.isNew === undefined ? null : (
            <span className="shrink-0">
              <NewBadge until={row.isNew.until} now={row.isNew.now} />
            </span>
          )}
        </td>
        <td role="cell" className="grid min-w-0 gap-1 self-start text-sm text-muted-foreground [grid-area:detail] [overflow-wrap:anywhere]">
          {meta.length === 0 ? null : (
            <span className={ROW_META}>
              <Meta parts={meta} />
            </span>
          )}
          {reason === null ? null : <span className={ROW_META}>{reason}</span>}
          {row.status === undefined || row.status.length === 0 ? null : <StatusLine items={row.status} />}
          {bar !== null ? <Bar percent={bar} tone="score" /> : progress !== null ? <Bar percent={progress} tone="progress" /> : null}
        </td>
        {withValue ? (
          <td role="cell" className={`shrink-0 text-right text-sm whitespace-nowrap tabular-nums [grid-area:value] ${row.live === true || ranked ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            {row.live === true ? (
              <span className="inline-flex items-center gap-1.5">
                <LiveDot />
                Spilles nå
              </span>
            ) : row.price !== undefined ? (
              <PriceValue price={row.price} />
            ) : (
              row.value
            )}
          </td>
        ) : null}
        {withAction ? (
          <td role="cell" className="[grid-area:action]">
            {row.action}
          </td>
        ) : null}
      </tr>
    )
  }
  const head = <SrTableHead columns={heads} />
  const body = "grid gap-y-3"
  // People with a role: a table per role, in the fixed order of the roles, each named by its role («Verter», «Gjester»).
  const groups = rows.some((row) => row.role !== undefined) ? groupByRole(rows) : null
  const table =
    groups === null ? (
      <table role="table" className="block">
        {label === undefined ? null : <caption className="sr-only">{label}</caption>}
        {head}
        <tbody role="rowgroup" className={body}>
          {rows.map(drawRow)}
        </tbody>
      </table>
    ) : (
      <div className="grid gap-5" {...(label === undefined ? {} : { role: "group", "aria-label": label })}>
        {groups.map((group) => (
          <table role="table" key={group.role} className="block">
            <caption className="text-muted-foreground mb-2 block text-left text-sm font-medium">{group.label}</caption>
            {head}
            <tbody role="rowgroup" className={body}>
              {group.items.map((row) => drawRow(row, rows.indexOf(row)))}
            </tbody>
          </table>
        ))}
      </div>
    )
  // The tiles' terms ask for the credit where the map is seen: once, under the list.
  return lead === "map" ? (
    <div className="grid gap-2">
      {table}
      <MapCredit />
    </div>
  ) : (
    table
  )
}

/** A price at the end of a row: on a sale the percent off in front, the price, and under it the price before, struck through. */
function PriceValue({ price }: { price: GamePrice }) {
  const words = priceWords(price)
  if (words.before === null) return <span className="text-foreground">{words.now}</span>
  return (
    <span className="grid justify-items-end">
      <span className="inline-flex items-center gap-1.5">
        <span className="rounded-sm bg-primary px-1 text-xs font-semibold text-primary-foreground">{words.discountWords}</span>
        <span className="font-medium text-foreground">{words.now}</span>
      </span>
      <s className="text-xs">
        <span className="sr-only">før </span>
        {words.before}
      </s>
    </span>
  )
}

function Lead({ row, lead, kind }: { row: ListRow; lead: Exclude<Lead, null>; kind: PictureKind | undefined }) {
  if (lead === "picture" && kind !== undefined) {
    const { ratio, corners } = shapeOf(kind, "row")
    const src = row.picture?.src ?? null
    const sources = row.picture?.sources
    const common = { src, corners, ...(sources === undefined ? {} : { sources }) }
    return ratio === "wide" ? <PictureFrame {...common} ratio="wide" size="row" /> : <PictureFrame {...common} ratio={ratio} size="row" disc={row.live === true} />
  }
  if (lead === "map") {
    if (row.map === undefined) return null
    return <MapThumb shape="square" at={row.map.at} {...(row.map.from === undefined ? {} : { from: row.map.from })} label={row.map.label} {...(row.map.tiles === undefined ? {} : { tiles: row.map.tiles })} stretched={row.href === undefined} />
  }
  if (row.icon === undefined) return null
  return <Icon name={row.icon} tone={row.iconTone ?? "muted"} {...(row.iconLabel === undefined ? {} : { label: row.iconLabel })} />
}
