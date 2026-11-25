import { ErrorPage } from "./error-page"

/**
 * 500 for a page that crashed while rendering. The Worker's 500 page draws it. Both ways on are plain links, whose targets reach 0.25rem above
 * and below the buttons: an empty address is this page again, so the first reloads it with or without JavaScript.
 */
export function ServerErrorPage({ home = "/" }: { /** The app's front page, with its base path (`/start/`): the site's root is not always it. */ home?: string }) {
  return (
    <ErrorPage
      status={500}
      title="Noe gikk galt"
      description="Siden fikk en feil den ikke kom seg ut av. Det hjelper som regel å laste siden på nytt. Hvis ikke, ligger feilen hos oss."
      actions={[
        { href: "", label: "Last siden på nytt" },
        { href: home, label: "Gå til forsiden" },
      ]}
    />
  )
}
