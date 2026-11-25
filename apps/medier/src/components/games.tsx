import type { ReactNode } from "react"

import { EmptyState } from "@lmfaole/designsystem/components/empty-state"
import { type DetailFact, DetailLayout } from "@lmfaole/designsystem/components/detail-layout"
import { FactList } from "@lmfaole/designsystem/components/fact-list"
import { gameFacts } from "@lmfaole/designsystem/components/game-facts"
import { Stack } from "@lmfaole/designsystem/components/layout"
import { List } from "@lmfaole/designsystem/components/list"
import { PageSection } from "@lmfaole/designsystem/components/page-section"
import { Progress } from "@lmfaole/designsystem/components/progress"
import { Text, TextLink } from "@lmfaole/designsystem/components/text"
import { LATEST, rarestBeyond, unlockedOf } from "../lib/achievement-view.ts"
import { longDay } from "../lib/days.ts"
import { gameHref, retroGameHref } from "../lib/pages.ts"
import type { GameEntry, GameView } from "../lib/played-games.ts"
import { sourcesOf } from "../lib/image-sources.ts"
import type { GameExtras } from "../lib/sources.ts"
import type { GameStat } from "../lib/steam-profile.ts"
import type { StoreApp } from "../lib/steam-store.ts"
import { deckVerdict, gamePrice, newsKindOf } from "../lib/steam-view.ts"
import { statFacts } from "@lmfaole/designsystem/lib/games"
import { type Achievement, playtimeText } from "../lib/steam.ts"
import { shortWhen } from "../lib/when.ts"

const PRIVATE = "Spill fra Steam vises bare når spilldetaljene på profilen er offentlige."

/** A game's page here: Steam's under «spill/», RetroAchievements' under «spill/retro/». */
export const entryHref = (base: string, entry: Pick<GameEntry, "source" | "id" | "title">): string => (entry.source === "steam" ? gameHref(base, entry.id, entry.title) : retroGameHref(base, entry.id, entry.title))

const when = (seconds: number | null): string => (seconds === null ? "" : shortWhen(new Date(seconds * 1000).toISOString()))

/**
 * The games played the last two weeks, from every service, the last played first: each in its wide picture (Steam's banner, a retro game's title screen), linked to its page here,
 * with where it was played and the time in all.
 */
export function RecentGames({ games, base, empty, playing }: { games: readonly GameEntry[]; base: string; /** Where to find the profiles, when there is nothing. */ empty?: { href: string; label: string }; /** The Steam app played now (the profile's presence): its row is first and says «Spilles nå». */ playing?: number | null }) {
  const isPlaying = (game: GameEntry): boolean => playing !== undefined && playing !== null && game.source === "steam" && game.id === playing
  games = [...games.filter(isPlaying), ...games.filter((game) => !isPlaying(game))]
  if (games.length === 0) return <EmptyState reason="nothing-yet" what="spill" description={`Spill som er spilt på Steam og med RetroAchievements de siste to ukene, dukker opp her. ${PRIVATE}`} {...(empty === undefined ? {} : { action: empty })} />
  return (
    <List
      kind="game"
      rows={games.map((game) => ({ key: `${game.source}-${game.id}`, title: game.title, href: entryHref(base, game), picture: { sources: sourcesOf(game.picture) }, meta: [game.platform, game.totalMinutes > 0 ? `${playtimeText(game.totalMinutes)} totalt` : null], value: game.lastPlayed === null ? playtimeText(game.recentMinutes) : when(game.lastPlayed), ...(isPlaying(game) ? { live: true } : {}) }))}
    />
  )
}

/** The games played most of all, from every service, by the hours, ranked. */
export function MostPlayedGames({ games, base }: { games: readonly GameEntry[]; base: string }) {
  if (games.length === 0) return <EmptyState reason="nothing-yet" what="spill" description={PRIVATE} />
  return <List kind="game" ranked rows={games.map((game) => ({ key: `${game.source}-${game.id}`, title: game.title, href: entryHref(base, game), picture: { sources: sourcesOf(game.picture) }, meta: [game.platform], value: playtimeText(game.totalMinutes), amount: game.totalMinutes }))} />
}

