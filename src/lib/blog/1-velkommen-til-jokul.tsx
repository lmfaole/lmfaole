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
        Jeg husker godt den første dagen jeg prøvde å lage en knapp som "så ut som Fremtind". Jeg
        hadde en Figma-fil med farger jeg ikke kjente igjen fra noen CSS-variabel, og en Slack-tråd
        der tre designere og to utviklere diskuterte om primærknappen skulle ha 4px eller 6px
        border-radius. Det var kaotisk, men det var også starten på noe bedre — Jøkul.
      </p>

      <Message variant="info">
        Jøkul er åpen kildekode og utvikles aktivt på{" "}
        <Link href="https://github.com/fremtind/jokul" external>GitHub</Link>.
        Bidrag, feilmeldinger og spørsmål er alltid velkomne!
      </Message>

      <h2>Hvorfor vi trengte et designsystem</h2>
      <p>
        Da Fremtind ble til i 2019 som et joint venture mellom SpareBank 1 og DNB Forsikring, hadde
        vi plutselig mange produktteam som skulle bygge ting som <em>føltes</em> like — uten noen
        felles standard. Hvert team hadde sine egne knapper, sine egne farger, sin egne tolkning av
        "Fremtind-stilen". Vi brukte mer tid på å diskutere marginer enn på å løse faktiske
        brukerbehov. Noe måtte gjøres.
      </p>
      <p>
        Jøkul ble svaret. Navngitt etter en type norsk isbre — solid, varig og formet over tid. Det
        passet godt: et designsystem skal ikke skifte med moten, det skal gi stabil grunn å bygge på.
      </p>

      <h2>Hva Jøkul faktisk er</h2>
      <DescriptionList>
        <DescriptionTerm>Designtokens</DescriptionTerm>
        <DescriptionDetail>CSS-variabler for farger, spacing, typografi og radiuser — den eneste kilden til sannhet for visuelle verdier.</DescriptionDetail>
        <DescriptionTerm>React-komponenter</DescriptionTerm>
        <DescriptionDetail>Over 50 ferdigbygde, tilgjengelige komponenter. Du trenger ikke finne opp hjulet på nytt.</DescriptionDetail>
        <DescriptionTerm>Fremtind Grotesk</DescriptionTerm>
        <DescriptionDetail>Vår egenutviklede webfont, optimalisert for lesbarhet på skjerm.</DescriptionDetail>
        <DescriptionTerm>Ikonsett</DescriptionTerm>
        <DescriptionDetail>Basert på Material Symbols, tilpasset Fremtinds visuelle identitet.</DescriptionDetail>
      </DescriptionList>

      <h2>Hva det faktisk endret for oss</h2>
      <p>
        Det mest overraskende var ikke at vi fikk konsistente knapper — det var at designreview ble
        kortere. Når vi alle brukte de samme komponentene og tokenene, forsvant diskusjonene om
        piksel-perfeksjon. Vi begynte å snakke om brukeropplevelse i stedet for implementasjonsdetaljer.
        Det er den ekte gevinsten ved et designsystem: tid til det som faktisk betyr noe.
      </p>

      <Flex gap="xs" wrap="wrap">
        <Tag>React</Tag>
        <Tag>TypeScript</Tag>
        <Tag>SCSS</Tag>
        <Tag>Storybook</Tag>
        <Tag>Åpen kildekode</Tag>
      </Flex>

      <h2>Kom i gang på tre minutter</h2>
      <OrderedList>
        <ListItem>Installer kjernepakken: <code>{'npm install @fremtind/jokul'}</code></ListItem>
        <ListItem>Importer global CSS: <code>{'import "@fremtind/jokul/core.css"'}</code></ListItem>
        <ListItem>Installer en komponent og bruk den</ListItem>
      </OrderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Jøkul vs. generiske komponentbiblioteker</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Et naturlig spørsmål er: hvorfor ikke bare bruke Material UI, Chakra eller shadcn/ui? Alle
            er gode biblioteker. Men de er designet for å være nøytrale — lett å tilpasse, men uten
            merkevare. Jøkul er det motsatte: håndskreddersy til Fremtinds visuelle identitet, typiske
            brukerscenarioer innen forsikring og sparing, og norske lovkrav til tilgjengelighet.
          </p>
          <p>
            Med generiske biblioteker ender du opp med å overstyre halvparten av stilene. Med Jøkul
            starter du allerede på riktig sted. Det er forskjellen mellom å bygge på sand og stein.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Hvis du jobber med Fremtind-produkter — eller bare er nysgjerrig på hvordan vi tenker rundt
        design og utvikling — håper jeg denne bloggen blir et nyttig sted å henge. Vi kommer til å
        skrive om alt fra tilgjengelighet og tokens til teststrategier og de feilene vi har gjort
        underveis. Ærlig og praktisk, ikke bare reklame for systemet.
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
