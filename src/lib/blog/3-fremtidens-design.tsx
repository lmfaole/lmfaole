import React from "react";
import { OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 3,
  title: "Fremtidens design",
  excerpt: "Hva er det neste for designsystemer i Fremtind?",
  content: (
    <>
      <p>
        Vi hadde nettopp avsluttet et prosjekt der vi lanserte samme UI i tre merkevarer. Knapper,
        skjemaer, navigasjon — alt visuelt ulikt, alt bygget på nøyaktig same kode. Uten design
        tokens hadde det vært måneder med manuell stilopprydding. Med dem tok det en dag. Det er
        ikke magi — det er arkitektur. Og det er der fremtiden til designsystemer ligger.
      </p>

      <Message variant="info">
        W3C Design Tokens Community Group jobber med en åpen standard for design tokens.
        Jøkul følger dette arbeidet tett og planlegger å adoptere standarden etterhvert.
      </Message>

      <h2>Tre lag du bør kjenne til</h2>
      <p>
        Tokens finnes ikke i ett lag — de er et system av referanser som gir mening på ulike nivåer.
        Forstår du lagstrukturen, forstår du how theming faktisk fungerer:
      </p>
      <DescriptionList>
        <DescriptionTerm>Primitive tokens</DescriptionTerm>
        <DescriptionDetail>
          Råverdier uten kontekst: <code>{'--color-granitt-90: #1a1a1a'}</code>. Disse endres nesten aldri.
          De er paletten, ikke reglene.
        </DescriptionDetail>
        <DescriptionTerm>Semantiske tokens</DescriptionTerm>
        <DescriptionDetail>
          Her skjer magien: <code>{'--color-text-default: var(--color-granitt-90)'}</code>. I mørkt tema
          peker den samme semantiske tokenen på en lys farge. Komponentene bryr seg ikke — de leser
          alltid den semantiske verdien.
        </DescriptionDetail>
        <DescriptionTerm>Komponent-tokens</DescriptionTerm>
        <DescriptionDetail>
          Scoped til én komponent: <code>{'--button-bg: var(--color-interactive)'}</code>. Gir
          finkornet kontroll uten å ryste resten av systemet.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Feilen de fleste gjør</h2>
      <p>
        Jeg har sett det skje gang på gang: team starter med tokens, men bruker dem som glorifiserte
        fargevariabler. De lager <code>--color-blue</code> og ender der. Neste gang noen vil endre
        primærfargen fra blå til grønn, må de oppdatere hundre steder i stedet for én.
      </p>
      <p>
        Riktig tilnærming er å gå gjennom semantiske tokens: <code>--color-interactive</code> peker
        på <code>--color-blue</code>, og alle komponenter peker på <code>--color-interactive</code>.
        Én endring, alt oppdateres.
      </p>

      <h2>AI og tokens — mer relevant enn du tror</h2>
      <p>
        En interessant bieffekt av veldefinerte tokens er at AI-verktøy faktisk kan bruke dem.
        Når du beskriver komponentene dine i form av semantiske tokens, kan et språkmodell generere
        UI-forslag som allerede er på-merkevare — fordi den har tilgang til de faktiske
        designbeslutningene, ikke bare generiske fargenavn.
      </p>
      <p>
        Vi har eksperimentert med å gi Copilot tilgang til token-manifestet vårt. Forslagene ble
        vesentlig bedre. Det er ikke science fiction — det er en naturlig konsekvens av god tokenstruktur.
      </p>

      <Flex gap="s" wrap="wrap">
        <Tag variant="info">Design Tokens W3C</Tag>
        <Tag variant="info">Style Dictionary</Tag>
        <Tag>AI-assistert design</Tag>
        <Tag>Multi-brand theming</Tag>
      </Flex>

      <ExpandablePanel>
        <ExpandablePanel.Header>Style Dictionary i praksis — steg for steg</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Style Dictionary lar deg definere tokens én gang og transformere dem til CSS, SCSS,
            JavaScript, iOS og Android automatisk. Slik setter vi det opp:
          </p>
          <OrderedList>
            <ListItem>Installer: <code>{'npm install style-dictionary'}</code></ListItem>
            <ListItem>Definer tokens i JSON-filer organisert etter kategori (color, spacing, typography)</ListItem>
            <ListItem>Konfigurer transformasjoner i <code>config.json</code></ListItem>
            <ListItem>Kjør <code>{'npx style-dictionary build'}</code> i CI for å generere output</ListItem>
          </OrderedList>
          <p>
            Med Token Studio for Figma kan designerne jobbe med de samme tokens direkte i
            designverktøyet og synkronisere til koderepoen via en GitHub Actions-jobb. Designere og
            utviklere jobber aldri ut av sync — det er en game changer.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>Fremtinds mål: null friksjon ved branching</h2>
      <p>
        Det langsiktige målet er at et produktteam skal kunne spinne opp en ny merkevarevi uten å
        involvere designsystemteamet i det hele tatt. Bytt ut de semantiske tokenene, og resten
        følger med. Vi er ikke der ennå, men vi er nærmere enn vi var for ett år siden.
        <em> Maksimal fleksibilitet, minimal friksjon</em> — det er mantraet.
      </p>
    </>
  ),
  date: "2026-03-10",
  category: "Strategi",
  author: "Erik Dahl",
  tags: ["ai", "design tokens", "w3c", "strategi", "fremtind"],
  resources: [
    {
      title: "W3C Design Tokens Community Group",
      url: "https://design-tokens.github.io/community-group/format/",
      description: "Pågående standardiseringsarbeid for design tokens",
    },
    {
      title: "Style Dictionary",
      url: "https://amzn.github.io/style-dictionary/",
      description: "Amazons verktøy for å transformere design tokens til platformspesifikke formater",
    },
    {
      title: "Token Studio for Figma",
      url: "https://tokens.studio/",
      description: "Plugin for å jobbe med design tokens direkte i Figma",
    },
  ],
};

export default post;