/** The numbers of a game's head, the same for every service: the time in all, the last two weeks where it was played then, the achievements, and the points where the service gives them. */
export function gameFigures(view: GameView): { value: string; label: string }[] {
  return [
    ...(view.totalMinutes > 0 ? [{ value: playtimeText(view.totalMinutes), label: "spilt i alt" }] : []),
    ...(view.recentMinutes > 0 ? [{ value: playtimeText(view.recentMinutes), label: "siste to uker" }] : []),
    ...(view.achievements === null ? [] : [{ value: `${view.achievements.unlocked} av ${view.achievements.total}`, label: "prestasjoner" }]),
    ...(view.points === null ? [] : [{ value: `${view.points.got} av ${view.points.of}`, label: "poeng" }]),
  ]
}

const day = (seconds: number): string => new Date(seconds * 1000).toISOString().slice(0, 10)
const share = (percent: number | null): string | null => (percent === null ? null : `${percent.toLocaleString("nb-NO", { maximumFractionDigits: percent < 10 ? 1 : 0 })} % av spillerne har den`)

export function AchievementRows({ list }: { list: readonly Achievement[] }) {
  return <List kind="achievement" rows={list.map((one) => ({ key: one.key, title: one.name, picture: { src: one.icon }, meta: [one.description, share(one.percent)], value: one.unlocked === null ? null : shortWhen(new Date(one.unlocked * 1000).toISOString()) }))} />
}

/** A day out as the page writes it: an ISO day in words, a year or a month as the year, the store's own words as they are. */
const releasedText = (released: string | null): string | null => (released === null ? null : /^\d{4}-\d\d-\d\d$/.test(released) ? longDay(released) : /^\d{4}(-\d\d)?$/.test(released) ? released.slice(0, 4) : released)

/**
 * A game's page, the same for every service, the owner's own first: the achievements, how many of how many with the last five unlocked (continued on their own page where there is
 * one), and the three rarest the owner has where the five do not show them already; their numbers in the game; the time on each machine; then what the game is, its pictures, its
 * news and its DLC. Who made it and when, and where it is sold, beside.
 */
