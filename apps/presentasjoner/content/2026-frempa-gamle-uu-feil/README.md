# Gamle UU-feil å unngå i nye løsninger

> Hvordan KI endrer universell utforming, og hvordan vi kan bruke det til vår fordel, med eksempler fra forsikring.

## Fakta

- **Arrangement:** Frempå 2026, Teknologi og innsikts internkonferanse (Fremtind). Tema: «Kompetanse i KI-alderen: hva trenger vi å lære, hva må vi endre, og hva bør vi bevare når ny teknologi endrer arbeidshverdagen vår?»
- **Dato og sted:** fredag 27. november 2026, H8 i Oslo (fysisk, ingen opptak eller videooverføring)
- **Tidspunkt:** 10:45–10:55 i Basecamp-2A
- **Format:** lyntale, 10 minutter, 19 slides pluss sluttslide
- **Foredragsholder:** Ole Jørgen Bakken
- **Målgruppe:** utviklere, designere og produkteiere som vil at alle kunder skal kunne fullføre flyten deres på riktig vis
- **Fil:** `gamle-uu-feil-a-unnga-i-nye-losninger.pptx` (ikke med i dette repoet)
- **Status:** utkast
- **Arrangører:** Berit Klundseter, Eva Wall, Gunn Øverjordet, Hans Henrik Petersen, Øystein Hansen

> Talen lander på 9:20 i notatene, altså 40 sekunder buffer i et slot på 10 minutter. Slides som ble kuttet ligger skjult etter sluttsliden som reserve (tidslinjen 2019–2026, UU-kravene, live-demo, KI-agenter, ARIA, helse m.m.).

## Abstract (offisiell tekst)

Feil i universell utforming kan enkelt unngås med KI, så lenge du ber den se etter det, og gidder å gjøre noe med det. I denne talken vil jeg gå gjennom vanlige feil i løsningene våre, konsekvensen av dem, og hvordan du fikser dem.

## Budskap

Nettet blir ikke mer tilgjengelig av at vi vet mer. Verktøy og KI hjelper først når vi gir dem reglene, sjekker resultatet og tester som brukerne. Velg ett grep og prøv det i neste sprint.

## Tidsplan

Tidsstempler ligger også i notatene på hver slide.

| Del | Slides | Tid |
| --- | --- | --- |
| Åpning og forsikring | 1–4 | 0:00–1:25 |
| Tallene og verktøyene (WebAIM, GDS) | 5–7 | 1:25–3:05 |
| KI endrer bildet | 8–11 | 3:05–4:45 |
| Bruk KI til din fordel (og risiko) | 12–17 | 4:45–8:45 |
| Svar og oppfordring | 18–19 | 8:45–9:20 |

## Kilder og påstander

| Påstand | Kilde | Status |
| --- | --- | --- |
| 95,9 % av forsidene har WCAG-feil; 56,1 feil per forside; seks feil står for 96 % | WebAIM Million 2026, webaim.org/projects/million | verifisert |
| Sider med ARIA: 59 feil mot 42 uten | WebAIM Million 2026 | verifisert (sammenheng, ikke årsak) |
| Krav: WCAG 2.0 A/AA for private nettløsninger | Forskrift FOR-2013-06-21-732 | verifisert |
| «Meld skade» uten tastaturtilgang, 2015 | Uu-tilsynet, tilsynsrapport Storebrand | verifisert |
| 60,1 % av skjermleserbrukere bruker KI til bildebeskrivelser | WebAIM Screen Reader Survey #11 (1 780 svar) | verifisert, ikke representativt utvalg |
| 1 av 3 bruker KI til helseinformasjon | Uu-tilsynet, sektortilsyn helse (sept. 2026) | verifisert, gjelder helse |
| 16 utviklere, ingen ba Copilot om tilgjengelighet | CodeA11y, arxiv.org/abs/2502.10884 | verifisert, liten studie |
| 143 barrierer, 42 oversett av alle ti verktøy | GDS-blogg 2017 | verifisert mot kilden |
| KI-agenter bruker tilgjengelighetstreet | Playwright MCP README | verifisert |
| Kritiske øyeblikk i forsikringsreisen | – | egen vurdering |
| Tidsserie 2019–2026 (mangler språk 33,1→13,5 %, alt-tekst 68→53,1 %; 51→56,1 feil per forside, ARIA +27 %) | webaim.org/projects/million | verifisert; årsak til endringene er ikke påvist, WebAIM sier «trolig» KI-assistert koding. Sliden ligger nå i reserve |
| Overlays er omstridt | overlayfactsheet.com | egen vurdering |

## Bildekreditering og lisenser

Se `bilder/KREDITERING.md`. Kreditering står også på sliden.

- Tastatur: Francisclarke, CC BY-SA 4.0
- Skadet bil, svaksynt mann med mobil, punktskriftdisplay: se bilder/KREDITERING.md
- Stolpediagram og tidslinjediagram (2019–2026): egenlaget fra WebAIM-tall

## Lenker

- Live-demo: https://www.fremtind.no
- Skjermleservideo (UCSF, 4:45): https://www.youtube.com/watch?v=dEbl5jvLKGQ
- W3C WAI-videoer ligger i skjulte reserveslides (w3.org/WAI/perspective-videos)

## Åpne punkter

- [x] Dato satt: fredag 27. november 2026
- [x] GDS-tallene verifisert mot accessibility.blog.gov.uk (24. feb. 2017): 143 feil, ti verktøy, 42 oversett av alle (29 %)
- [x] Knyttet til konferansetemaet «Kompetanse i KI-alderen» (slutten: lær å be KI om UU, endre rutiner, bevar manuell testing)
- [x] Talen kuttet til 10 minutter; live-demoen på fremtind.no ligger som skjult reserve
- [x] Ekte skadesak-øyeblikk: droppet. Talen bruker verifiserte, offentlige caser i stedet (Storebrand-tilsynet, GDS), og vi har ikke funnet opp noe
- [x] Gjennomgang 25. nov. 2026: tidslinje-sliden flyttet til reserve (overlappet med «2026: det ble verre», og seks serier er for tett for en lyntale), de tre grepene på oppsummeringssliden endret til de tre talen faktisk viser, lenke lagt på sluttsliden, «per side» rettet til «per forside», sanntidsteksting merket «best på engelsk», pausen på 95,9 %-sliden kortet fra ti til tre–fire sekunder, egenpresentasjonen fjernet fra åpningen. Lander på 9:20
- [ ] Visuell sjekk i PowerPoint: sluttsliden (tekstboksen er utvidet til to linjer), slide 12 med fire kulepunkter, og kjør Se gjennom → Kontroller tilgjengelighet
- [ ] Vurder om den dekorative bakgrunnsvideoen på forsiden skal bli med: den er fem sekunder og har alt-tekst, men en UU-tale som åpner med autospilt bevegelse er lett å henge seg opp i
