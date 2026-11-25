import type { ReactNode } from "react"

/**
 * What an empty frame shows, by its reason: the four reasons of `EmptyState` and the failure of `ErrorMessage`. The picture says which of
 * them it is at a glance, so «nothing yet», «no results», «all done» and «could not fetch» are never mistaken for each other.
 */
export type EmptyPicture = "first-run" | "nothing-yet" | "no-results" | "all-done" | "failed"

/**
 * INTERNAL (`EmptyState`, `ErrorMessage`): the picture of an empty or failed frame, one composition per reason, in the theme's tokens only
 * (it follows light, dark and the app's brand), drawn as inline SVG so it costs no request and is sharp at any size. It is decoration: the
 * title says the same in words, so it is hidden from assistive technology. It is sized by the frame it stands in (`clamp(7.5rem, 32cqi, 11rem)` in a page, smaller in a section),
 * and settles into place once as the page arrives (`motion-float`), not at all under reduced motion.
 *
 * - `first-run` and `nothing-yet`: a stack of cards, the front one the empty place where the first will land; `first-run` marks it with a
 *   «+» in the app's brand (the way to fill it is the action under it), `nothing-yet` with three dots (it comes by itself).
 * - `no-results`: a magnifier over a list with nothing in its rows.
 * - `all-done`: a tidy stack with a check.
 * - `failed`: a card with a warning sign.
 */
export function EmptyIllustration({ picture }: { picture: EmptyPicture }) {
  return (
    <svg viewBox="0 0 200 160" aria-hidden="true" focusable="false" data-empty-picture={picture} className="motion-float block h-auto w-[clamp(7.5rem,32cqi,11rem)] overflow-visible in-data-[frame=section]:w-[clamp(6rem,24cqi,8rem)]">
      <circle cx="100" cy="86" r="66" className="fill-muted" />
      {COMPOSITIONS[picture]}
    </svg>
  )
}

/** A card of the stack: the theme's card on its border. */
function Card({ x, y, width, height, turn = 0, look = "fill-card stroke-foreground/15" }: { x: number; y: number; width: number; height: number; turn?: number; look?: string }) {
  return <rect x={x} y={y} width={width} height={height} rx="10" strokeWidth="2" className={look} {...(turn === 0 ? {} : { transform: `rotate(${turn} ${x + width / 2} ${y + height / 2})` })} />
}

/** The lines of text on a card, as soft bars: a thing's name and the line under it. */
function Lines({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <>
      <rect x={x} y={y} width={width} height="7" rx="3.5" className="fill-muted-foreground/45" />
      <rect x={x} y={y + 14} width={width * 0.62} height="7" rx="3.5" className="fill-muted-foreground/25" />
    </>
  )
}

/** The two cards behind the front one, fanned a little: there is a place for many. */
function Fan() {
  return (
    <>
      <Card x={62} y={34} width={84} height={56} turn={-9} look="fill-card stroke-foreground/15 opacity-70" />
      <Card x={56} y={44} width={96} height={62} turn={5} />
    </>
  )
}

/** A badge in the corner of the composition: the one detail that rises a beat after the rest. */
function Badge({ look, children }: { look: string; children: ReactNode }) {
  return (
    <g data-float-detail="">
      <circle cx="148" cy="62" r="19" className={look} />
      {children}
    </g>
  )
}

const COMPOSITIONS: Record<EmptyPicture, ReactNode> = {
  "first-run": (
    <>
      <Fan />
      <Card x={44} y={64} width={112} height={66} />
      <rect x="58" y="78" width="26" height="26" rx="6" className="fill-muted" />
      <Lines x={94} y={81} width={48} />
      <Badge look="fill-brand">
        <path d="M148 53v18M139 62h18" strokeWidth="4" strokeLinecap="round" className="stroke-brand-foreground" />
      </Badge>
    </>
  ),
  "nothing-yet": (
    <>
      <Fan />
      <Card x={44} y={64} width={112} height={66} look="fill-background stroke-muted-foreground/50 [stroke-dasharray:7_6]" />
      <g data-float-detail="">
        <circle cx="84" cy="97" r="5" className="fill-muted-foreground/60" />
        <circle cx="100" cy="97" r="5" className="fill-muted-foreground/45" />
        <circle cx="116" cy="97" r="5" className="fill-muted-foreground/30" />
      </g>
    </>
  ),
  "no-results": (
    <>
      <Card x={40} y={38} width={110} height={92} />
      {[54, 80, 106].map((y) => (
        <g key={y}>
          <circle cx="58" cy={y + 4} r="7" className="fill-muted" />
          <rect x="72" y={y} width="60" height="8" rx="4" className="fill-muted" />
        </g>
      ))}
      <g data-float-detail="">
        <path d="M151 117l20 20" strokeWidth="11" strokeLinecap="round" className="stroke-foreground" />
        <circle cx="134" cy="100" r="25" strokeWidth="7" className="fill-background stroke-foreground" />
        <path d="M122 92a14 14 0 0 1 12-6" strokeWidth="4" strokeLinecap="round" fill="none" className="stroke-muted-foreground/50" />
      </g>
    </>
  ),
  "all-done": (
    <>
      <Card x={52} y={50} width={96} height={20} look="fill-card stroke-foreground/15 opacity-70" />
      <Card x={48} y={62} width={104} height={20} look="fill-card stroke-foreground/15 opacity-85" />
      <Card x={44} y={74} width={112} height={56} />
      <Lines x={60} y={92} width={64} />
      <Badge look="fill-primary">
        <path d="M139 62.5l6 6 12-13" pathLength="1" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="motion-draw stroke-primary-foreground" />
      </Badge>
    </>
  ),
  failed: (
    <>
      <Card x={56} y={44} width={96} height={62} turn={5} look="fill-card stroke-foreground/15 opacity-70" />
      <Card x={44} y={64} width={112} height={66} />
      <Lines x={60} y={82} width={64} />
      <rect x="60" y="110" width="40" height="7" rx="3.5" className="fill-muted-foreground/25" />
      <g data-float-detail="">
        <path d="M148 40l23 40h-46z" strokeWidth="5" strokeLinejoin="round" className="fill-destructive stroke-destructive" />
        <path d="M148 55v12" strokeWidth="5" strokeLinecap="round" className="stroke-background" />
        <circle cx="148" cy="74" r="2.8" className="fill-background" />
      </g>
    </>
  ),
}
