import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 4,
  title: "Tilgjengelighet er ikke valgfritt",
  excerpt: "Universell utforming er et lovkrav i Norge — her er hvordan Jøkul hjelper deg å etterleve det.",
  content: (
    <>
      <p>
        I Norge er universell utforming av IKT-løsninger lovpålagt gjennom{" "}
        <strong>likestillings- og diskrimineringsloven</strong> og forskrift om universell
        utforming av IKT. Fra 2025 gjelder også <em>European Accessibility Act</em> for private
        virksomheter som tilbyr produkter og tjenester i EU/EØS.
      </p>

      <Message variant="warning">
        Manglende etterlevelse av tilgjengelighetskrav kan medføre pålegg og bøter fra
        Tilsynet for universell utforming av IKT (Uutilsynet).
      </Message>

      <h2>WCAG-nivåene forklart</h2>
      <DescriptionList>
        <DescriptionTerm>Nivå A</DescriptionTerm>
        <DescriptionDetail>Minimumsgrensen. Uten disse kravene er løsningen ubrukelig for mange brukere. Eksempel: bilder har tekstalternativ.</DescriptionDetail>
        <DescriptionTerm>Nivå AA</DescriptionTerm>
        <DescriptionDetail>Lovkravet i Norge og EU. Inkluderer krav til kontrastratio (4.5:1 for tekst), fokussynlighet og feilmeldinger.</DescriptionDetail>
        <DescriptionTerm>Nivå AAA</DescriptionTerm>
        <DescriptionDetail>Høyeste nivå. Ikke lovpålagt, men anbefales for innhold rettet mot brukere med kognitive funksjonsnedsettelser.</DescriptionDetail>
      </DescriptionList>

      <h2>Skjermlesere du bør teste med</h2>
      <UnorderedList>
        <ListItem><strong>NVDA</strong> — gratis, Windows, brukes sammen med Chrome og Firefox</ListItem>
        <ListItem><strong>JAWS</strong> — markedsleder på Windows, mye brukt i bedriftsmarkedet</ListItem>
        <ListItem><strong>VoiceOver</strong> — innebygd i macOS og iOS, test med Safari</ListItem>
        <ListItem><strong>TalkBack</strong> — innebygd i Android, test med Chrome Mobile</ListItem>
        <ListItem><strong>Narrator</strong> — innebygd i Windows, test med Edge</ListItem>
      </UnorderedList>

      <h2>ARIA-roller og egenskaper</h2>
      <DescriptionList>
        <DescriptionTerm><code>role="alert"</code></DescriptionTerm>
        <DescriptionDetail>Kunngjør dynamisk innhold for skjermlesere uten at fokus flyttes. Brukes i Jøkuls Message-komponent.</DescriptionDetail>
        <DescriptionTerm><code>aria-expanded</code></DescriptionTerm>
        <DescriptionDetail>Kommuniserer om en knapp kontrollerer en kollapset/utvidet region. Håndteres automatisk i ExpandablePanel.</DescriptionDetail>
        <DescriptionTerm><code>aria-describedby</code></DescriptionTerm>
        <DescriptionDetail>Kobler et inputfelt til hjelpetekst eller feilmelding. Jøkuls skjemakomponenter setter dette automatisk.</DescriptionDetail>
        <DescriptionTerm><code>aria-live</code></DescriptionTerm>
        <DescriptionDetail>Angir at en region oppdateres dynamisk. Verdiene polite og assertive styrer kunngjøringstiming.</DescriptionDetail>
      </DescriptionList>

      <h2>Tastaturnavigasjon</h2>
      <OrderedList>
        <ListItem>Alle interaktive elementer må nås med <code>Tab</code>-tasten i logisk rekkefølge.</ListItem>
        <ListItem>Modaler og dialoger må fange fokus og returnere det til utløsende element ved lukking.</ListItem>
        <ListItem>Dropdown-menyer og trestrukturer bruker piltaster for intern navigasjon (<em>roving tabindex</em>).</ListItem>
        <ListItem>Escape-tasten skal alltid lukke midlertidige UI-elementer som tooltips og modaler.</ListItem>
        <ListItem>Fokusindikatoren må aldri fjernes med <code>outline: none</code> uten å erstattes med synlig alternativ.</ListItem>
      </OrderedList>

      <h2>Jøkuls innebygde tilgjengelighet</h2>
      <Flex gap="xs" wrap="wrap">
        <Tag variant="success">ARIA-attributter</Tag>
        <Tag variant="success">Fokushåndtering</Tag>
        <Tag variant="success">Fargekontrast AA</Tag>
        <Tag variant="success">Skjermleser-testet</Tag>
        <Tag variant="info">Tastaturnavigasjon</Tag>
      </Flex>

      <ExpandablePanel>
        <ExpandablePanel.Header>Hva MÅ du håndtere selv?</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Jøkul-komponenter er tilgjengelige isolert sett, men du som utvikler er ansvarlig for
            sammensetningen. Disse mønstrene krever ekstra oppmerksomhet:
          </p>
          <UnorderedList>
            <ListItem>Rekkefølge i DOM-en bør matche visuell rekkefølge — unngå å bruke CSS order for å endre sekvens.</ListItem>
            <ListItem>Bilder og ikoner uten tekst trenger alltid <code>alt</code>-tekst eller <code>aria-label</code>.</ListItem>
            <ListItem>Dynamiske oppdateringer (f.eks. søkeresultater) bør kunngjøres via <code>aria-live</code>-region.</ListItem>
            <ListItem>Unngå å spre relatert innhold slik at det blir ikke-sammenhengende for skjermleserbrukere.</ListItem>
          </UnorderedList>
          <p>
            Bruk <strong>jest-axe</strong> i testsuiten din for å fange opp ARIA-feil automatisk
            i CI/CD-pipelinen.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>
    </>
  ),
  date: "2026-03-09",
  category: "Tilgjengelighet",
  author: "Ingrid Berg",
  tags: ["wcag", "uu", "tilgjengelighet", "aria", "lovkrav"],
  resources: [
    {
      title: "WCAG 2.1 på norsk (Difi)",
      url: "https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86",
      description: "Norsk oversettelse og veiledning til WCAG-standarden",
    },
    {
      title: "axe DevTools",
      url: "https://www.deque.com/axe/",
      description: "Automatisert tilgjengelighetstest for nettlesere og CI",
    },
    {
      title: "WAI-ARIA Authoring Practices",
      url: "https://www.w3.org/WAI/ARIA/apg/",
      description: "Offisielle mønstre for ARIA-implementasjoner",
    },
    {
      title: "European Accessibility Act",
      url: "https://ec.europa.eu/social/main.jsp?catId=1202",
      description: "EUs tilgjengelighetsdirektiv som gjelder fra 2025",
    },
  ],
};

export default post;
