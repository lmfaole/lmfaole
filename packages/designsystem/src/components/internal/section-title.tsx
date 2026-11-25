import { Icon } from "../icon"
import type { IconName } from "../../lib/icons"

/** INTERNAL: the title of a section, with the icon that says what it is in front of it (`PageSection`, `SectionSkeleton`), set like a letter of it (`.ds-title-icon` in `icon.css`). */
export function SectionTitle({ icon, children }: { icon: IconName; children: string }) {
  return (
    <span className="inline-flex min-w-0 items-baseline gap-[0.35em]">
      <span className="ds-title-icon shrink-0">
        <Icon name={icon} />
      </span>
      <span className="min-w-0">{children}</span>
    </span>
  )
}

