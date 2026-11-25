import type { ReactNode } from "react"

import { EmptyIllustration, type EmptyPicture } from "./empty-illustration"

/**
 * INTERNAL (`EmptyState`, `ErrorMessage`): the frame of a page or section with nothing to show, after Apple's «content unavailable»: a
 * large picture, a title, a line under it and one central action, centred both ways in a frame that fills the room it stands in.
 *
 * Its height is decided by where it stands, never by the app: straight in a page it fills the rest of the screen (`100dvh` less
 * `--chrome`, the page's header, room and bars, `shell.css`); inside a `PageSection` (`data-frame="section"`) it is a calm block of
 * `clamp(14rem, 36dvh, 22rem)`, so three empty sections on one front page still read as a page. The title is not a heading: the page's or
 * the section's heading already names the place; it is the largest words of the frame (`text-2xl`, `text-lg` in a section).
 * In a chart's place (`chart`, `ChartEmpty`) it is a section's frame at the chart's own height (`--chart-height`), so nothing moves when data arrives.
 */
export function EmptyFrame({ picture, title, description, role, action, chart = false, children }: { picture: EmptyPicture; title: string; description?: string | undefined; role?: "alert" | undefined; action?: ReactNode; /** In a chart's place: a section's frame, the chart's height. */ chart?: boolean; children?: ReactNode }) {
  return (
    <div
      data-empty-frame={picture}
      {...(chart ? { "data-frame": "section" } : {})}
      {...(role === undefined ? {} : { role })}
      className={
        chart
          ? "@container grid min-h-(--chart-height) w-full min-w-0 place-items-center py-6"
          : "@container grid min-h-[max(18rem,calc(100dvh-var(--chrome,16rem)))] w-full min-w-0 place-items-center py-8 in-data-[frame=section]:min-h-[clamp(14rem,36dvh,22rem)] in-data-[frame=section]:py-6"
      }
    >
      <div className="grid w-full min-w-0 justify-items-center gap-5 text-center in-data-[frame=section]:gap-4">
        <EmptyIllustration picture={picture} />
        <div className="grid min-w-0 justify-items-center gap-2">
          <p className="text-foreground max-w-[30ch] min-w-0 text-2xl font-semibold tracking-tight text-balance hyphens-auto [overflow-wrap:anywhere] in-data-[frame=section]:text-lg">{title}</p>
          {description === undefined ? null : <p className="text-muted-foreground max-w-[42ch] text-base text-pretty [overflow-wrap:anywhere] in-data-[frame=section]:text-sm">{description}</p>}
          {children}
        </div>
        {action === undefined || action === null ? null : <div className="flex w-full justify-center pt-1">{action}</div>}
      </div>
    </div>
  )
}
