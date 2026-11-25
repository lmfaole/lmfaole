import { parseKp, type KpSlot } from "./aurora.ts"
import { KP_URL } from "./snapshot"
import { upstream } from "./upstream"

/** The Kp index every three hours, measured for the last days and forecast for the next three, from NOAA's Space Weather Prediction Center. */
export async function getKp(): Promise<KpSlot[]> {
  const response = await upstream(KP_URL, { revalidate: 1800 })
  if (!response.ok) throw new Error(`NOAA svarte ${response.status}`)
  return parseKp(await response.json())
}
