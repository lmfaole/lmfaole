/**
 * How the front page follows the time of day: one fixed configuration for everyone (there are no settings, and the server reads no
 * cookie), used by lib/day.ts and lib/plan.ts. Pure, so a test pins it.
 */
import type { DayPart } from "./day.ts"
import type { SectionId } from "./plan.ts"

export const PARTS: readonly DayPart[] = ["morgen", "arbeidsdag", "kveld", "natt"]

export type OnOff = "on" | "off"
export type WeatherWindow = "today" | "tomorrow"
export type PullsMode = "all" | "mine"

export interface DaySettings {
  /** `off`: the same front page all day (every chosen section, the weather for today, all pull requests). */
  mode: "auto" | "off"
  greeting: OnOff
  /** When each part of the day starts, in minutes after midnight, Oslo time; increasing in the day's cyclic order from the morning. */
  starts: Record<DayPart, number>
  /** Whether weekends have their own behaviour (`weekendPlan` in lib/plan.ts). */
  weekend: OnOff
  /** The days that are weekend days, 0 (Sunday) to 6 (Saturday). */
  weekendDays: number[]
  show: Record<DayPart, SectionId[]>
  weather: Record<DayPart, WeatherWindow>
  pulls: Record<DayPart, PullsMode>
}

export const DEFAULT_DAY_SETTINGS: DaySettings = {
  mode: "auto",
  greeting: "on",
  starts: { morgen: 5 * 60, arbeidsdag: 9 * 60, kveld: 16 * 60, natt: 22 * 60 },
  weekend: "on",
  weekendDays: [6, 0],
  show: {
    morgen: ["weather", "alerts", "pulls", "issues", "discussions"],
    arbeidsdag: ["alerts", "pulls", "issues", "discussions", "weather"],
    kveld: ["alerts", "pulls", "weather"],
    natt: ["weather"],
  },
  weather: { morgen: "today", arbeidsdag: "today", kveld: "tomorrow", natt: "tomorrow" },
  pulls: { morgen: "all", arbeidsdag: "all", kveld: "mine", natt: "mine" },
}
