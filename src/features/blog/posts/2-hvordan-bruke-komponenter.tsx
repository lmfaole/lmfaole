import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/shared/components/CodeBlock";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 2,
  title: "Hvordan bruke komponenter",
  excerpt: "Lær hvordan du kan utnytte de kraftige komponentene i Jøkul for å bygge raske nettsider.",
  content: (
    <>
      <p>
        Den første gangen jeg integrerte Jøkul i et eksisterende Next.js-prosjekt, tok det meg
        femten minutter å ha en fungerende knapp på skjermen. Hadde det gått galt? Nei — det er
        bare slik det er ment å fungere. Men det tok meg en uke til å forstå <em>hvorfor</em> det
        fungerer slik, og det er den historien jeg vil dele her.
      </p>

      <Message variant="success">
        Alle Jøkul-komponenter er fullt typede og støtter treeshaking. Du betaler bare for det du faktisk importerer.
      </Message>

      <h2>Pakkestruktur som faktisk gir mening</h2>
      <p>
        I stedet for én stor monolitt-pakke lever hver Jøkul-komponent i sin egen subpath-eksport.
        Det betyr at du aldri trekker inn knappekode når du bare trenger en tekstinndata. I praksis
        ser en importlinje slik ut:
      </p>
      <CodeBlock code={'import { Button } from "@fremtind/jokul/button";'} />
      <p>
        Enkelt, forutsigbart og lett å grep etter i kodebasen. Ingen magiske re-eksporter som gjemmer
        seg bak et barrel-fil-labyrint.
      </p>

      <h2>De komponentene jeg bruker mest</h2>
      <DescriptionList>
        <DescriptionTerm><code>TextInput</code></DescriptionTerm>
        <DescriptionDetail>Label, hjelpetekst, feilmelding og ARIA-kobling er innebygd. Slutter aldri å sette pris på det.</DescriptionDetail>
        <DescriptionTerm><code>Message</code></DescriptionTerm>
        <DescriptionDetail>Rask feedback til brukeren — info, success, warning og error. Leser-tilgjengelighet via role="alert" ut av boksen.</DescriptionDetail>
        <DescriptionTerm><code>ExpandablePanel</code></DescriptionTerm>
        <DescriptionDetail>Compound-komponent med Header og Content. Aria-attributter og fokushåndtering? Allerede på plass.</DescriptionDetail>
        <DescriptionTerm><code>Select</code></DescriptionTerm>
        <DescriptionDetail>Stilet nedtrekksliste med samme API som TextInput. Ikke mer ad-hoc CSS-overrides på native select.</DescriptionDetail>
      </DescriptionList>

      <h2>Mørk modus uten ekstra kode</h2>
      <p>
        Det som virkelig imponerte meg da jeg testet Jøkul for første gang: alle komponentene
        håndterer mørk modus automatisk via CSS Custom Properties. Du setter
        {" "}<code>{'data-theme="dark"'}</code> på rot-elementet, og hele grensesnittet skifter.
        Ingen <code>styled-components</code>-temaer, ingen context-providers, ingen ekstra bunter.
      </p>
      <p>
        Vil du speile operativsystemets preferanse? En liten JavaScript-snippet ved oppstart er alt
        som trengs. Vi løste det med en <code>useEffect</code> i <code>_app.tsx</code> som sjekker
        <code> prefers-color-scheme</code> og setter attributtet.
      </p>

      <ExpandablePanel>
        <ExpandablePanel.Header>Fallgruven jeg gikk i: CSS-import-rekkefølge</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Én ting tok meg lang tid å skjønne: du <em>må</em> importere <code>core.css</code> før
            komponent-CSS-ene. Gjør du det feil, kan tokens mangle og komponenter se helt feil ut.
            Dette er ikke dokumentert like tydelig som det burde være.
          </p>
          <p>
            Løsningen er enkel — importer én gang i rot-filen din:
          </p>
          <CodeBlock code={`// app/layout.tsx eller pages/_app.tsx
import "@fremtind/jokul/core.css";
// komponent-CSS kan importeres der de brukes`} />
          <p>
            Etter at vi la dette inn i code review-sjekklisten vår, forsvant hele kategorien av
            "rare styling-bugs" fra backloggen.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>TypeScript-integrasjonen er faktisk god</h2>
      <p>
        Jeg er vanligvis skeptisk til løfter om "fullt TypeScript-støtte", men Jøkul leverer.
        Autofullføring på prop-navn, union-typer på varianter som <code>variant="info" | "warning"</code>,
        og feilmeldinger som faktisk forteller deg hva som er galt. Generelle HTML-attributter som
        <code> className</code>, <code>id</code> og <code>data-*</code> videresendes alltid til
        roten — ingen surprises.
      </p>

      <Flex gap="xs" wrap="wrap">
        <Tag variant="info">React 18+</Tag>
        <Tag variant="info">TypeScript 5+</Tag>
        <Tag variant="success">WCAG 2.2 AA</Tag>
        <Tag variant="success">Mørk modus</Tag>
        <Tag>Treeshaking</Tag>
      </Flex>

      <p>
        Rådet mitt er enkelt: start med én komponent, les API-typen, og stol på at resten følger
        samme mønster. Det gjør det.
      </p>
    </>
  ),
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
