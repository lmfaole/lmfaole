import { type MediaItem, MediaGallery } from "@lmfaole/designsystem/components/media-gallery"
import { PageSection } from "@lmfaole/designsystem/components/page-section"

/** A game's films and screenshots in a section of its page, named for what is in it. An island (`client:visible`): the dialog it opens needs to be hydrated. */
export function GameMedia({ items }: { items: MediaItem[] }) {
  const films = items.some((item) => item.kind === "video")
  const pictures = items.some((item) => item.kind === "picture")
  const title = films && pictures ? "Bilder og videoer" : films ? "Videoer" : "Bilder"
  return (
    <PageSection id="bilder" title={title} icon={films && !pictures ? "video" : "image"}>
      <MediaGallery items={items} label={title} />
    </PageSection>
  )
}
