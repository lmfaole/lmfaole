import type { ReactNode } from "react"

import { Icon } from "./icon"
import type { IconName } from "../lib/icons"
import type { LinkTo, Source } from "../lib/vocabulary"
import { ErrorMessage } from "./error-message"
import { SectionTitle } from "./internal/section-title"
import { Heading, Text, TextLink } from "./text"

/** Where the words of a section come from, under it: «Tekst fra Wikipedia», linked when it has an address. */
function Credit({ source }: { source: Source }) {
  return (
    <Text role="note">
      {"Tekst fra "}
      {source.href === undefined ? source.label : <TextLink href={source.href} external>{source.label}</TextLink>}
    </Text>
  )
}

/** The section's content, or what went wrong fetching it: `error` is the failure a source returned as a value, `what` what it was. */
function Body({ what, error, children }: { what: string | undefined; error: unknown; children: ReactNode }) {
  if (error === undefined || error === null || error === false) return children
  return <ErrorMessage what={what ?? "innholdet"} error={error} retry />
}

/**
 * A titled block of a page (a ranked list, the latest plays): the small capitals heading and the content under it, labelled for a screen reader by it.
 *
 * With `continues` it is a preview of a subpage: a card holding the title, the first few of what the subpage has (the five latest
 * plays), and at its foot, inside the card under a line, one full-width link to the subpage («Se hele historikken»). The rows keep
 * their own links; only the foot goes to the subpage, so the card itself is not one link. It replaces `more` (both would go to the same page).
 */
export function PageSection({ id, title, icon, more, continues, source, what, error, children }: { id: string; title: string; /** What the section is about, in front of its title: a section is found at a glance. Every section has one. */ icon: IconName; /** Where the words in it come from («Tekst fra Last.fm»), drawn as a note under the content. */ source?: Source; /** What the section shows, in the words of «Kunne ikke hente {what}» («været», «pull requests»). */ what?: string; /** The failure its source returned as a value: given, the section shows an `ErrorMessage` instead of its content. */ error?: unknown; children: ReactNode } & (
  | { /** The page with all of it, when the section shows only the first of a list. */ more?: More; continues?: undefined }
  | { more?: undefined; /** The subpage this section is an excerpt of: the section becomes a card with the link at its foot. */ continues: Continuation }
)) {
  const heading = (
    <Heading level={2} look="label" id={id}>
      <SectionTitle icon={icon}>{title}</SectionTitle>
    </Heading>
  )
  if (continues !== undefined) {
    return (
      <section aria-labelledby={id} data-frame="section" className="border-border bg-card text-card-foreground grid min-w-0 content-start rounded-2xl border">
        <div className="grid min-w-0 content-start gap-4 p-4">
          {heading}
          <Body what={what} error={error}>{children}</Body>
          {source === undefined ? null : <Credit source={source} />}
        </div>
        <Foot continues={continues} />
      </section>
    )
  }
  return (
    <section aria-labelledby={id} data-frame="section" className="grid content-start gap-4">
      <Head more={more}>{heading}</Head>
      <Body what={what} error={error}>{children}</Body>
      {source === undefined ? null : <Credit source={source} />}
    </section>
  )
}

/**
 * The subpage a section card is an excerpt of, linked at the card's foot: «Se hele historikken». The label names where it goes, in full
 * («Se månedens Wrapped», never «Se alle» or «Mer» alone); the icon is the subpage's, given when the rows above have icons (`List`),
 * so the label stands in their text column.
 */
export interface Continuation extends LinkTo {
  /** How much there is there, with what it counts («1 248 avspillinger»): shown quietly at the end of the line, and read with the link. */
  count?: string
}

/** The card's foot: one link the width of the card, under a line, its text in the content's column and a chevron at the end. */
function Foot({ continues }: { continues: Continuation }) {
  return <ContinuationLink continues={continues} edge="rounded-b-2xl border-t border-border" />
}

/**
 * The link at the foot of a card to the page it is an excerpt of («Se alle avganger fra Carl Berners plass»): the card's width, the label
 * underlined and the count and a chevron at the end. `PageSection continues` and `DepartureBoard continues` put it under their rows; `edge`
 * rounds it to its card and draws the line above it.
 */
export function ContinuationLink({ continues, edge }: { continues: Continuation; /** The card's own corners, and the line above where the card has none of its own. */ edge: "rounded-b-2xl border-t border-border" | "w-full rounded-b-xl" }) {
  const { href, label, icon, count } = continues
  return (
    <a href={href} className={`group hover:bg-muted/50 grid min-h-12 items-center gap-x-3 px-4 py-3 ${edge} ${icon === undefined ? "grid-cols-[1fr_auto]" : "grid-cols-[1rem_1fr_auto]"}`}>
      {icon === undefined ? null : <Icon name={icon} tone="muted" />}
      <span className="font-medium underline decoration-dotted underline-offset-4 group-hover:decoration-solid group-active:decoration-2">{label}</span>
      <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
        {count === undefined ? null : <span className="tabular-nums">{count}</span>}
        <Icon name="chevron-right" size="sm" />
      </span>
    </a>
  )
}

/** A link to the page with all of it, at the end of a section's title. Its label says what it opens, in full («Se alle pull requests»), so it reads right by itself; it has no icon. */
export type More = Omit<LinkTo, "icon">

/** The title with its «see all» link on the same line. The link's target reaches 0.625rem above and below its line (2.75rem tall) without moving it. */
function Head({ more, children }: { more: More | undefined; children: ReactNode }) {
  if (more === undefined) return children
  return (
    <div className="flex min-w-0 items-baseline justify-between gap-4">
      {children}
      <a href={more.href} className="text-muted-foreground hover:text-foreground -my-2.5 inline-flex min-h-6 shrink-0 items-center gap-0.5 py-2.5 text-sm">
        {more.label}
        <Icon name="chevron-right" size="sm" />
      </a>
    </div>
  )
}
