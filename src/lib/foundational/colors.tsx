import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/components/CodeBlock";
import type { BlogPost } from "../blog/types";

const post: BlogPost = {
  id: 11,
  title: "Fargesystemet i Jøkul",
  excerpt:
    "En fullstendig referanse til Jøkuls fargesystem: primitive tokens, semantiske tokens, fargeroller, lys/mørk tema og kontrastkrav.",
  content: (
    <>
      <p>
        Farge er ett av de mest kraftfulle verktøyene i designsystemet. Jøkuls fargesystem er
        bygget i to lag — <strong>primitive tokens</strong> og{" "}
        <strong>semantiske tokens</strong> — for å gjøre det enkelt å bytte tema, sikre
        tilgjengelighet og holde produkter konsistente.
      </p>

      <Message variant="info">
        Bruk alltid semantiske fargevariabler i komponentkoden din — aldri de primitive tokenene
        direkte. Dette sikrer at temabytte (lys/mørk) fungerer automatisk.
      </Message>

      <h2>Primitive tokens — fargepaletten</h2>
      <p>
        De primitive tokenene er det nederste laget i systemet. De definerer alle konkrete
        fargeverdier — eksakte hex-koder eller HSL-verdier. De er ikke ment å brukes direkte i
        komponentkode, men er byggesteinene som de semantiske tokenene refererer til.
      </p>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-color-primitive-granitt-*</code></DescriptionTerm>
        <DescriptionDetail>
          Gråskalaen fra nesten hvit (10) til nesten svart (100). Grunnlaget for nøytrale
          overflater og tekst.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-primitive-skog-*</code></DescriptionTerm>
        <DescriptionDetail>
          Fremtinds primærfarge — en mørk, rolig grønn. Brukes for interaktive elementer og
          merkevareidentitet.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-primitive-varde-*</code></DescriptionTerm>
        <DescriptionDetail>
          En varm beige/sandfarge. Brukes til sekundære overflater og bakgrunner i markedsførings-
          kontekst.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-primitive-fjord-*</code></DescriptionTerm>
        <DescriptionDetail>
          En kjølig blå. Brukes primært for informasjons- og lenkefarger.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-primitive-furu-*</code></DescriptionTerm>
        <DescriptionDetail>
          En varm terrakotta/rødoransje. Brukes for varsler og feilmeldinger.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Semantiske tokens — fargeroller</h2>
      <p>
        Semantiske tokens gir farger <em>mening</em> i stedet for å beskrive den faktiske fargen.
        Dette gjør det mulig å bytte ut alle underliggende primitive verdier (f.eks. mørk modus)
        uten å endre komponentkoden.
      </p>

      <h2>Bakgrunnsfarger</h2>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-color-background-default</code></DescriptionTerm>
        <DescriptionDetail>
          Sidens hovedbakgrunn. Hvit i lys modus, nesten svart i mørk modus.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-background-subtle</code></DescriptionTerm>
        <DescriptionDetail>
          Lett hevet overflate. Brukes på kort, paneler og seksjoner som skal skille seg fra
          siden bak.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-background-sunken</code></DescriptionTerm>
        <DescriptionDetail>
          Nedsenket overflate — litt mørkere enn default. Brukes for inndatafelter og
          innrammede områder som visuelt «synker» inn.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-background-inverted</code></DescriptionTerm>
        <DescriptionDetail>
          Invertert overflate — mørk bakgrunn i lys modus, lys i mørk modus. For
          tydelig kontrast, f.eks. footer eller hero-seksjoner.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Innholdsfarger (tekst og ikoner)</h2>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-color-content-default</code></DescriptionTerm>
        <DescriptionDetail>
          Primær tekstfarge. Brukes for overskrifter og brødtekst.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-content-subtle</code></DescriptionTerm>
        <DescriptionDetail>
          Sekundær tekstfarge. Brukes for hjelpetekst, metadata og plassholdertekst i
          skjemafelter.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-content-inverted</code></DescriptionTerm>
        <DescriptionDetail>
          Tekst på invertert bakgrunn. Automatisk kontrastert mot{" "}
          <code>background-inverted</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-content-link</code></DescriptionTerm>
        <DescriptionDetail>
          Farge for lenker og interaktive inline-tekstelementer.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Kantlinjefarger</h2>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-color-border-default</code></DescriptionTerm>
        <DescriptionDetail>
          Standard kantlinje for skjemafelter, skillelinjer og kortkanter.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-border-focused</code></DescriptionTerm>
        <DescriptionDetail>
          Fokusring. Brukes automatisk av alle Jøkul-komponenter ved tastaturnavigasjon.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-border-invalid</code></DescriptionTerm>
        <DescriptionDetail>
          Feilmarkering. Vises automatisk på skjemafelter med valideringsfeil.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Tilstandsfarger (feedback)</h2>
      <p>
        Tilstandsfarger brukes for å kommunisere suksess, advarsel, feil og informasjon:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-color-feedback-success-*</code></DescriptionTerm>
        <DescriptionDetail>
          Grønn — operasjonen var vellykket, feltet er godkjent.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-feedback-warning-*</code></DescriptionTerm>
        <DescriptionDetail>
          Gul/amber — noe krever brukerens oppmerksomhet, men er ikke kritisk.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-feedback-error-*</code></DescriptionTerm>
        <DescriptionDetail>
          Rød — en feil har oppstått, eller feltet er ugyldig. Krever handling.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-color-feedback-info-*</code></DescriptionTerm>
        <DescriptionDetail>
          Blå — nøytral informasjon som kan hjelpe brukeren.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Lys og mørk tema</h2>
      <p>
        Jøkul støtter fullstendig mørk modus uten ekstra kode i komponentene. Temaet aktiveres
        ved å sette et attributt på et overordnet element:
      </p>
      <CodeBlock code={`<!-- Lys modus (standard) -->
<div data-theme="light">...</div>

<!-- Mørk modus -->
<div data-theme="dark">...</div>

<!-- Følger OS-innstillingen (anbefalt) -->
<div data-theme="auto">...</div>`} />
      <p>
        Alle semantiske fargevariabler bytter automatisk verdi basert på det aktive temaet.
        Primitive tokens endres <em>ikke</em>.
      </p>

      <Message variant="warning">
        Dersom du bruker en primitiv token direkte (f.eks.{" "}
        <code>--jkl-color-primitive-granitt-10</code>) vil ikke komponenten din bytte utseende
        ved temabytte. Bruk alltid semantiske tokens.
      </Message>

      <h2>Kontrastkrav og WCAG</h2>
      <p>
        Jøkuls fargepar er testet mot WCAG 2.1 AA-krav. Tommelfingerreglene er:
      </p>
      <UnorderedList>
        <ListItem>
          <strong>Normal tekst</strong> (under 18pt / 14pt bold): minimalt kontrastforhold
          på <strong>4,5:1</strong>.
        </ListItem>
        <ListItem>
          <strong>Stor tekst</strong> (18pt+ / 14pt+ bold): minimalt kontrastforhold på{" "}
          <strong>3:1</strong>.
        </ListItem>
        <ListItem>
          <strong>UI-komponenter og grafiske elementer</strong>: minimalt kontrastforhold
          på <strong>3:1</strong> mot tilstøtende farger.
        </ListItem>
        <ListItem>
          Bruk verktøy som <strong>Stark</strong> (Figma-plugin) eller{" "}
          <strong>WebAIM Contrast Checker</strong> for å verifisere egne fargekombinasjoner.
        </ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Bruke fargevariabler i egne komponenter</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>Eksempel på riktig bruk av semantiske fargevariabler i CSS:</p>
          <CodeBlock code={`.mitt-kort {
  background-color: var(--jkl-color-background-subtle);
  border: 1px solid var(--jkl-color-border-default);
  color: var(--jkl-color-content-default);
}

.mitt-kort__etikett {
  color: var(--jkl-color-content-subtle);
  font-size: var(--jkl-font-size-small);
}

.mitt-kort--markert {
  border-color: var(--jkl-color-border-focused);
  background-color: var(--jkl-color-background-default);
}`} />
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <Flex gap="xs" wrap="wrap">
        <Tag>Farger</Tag>
        <Tag>Design tokens</Tag>
        <Tag>Mørk modus</Tag>
        <Tag>WCAG</Tag>
        <Tag>Tema</Tag>
      </Flex>
    </>
  ),
  date: "2024-01-22",
  category: "Foundational",
  type: "foundational",
  author: "Jøkul-teamet",
  tags: ["farger", "design-tokens", "tema", "mørk-modus", "tilgjengelighet"],
  resources: [
    {
      title: "Jøkul Farger — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Oversikt over alle fargetokens og temaer",
    },
    {
      title: "WebAIM Contrast Checker",
      url: "https://webaim.org/resources/contrastchecker/",
      description: "Verktøy for å sjekke kontrastforhold mellom fargepar",
    },
    {
      title: "WCAG 2.1 — Contrast (Minimum) 1.4.3",
      url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
      description: "Offisielt krav til fargekontrast for tekst",
    },
  ],
};

export default post;
