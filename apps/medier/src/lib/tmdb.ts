/** Posters from TMDB (https://www.themoviedb.org): which address to ask for a film's or a show's, and what to keep of the answer. Pure, so a test pins it. */

const API = "https://api.themoviedb.org/3"
const IMAGES = "https://image.tmdb.org/t/p/w185"

/** The address that tells TMDB about a film or a show, in Norwegian where TMDB has it, with who played in it and who made it in the same answer; an episode has its show's poster and facts. */
export const detailsUrl = (kind: "film" | "episode", tmdbId: number): string => `${API}/${kind === "film" ? "movie" : "tv"}/${tmdbId}?language=nb-NO&append_to_response=credits`

/** The address that tells TMDB about a person, in Norwegian where TMDB has it. */
export const personUrl = (id: number): string => `${API}/person/${id}?language=nb-NO`

/** TMDB has two kinds of key: a long read access token (sent as a bearer) and a short API key (sent in the address). */
export function authorize(key: string, url: string): { url: string; headers: Record<string, string> } {
  if (key.startsWith("eyJ")) return { url, headers: { Authorization: `Bearer ${key}` } }
  return { url: `${url}${url.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(key)}`, headers: {} }
}

/** The poster's address from TMDB's answer, or `null` where it has none. */
export function parsePoster(answer: unknown): string | null {
  if (typeof answer !== "object" || answer === null) return null
  const path = (answer as Record<string, unknown>)["poster_path"]
  // `/mock/…` is a picture of this site's own (`src/lib/mock.ts`, `MOCK_DATA=1`), not one of TMDB's.
  return typeof path === "string" && path.startsWith("/") ? (path.startsWith("/mock/") ? path : `${IMAGES}${path}`) : null
}

/** What the site keeps of a film or a show beyond its poster: a few lines to know it by. Anything TMDB has not got is `null` (or none). */
export interface TitleInfo {
  /** The plot, in Norwegian where TMDB has it; `null` where it has none (it does not fall back to English: a Norwegian page does not read English). */
  overview: string | null
  genres: string[]
  /** A film's length in minutes. */
  runtime: number | null
  /** A show's number of seasons. */
  seasons: number | null
  /** TMDB's users' vote, 0 to 10, with how many voted: `null` for a title nobody has voted on. */
  rating: { value: number; votes: number } | null
  /** The first of those who played in it, by TMDB's order (the leads first), each with the part. */
  cast: Credit[]
  /** Those who made it that a page names: directing, writing, music, photography, and for a show who created it. */
  crew: Credit[]
}

/** A person in a film's or a show's credits: who, a picture where TMDB has one, and what they did (a part, or a job in Norwegian). */
export interface Credit {
  id: number
  name: string
  /** TMDB's path to the picture (`/abc.jpg`), `null` where there is none. */
  profile: string | null
  role: string | null
}

/** How many of the cast a title keeps: TMDB lists everyone down to the extras, and a page names the first of them. */
export const CAST_KEPT = 12

/** The jobs of the crew a page names, with what they are called here. */
const JOBS: Readonly<Record<string, string>> = { Director: "Regi", Screenplay: "Manus", Writer: "Manus", "Original Music Composer": "Musikk", "Director of Photography": "Foto", Creator: "Skaper" }

const record = (value: unknown): Record<string, unknown> => (typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {})
const positive = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null)

