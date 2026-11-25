import type { Day, DayPart } from "./day.ts"
import { DEFAULT_DAY_SETTINGS, type DaySettings } from "./day-settings.ts"

export type SectionId = "weather" | "alerts" | "pulls" | "issues" | "discussions"

/** The front page's sections, in the order they are shown. */
export const SECTIONS: readonly SectionId[] = ["alerts", "pulls", "issues", "discussions", "weather"]

export interface Plan {
  /** `null` when the greeting is turned off. */
  greeting: string | null
  /** What is shown, in order; what is not here is not fetched either. */
  sections: SectionId[]
  /** The forecast for the rest of the day, or for the day after it (counted from the date the day belongs to). */
  weatherWindow: "today" | "tomorrow"
  /** Pull requests: both the ones waiting for your review and your own, or only your own. */
  pulls: "all" | "mine"
}

const GREETINGS: Record<DayPart, string> = { morgen: "God morgen", arbeidsdag: "God dag", kveld: "God kveld", natt: "God natt" }

/** What a weekend leaves out: the work (reviews and assigned issues, discussions). */
const WORK: readonly SectionId[] = ["issues", "discussions"]

/**
 * What the page is made of at a time of day, by the fixed configuration (lib/day-settings.ts). Each part has its sections, weather window and pull requests. With weekends on, a weekend day leaves out the work (issues and
 * discussions) but keeps what is red or waiting in your own repositories (only your own pull requests), with the weather for today until
 * the evening. With the time control off, the page is the same all day: every section, the weather for today, all pull requests.
 */
export function planFor({ part, weekend }: Pick<Day, "part" | "weekend">, settings: DaySettings = DEFAULT_DAY_SETTINGS): Plan {
  const greeting = settings.greeting === "on" ? GREETINGS[part] : null
  if (settings.mode === "off") return { greeting, sections: [...SECTIONS], weatherWindow: "today", pulls: "all" }
  const shown = SECTIONS.filter((id) => settings.show[part].includes(id))
  if (weekend && settings.weekend === "on") {
    return {
      greeting,
      sections: shown.filter((id) => !WORK.includes(id)),
      weatherWindow: part === "morgen" || part === "arbeidsdag" ? "today" : settings.weather[part],
      pulls: "mine",
    }
  }
  return { greeting, sections: shown, weatherWindow: settings.weather[part], pulls: settings.pulls[part] }
}
