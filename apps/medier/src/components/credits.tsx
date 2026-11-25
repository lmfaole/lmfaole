import type { Source } from "@lmfaole/designsystem/components/app-settings"

/**
 * Where the data comes from, once, at the foot of «Innstillinger» rather than on every page: each source with its mark beside its name
 * (Spotify's is the attribution its developer policy asks for; each Spotify thing also links back to it), what it gives and how fresh
 * it is (`TTL` in `lib/sources.ts`), and the sentence TMDB asks for, for `SourcesSettings`. A source that did not answer is still said on the page it failed on (`Fetched`).
 */
export const SOURCES: readonly Source[] = [
  { name: "Last.fm", brand: "lastfm", href: "https://www.last.fm", description: "Det du har spilt og det som spilles nå, hentet på nytt hvert minutt." },
  { name: "ListenBrainz", href: "https://listenbrainz.org", description: "Det du har spilt og det som spilles nå, for deg som bruker ListenBrainz i stedet for Last.fm. Omslagene er fra Cover Art Archive." },
  { name: "Trakt", brand: "trakt", href: "https://trakt.tv", description: "Filmene og episodene du har sett, hentet på nytt hvert femte minutt." },
  { name: "Spotify", brand: "spotify", href: "https://open.spotify.com", description: "Bilder av artister, og lenker til dem på Spotify." },
  { name: "MusicBrainz", href: "https://musicbrainz.org", description: "Hvilke av en artists utgivelser som er album, og ikke singler, EP-er, livealbum eller samlinger. Hentet på nytt hver uke." },
  { name: "TMDB", brand: "tmdb", href: "https://www.themoviedb.org", description: "Plakater, hvem som er med og fakta om filmer og serier.", credit: "Denne siden bruker TMDB API, men er ikke støttet eller sertifisert av TMDB." },
  { name: "JustWatch", href: "https://www.justwatch.com/no", description: "Hvor en film eller serie kan strømmes, leies eller kjøpes i Norge, gjennom TMDB. Hentet på nytt hver dag.", credit: "Strømmedata fra JustWatch." },
  { name: "Steam", brand: "steam", href: "https://store.steampowered.com", description: "Spillene du har spilt de siste to ukene og mest av alt, med Steams egne bilder, hentet på nytt hvert tiende minutt.", credit: "Drevet av Steam. Ikke tilknyttet Valve Corporation." },
  { name: "RetroAchievements", href: "https://retroachievements.org", description: "De gamle konsollspillene du har spilt i en emulator, og prestasjonene dine i dem, hentet på nytt hvert tiende minutt." },
  { name: "setlist.fm", href: "https://www.setlist.fm", description: "En artists siste konserter og hva som ble spilt, slik det er skrevet ned der, med lenke til hver konsert. Hentet på nytt hver dag.", credit: "Konserter og settlister fra setlist.fm." },
]
