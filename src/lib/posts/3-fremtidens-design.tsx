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
        Designsystemer er ikke statiske produkter — de er levende infrastruktur. Mens Jøkul
        allerede leverer konsistens og tilgjengelighet i dag, peker veien fremover mot
        <strong> design tokens</strong> som den universelle valutaen mellom design og kode.
      </p>

      <Message variant="info">
        W3C Design Tokens Community Group jobber med en åpen standard for design tokens.
        Jøkul følger dette arbeidet tett og planlegger å adoptere standarden når den er stabil.
      </Message>

      <h2>Hva er design tokens?</h2>
      <p>
        Design tokens er navngitte variabler som representerer designbeslutninger. De finnes i tre
        konseptuelle lag:
      </p>
      <DescriptionList>
        <DescriptionTerm>Primitive tokens</DescriptionTerm>
        <DescriptionDetail>
          Råverdier uten kontekst: <code>{'--color-blue-500: #3b82f6'}</code>,{" "}
          <code>{'--spacing-4: 1rem'}</code>. Disse endres sjelden.
        </DescriptionDetail>
        <DescriptionTerm>Semantiske tokens</DescriptionTerm>
        <DescriptionDetail>
          Refererer til primitive tokens og tillegger mening: <code>{'--color-interactive: var(--color-blue-500)'}</code>.
          Dette laget byttes ut ved theming.
        </DescriptionDetail>
        <DescriptionTerm>Komponent-tokens</DescriptionTerm>
        <DescriptionDetail>
          Scoped til en spesifikk komponent: <code>{'--button-bg: var(--color-interactive)'}</code>.
          Gir finkornet kontroll uten å påvirke andre komponenter.
        </DescriptionDetail>
      </DescriptionList>

      <h2>CSS Custom Properties i praksis</h2>
      <p>
        Jøkul eksponerer alle tokens som CSS Custom Properties. Du kan overstyre dem på
        rotnivå eller scoped til en komponent:
      </p>
      <pre><code>{`:root {
  --jkl-color-background: #ffffff;
  --jkl-spacing-content-padding: 1.5rem;
}

[data-theme="dark"] {
  --jkl-color-background: #1a1a1a;
}`}</code></pre>

      <h2>Theming uten stiloverskrivinger</h2>
      <p>
        Den store fordelen med token-basert theming er at du <em>aldri trenger å overstyre
        komponentstiler direkte</em>. I stedet endrer du verdien av en token, og alle komponenter
        som bruker den token oppdateres automatisk.
      </p>

      <h2>Fremtiden: AI og generative grensesnitt</h2>
      <p>
        En spennende utvikling er bruken av AI i designprosessen. Med et veldefinert tokensystem
        kan et språkmodell generere UI-forslag som allerede er på-merkevare — fordi den har tilgang
        til de eksakte designbeslutningene, ikke bare generiske fargenavn.
      </p>

      <Flex gap="s" wrap="wrap">
        <Tag variant="info">Design Tokens W3C</Tag>
        <Tag variant="info">Style Dictionary</Tag>
        <Tag variant="info">Token Studio</Tag>
        <Tag>AI-assistert design</Tag>
        <Tag>Multi-brand theming</Tag>
      </Flex>

      <ExpandablePanel>
        <ExpandablePanel.Header>Slik bruker du Style Dictionary med Jøkul-tokens</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Style Dictionary fra Amazon lar deg definere tokens én gang og transformere dem til
            CSS, SCSS, JavaScript, iOS og Android-verdier automatisk.
          </p>
          <OrderedList>
            <ListItem>Installer: <code>{'npm install style-dictionary'}</code></ListItem>
            <ListItem>Definer tokens i JSON-filer organisert etter kategori</ListItem>
            <ListItem>Konfigurer transformasjoner og formater i <code>config.json</code></ListItem>
            <ListItem>Kjør <code>{'npx style-dictionary build'}</code> for å generere output</ListItem>
          </OrderedList>
          <p>
            Med Token Studio for Figma kan designere jobbe med de samme tokens direkte i
            designverktøyet, og synkronisere endringer til koderepoen via GitHub Actions.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>Strategi fremover</h2>
      <p>
        Fremtinds strategi er å gjøre token-laget så stabilt og veldokumentert at produktteam
        kan spinne opp nye merkevarer og temaer uten å involvere designsystemteamet. Det er
        målet for neste generasjon av Jøkul: <em>maksimal fleksibilitet, minimal friksjon</em>.
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
