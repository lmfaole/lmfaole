/**
 * The facts of a podcast for the rail of its page (`DetailLayout facts`), in the same terms and words in every app: who publishes it, its
 * categories (Apple's, in Norwegian), its language, how often it comes out (from the dates of its episodes), how many episodes and since when.
 */

/** Apple's podcast categories (the top level and the common ones under it) in Norwegian; one that is not here is shown as the feed has it. */
const CATEGORIES: Readonly<Record<string, string>> = {
  arts: "Kunst",
  books: "Bøker",
  business: "Næringsliv",
  comedy: "Humor",
  education: "Utdanning",
  fiction: "Fiksjon",
  government: "Offentlig forvaltning",
  history: "Historie",
  "health & fitness": "Helse og trening",
  "mental health": "Psykisk helse",
  "kids & family": "Barn og familie",
  leisure: "Fritid",
  music: "Musikk",
  news: "Nyheter",
  "daily news": "Dagsnytt",
  politics: "Politikk",
  "religion & spirituality": "Religion og livssyn",
  science: "Vitenskap",
  "society & culture": "Samfunn og kultur",
  documentary: "Dokumentar",
  "personal journals": "Dagbøker",
  sports: "Sport",
  football: "Fotball",
  technology: "Teknologi",
  "true crime": "Krim",
  "tv & film": "TV og film",
}

/** A category in Norwegian: «Society & Culture» is «Samfunn og kultur»; one we do not know stays as it is. */
export function categoryWords(category: string): string {
  const name = category.trim()
  return CATEGORIES[name.toLowerCase()] ?? name
}

/** A feed's language (`no`, `nb-NO`, `en-us`) as the name of the language in Norwegian, with a capital: «Norsk», «Engelsk». */
export function languageWords(code: string): string | null {
  const base = code.trim().split(/[-_]/)[0]?.toLowerCase() ?? ""
  if (!/^[a-z]{2,3}$/.test(base)) return null
  let name: string | undefined
  try {
    name = new Intl.DisplayNames(["nb"], { type: "language" }).of(base)
  } catch {
    return null
  }
  if (name === undefined || name.toLowerCase() === base) return null
  return name.charAt(0).toLocaleUpperCase("nb") + name.slice(1)
}

const DAY = 86_400_000

/**
 * How often new episodes come, from their dates (ISO, any order), in words: «Hver dag», «Flere ganger i uken», «Hver uke», «Annenhver uke»,
 * «Hver måned» or «Sjeldnere enn hver måned», from the median gap between the last twenty. With `now`, a podcast whose latest episode is
 * long past its usual gap (three gaps, and at least two months) says «Ingen nye siden {måned år}». `null` with fewer than three dates.
 */
export function releaseFrequency(dates: readonly string[], now?: string): string | null {
  const times = dates
    .map((date) => Date.parse(date))
    .filter((time) => Number.isFinite(time))
    .toSorted((a, b) => a - b)
    .slice(-21)
  if (times.length < 3) return null
  const gaps = times
    .slice(1)
    .map((time, index) => (time - (times[index] ?? time)) / DAY)
    .toSorted((a, b) => a - b)
  const middle = gaps.length >> 1
  const median = gaps.length % 2 === 1 ? (gaps[middle] ?? 0) : ((gaps[middle - 1] ?? 0) + (gaps[middle] ?? 0)) / 2
  const latest = times.at(-1) ?? 0
  if (now !== undefined) {
    const since = (Date.parse(now) - latest) / DAY
    if (since > Math.max(3 * median, 60)) return `Ingen nye siden ${new Intl.DateTimeFormat("nb", { month: "long", year: "numeric", timeZone: "Europe/Oslo" }).format(latest)}`
  }
  if (median <= 1.5) return "Hver dag"
  if (median <= 5) return "Flere ganger i uken"
  if (median <= 10) return "Hver uke"
  if (median <= 20) return "Annenhver uke"
  if (median <= 45) return "Hver måned"
  return "Sjeldnere enn hver måned"
}

/** What is known of a podcast; leave out what is not. */
export interface PodcastFactsInput {
  /** Who publishes it (`itunes:author`, Apple's `artistName`). */
  publisher?: string | null
  /** Apple's categories, as the feed or the lookup gives them. */
  categories?: readonly string[]
  /** The feed's `language`. */
  language?: string | null
  /** When its episodes came out (ISO): how often it comes out, and since when. */
  episodeDates?: readonly string[]
  /** How many episodes it has in all, where that is more than `episodeDates` has. */
  episodes?: number
  /** Now (ISO), the same the page reads its other times by: a podcast that has stopped says so. */
  now?: string
}

/**
 * The facts of a podcast, for `DetailLayout facts`, in a fixed order: «Utgiver», «Kategori» / «Kategorier» (each on its own line), «Språk»,
 * «Nye episoder», «Episoder», «Startet». A fact that is not known is left out.
 */
export function podcastFacts({ publisher, categories = [], language, episodeDates = [], episodes, now }: PodcastFactsInput): (readonly [string, string | readonly string[]])[] {
  const kinds = [...new Set(categories.map(categoryWords).filter((name) => name !== ""))]
  const count = episodes ?? (episodeDates.length > 0 ? episodeDates.length : undefined)
  const first = episodeDates.map((date) => Date.parse(date)).filter((time) => Number.isFinite(time))
  const facts: (readonly [string, string | readonly string[] | null | undefined])[] = [
    ["Utgiver", publisher?.trim()],
    [kinds.length === 1 ? "Kategori" : "Kategorier", kinds],
    ["Språk", language === null || language === undefined ? null : languageWords(language)],
    ["Nye episoder", releaseFrequency(episodeDates, now)],
    ["Episoder", count === undefined ? null : new Intl.NumberFormat("nb").format(count)],
    ["Startet", first.length === 0 ? null : String(new Date(Math.min(...first)).getUTCFullYear())],
  ]
  return facts.filter((fact): fact is readonly [string, string | readonly string[]] => fact[1] !== null && fact[1] !== undefined && fact[1] !== "" && !(Array.isArray(fact[1]) && fact[1].length === 0))
}
