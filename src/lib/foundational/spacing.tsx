import React from "react";
import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/components/CodeBlock";
import type { BlogPost } from "../blog/types";

const post: BlogPost = {
  id: 12,
  title: "Spacing og layout i Jøkul",
  excerpt:
    "Komplett referanse til Jøkuls spacing-skala, CSS-variabler, Flex- og Grid-komponenter, og best practice for gap, margin og padding.",
  content: (
    <>
      <p>
        Konsistent spacing er det som gjør et grensesnitt rolig og lesbart. Jøkul definerer en
        navngitt spacing-skala basert på en 8-punkts grid, eksponert som CSS-variabler og som
        props på layout-komponentene <code>Flex</code>.
      </p>

      <Message variant="info">
        Bruk alltid Jøkuls spacing-variabler i stedet for hardkodede pixelverdier. Dette gjør
        det enklere å skalere og justere layouten globalt.
      </Message>

      <h2>Spacing-skalaen</h2>
      <p>
        Jøkul bruker navngitte spacing-trinn fra <strong>3xs</strong> til <strong>3xl</strong>.
        Navngivingen gjør det intuitivt å velge riktig størrelse uten å huske pikselsverdier:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-spacing-3xs</code> — 2px</DescriptionTerm>
        <DescriptionDetail>
          Mikroavstand. Brukes for å skille svært nært relaterte elementer, som ikon og etikett
          side om side.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-2xs</code> — 4px</DescriptionTerm>
        <DescriptionDetail>
          Svært liten avstand. Intern padding i kompakte komponenter som Tags og Badges.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-xs</code> — 8px</DescriptionTerm>
        <DescriptionDetail>
          Liten avstand. Gap mellom elementer i tett gruppert innhold, f.eks. radio-knapper
          i en liste.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-s</code> — 12px</DescriptionTerm>
        <DescriptionDetail>
          Halvmiddels avstand. Padding inne i kompakte komponenter som knapper og
          skjemafelter.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-m</code> — 16px</DescriptionTerm>
        <DescriptionDetail>
          Standardavstand. Basislinje for de fleste komponenter — padding, gap og margin
          mellom relaterte seksjoner. Tilsvarer 1rem.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-l</code> — 24px</DescriptionTerm>
        <DescriptionDetail>
          Stor avstand. Brukes mellom kortene i en kortliste, mellom skjemafelt-grupper og
          under overskrifter.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-xl</code> — 32px</DescriptionTerm>
        <DescriptionDetail>
          Svært stor avstand. Mellom semantiske seksjoner på en side, f.eks. mellom
          «Kontaktinformasjon» og «Betalingsdetaljer» i et skjema.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-2xl</code> — 48px</DescriptionTerm>
        <DescriptionDetail>
          Ekstra stor avstand. Mellom tematisk atskilte deler av en side, f.eks. mellom
          hero-seksjon og innholdsseksjon.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-spacing-3xl</code> — 64px</DescriptionTerm>
        <DescriptionDetail>
          Maksimalavstand. Mellom store layoutblokker, sidehoder og sidefot.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Når skal du bruke gap, margin eller padding?</h2>
      <p>
        En vanlig kilde til inkonsistens er å blande <code>margin</code>, <code>padding</code>{" "}
        og <code>gap</code> uten et tydelig system. Her er tommelfingerreglene i Jøkul:
      </p>
      <DescriptionList>
        <DescriptionTerm>gap</DescriptionTerm>
        <DescriptionDetail>
          Avstand <em>mellom</em> søsken-elementer i en Flex- eller Grid-container. Foretrekk
          alltid <code>gap</code> fremfor margin når du har kontroll over containeren.
          Eksempel: avstand mellom knapper i en knapperad, mellom kort i en kortliste.
        </DescriptionDetail>

        <DescriptionTerm>padding</DescriptionTerm>
        <DescriptionDetail>
          Avstand <em>inne</em> i en komponent eller beholder, mellom kanten og innholdet.
          Eksempel: innvendig luft i et kort, padding rundt teksten i en knapp.
        </DescriptionDetail>

        <DescriptionTerm>margin</DescriptionTerm>
        <DescriptionDetail>
          Avstand <em>utenfor</em> en komponent, mellom komponenten og omgivelsene. Bruk
          margin når du ikke kontrollerer containeren — f.eks. for å dytte en overskrift
          ned fra toppen av siden. Unngå margin-collapse-problemer ved å foretrekke{" "}
          <code>gap</code> i alle flex-/grid-kontekster.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Flex-komponenten</h2>
      <p>
        Jøkul tilbyr en <code>Flex</code>-komponent som er en tynn wrapper rundt CSS Flexbox
        med innebygd støtte for spacing-tokens via <code>gap</code>-propen:
      </p>
      <CodeBlock code={`import { Flex } from "@fremtind/jokul/flex";

// Horisontal rad med medium gap
<Flex gap="m" align="center">
  <Icon name="check" />
  <span>Betaling godkjent</span>
</Flex>

// Vertikal kolonne med stor gap
<Flex direction="column" gap="l">
  <SkjemaFelt label="Navn" />
  <SkjemaFelt label="E-post" />
  <SkjemaFelt label="Telefon" />
</Flex>

// Wrap med liten gap (f.eks. tags)
<Flex gap="xs" wrap="wrap">
  <Tag>React</Tag>
  <Tag>TypeScript</Tag>
  <Tag>Jøkul</Tag>
</Flex>`} />

      <h2>Tilgjengelige props på Flex</h2>
      <DescriptionList>
        <DescriptionTerm><code>gap</code></DescriptionTerm>
        <DescriptionDetail>
          Avstand mellom barn-elementer. Tar alle spacing-tokens: «3xs» | «2xs» | «xs» | «s»
          | «m» | «l» | «xl» | «2xl» | «3xl».
        </DescriptionDetail>

        <DescriptionTerm><code>direction</code></DescriptionTerm>
        <DescriptionDetail>
          «row» (standard) eller «column». Setter{" "}
          <code>flex-direction</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>align</code></DescriptionTerm>
        <DescriptionDetail>
          Kryssaksejustering (<code>align-items</code>): «start» | «center» | «end» |
          «stretch» | «baseline».
        </DescriptionDetail>

        <DescriptionTerm><code>justify</code></DescriptionTerm>
        <DescriptionDetail>
          Hovedaksejustering (<code>justify-content</code>): «start» | «center» | «end» |
          «space-between» | «space-around» | «space-evenly».
        </DescriptionDetail>

        <DescriptionTerm><code>wrap</code></DescriptionTerm>
        <DescriptionDetail>
          «wrap» | «nowrap» | «wrap-reverse». Setter <code>flex-wrap</code>.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Responsiv spacing</h2>
      <p>
        Spacing-tokenene er faste verdier (ikke responsive), men du kan justere dem med
        media queries:
      </p>
      <CodeBlock code={`.min-seksjon {
  padding: var(--jkl-spacing-l);
}

@media (max-width: 768px) {
  .min-seksjon {
    padding: var(--jkl-spacing-m);
  }
}`} />
      <p>
        For Flex-komponenten kan du bruke standard breakpoint-klasser eller betinget rendering
        via React:
      </p>
      <CodeBlock code={`const isMobile = useMediaQuery("(max-width: 768px)");

<Flex
  direction={isMobile ? "column" : "row"}
  gap={isMobile ? "m" : "l"}
>
  ...
</Flex>`} />

      <h2>Spacing i praksis — eksempler</h2>
      <UnorderedList>
        <ListItem>
          <strong>Mellom skjemafelt:</strong> <code>gap="l"</code> (24px) mellom hvert
          inndatafelt i en vertikal liste.
        </ListItem>
        <ListItem>
          <strong>Mellom knapper i en rad:</strong> <code>gap="s"</code> (12px) — nok luft
          uten at knappene virker urelaterte.
        </ListItem>
        <ListItem>
          <strong>Innvendig padding i kort:</strong> <code>padding: var(--jkl-spacing-l)</code>{" "}
          (24px) gir kortet pusterom uten å bli for luftig.
        </ListItem>
        <ListItem>
          <strong>Mellom sidehode og innhold:</strong>{" "}
          <code>margin-bottom: var(--jkl-spacing-2xl)</code> (48px) gir tydelig visuelt
          skille.
        </ListItem>
        <ListItem>
          <strong>Ikon ved siden av tekst:</strong> <code>gap="3xs"</code> (2px) eller{" "}
          <code>gap="2xs"</code> (4px) — ikonet skal oppleves som del av teksten.
        </ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>8-punkts grid — grunnlaget for spacing-skalaen</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Jøkuls spacing-skala er basert på et <strong>8-punkts grid</strong>. Det vil si at
            alle verdier er multipler av 4px (med 2px som unntaket for de minste trinnene):
          </p>
          <DescriptionList>
            <DescriptionTerm>Fordeler med 8-punkts grid</DescriptionTerm>
            <DescriptionDetail>
              Visuelt harmoni mellom komponenter, enklere kommunikasjon med designere (alle
              jobber med de samme tallene), og god tilpasning til piksel-tette skjermer (2x,
              3x retina).
            </DescriptionDetail>
            <DescriptionTerm>Praktisk tommelfingerregel</DescriptionTerm>
            <DescriptionDetail>
              Hvert trinn opp i skalaen er omtrent 1,5× det forrige. Ikke en perfekt
              geometrisk progresjon, men en pragmatisk skala optimalisert for reelle UI-behov.
            </DescriptionDetail>
          </DescriptionList>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <Flex gap="xs" wrap="wrap">
        <Tag>Spacing</Tag>
        <Tag>Layout</Tag>
        <Tag>Flex</Tag>
        <Tag>CSS-variabler</Tag>
        <Tag>8-punkts grid</Tag>
      </Flex>
    </>
  ),
  date: "2024-01-29",
  category: "Foundational",
  type: "foundational",
  author: "Jøkul-teamet",
  tags: ["spacing", "layout", "flex", "css-variabler", "grid"],
  resources: [
    {
      title: "Jøkul Spacing — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Interaktiv oversikt over alle spacing-tokens og layout-komponenter",
    },
    {
      title: "The 8-Point Grid System",
      url: "https://spec.fm/specifics/8-pt-grid",
      description: "Introduksjon til 8-punkts grid-systemet som Jøkul bygger på",
    },
    {
      title: "MDN: CSS Flexible Box Layout",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
      description: "Komplett referanse til CSS Flexbox",
    },
  ],
};

export default post;
