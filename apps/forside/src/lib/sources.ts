// Where the media pages' content (https://lmfaole.party/medier/) comes from and when it is fetched: the one list the `/kilder` page is written from.
// A service is named once per app that uses it, because what it gives differs from app to app. The schedules are the scheduler's
// (`workers/scheduler/src/jobs.ts`): `workers/activity` every third hour, `workers/likes-sync` on Mondays.
import { everyThreeHours, weekly, type Schedule } from './next-sync.ts'

/** `api`: fetched from the service's own API; `register`: a public register that says what each thing is. */
export type SourceKind = 'api' | 'register'

export interface Source {
  label: string
  /** The service's own site. */
  href: string
  kind: SourceKind
  note: string
  /** How often it is fetched, in words. */
  when: string
  /** The scheduler's times, or none when it is only asked when a page is shown. */
  schedule: Schedule | null
}

export const KIND_LABELS: Record<SourceKind, string> = {
  api: 'Hentet fra API',
  register: 'Register',
}

export type AppId = 'music' | 'film' | 'tv' | 'games'

/** The apps' names, as the media pages call them. */
export const APP_LABELS: Record<AppId, string> = {
  music: 'Musikk',
  film: 'Film',
  tv: 'TV',
  games: 'Spill',
}

/** My accounts at the services, as public as the profile pages they lead to (Steam's has to be public for the game details to be read). */
export const ACCOUNTS: readonly { service: string; name: string; href: string; used: string }[] = [
  { service: 'Trakt', name: 'lmfaole', href: 'https://trakt.tv/users/lmfaole', used: 'film og tv' },
  { service: 'Letterboxd', name: 'lmfaole', href: 'https://letterboxd.com/lmfaole/', used: 'film' },
  { service: 'Last.fm', name: 'snowpony69', href: 'https://www.last.fm/user/snowpony69', used: 'musikk' },
  { service: 'ListenBrainz', name: 'lmfaole', href: 'https://listenbrainz.org/user/lmfaole/', used: 'musikk' },
  { service: 'Spotify', name: 'lmfaole', href: 'https://open.spotify.com/user/lmfaole', used: 'musikk' },
  { service: 'Steam', name: '76561198871653749', href: 'https://steamcommunity.com/profiles/76561198871653749', used: 'spill' },
  { service: 'RetroAchievements', name: 'lmfaole2', href: 'https://retroachievements.org/user/lmfaole2', used: 'spill' },
]

const SHOWN = 'når en side vises'
const STORED = 'hver tredje time'
const ACTIVITY = everyThreeHours(0)

/** The apps in the order `/kilder` lists them, each with what it is fed from. */
export const SOURCES: readonly { app: AppId; sources: readonly Source[] }[] = [
  {
    app: 'music',
    sources: [
      { label: 'ListenBrainz', href: 'https://listenbrainz.org', kind: 'api', note: 'hele lyttehistorikken, lagret i D1', when: STORED, schedule: ACTIVITY },
      { label: 'Last.fm', href: 'https://www.last.fm', kind: 'api', note: 'det som spilles nå, topplister og låter jeg har elsket', when: `${SHOWN}, og ${STORED}`, schedule: ACTIVITY },
      { label: 'Spotify', href: 'https://www.spotify.com', kind: 'api', note: 'bilder av artister, og nye likte låter, som blir elsket på Last.fm', when: `${SHOWN}, og ukentlig`, schedule: weekly(1, 5, 0) },
      { label: 'MusicBrainz', href: 'https://musicbrainz.org', kind: 'register', note: 'fakta om artister, album og spor', when: SHOWN, schedule: null },
      { label: 'setlist.fm', href: 'https://www.setlist.fm', kind: 'register', note: 'konserter og settlister', when: SHOWN, schedule: null },
    ],
  },
  {
    app: 'film',
    sources: [
      { label: 'Trakt', href: 'https://trakt.tv', kind: 'api', note: 'filmer jeg har sett, lagret i D1', when: `${SHOWN}, og ${STORED}`, schedule: ACTIVITY },
      { label: 'Letterboxd', href: 'https://letterboxd.com', kind: 'api', note: 'dagboka mi, via RSS-feeden, lagret i D1', when: STORED, schedule: ACTIVITY },
      { label: 'TMDB', href: 'https://www.themoviedb.org', kind: 'register', note: 'fakta, plakater og besetning', when: SHOWN, schedule: null },
    ],
  },
  {
    app: 'tv',
    sources: [
      { label: 'Trakt', href: 'https://trakt.tv', kind: 'api', note: 'episoder og serier jeg har sett, lagret i D1', when: `${SHOWN}, og ${STORED}`, schedule: ACTIVITY },
      { label: 'TMDB', href: 'https://www.themoviedb.org', kind: 'register', note: 'fakta om serier, sesonger og episoder', when: SHOWN, schedule: null },
    ],
  },
  {
    app: 'games',
    sources: [
      { label: 'Steam', href: 'https://store.steampowered.com', kind: 'api', note: 'biblioteket, spilletid og achievements, lagret i D1', when: `${SHOWN}, og ${STORED}`, schedule: ACTIVITY },
      { label: 'RetroAchievements', href: 'https://retroachievements.org', kind: 'api', note: 'spill i emulator og achievements for dem, lagret i D1', when: `${SHOWN}, og ${STORED}`, schedule: ACTIVITY },
    ],
  },
]
