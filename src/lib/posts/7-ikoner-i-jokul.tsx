import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 7,
  title: "Ikoner i Jøkul",
  excerpt: "Jøkul leveres med et komplett ikonsett basert på Material Symbols. Lær hvordan du bruker dem riktig.",
  content: (
    <>
      <p>
        Ikoner er et kraftig kommunikasjonsverktøy, men de stiller krav til konsistens,
        skalerbarhet og tilgjengelighet. Jøkul bruker <strong>Material Symbols</strong> fra
        Google som fundament, tilpasset Fremtinds visuelle identitet med spesifikke standardverdier
        for vekt, optisk størrelse og fylling.
      </p>

      <h2>Installasjon</h2>
      <OrderedList>
        <ListItem>Installer pakken: <code>{'npm install @fremtind/jokul/icon'}</code></ListItem>
        <ListItem>Importer CSS: <code>{'import "@fremtind/jokul/icon/icon.css"'}</code></ListItem>
        <ListItem>Importer komponenten: <code>{'import { Icon } from "@fremtind/jokul/icon"'}</code></ListItem>
        <ListItem>Bruk komponenten med ikonnavnet: <code>{'<Icon name="home" />'}</code></ListItem>
        <ListItem>For React Native eller SVG-eksport, se tilleggsdokumentasjonen.</ListItem>
      </OrderedList>

      <Message variant="info">
        Material Symbols er en variabel font med fire justerbare akser. Jøkul setter
        standardverdier som passer Fremtinds profil, men du kan overstyre disse per ikon.
      </Message>

      <h2>Variable font-akser</h2>
      <DescriptionList>
        <DescriptionTerm><code>wght</code> — Tykkelse</DescriptionTerm>
        <DescriptionDetail>Området 100–700. Jøkul bruker 400 som standard. Lavere verdier gir tynnere streker.</DescriptionDetail>
        <DescriptionTerm><code>opsz</code> — Optisk størrelse</DescriptionTerm>
        <DescriptionDetail>Området 20–48. Høyere verdi gir tynnere detaljer for store ikoner, lavere for bedre lesbarhet i liten størrelse.</DescriptionDetail>
        <DescriptionTerm><code>GRAD</code> — Gradering</DescriptionTerm>
        <DescriptionDetail>Området -25 til 200. Påvirker visuell vekt uten å endre ikonets fotavtrykk. Nyttig for hover-effekter.</DescriptionDetail>
        <DescriptionTerm><code>FILL</code> — Fylling</DescriptionTerm>
        <DescriptionDetail>0 (outline) eller 1 (fylt). Brukes for å kommunisere aktiv tilstand, f.eks. stjerneikon for lagret favoritt.</DescriptionDetail>
      </DescriptionList>

      <h2>Ikonvarianter i bruk</h2>
      <Flex gap="s" wrap="wrap">
        <Tag>24px — standard UI</Tag>
        <Tag>20px — kompakt/inline</Tag>
        <Tag>32px — fremhevet</Tag>
        <Tag variant="info">Outline — standardtilstand</Tag>
        <Tag variant="success">Filled — aktiv tilstand</Tag>
      </Flex>

      <h2>Dekorative vs. funksjonelle ikoner</h2>
      <p>
        Det er et kritisk skille mellom ikoner som <em>dekorerer</em> tekst og ikoner som
        <em> formidler informasjon</em> selvstendig:
      </p>
      <UnorderedList>
        <ListItem>
          <strong>Dekorativt ikon</strong> (ved siden av tekst): legg til{" "}
          <code>{'aria-hidden="true"'}</code> så skjermlesere ignorerer det.
        </ListItem>
        <ListItem>
          <strong>Funksjonelt ikon</strong> (uten tekst, f.eks. lukkknapp): bruk{" "}
          <code>{'aria-label="Lukk dialog"'}</code> på den omsluttende knappen.
        </ListItem>
        <ListItem>
          <strong>Informativt ikon</strong> (statusindikatorer): legg til visuelt skjult tekst
          med <code>jkl-sr-only</code>-klassen.
        </ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Egendefinerte ikoner utenfor Material Symbols</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Noen ganger trenger du et ikon som ikke finnes i Material Symbols. I Jøkul kan du
            lage egne SVG-ikoner og pakke dem i en ikonkomponent. Sørg for:
          </p>
          <OrderedList>
            <ListItem>SVG-en er på et 24×24px viewport med 2px padding (20px synlig område)</ListItem>
            <ListItem><code>fill="currentColor"</code> brukes slik at fargen arves fra CSS</ListItem>
            <ListItem>Ikonets semantikk er dokumentert og godkjent av designteamet</ListItem>
            <ListItem>Ikonet testes i begge temaer og i alle relevante størrelser</ListItem>
          </OrderedList>
          <p>
            Egendefinerte ikoner bør holdes i et delt komponentbibliotek, ikke kopiert
            mellom applikasjoner, for å sikre konsistens og enkel oppdatering.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>
    </>
  ),
  date: "2026-03-06",
  category: "Utvikling",
  author: "Erik Dahl",
  tags: ["ikoner", "svg", "material symbols", "tilgjengelighet"],
  resources: [
    {
      title: "Material Symbols oversikt",
      url: "https://fonts.google.com/icons",
      description: "Søk og forhåndsvis alle Material Symbols-ikoner",
    },
    {
      title: "Jøkul ikondokumentasjon",
      url: "https://jokul.fremtind.no/komponenter/icon",
      description: "Bruksveiledning og API-dokumentasjon for Icon-komponenten",
    },
    {
      title: "SVG Accessibility Guide",
      url: "https://www.sitepoint.com/tips-accessible-svg/",
      description: "Hvordan lage SVG-ikoner tilgjengelige for skjermlesere",
    },
  ],
};

export default post;
