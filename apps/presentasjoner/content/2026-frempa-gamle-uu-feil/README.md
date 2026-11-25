# Gamle UU-feil å unngå i nye løsninger

> Hvordan KI endrer universell utforming, og hvordan vi kan bruke det til vår fordel, med eksempler fra forsikring.

## Fakta

- **Arrangement:** Frempå 2026, Teknologi og innsikts internkonferanse (Fremtind). Tema: «Kompetanse i KI-alderen: hva trenger vi å lære, hva må vi endre, og hva bør vi bevare når ny teknologi endrer arbeidshverdagen vår?»
- **Dato og sted:** fredag 27. november 2026, H8 i Oslo (fysisk, ingen opptak eller videooverføring)
- **Tidspunkt:** 10:45–10:55 i Basecamp-2A
- **Format:** lyntale, 10 minutter, 20 slides pluss sluttslide
- **Foredragsholder:** Ole Jørgen Bakken
- **Målgruppe:** utviklere, designere og produkteiere som vil at alle kunder skal kunne fullføre flyten deres på riktig vis
- **Fil:** `gamle-uu-feil-a-unnga-i-nye-losninger.pptx` (ikke med i dette repoet)
- **Status:** utkast
- **Arrangører:** Berit Klundseter, Eva Wall, Gunn Øverjordet, Hans Henrik Petersen, Øystein Hansen

> Talen er kuttet til 10 minutter (10:00 i notatene). Slides som ble kuttet ligger skjult etter sluttsliden som reserve (UU-kravene, live-demo, KI-agenter, ARIA, helse m.m.).

## Abstract (offisiell tekst)

Feil i universell utforming kan enkelt unngås med KI, så lenge du ber den se etter det, og gidder å gjøre noe med det. I denne talken vil jeg gå gjennom vanlige feil i løsningene våre, konsekvensen av dem, og hvordan du fikser dem.

## Budskap

Nettet blir ikke mer tilgjengelig av at vi vet mer. Verktøy og KI hjelper først når vi gir dem reglene, sjekker resultatet og tester som brukerne. Velg ett grep og prøv det i neste sprint.

## Tidsplan

Tidsstempler ligger også i notatene på hver slide.

| Del | Slides | Tid |
| --- | --- | --- |
| Åpning og forsikring | 1–4 | 0:00–1:30 |
| Tallene og verktøyene (WebAIM, GDS) | 5–7 | 1:30–3:10 |
| KI endrer bildet (inkl. tidslinje 2019–2026) | 8–12 | 3:10–5:35 |
| Bruk KI til din fordel (og risiko) | 13–18 | 5:35–9:35 |
| Svar og oppfordring | 19–20 | 9:35–10:00 |

## Kilder og påstander

| Påstand | Kilde | Status |
| --- | --- | --- |
| 95,9 % av forsidene har WCAG-feil; 56,1 feil per side; seks feil står for 96 % | WebAIM Million 2026, webaim.org/projects/million | verifisert |
| Sider med ARIA: 59 feil mot 42 uten | WebAIM Million 2026 | verifisert (sammenheng, ikke årsak) |
| Krav: WCAG 2.0 A/AA for private nettløsninger | Forskrift FOR-2013-06-21-732 | verifisert |
| «Meld skade» uten tastaturtilgang, 2015 | Uu-tilsynet, tilsynsrapport Storebrand | verifisert |
| 60,1 % av skjermleserbrukere bruker KI til bildebeskrivelser | WebAIM Screen Reader Survey #11 (1 780 svar) | verifisert, ikke representativt utvalg |
| 1 av 3 bruker KI til helseinformasjon | Uu-tilsynet, sektortilsyn helse (sept. 2026) | verifisert, gjelder helse |
| 16 utviklere, ingen ba Copilot om tilgjengelighet | CodeA11y, arxiv.org/abs/2502.10884 | verifisert, liten studie |
| 143 barrierer, 42 oversett av alle ti verktøy | GDS-blogg 2017 | verifisert mot kilden |
| KI-agenter bruker tilgjengelighetstreet | Playwright MCP README | verifisert |
| Kritiske øyeblikk i forsikringsreisen | – | egen vurdering |
| Tidsserie 2019–2026 (mangler språk 33,1→13,5 %, alt-tekst 68→53,1 %; 51→56,1 feil per side, ARIA +27 %) | webaim.org/projects/million | verifisert; årsak til endringene er ikke påvist, WebAIM sier «trolig» KI-assistert koding |
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
