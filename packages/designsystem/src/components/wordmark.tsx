import { APP_GLYPHS, type AppGlyph } from "../lib/brand"

export type MarkSize = "sm" | "md" | "lg"

const TILE: Record<MarkSize, string> = { sm: "size-6", md: "size-8", lg: "size-12" }
const NAME: Record<MarkSize, string> = { sm: "text-sm", md: "text-base", lg: "text-2xl" }
const GAP: Record<MarkSize, string> = { sm: "gap-2", md: "gap-2.5", lg: "gap-3" }

/** Where a glyph's first path is clipped when it moves on its own in `reveal`: the sun below its horizon. */
const HORIZON: Partial<Record<AppGlyph, number>> = { sunrise: 66 }

/**
 * The app's mark: its glyph on a rounded tile, the same shape for every app in the family, in the app's brand colour (`data-brand`; the ink without one). The same drawing as the
 * app's icon on a home screen and in a tab (`npx designsystem-app-icons`), so the app is recognised where it is opened. Decoration beside the
 * app's name, so hidden from a screen reader; never a button or a link on its own.
 *
 * Brand motion (guide «Motion», «Brand motion»), for a signature moment only and never in the chrome: `reveal` plays the mark's gesture once as it
 * appears (the play mark beats twice, the sun rises over its horizon, any other mark rises into place), on the brand's tokens, within a second.
 * `loading` is a wait: after a second the glyph beats twice and rests, so say in words what is waited for. Under reduced motion both stand still.
 */
export function AppMark({ glyph, size = "md", reveal = false, loading = false }: { glyph: AppGlyph; size?: MarkSize; /** Play the mark's gesture once as it appears: the first run's first step, an empty page. */ reveal?: boolean; /** A wait of more than a second: the glyph beats twice, then rests. */ loading?: boolean }) {
  const motion = reveal ? "reveal" : loading ? "loading" : undefined
  const horizon = reveal ? HORIZON[glyph] : undefined
  const paths = APP_GLYPHS[glyph].map((path, index) => {
    const drawn = <path key={path.d} d={path.d} fill={path.fill} stroke={path.stroke} strokeWidth={path.strokeWidth} strokeLinejoin={path.strokeLinejoin === "round" ? "round" : undefined} strokeLinecap={path.strokeLinecap === "round" ? "round" : undefined} {...(horizon !== undefined && index === 0 ? { "data-sun": "" } : {})} />
    // A nested <svg> clips what is under its height, so the sun is hidden below the horizon as it rises: no clip-path id to keep unique on the page.
    return horizon !== undefined && index === 0 ? (
      <svg key={path.d} width="100" height={horizon} viewBox={`0 0 100 ${horizon}`} overflow="hidden">
        {drawn}
      </svg>
    ) : (
      drawn
    )
  })
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" data-app-mark={glyph} data-mark-motion={motion} className={`${TILE[size]} shrink-0 text-brand-foreground`}>
      <rect width="100" height="100" rx="22" className="fill-brand" />
      {motion === undefined ? paths : <g data-glyph="">{paths}</g>}
    </svg>
  )
}

/**
 * The app's name with its mark: at the top of the `NavBar` rail, in the first-run introduction, on a page about the app. `family` is the
 * family it belongs to, said after the name and quieter («Medier · lmfaole»): the app leads, the family vouches for it (an endorsed brand).
 * The name is text in the reading font, in the ink; the colour is in the mark only.
 */
export function Wordmark({ name, glyph, family, size = "md" }: { name: string; glyph: AppGlyph; family?: string; size?: MarkSize }) {
  return (
    <span className={`inline-flex min-w-0 items-center ${GAP[size]}`}>
      <AppMark glyph={glyph} size={size} />
      <span className={`font-heading min-w-0 truncate font-semibold tracking-tight ${NAME[size]}`}>
        {name}
        {family === undefined ? null : (
          <span className="text-muted-foreground font-normal">
            <span aria-hidden="true"> · </span>
            <span className="sr-only"> </span>
            {family}
          </span>
        )}
      </span>
    </span>
  )
}
