import { describeTime } from "@lmfaole/designsystem/lib/time"

/** A time as «19. nov. 2026, 14:05», in Oslo: the page is made at build time, so a relative time («for 2 timer siden») would go stale. */
export function when(iso: string): string {
  return describeTime(iso, new Date(iso), "datetime")?.text ?? ""
}

const SHORT = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Oslo" })

/** «9. nov., 12:39», for the end of a row, where the year only takes room: the lists hold the last weeks. */
export function shortWhen(iso: string): string {
  return SHORT.format(new Date(iso))
}
