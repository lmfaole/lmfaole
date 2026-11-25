// What the pages say: the owner, and the head content of each page. The name and the role are read from the CV in D1 (`stored.ts`) where it has them;
// these are the words the page has while it has not.
export const NAME = 'Ole Jørgen Bakken'
/** What the front page says about the work, in one sentence; the description under the link previews too. */
export const BIO = 'Jeg er senior frontend-utvikler hos Fremtind og bygger komponenter og webløsninger i designsystemet Jøkul, med universell utforming og webstandarder som utgangspunkt.'
/** The line under the name on the front page. */
export const ROLE = 'Senior frontend-utvikler hos Fremtind'

/** Who the front page is about: the name over it and the line under the name. */
export interface Owner {
  name: string
  role: string
}
export const OWNER: Owner = { name: NAME, role: ROLE }

export const PROFILE = {
  url: 'https://lmfaole.party/',
  /** The CV: a path of this origin, served by the CV's own Worker (`apps/cv`). */
  cv: '/cv/',
  /** The names that come up in the texts and where they link (`/ordliste`), linked from the front page once there are any. */
  glossary: '/ordliste',
  email: 'hei@lmfaole.party',
  github: 'https://github.com/lmfaole',
  linkedin: 'https://www.linkedin.com/in/olejorgenbakken/',
} as const

/** Each page's own `<title>` and link-preview text, by path. `/kilder` is not linked from the front page or the sitemap; `/ordliste` is linked while it has terms. */
const PAGES = [
  { path: '/', title: NAME, description: BIO },
  { path: '/kilder', title: 'Kilder', description: 'Hvor dataene om det jeg ser, hører på og spiller kommer fra, og når de hentes.' },
  { path: '/ordliste', title: 'Ordliste', description: 'Navn som går igjen i tekstene mine, og hvor de hører hjemme.' },
] as const

export type PagePath = (typeof PAGES)[number]['path']

export function pageHead(path: PagePath) {
  return PAGES.find((page) => page.path === path) ?? PAGES[0]
}
