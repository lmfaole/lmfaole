/**
 * The people of a podcast or an episode (Podcasting 2.0 `podcast:person`): who they are to it, in fixed Norwegian words, and the order the
 * roles come in. `List` groups rows with a `role` under these words, so the people of an episode read the same in every app.
 */

/** What a person is to a podcast or an episode. */
export type PersonRole = "host" | "co-host" | "guest" | "narrator" | "producer" | "editor" | "sound" | "composer" | "artwork" | "other"

/** The roles in the order they are shown, each with its words for one and for several. */
export const PERSON_ROLES: readonly { role: PersonRole; one: string; many: string }[] = [
  { role: "host", one: "Vert", many: "Verter" },
  { role: "co-host", one: "Medvert", many: "Medverter" },
  { role: "guest", one: "Gjest", many: "Gjester" },
  { role: "narrator", one: "Forteller", many: "Fortellere" },
  { role: "producer", one: "Produsent", many: "Produsenter" },
  { role: "editor", one: "Redaktør", many: "Redaktører" },
  { role: "sound", one: "Lydtekniker", many: "Lydteknikere" },
  { role: "composer", one: "Komponist", many: "Komponister" },
  { role: "artwork", one: "Illustratør", many: "Illustratører" },
  { role: "other", one: "Medvirkende", many: "Medvirkende" },
]

/** The words for a role: «Vert», or «Verter» for several. */
export function roleWords(role: PersonRole, count = 1): string {
  const words = PERSON_ROLES.find((entry) => entry.role === role) ?? PERSON_ROLES[PERSON_ROLES.length - 1]
  return count === 1 ? (words?.one ?? "") : (words?.many ?? "")
}

/** The feed's roles (the Podcasting 2.0 taxonomy, any case) that are not just one of ours by name. */
const FEED_ROLES: Readonly<Record<string, PersonRole>> = {
  cohost: "co-host",
  "guest host": "co-host",
  "co-host": "co-host",
  "host": "host",
  "guest": "guest",
  "narrator": "narrator",
  "voice actor": "narrator",
  "announcer": "narrator",
  "producer": "producer",
  "executive producer": "producer",
  "co-producer": "producer",
  "associate producer": "producer",
  "editor": "editor",
  "story editor": "editor",
  "managing editor": "editor",
  "audio editor": "sound",
  "sound designer": "sound",
  "audio engineer": "sound",
  "mixing engineer": "sound",
  "composer": "composer",
  "theme music": "composer",
  "music production": "composer",
  "cover art designer": "artwork",
  "graphic designer": "artwork",
}

/** A feed's role as one of ours: `podcast:person role="Guest"` is `guest`; none is `host` (the taxonomy's default); one we do not know is `other`. */
export function personRole(feed: string | null | undefined): PersonRole {
  if (feed === null || feed === undefined || feed.trim() === "") return "host"
  return FEED_ROLES[feed.trim().toLowerCase()] ?? "other"
}

/** Things with a role, in groups by role in the order of `PERSON_ROLES`, each keeping the order it was given in, with the group's words. */
export function groupByRole<T extends { role?: PersonRole | undefined }>(items: readonly T[]): { role: PersonRole; label: string; items: T[] }[] {
  return PERSON_ROLES.map(({ role }) => {
    const mine = items.filter((item) => (item.role ?? "other") === role)
    return { role, label: roleWords(role, mine.length), items: mine }
  }).filter((group) => group.items.length > 0)
}
