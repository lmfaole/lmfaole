// What the pages say: the owner, and the head content of each page.
export const NAME = 'Ole Jørgen Bakken'
/** What the front page says about the work, in one sentence; the description under the link previews too. */
export const BIO = 'Jeg er senior frontend-utvikler hos Fremtind og bygger komponenter og webløsninger i designsystemet Jøkul, med universell utforming og webstandarder som utgangspunkt.'
/** The line under the name on the front page. */
export const ROLE = 'Senior frontend-utvikler hos Fremtind'

export const PROFILE = {
  url: 'https://lmfaole.party/',
  /** The CV: a path of this origin, served by the CV's own Worker (`apps/cv`). */
  cv: '/cv/',
  email: 'hei@lmfaole.party',
  github: 'https://github.com/lmfaole',
  linkedin: 'https://www.linkedin.com/in/olejorgenbakken/',
} as const

/** Each page's own `<title>` and link-preview text, by path. `/kilder` is not linked from the front page or the sitemap. */
const PAGES = [
  { path: '/', title: NAME, description: BIO },
  { path: '/kilder', title: 'Kilder', description: 'Hvor dataene om det jeg ser, hører på og spiller kommer fra, og når de hentes.' },
] as const

export type PagePath = (typeof PAGES)[number]['path']

export function pageHead(path: PagePath) {
  return PAGES.find((page) => page.path === path) ?? PAGES[0]
}
