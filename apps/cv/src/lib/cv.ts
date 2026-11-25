// The CV as the page reads it: the snapshot in `src/data/cv.json`, the same shape the old monorepo's `/api/cv.json` had.

export interface Person {
  navn: string
  tittel: string | null
  arbeidsgiver: string | null
  sted: string | null
}

export interface Project {
  aar: number
  fra: string | null
  til: string | null
  navn: string
  tittel: string | null
  url: string | null
  beskrivelse: string | null
  /** The project's repository and its latest commit, where it has one on GitHub. */
  github: { repo: string; commit: { message: string; at: string; url: string } } | null
}

export interface Role {
  aar: number
  fra: string | null
  til: string | null
  tittel: string
  beskrivelse: string | null
  projects: Project[]
}

export interface Employer {
  navn: string
  sted: string | null
  roles: Role[]
}

export interface Education {
  aar: number
  fra: string | null
  til: string | null
  grad: string
  institusjon: string | null
  beskrivelse: string | null
}

export interface Cv {
  person: Person | null
  employers: Employer[]
  education: Education[]
  links: { navn: string; url: string }[]
}

const DATE = new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', day: 'numeric', month: 'long', year: 'numeric' })

/** A day as it is written in Norwegian, «17. november 2026». */
export function formatDate(at: string): string {
  return DATE.format(new Date(at))
}
