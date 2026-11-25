// A new key for the relay and the Workers that ask it, in an order where no ask is ever refused (README «Nøkkelen»): the relay takes the new key besides
// the old one, then each app gets it, then the relay keeps only it. No step needs the old key, so it never has to be read back. Pure: the script
// (`scripts/rotate-key.ts`) runs the steps.

/** The Workers that ask the relay with the key, as their `UPSTREAM_KEY`. */
export const CLIENTS = ["medier", "startside"] as const

/** A step: a secret put or deleted on a Worker (`null` is the relay itself, by its `wrangler.jsonc`), or a pause while the new version reaches every place. */
export type Step = { do: "put" | "delete"; secret: "UPSTREAM_KEY" | "UPSTREAM_KEY_NEXT"; worker: string | null } | { do: "wait" }

export function rotation(clients: readonly string[]): Step[] {
  return [
    { do: "put", secret: "UPSTREAM_KEY_NEXT", worker: null },
    { do: "wait" },
    ...clients.map((worker): Step => ({ do: "put", secret: "UPSTREAM_KEY", worker })),
    { do: "wait" },
    { do: "put", secret: "UPSTREAM_KEY", worker: null },
    { do: "wait" },
    { do: "delete", secret: "UPSTREAM_KEY_NEXT", worker: null },
  ]
}
