import { darkEnough } from "./sun.ts"

/**
 * The chance of the northern lights: how active the Earth's magnetic field is (the Kp index, 0–9, every three hours, from NOAA's Space Weather
 * Prediction Center), whether that reaches as far south as the place, whether it is dark, and whether the sky is clear (Yr's cloud cover). An
 * estimate, as every aurora forecast is.
 */

/** Three hours of the Kp index: when they start (ISO), the index, and whether it was measured or is forecast. */
export interface KpSlot {
  time: string
  kp: number
  observed: boolean
}

/** SWPC's `noaa-planetary-k-index-forecast.json`: times in UTC without a zone. */
export function parseKp(body: unknown): KpSlot[] {
  if (!Array.isArray(body)) return []
  return body.flatMap((row: unknown) => {
    if (typeof row !== "object" || row === null) return []
    const { time_tag: tag, kp, observed } = row as { time_tag?: unknown; kp?: unknown; observed?: unknown }
    if (typeof tag !== "string" || typeof kp !== "number") return []
    const time = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(tag) ? tag : `${tag}Z`)
    return Number.isNaN(time.getTime()) ? [] : [{ time: time.toISOString(), kp, observed: observed === "observed" }]
  })
}

/**
 * The Kp the aurora needs to be seen overhead at a latitude in Norway. The oval reaches about two degrees of geomagnetic latitude further south for
 * each step of Kp, from 66.5° at Kp 0 (NOAA's table), and in Norway the geomagnetic latitude is about three degrees under the geographic one:
 * about 0 in Tromsø, 3 in Trondheim and 5 in Oslo.
 */
export function kpNeeded(lat: number): number {
  return Math.max(0, (66.5 - (lat - 3)) / 2.05)
}

export type AuroraChance = "god" | "mulig" | "liten"

/** The chance from the Kp alone: good where it is enough to be seen overhead, possible low in the north a step under that. */
export function chanceFromKp(kp: number, lat: number): AuroraChance {
  const margin = kp - kpNeeded(lat)
  return margin >= 0 ? "god" : margin >= -1.5 ? "mulig" : "liten"
}

/** Three dark hours of the coming night with what they give: the Kp, the cloud cover (0–100 %, null where Yr has none), and the chance in all. */
export interface AuroraSlot {
  from: string
  to: string
  kp: number
  clouds: number | null
  chance: AuroraChance
  /** The chance from the Kp alone, before the clouds: «god», but the sky is overcast. */
  sky: AuroraChance
}

/** Cloud cover over 70 % hides it; over 40 % takes a step off. */
function withClouds(chance: AuroraChance, clouds: number | null): AuroraChance {
  if (clouds === null || clouds <= 40) return chance
  if (clouds > 70) return "liten"
  return chance === "god" ? "mulig" : "liten"
}

/**
 * The dark three-hour slots of the coming night (the first ones in a row from now, within the next `hours` hours), with the Kp and the clouds of each: a slot counts as dark when the sun is
 * more than 6° under the horizon at its middle.
 */
export function auroraNight(slots: readonly KpSlot[], clouds: readonly { time: string; clouds: number }[], instant: Date, lat: number, lon: number, hours = 24): AuroraSlot[] {
  const end = instant.getTime() + hours * 3_600_000
  const dark = slots.flatMap((slot) => {
    const from = new Date(slot.time).getTime()
    const to = from + 3 * 3_600_000
    if (to <= instant.getTime() || from >= end) return []
    if (!darkEnough(new Date(from + 1.5 * 3_600_000), lat, lon)) return []
    const inSlot = clouds.filter((one) => {
      const at = new Date(one.time).getTime()
      return at >= from && at < to
    })
    const cover = inSlot.length === 0 ? null : Math.round(inSlot.reduce((sum, one) => sum + one.clouds, 0) / inSlot.length)
    const sky = chanceFromKp(slot.kp, lat)
    return [{ from: new Date(from).toISOString(), to: new Date(to).toISOString(), kp: slot.kp, clouds: cover, chance: withClouds(sky, cover), sky }]
  })
  // Only the one night: the first slots that follow each other, not the next evening as well.
  const gap = dark.findIndex((slot, index) => index > 0 && slot.from !== dark[index - 1]?.to)
  return gap === -1 ? dark : dark.slice(0, gap)
}

const RANK: Record<AuroraChance, number> = { liten: 0, mulig: 1, god: 2 }

/** The best slot of the night: the highest chance, then the highest Kp, the earliest first. */
export function bestSlot(night: readonly AuroraSlot[]): AuroraSlot | undefined {
  return night.reduce<AuroraSlot | undefined>((best, slot) => (best === undefined || RANK[slot.chance] > RANK[best.chance] || (RANK[slot.chance] === RANK[best.chance] && slot.kp > best.kp) ? slot : best), undefined)
}

export const CHANCE_LABEL: Record<AuroraChance, string> = { god: "God sjanse", mulig: "Mulig, lavt i nord", liten: "Liten sjanse" }
