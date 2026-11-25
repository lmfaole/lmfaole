import type { ReactNode } from "react"

import { ENTITY_LINK } from "../lib/link-style"
import { HEAD_TITLE, titleStep } from "../lib/long-titles"
import { EXTERNAL_REL, ExternalMark } from "./internal/external-mark"

/**
 * Text in the four roles the design system has, so an app never sets a size, a weight or a colour itself: it says what the words ARE.
 * `Heading` is the look of a heading and `level` the element, so the outline of a page and its looks are chosen apart.
 *
 * - `body` (the default): a paragraph.
 * - `quiet`: a secondary line or a description, smaller and quieter.
 * - `note`: small text under content: a credit, «Sist endret», a source. Usually drawn for you (`PageSection source`).
 * - `figure`: a number in a sentence or a row, its figures lined up under each other. It is a `span`; the others are paragraphs.
 */
const ROLES = {
  body: "text-base",
  quiet: "text-sm text-muted-foreground",
  note: "text-xs text-muted-foreground",
  figure: "text-sm font-medium tabular-nums",
} as const

export type TextRole = keyof typeof ROLES

const HEADINGS = {
  page: `font-heading font-semibold tracking-tight ${HEAD_TITLE}`,
  section: "min-w-0 text-lg font-semibold [overflow-wrap:anywhere]",
  label: "min-w-0 font-mono text-sm font-medium tracking-widest text-muted-foreground uppercase [overflow-wrap:anywhere]",
} as const

/** A long word breaks where it must, so the text never widens the page. */
export function Text({ role = "body", id, children }: { role?: TextRole; children?: ReactNode; id?: string }) {
  const Tag = role === "figure" ? "span" : "p"
  return (
    <Tag id={id} className={`min-w-0 ${ROLES[role]} [overflow-wrap:anywhere]`}>
      {children}
    </Tag>
  )
}

/** A page's title a step smaller when it is long (`titleStep`): never cut, so a long one is smaller rather than taller. */
const PAGE_SIZES = ["text-3xl 2xl:text-4xl", "text-2xl 2xl:text-3xl", "text-xl 2xl:text-2xl"] as const

export function Heading({ level, look = level === 1 ? "page" : level === 2 ? "section" : "label", id, children }: { level: 1 | 2 | 3; look?: keyof typeof HEADINGS; id?: string; children: ReactNode }) {
  const Tag = `h${level}` as const
  return (
    <Tag id={id} className={look === "page" ? `${HEADINGS.page} ${PAGE_SIZES[typeof children === "string" ? titleStep(children) : 0]}` : HEADINGS[look]}>
      {children}
    </Tag>
  )
}

/**
 * The heading inside a card's title (`CardTitle` is a plain `<div>` from shadcn): the outline gets the card, and the look stays the
 * title's own, so nothing is drawn twice.
 */
export function CardHeading({ level, children }: { level: 2 | 3 | 4; children: ReactNode }) {
  const Tag = `h${level}` as const
  return <Tag className="min-w-0 [overflow-wrap:anywhere] [font:inherit]">{children}</Tag>
}

/**
 * A link in or beside running text, with the look every name that has a page shares (`ENTITY_LINK`), the same in every app. `external`
 * is a link out to another site: marked as one (the external symbol, and «(eksternt nettsted)» for a screen reader) and opened without
 * handing the new page a `window.opener`. It replaces `ExternalLink`. A link that covers a whole row is the list's own (`List`, `Tiles`),
 * never a `TextLink`; an action that goes somewhere is a `LinkButton`.
 */
export function TextLink({ href, external = false, children }: { href: string; /** A link out to another site. */ external?: boolean; children: ReactNode }) {
  return (
    <a href={href} className={ENTITY_LINK} {...(external ? { rel: EXTERNAL_REL } : {})}>
      {children}
      {external ? <ExternalMark /> : null}
    </a>
  )
}
