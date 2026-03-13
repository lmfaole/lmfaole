import React from "react";
import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/components/CodeBlock";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 9,
  title: "Spacing og layout i Jøkul",
  excerpt: "Lær hvordan Jøkul sitt spacing-system og Flex-komponenten lar deg bygge konsistente layout uten egendefinerte verdier.",
  content: (
    <>
      <p>
        Vet du hva som er den vanligste kilden til avvik mellom design og implementasjon? Det er
        ikke farger. Det er ikke typografi. Det er spacing. Designeren sier 16px mellom elementene,
        utvikleren skriver <code>margin: 15px</code> fordi det "ser likt ut". Multiplisert over
        hundre komponenter og ti team over to år, og du har et grensesnitt som aldri helt stemmer.
        Jøkuls spacing-system er svaret på det problemet.
      </p>

      <h2>Skalaen — ni navngitte trinn</h2>
      <p>
        I stedet for vilkårlige piksel-verdier bruker Jøkul navngitte trinn. Navnet er kontrakten:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>3xs</code> — 2px</DescriptionTerm>
        <DescriptionDetail>Mikroavstand mellom tett relaterte elementer, f.eks. ikon og etikett inline.</DescriptionDetail>
        <DescriptionTerm><code>2xs</code> — 4px</DescriptionTerm>
        <DescriptionDetail>Indre padding i kompakte komponenter som tags og badges.</DescriptionDetail>
        <DescriptionTerm><code>xs</code> — 8px</DescriptionTerm>
        <DescriptionDetail>Standard innvendig padding i knapper og inndatafelter.</DescriptionDetail>
        <DescriptionTerm><code>s</code> — 12px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom relaterte elementer i samme gruppe.</DescriptionDetail>
        <DescriptionTerm><code>m</code> — 16px</DescriptionTerm>
        <DescriptionDetail>Basisenheten. Avstand mellom uavhengige elementer i en seksjon.</DescriptionDetail>
        <DescriptionTerm><code>l</code> — 24px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom seksjoner på samme side.</DescriptionDetail>
        <DescriptionTerm><code>xl</code> — 32px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom store blokker eller kortkomponenter i en grid.</DescriptionDetail>
        <DescriptionTerm><code>2xl</code> — 48px</DescriptionTerm>
        <DescriptionDetail>Vertikal rytme mellom innholdsrike seksjoner.</DescriptionDetail>
        <DescriptionTerm><code>3xl</code> — 64px</DescriptionTerm>
        <DescriptionDetail>Heroavstand — kun mellom primære sideblokker på landingssider.</DescriptionDetail>
      </DescriptionList>

      <h2>Flex-komponenten — spacing uten egendefinerte verdier</h2>
      <p>
        <code>Flex</code>-komponenten er Jøkuls svar på "hvordan distribuerer jeg elementer uten å
        skrive CSS?". Den tar spacing-verdiene fra skalaen direkte som props:
      </p>
      <CodeBlock code={'<Flex gap="m" direction="row" wrap="wrap" align="center">'} />
      <p>
        Ingen magiske tall. Ingen inline styles. Bare kontrakt med systemet.
      </p>

      <h2>Grid vs. Flex — det jeg alltid glemmer</h2>
      <Flex gap="s" wrap="wrap">
        <Tag variant="info">Flex — én dimensjon (rad eller kolonne)</Tag>
        <Tag variant="info">Grid — to dimensjoner (rad OG kolonne)</Tag>
        <Tag variant="success">Flex — dynamisk innhold</Tag>
        <Tag variant="success">Grid — fast rutenettstruktur</Tag>
      </Flex>
      <UnorderedList>
        <ListItem><strong>Flex</strong> er best for navigasjonslinjer, kortrekker og knappgrupper der innholdets størrelse varierer.</ListItem>
        <ListItem><strong>Grid</strong> er best for sidelayout, datatabeller og gallerier med eksplisitt rad- og kolonnestruktur.</ListItem>
        <ListItem>Nest gjerne Flex inne i Grid-celler for å justere innholdet i hver celle.</ListItem>
      </UnorderedList>

      <Message variant="info">
        <code>data-size="compact"</code> på et foreldreelement reduserer spacing og typografistørrelser
        for alle barn-komponenter automatisk. Perfekt for dashbord og tabeller med høy informasjonstetthet.
      </Message>

      <ExpandablePanel>
        <ExpandablePanel.Header>CSS Logical Properties — fremtidssikker spacing</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Jøkul bruker CSS Logical Properties internt for å støtte høyre-til-venstre-språk.
            I stedet for <code>margin-left</code> brukes <code>margin-inline-start</code> — det
            speiles automatisk i RTL-kontekster.
          </p>
          <p>
            Vi anbefalte teamene å gjøre det samme i egne komponenter. Nettleserstøtten er
            utmerket i alle evergreen-nettlesere, og du fremtidssikrer layouten uten ekstra
            arbeid når en dag dere trenger å støtte arabisk eller hebraisk:
          </p>
          <CodeBlock code={`/* Unngå fysiske egenskaper */
.element { margin-left: 1rem; }

/* Bruk logiske egenskaper */
.element { margin-inline-start: 1rem; }`} />
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Spacing er den typen designbeslutning som skalerer stille i bakgrunnen. Når alle bruker
        de samme navngitte trinnene, forsvinner avvikene av seg selv — ikke fordi folk er mer
        nøye, men fordi systemet gjør det vanskelig å ta feil.
      </p>
    </>
  ),
  date: "2026-03-04",
  category: "Design",
  author: "Ola Nordmann",
  tags: ["spacing", "layout", "flex", "grid", "responsiv"],
  resources: [
    {
      title: "Jøkul Flex-dokumentasjon",
      url: "https://jokul.fremtind.no/komponenter/flex",
      description: "API og eksempler for Flex-komponenten",
    },
    {
      title: "Every Layout",
      url: "https://every-layout.dev/",
      description: "Robuste CSS-layoutprimitiver for det moderne web",
    },
    {
      title: "CSS Logical Properties",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values",
      description: "MDN-dokumentasjon om CSS Logical Properties",
    },
  ],
};

export default post;
