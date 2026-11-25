import { Icon } from "./icon"
import type { IconName } from "../lib/icons"
import type { Tone } from "../lib/vocabulary"

export interface Status {
  text: string
  /** `destructive` is for what stops something: a failure, a conflict, a change asked for. */
  tone?: Tone
  /** What it means, next to the words: a status with a symbol is found at a glance, and does not depend on its colour. */
  icon?: IconName
}

const TONES: Readonly<Record<Tone, string>> = { default: "", muted: "text-muted-foreground", destructive: "text-destructive font-medium" }

/**
 * Short statuses on one line, each with an icon and its words (`Tester feilet`, `Godkjent`, `Venter 3 dager`). The icon
 * means the same as the words and the colour never stands alone, so a status reads the same without colour. Nothing is
 * drawn for an empty list.
 */
export function StatusLine({ items }: { items: readonly Status[] }) {
  if (items.length === 0) return null
  return (
    <ul className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs">
      {items.map((item) => (
        <li key={item.text} className={`inline-flex min-w-0 items-center gap-1 [overflow-wrap:anywhere] ${TONES[item.tone ?? "default"]}`}>
          {item.icon === undefined ? null : <Icon name={item.icon} size="sm" tone={item.tone === "destructive" ? "destructive" : item.tone === "muted" ? "muted" : "default"} />}
          {item.text}
        </li>
      ))}
    </ul>
  )
}
