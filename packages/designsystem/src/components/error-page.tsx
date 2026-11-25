import type { LinkTo } from "../lib/vocabulary"
import { ActionLink } from "./internal/action"

interface ErrorPageProps {
  /** The HTTP-style status the page stands for, shown large: 404, 500, 403. */
  status: number
  title: string
  /** A sentence or two on what happened and what helps. */
  description: string
  /** The ways on, the main one first: it is drawn filled, the rest in outline. Each is a plain link, whose target reaches past the button. */
  actions?: readonly LinkTo[]
}

/**
 * The one layout every error page shares, so a 404 in `cv` and a 500 in
 * `budget` look like the same site. Rendered inside `AppLayout`, so the
 * header and the cross-app sidebar stay, and the way out is always there.
 * The first action is the main way on, filled; the page decides that, not the app.
 * The Worker-side twin, for when React cannot run at all, is
 * `@designsystem/config/error-pages`.
 */
export function ErrorPage({ status, title, description, actions = [] }: ErrorPageProps) {
  return (
    <section
      aria-labelledby="error-page-title"
      className="grid justify-items-start gap-3 py-16 [grid-template-areas:'status'_'title'_'description'_'actions']"
    >
      <p className="text-muted-foreground font-mono text-sm [grid-area:status]">{status}</p>
      <h1 id="error-page-title" className="text-3xl font-semibold tracking-tight [grid-area:title]">
        {title}
      </h1>
      <div className="text-muted-foreground max-w-prose [grid-area:description]">{description}</div>
      {actions.length === 0 ? null : (
        <div className="mt-3 flex flex-wrap gap-2 [grid-area:actions]">
          {actions.map((action, index) => (
            <ActionLink key={action.href + action.label} href={action.href} icon={action.icon} look={index === 0 ? "primary" : "outline"}>
              {action.label}
            </ActionLink>
          ))}
        </div>
      )}
    </section>
  )
}
