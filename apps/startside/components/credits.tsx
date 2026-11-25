import type { Source } from "@lmfaole/designsystem/components/app-settings"

/** Where the data comes from, once, at the foot of «Innstillinger» (`SourcesSettings`) rather than on the pages that use it: each source with its mark beside its name, what it gives, and the credit its licence asks for. */
export const SOURCES: Source[] = [
  { name: "GitHub", brand: "github", href: "https://github.com", description: "Offentlige pull requests, saker og diskusjoner for brukeren du har valgt." },
  { name: "Entur", brand: "entur", href: "https://entur.no", description: "Stasjoner og avganger." },
  { name: "Yr", brand: "yr", href: "https://www.yr.no", description: "Værdata fra Meteorologisk institutt." },
  { name: "Meteorologisk institutt", href: "https://api.met.no", description: "Farevarsler, nedbørradar, UV-indeks, luftkvalitet og månen.", credit: "Data fra MET Norway (CC BY 4.0)." },
  { name: "Varsom.no (NVE)", href: "https://www.varsom.no", description: "Flom-, jordskred- og snøskredvarsler.", credit: "Varsler fra NVE og Varsom.no." },
  { name: "Hva koster strømmen.no", href: "https://www.hvakosterstrommen.no", description: "Strømprisen time for time i prisområdet ditt, uten mva og nettleie.", credit: "Strømpriser levert av Hva koster strømmen.no." },
  { name: "Oslo Bysykkel", href: "https://oslobysykkel.no/apne-data/sanntid", description: "Ledige sykler og plasser ved stasjonene nær deg.", credit: "Sanntidsdata under Norsk lisens for offentlige data (NLOD)." },
  { name: "Kartverket", href: "https://www.kartverket.no", description: "Kommunen du er i, for varslene fra NVE.", credit: "© Kartverket." },
  { name: "NOAA Space Weather Prediction Center", href: "https://www.swpc.noaa.gov", description: "Kp-indeksen, som nordlysvarselet bygger på." },
  { name: "OpenStreetMap", brand: "openstreetmap", href: "https://www.openstreetmap.org/copyright", description: "Navnet på stedet du er, og kartene over stasjonene og bysykkelstativene under Transport.", credit: "Kart og stedsnavn © OpenStreetMap-bidragsytere (ODbL)." },
]
