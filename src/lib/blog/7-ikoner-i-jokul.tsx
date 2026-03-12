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
        Vi hadde en gang et ikon som skulle bety "last ned dokument". Det var et rektangel med en
        pil ned. Perfekt. Problemet var at det samme ikonet ble brukt for "lagre", "eksportere" og
        "arkivere" i tre forskjellige deler av appen. Brukertestingen var pinlig. Det lærte oss noe
        viktig: ikoner er ikke dekorasjon. De er kommunikasjon. Og kommunikasjon krever konsistens.
      </p>

      <h2>Hvorfor Material Symbols?</h2>
      <p>
        Vi vurderte å designe et eget ikonsett. Det ville gitt oss full kontroll, men også full
        vedlikeholdsbyrde for over tusen ikoner. Material Symbols fra Google gir oss et komplett,
        gjennomtenkt sett som fungerer på alle plattformer — og vi har tilpasset standardverdiene
        til Fremtinds profil.
      </p>

      <Message variant="info">
        Material Symbols er en variabel font med fire justerbare akser. Jøkul setter
        standardverdier som passer Fremtinds profil, men du kan overstyre per ikon.
      </Message>

      <h2>De fire aksene du bør kjenne</h2>
      <DescriptionList>
        <DescriptionTerm><code>wght</code> — Tykkelse (100–700)</DescriptionTerm>
        <DescriptionDetail>Jøkul bruker 400 som standard. Lavere = tynnere streker. Bruk 300 for dekorative ikoner i store størrelser.</DescriptionDetail>
        <DescriptionTerm><code>opsz</code> — Optisk størrelse (20–48)</DescriptionTerm>
        <DescriptionDetail>Høyere verdi = tynnere detaljer for store ikoner. Lavere = bedre lesbarhet i liten størrelse. Sett lik faktisk pikselstørrelse.</DescriptionDetail>
        <DescriptionTerm><code>GRAD</code> — Gradering (-25 til 200)</DescriptionTerm>
        <DescriptionDetail>Påvirker visuell vekt uten å endre fotavtrykket. Nyttig for hover-effekter der du vil gi mer "oomph".</DescriptionDetail>
        <DescriptionTerm><code>FILL</code> — Fylling (0 eller 1)</DescriptionTerm>
        <DescriptionDetail>0 = outline (standardtilstand), 1 = fylt (aktiv tilstand). Bruk dette til å kommunisere om noe er valgt eller favorittmerket.</DescriptionDetail>
      </DescriptionList>

      <h2>Dekorativt vs. funksjonelt ikon — et kritisk skille</h2>
      <p>
        Dette er der de fleste gjør det feil. Hvert ikon er enten dekorativt (støtter tekst) eller
        funksjonelt (kommuniserer selvstendig). Feil håndtering gir et forferdelig skjermleseropplevelse:
      </p>
      <UnorderedList>
        <ListItem>
          <strong>Dekorativt ikon</strong> ved siden av tekst: <code>{'aria-hidden="true"'}</code> — skjermleseren skal ikke lese det.
        </ListItem>
        <ListItem>
          <strong>Funksjonelt ikon</strong> uten tekst (f.eks. lukkknapp): <code>{'aria-label="Lukk dialog"'}</code> på knappen.
        </ListItem>
        <ListItem>
          <strong>Informativt ikon</strong> som statusindikator: legg til visuelt skjult tekst med <code>jkl-sr-only</code>-klassen.
        </ListItem>
      </UnorderedList>

      <Flex gap="s" wrap="wrap">
        <Tag>24px — standard UI</Tag>
        <Tag>20px — kompakt/inline</Tag>
        <Tag>32px — fremhevet</Tag>
        <Tag variant="info">Outline — standardtilstand</Tag>
        <Tag variant="success">Filled — aktiv tilstand</Tag>
      </Flex>

      <h2>Kom i gang</h2>
      <OrderedList>
        <ListItem>Installer pakken: <code>{'npm install @fremtind/jokul/icon'}</code></ListItem>
        <ListItem>Importer CSS: <code>{'import "@fremtind/jokul/icon/icon.css"'}</code></ListItem>
        <ListItem>Importer komponenten: <code>{'import { Icon } from "@fremtind/jokul/icon"'}</code></ListItem>
        <ListItem>Bruk med ikonnavnet: <code>{'<Icon name="home" />'}</code></ListItem>
      </OrderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Når du trenger et ikon som ikke finnes</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Material Symbols har over 2500 ikoner. Men noen ganger finnes ikke akkurat det du
            trenger. Slik håndterer vi egendefinerte SVG-ikoner:
          </p>
          <OrderedList>
            <ListItem>SVG på 24×24px viewport med 2px padding (20px synlig)</ListItem>
            <ListItem><code>fill="currentColor"</code> slik at fargen arves fra CSS</ListItem>
            <ListItem>Godkjent av designteamet og dokumentert i Storybook</ListItem>
            <ListItem>Testet i begge temaer og alle relevante størrelser</ListItem>
          </OrderedList>
          <p>
            Aldri kopier SVG-ikoner mellom applikasjoner. Legg dem i et delt komponentbibliotek.
            Jeg har sett det samme ikonet eksistere i fem ulike versjoner i fem repos. Det er
            vedlikeholdsmarerittet vi prøver å unngå.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Gode ikoner er usynlige i den forstand at de aldri skaper forvirring. Brukeren bare
        forstår. Dårlige ikoner er usynlige fordi ingen har tenkt på dem i det hele tatt —
        og det merker brukeren.
      </p>
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
