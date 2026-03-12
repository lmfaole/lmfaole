import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Link } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 1,
  title: "Velkommen til Jøkul",
  excerpt: "Dette er det første innlegget på vår nye blogg bygget med Jøkul designsystem.",
  content: (
    <>
      <p>
        Jøkul er designsystemet til Fremtind — skapt for å gi konsistente, tilgjengelige og
        gjenkjennbare brukeropplevelser på tvers av alle digitale produkter. Enten du bygger en
        skademelding, en sparekalkulator eller en onboarding-flyt, gir Jøkul deg ferdigbygde
        byggeklosser og klare retningslinjer.
      </p>

      <Message variant="info">
        Jøkul er åpen kildekode og utvikles aktivt på{" "}
        <Link href="https://github.com/fremtind/jokul" external>GitHub</Link>.
        Alle bidrag og tilbakemeldinger er hjertelig velkomne!
      </Message>

      <h2>Atomic Design — systemets fundament</h2>
      <p>
        Jøkul er strukturert etter <strong>Atomic Design</strong>-metodologien til Brad Frost.
        Prinsippet er at komplekse grensesnitt bygges opp av stadig større enheter:
      </p>
      <DescriptionList>
        <DescriptionTerm>Atomer</DescriptionTerm>
        <DescriptionDetail>Minste byggekloss: knapper, inndatafelter, ikoner og typografielementer.</DescriptionDetail>
        <DescriptionTerm>Molekyler</DescriptionTerm>
        <DescriptionDetail>Kombinasjoner av atomer med én klar funksjon, f.eks. et søkefelt med label og knapp.</DescriptionDetail>
        <DescriptionTerm>Organismer</DescriptionTerm>
        <DescriptionDetail>Komplekse seksjoner sammensatt av molekyler, f.eks. navigasjonsbar eller skjemagruppe.</DescriptionDetail>
        <DescriptionTerm>Maler</DescriptionTerm>
        <DescriptionDetail>Sidestruktur uten reelt innhold — wireframe med organismer på plass.</DescriptionDetail>
        <DescriptionTerm>Sider</DescriptionTerm>
        <DescriptionDetail>Den ferdige siden med ekte innhold, klar for brukertesting og produksjon.</DescriptionDetail>
      </DescriptionList>

      <h2>Kom i gang</h2>
      <p>Installasjon av Jøkul i et eksisterende prosjekt gjøres i tre steg:</p>
      <OrderedList>
        <ListItem>Installer kjernepakken: <code>{'npm install @fremtind/jokul'}</code></ListItem>
        <ListItem>Importer global CSS i rot-filen din: <code>{'import "@fremtind/jokul/core.css"'}</code></ListItem>
        <ListItem>Installer individuelle komponentpakker etter behov, f.eks. <code>{'npm install @fremtind/jokul/button'}</code></ListItem>
      </OrderedList>

      <h2>Hva er inkludert i Jøkul?</h2>
      <UnorderedList>
        <ListItem><strong>Designtokens</strong> — CSS-variabler for farger, spacing, typografi og radiuser</ListItem>
        <ListItem><strong>Fremtind Grotesk</strong> — en skreddersydd webfont optimalisert for lesbarhet</ListItem>
        <ListItem><strong>React-komponenter</strong> — over 50 ferdigbygde, tilgjengelige komponenter</ListItem>
        <ListItem><strong>Ikonsett</strong> — basert på Material Symbols med Fremtind-tilpasninger</ListItem>
        <ListItem><strong>Mørk modus</strong> — fullt støttet via data-theme-attributt uten ekstra kode</ListItem>
        <ListItem><strong>Illustrasjoner og assets</strong> — egne visuelle ressurser til Fremtind-merkevaren</ListItem>
      </UnorderedList>

      <h2>Teknologistakk</h2>
      <Flex gap="xs" wrap="wrap">
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        <Tag>SCSS</Tag>
        <Tag>CSS Custom Properties</Tag>
        <Tag>Storybook</Tag>
        <Tag>Vitest</Tag>
      </Flex>

      <ExpandablePanel>
        <ExpandablePanel.Header>Historien bak Jøkul</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Jøkul ble til da Fremtind ble stiftet i 2019 som et joint venture mellom SpareBank 1 og
            DNB Forsikring. Med to selskaper og mange produktteam var det kritisk å etablere et felles
            visuelt språk raskt. Designsystemet ble navngitt etter en type norsk isbre — solid, varig
            og formet over tid.
          </p>
          <p>
            Siden oppstarten har Jøkul vokst fra et internt verktøy til et fullt åpen kildekode-prosjekt
            med aktiv ekstern bruk. Komponentbiblioteket oppdateres kontinuerlig basert på tilbakemeldinger
            fra produktteam og bidrag fra samfunnet.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>Jøkul vs. generiske biblioteker</h2>
      <p>
        Hvorfor bruke Jøkul fremfor Material UI, Chakra eller Ant Design? Det enkle svaret er
        <em>merkevare og kontekst</em>. Generiske biblioteker er designet for å være nøytrale, mens
        Jøkul er håndskreddersy til Fremtinds visuelle identitet, tone-of-voice og typiske
        brukerscenarioer innen forsikring og sparing. Det betyr færre overstyrte stiler, kortere
        designreview og mer konsistente produkter.
      </p>
    </>
  ),
  date: "2026-03-12",
  category: "Design",
  author: "Ola Nordmann",
  tags: ["designsystem", "jøkul", "fremtind", "open source"],
  resources: [
    {
      title: "Jøkul dokumentasjon",
      url: "https://jokul.fremtind.no/",
      description: "Offisiell dokumentasjon for Jøkul designsystem",
    },
    {
      title: "Jøkul på GitHub",
      url: "https://github.com/fremtind/jokul",
      description: "Kildekode og bidragsveiledning",
    },
    {
      title: "Atomic Design av Brad Frost",
      url: "https://atomicdesign.bradfrost.com/",
      description: "Boken som introduserte Atomic Design-metodologien",
    },
  ],
};

export default post;
