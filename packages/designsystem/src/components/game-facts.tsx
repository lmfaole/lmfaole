import type { ReactNode } from "react"

import { countWords, releaseWords, deckWords, gameFeatures, priceWords, reviewSummary, SENTIMENT_ICONS, type DeckCompatibility, type GamePrice } from "../lib/games"
import type { DetailFact } from "./detail-layout"
import { Icon } from "./icon"
import { LiveDot } from "./live-dot"

export type { DeckCompatibility, GamePrice } from "../lib/games"

/** What a game's store and Steam say about it, all optional: a fact without data is left out. */
export interface GameFactsInput {
  /** How many of how many recommend it (`query_summary.total_positive`, `total_reviews`). */
  reviews?: { positive: number; total: number } | null
  /** Playing it right now, worldwide (`GetNumberOfCurrentPlayers`). */
  playersNow?: number | null
  /** Valve's Steam Deck verdict (`deckCompatibility(resolved_category)`). */
  deck?: DeckCompatibility | null
  /** The store's categories (`categories[].id`): how it is played, and with a controller. */
  categories?: readonly number[]
  developers?: readonly string[]
  publishers?: readonly string[]
  /** When it came out, ISO (`release_date.date`, parsed). */
  released?: string | null
  /** What it costs in the store now. */
  price?: GamePrice | null
}

function Line({ icon, children, muted = false }: { icon: ReactNode; children: ReactNode; muted?: boolean }) {
  return (
    <span className={`inline-flex items-start gap-1.5 ${muted ? "text-muted-foreground" : ""}`}>
      <span className="inline-flex h-[1lh] shrink-0 items-center">{icon}</span>
      <span className="min-w-0">{children}</span>
    </span>
  )
}

/**
 * The facts of a game for the rail of its page (`DetailLayout facts`), in a fixed order and the same words in every app: «Anmeldelser»
 * (Steam's summary, its icon by how they lean: a thumb up, scales, a thumb down; the words say it, the colour never stands alone),
 * «Spiller nå» (a live dot and the count), «Steam Deck» (the verdict with its icon), «Spillere» (how it is played, one value each),
 * «Kontroller», «Utvikler», «Utgiver», «Utgitt» and «Pris» (with what it cost before a sale). A fact without data is left out.
 */
export function gameFacts(input: GameFactsInput): DetailFact[] {
  const reviews = input.reviews === undefined || input.reviews === null ? null : reviewSummary(input.reviews.positive, input.reviews.total)
  const features = gameFeatures(input.categories ?? [])
  const deck = input.deck === undefined || input.deck === null ? null : deckWords(input.deck)
  const price = input.price === undefined || input.price === null ? null : priceWords(input.price)
  const facts: [string, DetailFact[1]][] = [
    [
      "Anmeldelser",
      reviews === null ? null : (
        <Line key="reviews" icon={<Icon name={SENTIMENT_ICONS[reviews.sentiment]} size="sm" tone={reviews.sentiment === "positive" ? "primary" : reviews.sentiment === "few" ? "muted" : "default"} />} muted={reviews.sentiment === "few"}>
          {reviews.words}
        </Line>
      ),
    ],
    ["Spiller nå", input.playersNow === undefined || input.playersNow === null || input.playersNow < 0 ? null : <Line key="now" icon={<LiveDot />}>{`${countWords(input.playersNow)} ${input.playersNow === 1 ? "spiller" : "spillere"}`}</Line>],
    ["Steam Deck", deck === null ? null : <Line key="deck" icon={<Icon name={deck.icon} size="sm" tone={deck.tone} />} muted={deck.tone === "muted"}>{deck.word}</Line>],
    ["Spillere", features.players],
    ["Kontroller", features.controller === null ? null : <Line key="controller" icon={<Icon name="controller" size="sm" />}>{features.controller}</Line>],
    ["Utvikler", [...(input.developers ?? [])]],
    ["Utgiver", [...(input.publishers ?? [])]],
    ["Utgitt", input.released === undefined || input.released === null ? null : releaseWords(input.released)],
    [
      "Pris",
      price === null ? null : price.before === null ? price.now : (
        <span key="price">
          <span className="font-medium">{price.discountWords}</span> {price.now}{" "}
          <s className="text-muted-foreground">
            <span className="sr-only">før </span>
            {price.before}
          </s>
        </span>
      ),
    ],
  ]
  return facts
}
