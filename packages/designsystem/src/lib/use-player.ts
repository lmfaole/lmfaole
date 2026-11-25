import { useSyncExternalStore } from "react"

import { player, type PlayerState } from "./podcast-player"

/**
 * The podcast player's state in a React component (`lib/podcast-player`'s `player`), redrawn as it changes. The server and the first render
 * in the browser see the empty player (`INITIAL_PLAYER_STATE`), so the two match; what plays shows after hydration. Also exported from
 * `components/podcast-player`. In a client component only: `lib/podcast-player` stays free of React, for a server component to import.
 */
export function usePlayer(): PlayerState {
  return useSyncExternalStore(player.subscribe, player.getState, player.getServerState)
}
