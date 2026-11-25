import { getCloudflareContext } from "@opennextjs/cloudflare"

/** `MOCK_DATA=1`: every upstream answers from fixtures (lib/mock.ts), for local development with no keys and no network. */
export const mocking = (): boolean => env("MOCK_DATA") === "1"

/** A variable or secret: from the Worker's bindings when deployed, from the process environment in `next dev`. */
export function env(name: string): string | undefined {
  try {
    const value = (getCloudflareContext().env as unknown as Record<string, unknown>)[name]
    if (typeof value === "string" && value !== "") return value
  } catch {
    // Not running in a Worker.
  }
  return process.env[name] || undefined
}
