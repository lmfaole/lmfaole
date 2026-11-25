import { ErrorPage } from "./error-page"

/**
 * 404 for a path the app has no page for, drawn in the page chrome of an island. The Worker's own 404 is
 * `@designsystem/config/error-pages`. The way on is a plain link, filled as the page's main action, whose target reaches 0.25rem above and below the button.
 */
export function NotFoundPage({ home = "/" }: { /** The app's front page, with its base path (`/start/`): the site's root is not always it. */ home?: string }) {
  return (
    <ErrorPage
      status={404}
      title="Siden finnes ikke"
      description="Det er ingenting på denne adressen. Siden kan ha flyttet, eller lenken har en skrivefeil."
      actions={[{ href: home, label: "Gå til forsiden" }]}
    />
  )
}
