import React from "react";
import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 5,
  title: "Typografi i Jøkul",
  excerpt: "God typografi er ryggraden i ethvert designsystem. Se hvordan Jøkul håndterer det.",
  content: (
    <>
      <p>
        Typografi er mer enn fonter og størrelse — det handler om rytme, lesbarhet og hierarki.
        Jøkul definerer et gjennomtenkt typografisystem som fungerer fra mobilskjermer til store
        desktop-flater, og fra skumlesing til dyptpløyende lesing av forsikringsvilkår.
      </p>

      <h2>Fremtind Grotesk</h2>
      <p>
        Jøkul bruker <strong>Fremtind Grotesk</strong> — en egenutviklet humanistisk sans-serif
        optimalisert for skjermbruk. Fonten er tegnet med ekstra høy x-høyde for bedre lesbarhet
        i små størrelser, og inkluderer OpenType-funksjoner som ligaturar, tabellnummer og
        stilistiske alternativer for visse tegn.
      </p>

      <Message variant="info">
        Fremtind Grotesk lastes automatisk inn når du importerer Jøkuls CSS. Du trenger ikke
        konfigurere fontlasting manuelt.
      </Message>

      <h2>Typografiskalaen</h2>
      <DescriptionList>
        <DescriptionTerm><code>jkl-title-large</code></DescriptionTerm>
        <DescriptionDetail>3rem (48px) — brukes til hero-overskrifter og store landingssider.</DescriptionDetail>
        <DescriptionTerm><code>jkl-title-medium</code></DescriptionTerm>
        <DescriptionDetail>2.25rem (36px) — primær sidetittel, brukes én gang per side.</DescriptionDetail>
        <DescriptionTerm><code>jkl-title-small</code></DescriptionTerm>
        <DescriptionDetail>1.75rem (28px) — seksjonsoverskrift, tilsvarer typisk h2.</DescriptionDetail>
        <DescriptionTerm><code>jkl-heading-large</code></DescriptionTerm>
        <DescriptionDetail>1.375rem (22px) — underoverskrift, h3-nivå.</DescriptionDetail>
        <DescriptionTerm><code>jkl-body</code></DescriptionTerm>
        <DescriptionDetail>1rem (16px) — standard brødtekst, optimal for lengre lesing.</DescriptionDetail>
        <DescriptionTerm><code>jkl-small</code></DescriptionTerm>
        <DescriptionDetail>0.875rem (14px) — hjelpetekst, labels og metadata.</DescriptionDetail>
      </DescriptionList>

      <h2>SCSS-miksiner</h2>
      <p>
        Jøkul eksponerer typografistilene som SCSS-miksiner. Bruk dem for å holde egne
        komponenter i samsvar med systemet:
      </p>
      <pre><code>{`@use "@fremtind/jokul/core" as jokul;

.min-komponent__tittel {
  @include jokul.jkl-title-small;
  margin-bottom: jokul.jkl-spacing(s);
}

.min-komponent__brødtekst {
  @include jokul.jkl-body;
  max-width: 66ch; /* optimal linjelengde */
}`}</code></pre>

      <h2>Responsiv typografi</h2>
      <p>
        For flytende typografi kan du bruke CSS <code>clamp()</code> med Jøkuls størrelser som
        ytterpunkter. Eksempel som skalerer fra body til heading mellom 320px og 1200px viewport:
      </p>
      <pre><code>{`font-size: clamp(1rem, 1rem + 1.5vw, 1.375rem);`}</code></pre>

      <h2>Linjelengde og lesbarhet</h2>
      <UnorderedList>
        <ListItem>Optimal linjelengde er <strong>45–75 tegn</strong> (ca. 50–80ch) for brødtekst.</ListItem>
        <ListItem>For tekst i smale kolonner (sidebarer, kort) kan 35–45 tegn fungere.</ListItem>
        <ListItem>Sett aldri <code>max-width</code> i <code>px</code> — bruk <code>ch</code>-enheter som følger fontstørrelsen.</ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Font-display og layout shift</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            <strong>Cumulative Layout Shift (CLS)</strong> er en viktig Core Web Vital. Fonter
            som lastes sent kan forårsake layout-forskyvning når de erstatter fallback-fonten.
            Jøkul løser dette med:
          </p>
          <DescriptionList>
            <DescriptionTerm><code>font-display: swap</code></DescriptionTerm>
            <DescriptionDetail>Brødtekst vises umiddelbart med fallback-font, deretter byttes til Fremtind Grotesk. Liten CLS-risiko.</DescriptionDetail>
            <DescriptionTerm><code>font-display: optional</code></DescriptionTerm>
            <DescriptionDetail>Fonten brukes kun hvis den er tilgjengelig innen en svært kort blokkperiode. Null CLS, men fonten vises kanskje ikke ved treg tilkobling.</DescriptionDetail>
          </DescriptionList>
          <p>
            I tillegg bruker Jøkul <code>size-adjust</code> og <code>ascent-override</code>
            {" "}på fallback-fonten for å minimere det visuelle hoppet ved fontbytte.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>
    </>
  ),
  date: "2026-03-08",
  category: "Design",
  author: "Ola Nordmann",
  tags: ["typografi", "font", "scss", "responsiv", "design"],
  resources: [
    {
      title: "Fremtind Grotesk på GitHub",
      url: "https://github.com/fremtind/jokul",
      description: "Kildekoden til Jøkul, inkludert font-filer",
    },
    {
      title: "Modular Scale",
      url: "https://www.modularscale.com/",
      description: "Verktøy for å generere harmoniske typografiskalaer",
    },
    {
      title: "Web Fonts & Performance (CSS-Tricks)",
      url: "https://css-tricks.com/almanac/properties/f/font-display/",
      description: "Dyptgående gjennomgang av font-display-strategier",
    },
  ],
};

export default post;
