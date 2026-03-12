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
  id: 6,
  title: "Fargesystemet i Jøkul",
  excerpt: "Hvordan Jøkul bruker semantiske fargetokens for å sikre konsistens og tilgjengelighet på tvers av temaer.",
  content: (
    <>
      <p>
        Et robust fargesystem er fundamentet for et skalerbart designsystem. Jøkul skiller
        tydelig mellom <strong>primitive fargetokens</strong> (råverdier) og
        <strong> semantiske fargetokens</strong> (meningsfulle variabler). Dette gjør det mulig
        å bytte tema uten å endre én eneste komponent.
      </p>

      <h2>Primitive vs. semantiske tokens</h2>
      <p>
        Primitive tokens er de rå fargene i paletten — de har navn som{" "}
        <code>--jkl-color-granitt-20</code> eller <code>--jkl-color-stein-60</code>. Semantiske
        tokens refererer til disse og legger til kontekst og intensjon.
      </p>

      <h2>De semantiske lagene</h2>
      <DescriptionList>
        <DescriptionTerm>Bakgrunnsfarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-background-default</code> — sidens grunnfarge. Byttes mellom lys og mørk
          ved temaendring uten å berøre komponentkode.
        </DescriptionDetail>
        <DescriptionTerm>Tekstfarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-text-default</code>, <code>--jkl-color-text-subdued</code> og
          <code>--jkl-color-text-on-action</code> — tre nivåer for teksthierarki.
        </DescriptionDetail>
        <DescriptionTerm>Interaktive farger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-interactive-default</code> og <code>--jkl-color-interactive-hover</code>
          {" "}— brukes på knapper og lenker. Garantert 4.5:1 kontrast mot bakgrunn i begge temaer.
        </DescriptionDetail>
        <DescriptionTerm>Kantlinjefarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-border-default</code> og <code>--jkl-color-border-focus</code>
          {" "}— tydelig visuell separasjon og fokusindikator.
        </DescriptionDetail>
        <DescriptionTerm>Fokusfarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-focus-ring</code> — kontrastrik fokusring som alltid er synlig, uavhengig av tema.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Tilstandsfarger</h2>
      <p>Disse fargene brukes for å kommunisere system- og inndatastatus:</p>
      <Flex gap="xs" wrap="wrap">
        <Tag variant="info">Info — nøytral blå</Tag>
        <Tag variant="success">Suksess — grønn</Tag>
        <Tag variant="warning">Advarsel — gul</Tag>
        <Tag variant="error">Feil — rød</Tag>
      </Flex>

      <Message variant="warning">
        Tilstandsfarger bør <strong>aldri</strong> brukes som dekorasjon. De har en semantisk
        betydning som brukere, inkludert de med fargeblindhet, stoler på. Kombiner alltid farge
        med ikon eller tekst for å formidle status.
      </Message>

      <h2>Mørk modus i praksis</h2>
      <p>
        For å aktivere mørk modus setter du <code>{'data-theme="dark"'}</code> på et foreldre
        element. Alle semantiske tokens bytter automatisk til mørke varianter:
      </p>
      <OrderedList>
        <ListItem>Bakgrunnsfarger inverteres fra lys til mørk grå</ListItem>
        <ListItem>Tekstfarger justeres for å bevare 4.5:1 kontrast</ListItem>
        <ListItem>Interaktive farger lysnes for bedre synlighet mot mørk bakgrunn</ListItem>
        <ListItem>Fokusringer justeres for å skille seg ut mot mørke overflater</ListItem>
      </OrderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Kontrastkrav og WCAG</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>WCAG 2.2 definerer disse minimumskravene for kontrast:</p>
          <UnorderedList>
            <ListItem><strong>4.5:1</strong> — normal tekst (under 18pt / 14pt bold)</ListItem>
            <ListItem><strong>3:1</strong> — stor tekst (18pt+ / 14pt+ bold) og UI-komponenter</ListItem>
            <ListItem><strong>3:1</strong> — grafiske elementer og infografikk som formidler informasjon</ListItem>
          </UnorderedList>
          <p>
            Jøkuls fargepalette er designet slik at alle semantiske fargepar automatisk
            oppfyller AA-kravene. Du kan verifisere kontrasten med{" "}
            <Link href="https://webaim.org/resources/contrastchecker/" external>WebAIM Contrast Checker</Link>.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>
    </>
  ),
  date: "2026-03-07",
  category: "Design",
  author: "Kari Olsen",
  tags: ["farger", "tokens", "dark mode", "kontrast", "design"],
  resources: [
    {
      title: "Jøkul fargedokumentasjon",
      url: "https://jokul.fremtind.no/profil/farger",
      description: "Komplett fargepalette og retningslinjer",
    },
    {
      title: "WebAIM Contrast Checker",
      url: "https://webaim.org/resources/contrastchecker/",
      description: "Verktøy for å sjekke fargekontrast mot WCAG",
    },
    {
      title: "Reasonable Colors",
      url: "https://reasonable.work/colors/",
      description: "Et system for å lage tilgjengelige fargepaletter",
    },
  ],
};

export default post;
