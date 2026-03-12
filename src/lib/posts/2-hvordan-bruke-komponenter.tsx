import React from "react";
import { OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 2,
  title: "Hvordan bruke komponenter",
  excerpt: "Lær hvordan du kan utnytte de kraftige komponentene i Jøkul for å bygge raske nettsider.",
  content: (
    <>
      <p>
        Jøkul-komponenter er bygget med <strong>React</strong> og <strong>TypeScript</strong>, og
        leveres som individuelle npm-pakker. Dette gir deg full kontroll over buntstørrelse — du
        installerer kun det du faktisk bruker.
      </p>

      <Message variant="success">
        Alle Jøkul-komponenter støtter <strong>treeshaking</strong> og har innebygd
        tilgjengelighetsstøtte i henhold til WCAG 2.2 AA.
      </Message>

      <h2>Importmønstre</h2>
      <p>
        Jøkul bruker et konsistent importmønster på tvers av alle pakker. Her er de vanligste
        pakkene og hva de eksporterer:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>{'@fremtind/jokul/button'}</code></DescriptionTerm>
        <DescriptionDetail>Eksporterer <code>Button</code> med varianter primary, secondary og ghost.</DescriptionDetail>
        <DescriptionTerm><code>{'@fremtind/jokul/text-input'}</code></DescriptionTerm>
        <DescriptionDetail>Eksporterer <code>TextInput</code> med label, hjelpetekst og feilmelding innebygd.</DescriptionDetail>
        <DescriptionTerm><code>{'@fremtind/jokul/select'}</code></DescriptionTerm>
        <DescriptionDetail>Eksporterer <code>Select</code> og <code>Option</code> — tilgjengelig nedtrekksliste.</DescriptionDetail>
        <DescriptionTerm><code>{'@fremtind/jokul/message'}</code></DescriptionTerm>
        <DescriptionDetail>Eksporterer <code>Message</code> med variantene info, success, warning og error.</DescriptionDetail>
        <DescriptionTerm><code>{'@fremtind/jokul/expander'}</code></DescriptionTerm>
        <DescriptionDetail>Eksporterer <code>ExpandablePanel</code> med compound-mønster for header og innhold.</DescriptionDetail>
      </DescriptionList>

      <h2>Installasjon steg for steg</h2>
      <OrderedList>
        <ListItem>Installer basispakken og CSS: <code>{'npm install @fremtind/jokul'}</code></ListItem>
        <ListItem>Legg til global CSS øverst i <code>app/layout.tsx</code> eller tilsvarende: <code>{'import "@fremtind/jokul/core.css"'}</code></ListItem>
        <ListItem>Installer ønsket komponentpakke, f.eks.: <code>{'npm install @fremtind/jokul/button'}</code></ListItem>
        <ListItem>Importer komponenten der du trenger den: <code>{'import { Button } from "@fremtind/jokul/button"'}</code></ListItem>
        <ListItem>Legg til komponent-CSS i samme fil eller globalt: <code>{'import "@fremtind/jokul/button/button.css"'}</code></ListItem>
      </OrderedList>

      <h2>Theming og mørk modus</h2>
      <p>
        Jøkul bruker <strong>CSS Custom Properties</strong> for theming. Mørk modus aktiveres ved
        å sette <code>{'data-theme="dark"'}</code> på rotelementet. Du trenger ikke ekstra kode i
        komponentene — de reagerer automatisk.
      </p>
      <p>
        For å speile operativsystemets preferanse kan du bruke <code>prefers-color-scheme</code>
        {" "}i CSS, eller håndtere det med JavaScript ved oppstart.
      </p>

      <h2>Komposisjonsteknikker</h2>
      <p>
        Mange Jøkul-komponenter støtter det såkalte <em>compound component</em>-mønsteret, der
        underkomponenter aksesseres som egenskaper på foreldrekomponenten. Dette gir ren,
        selvdokumenterende JSX.
      </p>

      <ExpandablePanel>
        <ExpandablePanel.Header>Eksempel: ExpandablePanel compound-mønster</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>I stedet for å sende header som en prop, bruker du underkomponenter:</p>
          <pre><code>{`<ExpandablePanel>
  <ExpandablePanel.Header>
    Klikk for å utvide
  </ExpandablePanel.Header>
  <ExpandablePanel.Content>
    Her er det skjulte innholdet som vises når panelet åpnes.
    Du kan legge inn hvilken som helst React-node her.
  </ExpandablePanel.Content>
</ExpandablePanel>`}</code></pre>
          <p>
            Denne tilnærmingen gir deg full kontroll over innholdet i både header og body, og gjør
            det enkelt å komponere komplekse paneler uten prop-drilling.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>Prop-APIer og TypeScript</h2>
      <p>
        Alle Jøkul-komponenter er fullt typede. Du får autofullføring og kompileringstidsfeil hvis
        du bruker props feil. Generelle props som <code>className</code>, <code>id</code> og
        {" "}<code>data-*</code>-attributter videresendes alltid til rotElementet, slik at du kan
        integrere med egne CSS-moduler uten friksjon.
      </p>

      <Flex gap="xs" wrap="wrap">
        <Tag variant="info">React 18+</Tag>
        <Tag variant="info">TypeScript 5+</Tag>
        <Tag variant="success">WCAG 2.2 AA</Tag>
        <Tag variant="success">Mørk modus</Tag>
        <Tag>Treeshaking</Tag>
      </Flex>
    </>
  ),
  date: "2026-03-11",
  category: "Utvikling",
  author: "Kari Olsen",
  tags: ["react", "typescript", "npm", "wcag", "dark mode"],
  resources: [
    {
      title: "Jøkul komponentoversikt",
      url: "https://jokul.fremtind.no/komponenter",
      description: "Komplett oversikt over alle tilgjengelige komponenter",
    },
    {
      title: "WCAG 2.2 oversikt",
      url: "https://www.w3.org/TR/WCAG22/",
      description: "W3C-standarden for tilgjengelighet på web",
    },
    {
      title: "Next.js dokumentasjon",
      url: "https://nextjs.org/docs",
      description: "Offisiell Next.js-dokumentasjon",
    },
  ],
};

export default post;