export function GameDetail({ view, steam, achievementsHref, children }: { view: GameView; /** The page of all the game's achievements, the locked too, where there is one. */ achievementsHref?: string; /** A Steam game's own: the store's page, what Steam says beyond it (reviews, players now, news, the Deck, DLC) and the owner's numbers in it. */ steam?: { store: StoreApp | null; extras: GameExtras | null; stats: readonly GameStat[]; base: string }; /** Sections of its own after the text (the pictures, which are an island). */ children?: ReactNode }) {
  const { achievements } = view
  const unlocked = achievements === null ? [] : unlockedOf(achievements.list)
  const rarest = rarestBeyond(unlocked)
  const metacritic: [string, ReactNode] = ["Metacritic", view.metacritic === null ? null : <TextLink href={view.metacritic.url} external>{String(view.metacritic.score)}</TextLink>]
  const lastPlayed: [string, ReactNode] = ["Sist spilt", view.lastPlayed === null ? null : longDay(day(view.lastPlayed))]
  const extras = steam?.extras ?? null
  const store = steam?.store ?? null
  const facts: DetailFact[] =
    steam === undefined
      ? [["Plattform", view.platform], ["Utvikler", view.developer], ["Utgiver", view.publisher], ["Utgitt", releasedText(view.released)], lastPlayed, ["Utmerkelse", view.award], ["Spillere", view.players === null ? null : view.players.toLocaleString("nb-NO")], metacritic, ["Pris", view.price]]
      : [
          ["Plattform", view.platform],
          ...gameFacts({
            reviews: extras?.reviews == null || extras.reviews.total === 0 ? null : { positive: extras.reviews.positive, total: extras.reviews.total },
            playersNow: extras?.playersNow ?? null,
            deck: deckVerdict(extras?.deck ?? null),
            categories: store?.categories.map((category) => category.id) ?? [],
            developers: store?.developers ?? [],
            publishers: (store?.publishers ?? []).filter((one) => !(store?.developers ?? []).includes(one)),
            released: view.released !== null && /^\d{4}-\d\d-\d\d$/.test(view.released) ? view.released : null,
            price: gamePrice(store?.priceNow ?? null),
          }),
          ...(view.released !== null && !/^\d{4}-\d\d-\d\d$/.test(view.released) ? ([["Utgitt", releasedText(view.released)]] as DetailFact[]) : []),
          lastPlayed,
          metacritic,
        ]
  const own = steam === undefined ? [] : statFacts(steam.stats)
  const news = extras?.news.slice(0, 5) ?? []
  const dlc = extras?.dlc ?? []
  return (
    <DetailLayout facts={facts} links={[view.link]}>
      <PageSection id="prestasjoner" title="Prestasjoner" icon="target" continues={achievementsHref === undefined || achievements === null || achievements.total <= Math.min(unlocked.length, LATEST) ? undefined : { href: achievementsHref, label: `Se alle ${achievements.total} prestasjoner` }}>
        {achievements === null ? (
          <EmptyState reason="nothing-yet" what="prestasjoner" description={view.source === "steam" ? "Spillet har ingen prestasjoner, eller de er ikke offentlige på profilen." : "Spillet har ingen prestasjoner på RetroAchievements ennå."} />
        ) : (
          <Stack>
            <Progress label="Låst opp" value={achievements.unlocked} max={achievements.total} valueText={`${achievements.unlocked} av ${achievements.total}`} />
            {unlocked.length === 0 ? <Text role="quiet">Ingen låst opp ennå.</Text> : <AchievementRows list={unlocked.slice(0, LATEST)} />}
          </Stack>
        )}
      </PageSection>
      {rarest.length === 0 ? null : (
        <PageSection id="sjeldneste" title="De sjeldneste" icon="favorite">
          <AchievementRows list={rarest} />
        </PageSection>
      )}
      {own.length === 0 ? null : (
        <PageSection id="tall" title="Tall i spillet" icon="trend-up">
          <FactList facts={own} />
        </PageSection>
      )}
      {view.platforms.length === 0 ? null : (
        <PageSection id="spilletid" title="Spilletid per maskin" icon="duration">
          <List ranked rows={view.platforms.map((platform) => ({ key: platform.label, title: platform.label, value: playtimeText(platform.minutes), amount: platform.minutes }))} />
        </PageSection>
      )}
      {view.description === null ? null : (
        <PageSection id="om" title="Om spillet" icon="info" source={{ label: view.description.from }}>
          <Text>{view.description.text}</Text>
        </PageSection>
      )}
      {children}
      {news.length === 0 ? null : (
        <PageSection id="nytt" title="Siste nytt" icon="article" source={{ label: "Steam" }}>
          <List rows={news.map((item) => ({ key: item.id, title: item.title, href: item.url, external: true, meta: [item.feedLabel, shortWhen(new Date(item.date * 1000).toISOString())], ...(newsKindOf(item) === undefined ? {} : { news: newsKindOf(item)! }) }))} />
        </PageSection>
      )}
      {dlc.length === 0 ? null : (
        <PageSection id="tillegg" title="Tillegg" icon="package">
          <List rows={dlc.map((one) => ({ key: String(one.appId), title: one.name, href: one.url, external: true, ...(gamePrice(one.price) === null ? {} : { price: gamePrice(one.price)! }) }))} />
        </PageSection>
      )}
    </DetailLayout>
  )
}
