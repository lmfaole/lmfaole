/**
 * The first-visit help of the site: the intros of the pages and the offer to install, each remembered in the design system's `seen` cookie (`@lmfaole/designsystem/lib/onboarding`) under the whole
 * site. Raise an intro's version to show a changed one again.
 */
export const SEEN_PATH = "/"

export interface Intro {
  id: string
  version?: number
  title: string
  body: string
}

export const INTROS = {
  musikk: {
    id: "intro-musikk",
    version: 2,
    title: "Musikken din",
    body: "Her er de siste avspillingene og artistene du har spilt mest den siste måneden. Historikken og oppsummeringen av måneden finner du nederst i kortene. Trykk på en artist, et album eller en låt for å se mer.",
  },
  musikkHistorikk: {
    id: "intro-musikk-historikk",
    title: "Alt du har hørt på, dag for dag",
    body: "Avspillingene dine, nyeste først. Øktene øverst viser hvor lenge du lyttet: avspillinger med under 30 minutters mellomrom blir regnet som én økt.",
  },
  film: {
    id: "intro-film",
    title: "Filmene du har sett, fra Trakt",
    body: "Filmene du har markert som sett på Trakt, med plakat og handling fra TMDB. Historikken og oppsummeringen av måneden finner du nederst i kortene. Trykk på en film for å se hvem som var med.",
  },
  filmHistorikk: {
    id: "intro-film-historikk",
    version: 2,
    title: "Alle filmene du har sett, dag for dag",
    body: "Filmene fra Trakt, nyeste først. Øktene øverst viser hvor lenge du så: en film regnes med lengden sin (110 minutter om TMDB ikke vet), og filmer med under 30 minutters mellomrom blir én økt.",
  },
  tv: {
    id: "intro-tv",
    title: "Seriene du følger, fra Trakt",
    body: "Episodene du har markert som sett på Trakt, og seriene de hører til, med plakat fra TMDB. Historikken og oppsummeringen av måneden finner du nederst i kortene. Trykk på en serie for å se mer.",
  },
  tvHistorikk: {
    id: "intro-tv-historikk",
    title: "Alle episodene du har sett, dag for dag",
    body: "Episodene fra Trakt, nyeste først, med flere episoder av samme serie samme dag samlet. Øktene øverst viser hvor lenge du så: en episode regnes som 45 minutter, og episoder med under 30 minutters mellomrom blir én økt.",
  },
} as const satisfies Record<string, Intro>
