import React from "react";
import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 9,
  title: "Spacing og layout i Jøkul",
  excerpt: "Lær hvordan Jøkul sitt spacing-system og Flex-komponenten lar deg bygge konsistente layout uten egendefinerte verdier.",
  content: (
    <>
      <p>
        Ujevn spacing er et av de vanligste avvikene mellom design og implementasjon. Jøkul løser
        dette med et fast, navngitt spacing-system som brukes konsekvent i både Figma og kode.
        Resultatet er grensesnitt som <em>ser</em> gjennomtenkte ut fordi de faktisk er det.
      </p>

      <h2>Spacing-skalaen</h2>
      <DescriptionList>
        <DescriptionTerm><code>3xs</code> — 2px</DescriptionTerm>
        <DescriptionDetail>Mikroavstand mellom tett relaterte elementer, f.eks. ikon og etikett inline.</DescriptionDetail>
        <DescriptionTerm><code>2xs</code> — 4px</DescriptionTerm>
        <DescriptionDetail>Indre padding i kompakte komponenter som tags og badges.</DescriptionDetail>
        <DescriptionTerm><code>xs</code> — 8px</DescriptionTerm>
        <DescriptionDetail>Standard innvendig padding i knapper og inndatafelter.</DescriptionDetail>
        <DescriptionTerm><code>s</code> — 12px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom relaterte elementer i samme gruppe, f.eks. label og inputfelt.</DescriptionDetail>
        <DescriptionTerm><code>m</code> — 16px</DescriptionTerm>
        <DescriptionDetail>Basisenheten — avstand mellom uavhengige elementer i en seksjon.</DescriptionDetail>
        <DescriptionTerm><code>l</code> — 24px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom seksjoner på samme side.</DescriptionDetail>
        <DescriptionTerm><code>xl</code> — 32px</DescriptionTerm>
        <DescriptionDetail>Avstand mellom store blokker eller kortkomponenter i en grid.</DescriptionDetail>
        <DescriptionTerm><code>2xl</code> — 48px</DescriptionTerm>
        <DescriptionDetail>Vertikal rytme mellom innholdsrike seksjoner på en side.</DescriptionDetail>
        <DescriptionTerm><code>3xl</code> — 64px</DescriptionTerm>
        <DescriptionDetail>Heroavstand — kun mellom primære sideblokker på landingssider.</DescriptionDetail>
      </DescriptionList>

      <h2>Flex-komponentens API</h2>
      <DescriptionList>
        <DescriptionTerm><code>direction</code></DescriptionTerm>
        <DescriptionDetail><code>row</code> (standard) eller <code>column</code> — tilsvarer CSS flex-direction.</DescriptionDetail>
        <DescriptionTerm><code>gap</code></DescriptionTerm>
        <DescriptionDetail>Tar en av de ni spacing-verdiene fra skalaen over. Ingen egendefinerte px-verdier.</DescriptionDetail>
        <DescriptionTerm><code>align</code></DescriptionTerm>
        <DescriptionDetail><code>flex-start</code>, <code>center</code>, <code>flex-end</code> eller <code>stretch</code> — tilsvarer align-items.</DescriptionDetail>
        <DescriptionTerm><code>wrap</code></DescriptionTerm>
        <DescriptionDetail><code>wrap</code> eller <code>nowrap</code> — om elementer brytes til ny linje.</DescriptionDetail>
        <DescriptionTerm><code>as</code></DescriptionTerm>
        <DescriptionDetail>Polymorf prop for semantisk HTML. Bruk <code>as="ul"</code> for lister, <code>as="nav"</code> for navigasjon.</DescriptionDetail>
      </DescriptionList>

      <h2>Grid vs. Flex — når bruker du hva?</h2>
      <Flex gap="s" wrap="wrap">
        <Tag variant="info">Flex — én dimensjon</Tag>
        <Tag variant="info">Grid — to dimensjoner</Tag>
        <Tag variant="success">Flex — dynamisk innhold</Tag>
        <Tag variant="success">Grid — fast struktur</Tag>
      </Flex>
      <UnorderedList>
        <ListItem><strong>Flex</strong> er best for navigasjonslinjer, kortrekker, knappgrupper og komponenter der innholdets størrelse varierer.</ListItem>
        <ListItem><strong>Grid</strong> er best for sidelayout, datatabeller og gallerier der du trenger eksplisitt rad- og kolonnestruktur.</ListItem>
        <ListItem>Nest gjerne Flex inne i Grid-celler for å justere innholdet i hver celle.</ListItem>
      </UnorderedList>

      <h2>Responsivt spacing med data-size</h2>
      <p>
        Jøkul støtter et responsivt størrelsessystem via <code>data-size</code>-attributtet.
        Setter du <code>{'data-size="compact"'}</code> på et foreldreelement, reduseres spacing
        og typografistørrelser automatisk for alle barn-komponenter:
      </p>
      <pre><code>{`<section data-size="compact">
  {/* Alle Jøkul-komponenter her bruker kompakt spacing */}
  <TextInput label="Søk" />
  <Button>Søk</Button>
</section>`}</code></pre>

      <Message variant="info">
        <code>data-size</code> er spesielt nyttig i dashbord og tabellrader der du trenger
        høy informasjonstetthet uten å overstyre enkeltkomponenter.
      </Message>

      <ExpandablePanel>
        <ExpandablePanel.Header>CSS Logical Properties og flerspråklig layout</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Jøkul bruker <strong>CSS Logical Properties</strong> internt for å støtte
            høyre-til-venstre-språk (RTL) uten layout-brudd. I stedet for{" "}
            <code>margin-left</code> brukes <code>margin-inline-start</code>, som automatisk
            speiles i RTL-kontekster.
          </p>
          <p>
            For egne komponenter bør du bruke de samme logiske egenskapene:
          </p>
          <pre><code>{`/* Fysiske egenskaper — unngå */
.element {
  margin-left: 1rem;
  padding-right: 0.5rem;
  border-left: 2px solid;
}

/* Logiske egenskaper — foretrekk */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 0.5rem;
  border-inline-start: 2px solid;
}`}</code></pre>
          <p>
            Nettleserstøtten for CSS Logical Properties er svært god og inkluderer alle
            evergreen-nettlesere. Det er trygt å bruke i produksjon i dag.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>
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
