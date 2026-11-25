import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { List } from "@lmfaole/designsystem/components/list"
import { Progress } from "@lmfaole/designsystem/components/progress"
import { levelProgress } from "@lmfaole/designsystem/lib/games"

import { gameHref } from "../lib/pages.ts"
import type { SteamBadges } from "../lib/steam-profile.ts"
import type { WishlistGame } from "../lib/steam-wishlist.ts"
import { gamePrice } from "../lib/steam-view.ts"
import { shortWhen } from "../lib/when.ts"

/** Games of the wishlist: the store's picture, the price (with a sale struck through, «Nytt tilbud» where it came since the visitor last looked), and the game in the store. */
export function WishlistRows({ games }: { games: readonly WishlistGame[] }) {
  if (games.length === 0) return <EmptyState reason="nothing-yet" what="spill" description="Ingen spill her akkurat nå." />
  return (
    <List
      kind="game"
      rows={games.map((game) => {
        const price = gamePrice(game.price)
        return { key: String(game.appId), title: game.name ?? `Spill ${game.appId}`, href: game.url, external: true, picture: { src: game.image }, ...(game.comingSoon ? { meta: ["Kommer snart"] } : {}), ...(price === null ? {} : { price: { ...price, ...(game.newSale ? { newSale: true } : {}) } }) }
      })}
    />
  )
}

/** The level as a bar: the experience of this level so far against what it takes. */
export function LevelBar({ badges }: { badges: SteamBadges }) {
  if (badges.xpToNext <= 0) return null
  return <Progress {...levelProgress({ level: badges.level, xp: badges.xp, xpAtLevel: badges.xpLevelStart, xpToNext: badges.xpToNext })} />
}

/** The badges, the last earned first: a game's badge links to the game's page where it is one of the visitor's. */
export function BadgeRows({ badges, base, owned }: { badges: SteamBadges; base: string; owned: ReadonlySet<number> }) {
  if (badges.badges.length === 0) return <EmptyState reason="nothing-yet" what="merker" description="Profilen har ingen merker, eller de er ikke offentlige." />
  return (
    <List
      kind="achievement"
      rows={badges.badges.slice(0, 10).map((badge) => ({
        key: `${badge.badgeId}-${badge.appId ?? 0}-${badge.foil ? "folie" : "vanlig"}`,
        title: badge.name ?? "Merke",
        ...(badge.appId !== null && badge.name !== null && owned.has(badge.appId) ? { href: gameHref(base, badge.appId, badge.name) } : {}),
        meta: [`Nivå ${badge.level}`, badge.foil ? "Folie" : null, `${badge.xp.toLocaleString("nb-NO")} XP`],
        value: badge.completed === null ? null : shortWhen(new Date(badge.completed * 1000).toISOString()),
      }))}
    />
  )
}
