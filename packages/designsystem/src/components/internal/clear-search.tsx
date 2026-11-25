"use client"

import { useEffect, useState } from "react"

import { ActionLink } from "./action"

/**
 * INTERNAL (`EmptyState reason="no-results"`): «Tøm søket», the way out of a search that found nothing. It is a link to the same page
 * without the search (`q`) and without a page number, the other filters kept; before the script has run it goes to the page with no query at all.
 */
export function ClearSearch() {
  const [href, setHref] = useState("?")
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete("q")
    url.searchParams.delete("side")
    setHref(`${url.pathname}${url.search}${url.hash}`)
  }, [])
  return (
    <ActionLink href={href} icon="close" look="primary" central>
      Tøm søket
    </ActionLink>
  )
}
