import { Icon } from "../icon"
import type { IconName } from "../../lib/icons"

/** INTERNAL: the title of a section, with the icon that says what it is in front of it (`PageSection`, `SectionSkeleton`). */
export function SectionTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span className="shrink-0">
        <Icon name={icon} size="lg" />
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  )
}

