import type { ReactNode } from "react"

import { Icon } from "../icon"
import type { IconName } from "../../lib/icons"
import { Text } from "../text"

/** INTERNAL (`Banner`, `ConnectionBanner`): a message about the whole page, its symbol, its title and a line under it, in the reading column. */
export function Notice({ icon, title, children }: { icon: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="border-border flex items-start gap-3 rounded-lg border p-4">
      <span className="shrink-0 pt-0.5">
        <Icon name={icon} tone="muted" />
      </span>
      <div className="grid min-w-0 gap-1">
        <p className="min-w-0 font-medium [overflow-wrap:anywhere]">{title}</p>
        {children === undefined ? null : <Text role="quiet">{children}</Text>}
      </div>
    </div>
  )
}