export function parseInfo(answer: unknown): TitleInfo {
  const details = record(answer)
  const overview = typeof details["overview"] === "string" ? details["overview"].trim() : ""
  const genres = (Array.isArray(details["genres"]) ? details["genres"] : []).flatMap((genre) => {
    const name = record(genre)["name"]
    return typeof name === "string" && name !== "" ? [name] : []
  })
  const value = positive(details["vote_average"])
  const votes = positive(details["vote_count"]) ?? 0
  const credits = record(details["credits"])
  const cast = (Array.isArray(credits["cast"]) ? credits["cast"] : []).flatMap((person) => credit(person, "character")).slice(0, CAST_KEPT)
  const created = (Array.isArray(details["created_by"]) ? details["created_by"] : []).flatMap((person) => credit(person, null, "Skaper"))
  const crew = [...created, ...(Array.isArray(credits["crew"]) ? credits["crew"] : []).flatMap((person) => credit(person, "job"))]
  return { overview: overview === "" ? null : overview, genres, runtime: positive(details["runtime"]), seasons: positive(details["number_of_seasons"]), rating: value === null || votes === 0 ? null : { value, votes }, cast, crew: dedupe(crew) }
}

/** One person of the credits, or none where it has no id or name; `field` is the one that holds the role (`character` for the cast, `job` for the crew: only the jobs a page names are kept, in Norwegian). */
function credit(value: unknown, field: "character" | "job" | null, fixed?: string): Credit[] {
  const person = record(value)
  const id = positive(person["id"])
  const name = typeof person["name"] === "string" ? person["name"].trim() : ""
  if (id === null || !Number.isInteger(id) || name === "") return []
  const raw = field === null ? null : person[field]
  const role = fixed ?? (field === "job" ? (typeof raw === "string" ? (JOBS[raw] ?? null) : null) : typeof raw === "string" && raw.trim() !== "" ? raw.trim() : null)
  if (field === "job" && role === null) return []
  const profile = typeof person["profile_path"] === "string" && person["profile_path"].startsWith("/") ? person["profile_path"] : null
  return [{ id, name, profile, role }]
}

/** Each person once for each role (a writer who also directed is two lines), in the order they came. */
function dedupe(credits: readonly Credit[]): Credit[] {
  const seen = new Set<string>()
  return credits.filter((one) => {
    const key = `${one.id}:${one.role}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** A person's picture in the widths TMDB has for profiles (not the poster's: `w92` is no size of a profile, and the address would be nothing). */
export function profileSources(profile: string | null): { src: string; width: number }[] {
  if (profile === null) return []
  if (profile.startsWith("/mock/")) return [{ src: profile, width: 185 }]
  return [{ src: `https://image.tmdb.org/t/p/w45${profile}`, width: 45 }, { src: `https://image.tmdb.org/t/p/w185${profile}`, width: 185 }, { src: `https://image.tmdb.org/t/p/h632${profile}`, width: 421 }]
}

/** What the site keeps of a person from TMDB's page of them. */
export interface Person {
  name: string
  /** The life story, in Norwegian where TMDB has it; `null` otherwise. */
  biography: string | null
  /** `YYYY-MM-DD`. */
  birthday: string | null
  deathday: string | null
  place: string | null
  /** What they are known for, in Norwegian: acting, directing, writing and so on. */
  department: string | null
  profile: string | null
}

const DEPARTMENTS: Readonly<Record<string, string>> = { Acting: "Skuespiller", Directing: "Regissør", Writing: "Manusforfatter", Production: "Produsent", Sound: "Musikk og lyd", Camera: "Fotograf", Editing: "Klipper", Creator: "Skaper" }
const DAY = /^\d{4}-\d{2}-\d{2}$/

export function parsePerson(answer: unknown): Person | null {
  const person = record(answer)
  const name = typeof person["name"] === "string" ? person["name"].trim() : ""
  if (name === "") return null
  const text = (key: string): string | null => (typeof person[key] === "string" && person[key].trim() !== "" ? person[key].trim() : null)
  const day = (key: string): string | null => {
    const value = text(key)
    return value !== null && DAY.test(value) ? value : null
  }
  const department = text("known_for_department")
  return { name, biography: text("biography"), birthday: day("birthday"), deathday: day("deathday"), place: text("place_of_birth"), department: department === null ? null : (DEPARTMENTS[department] ?? null), profile: typeof person["profile_path"] === "string" && person["profile_path"].startsWith("/") ? person["profile_path"] : null }
}
