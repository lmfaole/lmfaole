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
        En kollega viste meg en gang en skjerm der vi hadde fire ulike skriftstørrelser for
        "brødtekst" i fire ulike deler av applikasjonen. Alle var rundt 16px, men ingen var
        eksakt like. Det hadde skjedd gradvis — én liten override her, en annen der. Ingen hadde
        lagt merke til det, men alle <em>kjente</em> at noe var galt. Det er det typografi gjør når
        det svikter: det undergraver tillit uten at du kan peke på nøyaktig hvorfor.
      </p>

      <h2>Fremtind Grotesk — og hvorfor vi laget vår egen font</h2>
      <p>
        Jøkul bruker <strong>Fremtind Grotesk</strong>, en egenutviklet humanistisk sans-serif.
        Beslutningen om å lage en egenutviklet font var ikke tatt lett — det er dyrt og tidkrevende.
        Men ingen off-the-shelf-font hadde den kombinasjonen vi trengte: høy x-høyde for lesbarhet
        i små størrelser, norske spesialtegn i perfekt form, og en tone som sier "norsk
        forsikringsselskap" uten å se kjedelig ut.
      </p>

      <Message variant="info">
        Fremtind Grotesk lastes automatisk når du importerer Jøkuls CSS. Ingen manuell fontlasting
        nødvendig.
      </Message>

      <h2>Typografiskalaen — seks nivåer som faktisk brukes</h2>
      <p>
        Vi startet med ni skriftstørrelser. Etter et halvt år hadde vi innsett at folk brukte
        tre av dem 90% av tiden. Skalaen er nå seks nivåer, og hvert nivå har et klart formål:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>jkl-title-large</code> — 3rem</DescriptionTerm>
        <DescriptionDetail>Hero-overskrifter. Brukes maksimalt én gang per side, og bare på landingssider.</DescriptionDetail>
        <DescriptionTerm><code>jkl-title-medium</code> — 2.25rem</DescriptionTerm>
        <DescriptionDetail>Primær sidetittel. Én per side. Ikke to.</DescriptionDetail>
        <DescriptionTerm><code>jkl-title-small</code> — 1.75rem</DescriptionTerm>
        <DescriptionDetail>Seksjonsoverskrift, tilsvarer h2. Det du bruker mest.</DescriptionDetail>
        <DescriptionTerm><code>jkl-heading-large</code> — 1.375rem</DescriptionTerm>
        <DescriptionDetail>Underoverskrift, h3-nivå.</DescriptionDetail>
        <DescriptionTerm><code>jkl-body</code> — 1rem</DescriptionTerm>
        <DescriptionDetail>Standard brødtekst. 16px. Gjør ikke denne lavere.</DescriptionDetail>
        <DescriptionTerm><code>jkl-small</code> — 0.875rem</DescriptionTerm>
        <DescriptionDetail>Hjelpetekst og metadata. Ikke bruk den til avsnitt — det er for lite.</DescriptionDetail>
      </DescriptionList>

      <h2>SCSS-miksiner i stedet for CSS-klasser</h2>
      <p>
        Jøkul eksponerer typografistilene som SCSS-miksiner, ikke bare ferdige CSS-klasser. Det
        betyr at du kan inkludere riktig typografi i dine egne komponenter uten å legge til
        ekstra HTML-wrapper-elementer:
      </p>
      <pre><code>{`@use "@fremtind/jokul/core" as jokul;

.min-komponent__tittel {
  @include jokul.jkl-title-small;
}

.min-komponent__brødtekst {
  @include jokul.jkl-body;
  max-width: 66ch;
}`}</code></pre>

      <h2>Linjelengde — den regelen de fleste ignorerer</h2>
      <UnorderedList>
        <ListItem>Optimal linjelengde er <strong>45–75 tegn</strong> for brødtekst. Mer enn det, og øyet mister tråden.</ListItem>
        <ListItem>Bruk <code>ch</code>-enheter, ikke <code>px</code> — de skalerer med fontstørrelsen.</ListItem>
        <ListItem>I smale kolonner kan 35–45 tegn fungere, men test alltid med ekte innhold.</ListItem>
      </UnorderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>CLS og font-display — det vi lærte av en dårlig Lighthouse-score</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Vi hadde en periode der Lighthouse-scoren vår falt dramatisk på CLS. Årsaken var at
            Fremtind Grotesk lastet sent og forskjøv hele layouten. Løsningen var å tune
            font-display-strategien:
          </p>
          <DescriptionList>
            <DescriptionTerm><code>font-display: swap</code></DescriptionTerm>
            <DescriptionDetail>Brødtekst vises umiddelbart med fallback-font, deretter byttes til Fremtind Grotesk. Liten CLS-risiko.</DescriptionDetail>
            <DescriptionTerm><code>font-display: optional</code></DescriptionTerm>
            <DescriptionDetail>Null CLS, men fonten vises kanskje ikke ved treg tilkobling. Vi bruker dette for overskrifter over fold.</DescriptionDetail>
          </DescriptionList>
          <p>
            I tillegg la vi til <code>size-adjust</code> og <code>ascent-override</code> på
            fallback-fonten for å minimere det visuelle hoppet. CLS-scoren gikk fra 0.18 til 0.02.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Typografi er det usynlige arbeidet. Når det er gjort riktig, legger ingen merke til det.
        Når det er galt, vet alle at noe er skjevt — selv om ingen kan sette ord på det.
        Jøkul gjør jobben for deg, men du må respektere systemet og la det gjøre det.
      </p>
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
