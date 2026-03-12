import React from "react";
import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Link } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";

export interface Resource {
  title: string;
  url: string;
  description?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: React.ReactNode;
  date: string;
  category: string;
  author: string;
  tags: string[];
  resources?: Resource[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Velkommen til Jøkul",
    excerpt: "Dette er det første innlegget på vår nye blogg bygget med Jøkul designsystem.",
    content: (
      <>
        <p>
          Jøkul er designsystemet til Fremtind — skapt for å gi konsistente, tilgjengelige og
          gjenkjennbare brukeropplevelser på tvers av alle digitale produkter. Enten du bygger en
          skademelding, en sparekalkulator eller en onboarding-flyt, gir Jøkul deg ferdigbygde
          byggeklosser og klare retningslinjer.
        </p>

        <Message variant="info">
          Jøkul er åpen kildekode og utvikles aktivt på{" "}
          <Link href="https://github.com/fremtind/jokul" external>GitHub</Link>.
          Alle bidrag og tilbakemeldinger er hjertelig velkomne!
        </Message>

        <h2>Atomic Design — systemets fundament</h2>
        <p>
          Jøkul er strukturert etter <strong>Atomic Design</strong>-metodologien til Brad Frost.
          Prinsippet er at komplekse grensesnitt bygges opp av stadig større enheter:
        </p>
        <DescriptionList>
          <DescriptionTerm>Atomer</DescriptionTerm>
          <DescriptionDetail>Minste byggekloss: knapper, inndatafelter, ikoner og typografielementer.</DescriptionDetail>
          <DescriptionTerm>Molekyler</DescriptionTerm>
          <DescriptionDetail>Kombinasjoner av atomer med én klar funksjon, f.eks. et søkefelt med label og knapp.</DescriptionDetail>
          <DescriptionTerm>Organismer</DescriptionTerm>
          <DescriptionDetail>Komplekse seksjoner sammensatt av molekyler, f.eks. navigasjonsbar eller skjemagruppe.</DescriptionDetail>
          <DescriptionTerm>Maler</DescriptionTerm>
          <DescriptionDetail>Sidestruktur uten reelt innhold — wireframe med organismer på plass.</DescriptionDetail>
          <DescriptionTerm>Sider</DescriptionTerm>
          <DescriptionDetail>Den ferdige siden med ekte innhold, klar for brukertesting og produksjon.</DescriptionDetail>
        </DescriptionList>

        <h2>Kom i gang</h2>
        <p>Installasjon av Jøkul i et eksisterende prosjekt gjøres i tre steg:</p>
        <OrderedList>
          <ListItem>Installer kjernepakken: <code>{'npm install @fremtind/jokul'}</code></ListItem>
          <ListItem>Importer global CSS i rot-filen din: <code>{'import "@fremtind/jokul/core.css"'}</code></ListItem>
          <ListItem>Installer individuelle komponentpakker etter behov, f.eks. <code>{'npm install @fremtind/jokul/button'}</code></ListItem>
        </OrderedList>

        <h2>Hva er inkludert i Jøkul?</h2>
        <UnorderedList>
          <ListItem><strong>Designtokens</strong> — CSS-variabler for farger, spacing, typografi og radiuser</ListItem>
          <ListItem><strong>Fremtind Grotesk</strong> — en skreddersydd webfont optimalisert for lesbarhet</ListItem>
          <ListItem><strong>React-komponenter</strong> — over 50 ferdigbygde, tilgjengelige komponenter</ListItem>
          <ListItem><strong>Ikonsett</strong> — basert på Material Symbols med Fremtind-tilpasninger</ListItem>
          <ListItem><strong>Mørk modus</strong> — fullt støttet via data-theme-attributt uten ekstra kode</ListItem>
          <ListItem><strong>Illustrasjoner og assets</strong> — egne visuelle ressurser til Fremtind-merkevaren</ListItem>
        </UnorderedList>

        <h2>Teknologistakk</h2>
        <Flex gap="xs" wrap="wrap">
          <Tag>React</Tag>
          <Tag>TypeScript</Tag>
          <Tag>SCSS</Tag>
          <Tag>CSS Custom Properties</Tag>
          <Tag>Storybook</Tag>
          <Tag>Vitest</Tag>
        </Flex>

        <ExpandablePanel>
          <ExpandablePanel.Header>Historien bak Jøkul</ExpandablePanel.Header>
          <ExpandablePanel.Content>
            <p>
              Jøkul ble til da Fremtind ble stiftet i 2019 som et joint venture mellom SpareBank 1 og
              DNB Forsikring. Med to selskaper og mange produktteam var det kritisk å etablere et felles
              visuelt språk raskt. Designsystemet ble navngitt etter en type norsk isbre — solid, varig
              og formet over tid.
            </p>
            <p>
              Siden oppstarten har Jøkul vokst fra et internt verktøy til et fullt åpen kildekode-prosjekt
              med aktiv ekstern bruk. Komponentbiblioteket oppdateres kontinuerlig basert på tilbakemeldinger
              fra produktteam og bidrag fra samfunnet.
            </p>
          </ExpandablePanel.Content>
        </ExpandablePanel>

        <h2>Jøkul vs. generiske biblioteker</h2>
        <p>
          Hvorfor bruke Jøkul fremfor Material UI, Chakra eller Ant Design? Det enkle svaret er
          <em>merkevare og kontekst</em>. Generiske biblioteker er designet for å være nøytrale, mens
          Jøkul er håndskreddersy til Fremtinds visuelle identitet, tone-of-voice og typiske
          brukerscenarioer innen forsikring og sparing. Det betyr færre overstyrte stiler, kortere
          designreview og mer konsistente produkter.
        </p>
      </>
    ),
    date: "2026-03-12",
    category: "Design",
    author: "Ola Nordmann",
    tags: ["designsystem", "jøkul", "fremtind", "open source"],
    resources: [
      {
        title: "Jøkul dokumentasjon",
        url: "https://jokul.fremtind.no/",
        description: "Offisiell dokumentasjon for Jøkul designsystem",
      },
      {
        title: "Jøkul på GitHub",
        url: "https://github.com/fremtind/jokul",
        description: "Kildekode og bidragsveiledning",
      },
      {
        title: "Atomic Design av Brad Frost",
        url: "https://atomicdesign.bradfrost.com/",
        description: "Boken som introduserte Atomic Design-metodologien",
      },
    ],
  },
  {
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
  },
  {
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
  },
  {
    id: 4,
    title: "Tilgjengelighet er ikke valgfritt",
    excerpt: "Universell utforming er et lovkrav i Norge — her er hvordan Jøkul hjelper deg å etterleve det.",
    content: (
      <>
        <p>
          I Norge er universell utforming av IKT-løsninger lovpålagt gjennom{" "}
          <strong>likestillings- og diskrimineringsloven</strong> og forskrift om universell
          utforming av IKT. Fra 2025 gjelder også <em>European Accessibility Act</em> for private
          virksomheter som tilbyr produkter og tjenester i EU/EØS.
        </p>

        <Message variant="warning">
          Manglende etterlevelse av tilgjengelighetskrav kan medføre pålegg og bøter fra
          Tilsynet for universell utforming av IKT (Uutilsynet).
        </Message>

        <h2>WCAG-nivåene forklart</h2>
        <DescriptionList>
          <DescriptionTerm>Nivå A</DescriptionTerm>
          <DescriptionDetail>Minimumsgrensen. Uten disse kravene er løsningen ubrukelig for mange brukere. Eksempel: bilder har tekstalternativ.</DescriptionDetail>
          <DescriptionTerm>Nivå AA</DescriptionTerm>
          <DescriptionDetail>Lovkravet i Norge og EU. Inkluderer krav til kontrastratio (4.5:1 for tekst), fokussynlighet og feilmeldinger.</DescriptionDetail>
          <DescriptionTerm>Nivå AAA</DescriptionTerm>
          <DescriptionDetail>Høyeste nivå. Ikke lovpålagt, men anbefales for innhold rettet mot brukere med kognitive funksjonsnedsettelser.</DescriptionDetail>
        </DescriptionList>

        <h2>Skjermlesere du bør teste med</h2>
        <UnorderedList>
          <ListItem><strong>NVDA</strong> — gratis, Windows, brukes sammen med Chrome og Firefox</ListItem>
          <ListItem><strong>JAWS</strong> — markedsleder på Windows, mye brukt i bedriftsmarkedet</ListItem>
          <ListItem><strong>VoiceOver</strong> — innebygd i macOS og iOS, test med Safari</ListItem>
          <ListItem><strong>TalkBack</strong> — innebygd i Android, test med Chrome Mobile</ListItem>
          <ListItem><strong>Narrator</strong> — innebygd i Windows, test med Edge</ListItem>
        </UnorderedList>

        <h2>ARIA-roller og egenskaper</h2>
        <DescriptionList>
          <DescriptionTerm><code>role="alert"</code></DescriptionTerm>
          <DescriptionDetail>Kunngjør dynamisk innhold for skjermlesere uten at fokus flyttes. Brukes i Jøkuls Message-komponent.</DescriptionDetail>
          <DescriptionTerm><code>aria-expanded</code></DescriptionTerm>
          <DescriptionDetail>Kommuniserer om en knapp kontrollerer en kollapset/utvidet region. Håndteres automatisk i ExpandablePanel.</DescriptionDetail>
          <DescriptionTerm><code>aria-describedby</code></DescriptionTerm>
          <DescriptionDetail>Kobler et inputfelt til hjelpetekst eller feilmelding. Jøkuls skjemakomponenter setter dette automatisk.</DescriptionDetail>
          <DescriptionTerm><code>aria-live</code></DescriptionTerm>
          <DescriptionDetail>Angir at en region oppdateres dynamisk. Verdiene polite og assertive styrer kunngjøringstiming.</DescriptionDetail>
        </DescriptionList>

        <h2>Tastaturnavigasjon</h2>
        <OrderedList>
          <ListItem>Alle interaktive elementer må nås med <code>Tab</code>-tasten i logisk rekkefølge.</ListItem>
          <ListItem>Modaler og dialoger må fange fokus og returnere det til utløsende element ved lukking.</ListItem>
          <ListItem>Dropdown-menyer og trestrukturer bruker piltaster for intern navigasjon (<em>roving tabindex</em>).</ListItem>
          <ListItem>Escape-tasten skal alltid lukke midlertidige UI-elementer som tooltips og modaler.</ListItem>
          <ListItem>Fokusindikatoren må aldri fjernes med <code>outline: none</code> uten å erstattes med synlig alternativ.</ListItem>
        </OrderedList>

        <h2>Jøkuls innebygde tilgjengelighet</h2>
        <Flex gap="xs" wrap="wrap">
          <Tag variant="success">ARIA-attributter</Tag>
          <Tag variant="success">Fokushåndtering</Tag>
          <Tag variant="success">Fargekontrast AA</Tag>
          <Tag variant="success">Skjermleser-testet</Tag>
          <Tag variant="info">Tastaturnavigasjon</Tag>
        </Flex>

        <ExpandablePanel>
          <ExpandablePanel.Header>Hva MÅ du håndtere selv?</ExpandablePanel.Header>
          <ExpandablePanel.Content>
            <p>
              Jøkul-komponenter er tilgjengelige isolert sett, men du som utvikler er ansvarlig for
              sammensetningen. Disse mønstrene krever ekstra oppmerksomhet:
            </p>
            <UnorderedList>
              <ListItem>Rekkefølge i DOM-en bør matche visuell rekkefølge — unngå å bruke CSS order for å endre sekvens.</ListItem>
              <ListItem>Bilder og ikoner uten tekst trenger alltid <code>alt</code>-tekst eller <code>aria-label</code>.</ListItem>
              <ListItem>Dynamiske oppdateringer (f.eks. søkeresultater) bør kunngjøres via <code>aria-live</code>-region.</ListItem>
              <ListItem>Unngå å spre relatert innhold slik at det blir ikke-sammenhengende for skjermleserbrukere.</ListItem>
            </UnorderedList>
            <p>
              Bruk <strong>jest-axe</strong> i testsuiten din for å fange opp ARIA-feil automatisk
              i CI/CD-pipelinen.
            </p>
          </ExpandablePanel.Content>
        </ExpandablePanel>
      </>
    ),
    date: "2026-03-09",
    category: "Tilgjengelighet",
    author: "Ingrid Berg",
    tags: ["wcag", "uu", "tilgjengelighet", "aria", "lovkrav"],
    resources: [
      {
        title: "WCAG 2.1 på norsk (Difi)",
        url: "https://www.uutilsynet.no/wcag-standarden/wcag-standarden/86",
        description: "Norsk oversettelse og veiledning til WCAG-standarden",
      },
      {
        title: "axe DevTools",
        url: "https://www.deque.com/axe/",
        description: "Automatisert tilgjengelighetstest for nettlesere og CI",
      },
      {
        title: "WAI-ARIA Authoring Practices",
        url: "https://www.w3.org/WAI/ARIA/apg/",
        description: "Offisielle mønstre for ARIA-implementasjoner",
      },
      {
        title: "European Accessibility Act",
        url: "https://ec.europa.eu/social/main.jsp?catId=1202",
        description: "EUs tilgjengelighetsdirektiv som gjelder fra 2025",
      },
    ],
  },
  {
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
  },
  {
    id: 6,
    title: "Fargesystemet i Jøkul",
    excerpt: "Hvordan Jøkul bruker semantiske fargetokens for å sikre konsistens og tilgjengelighet på tvers av temaer.",
    content: (
      <>
        <p>
          Et robust fargesystem er fundamentet for et skalerbart designsystem. Jøkul skiller
          tydelig mellom <strong>primitive fargetokens</strong> (råverdier) og
          <strong> semantiske fargetokens</strong> (meningsfulle variabler). Dette gjør det mulig
          å bytte tema uten å endre én eneste komponent.
        </p>

        <h2>Primitive vs. semantiske tokens</h2>
        <p>
          Primitive tokens er de rå fargene i paletten — de har navn som{" "}
          <code>--jkl-color-granitt-20</code> eller <code>--jkl-color-stein-60</code>. Semantiske
          tokens refererer til disse og legger til kontekst og intensjon.
        </p>

        <h2>De semantiske lagene</h2>
        <DescriptionList>
          <DescriptionTerm>Bakgrunnsfarger</DescriptionTerm>
          <DescriptionDetail>
            <code>--jkl-color-background-default</code> — sidens grunnfarge. Byttes mellom lys og mørk
            ved temaendring uten å berøre komponentkode.
          </DescriptionDetail>
          <DescriptionTerm>Tekstfarger</DescriptionTerm>
          <DescriptionDetail>
            <code>--jkl-color-text-default</code>, <code>--jkl-color-text-subdued</code> og
            <code>--jkl-color-text-on-action</code> — tre nivåer for teksthierarki.
          </DescriptionDetail>
          <DescriptionTerm>Interaktive farger</DescriptionTerm>
          <DescriptionDetail>
            <code>--jkl-color-interactive-default</code> og <code>--jkl-color-interactive-hover</code>
            {" "}— brukes på knapper og lenker. Garantert 4.5:1 kontrast mot bakgrunn i begge temaer.
          </DescriptionDetail>
          <DescriptionTerm>Kantlinjefarger</DescriptionTerm>
          <DescriptionDetail>
            <code>--jkl-color-border-default</code> og <code>--jkl-color-border-focus</code>
            {" "}— tydelig visuell separasjon og fokusindikator.
          </DescriptionDetail>
          <DescriptionTerm>Fokusfarger</DescriptionTerm>
          <DescriptionDetail>
            <code>--jkl-color-focus-ring</code> — kontrastrik fokusring som alltid er synlig, uavhengig av tema.
          </DescriptionDetail>
        </DescriptionList>

        <h2>Tilstandsfarger</h2>
        <p>Disse fargene brukes for å kommunisere system- og inndatastatus:</p>
        <Flex gap="xs" wrap="wrap">
          <Tag variant="info">Info — nøytral blå</Tag>
          <Tag variant="success">Suksess — grønn</Tag>
          <Tag variant="warning">Advarsel — gul</Tag>
          <Tag variant="error">Feil — rød</Tag>
        </Flex>

        <Message variant="warning">
          Tilstandsfarger bør <strong>aldri</strong> brukes som dekorasjon. De har en semantisk
          betydning som brukere, inkludert de med fargeblindhet, stoler på. Kombiner alltid farge
          med ikon eller tekst for å formidle status.
        </Message>

        <h2>Mørk modus i praksis</h2>
        <p>
          For å aktivere mørk modus setter du <code>{'data-theme="dark"'}</code> på et foreldre
          element. Alle semantiske tokens bytter automatisk til mørke varianter:
        </p>
        <OrderedList>
          <ListItem>Bakgrunnsfarger inverteres fra lys til mørk grå</ListItem>
          <ListItem>Tekstfarger justeres for å bevare 4.5:1 kontrast</ListItem>
          <ListItem>Interaktive farger lysnes for bedre synlighet mot mørk bakgrunn</ListItem>
          <ListItem>Fokusringer justeres for å skille seg ut mot mørke overflater</ListItem>
        </OrderedList>

        <ExpandablePanel>
          <ExpandablePanel.Header>Kontrastkrav og WCAG</ExpandablePanel.Header>
          <ExpandablePanel.Content>
            <p>WCAG 2.2 definerer disse minimumskravene for kontrast:</p>
            <UnorderedList>
              <ListItem><strong>4.5:1</strong> — normal tekst (under 18pt / 14pt bold)</ListItem>
              <ListItem><strong>3:1</strong> — stor tekst (18pt+ / 14pt+ bold) og UI-komponenter</ListItem>
              <ListItem><strong>3:1</strong> — grafiske elementer og infografikk som formidler informasjon</ListItem>
            </UnorderedList>
            <p>
              Jøkuls fargepalette er designet slik at alle semantiske fargepar automatisk
              oppfyller AA-kravene. Du kan verifisere kontrasten med{" "}
              <Link href="https://webaim.org/resources/contrastchecker/" external>WebAIM Contrast Checker</Link>.
            </p>
          </ExpandablePanel.Content>
        </ExpandablePanel>
      </>
    ),
    date: "2026-03-07",
    category: "Design",
    author: "Kari Olsen",
    tags: ["farger", "tokens", "dark mode", "kontrast", "design"],
    resources: [
      {
        title: "Jøkul fargedokumentasjon",
        url: "https://jokul.fremtind.no/profil/farger",
        description: "Komplett fargepalette og retningslinjer",
      },
      {
        title: "WebAIM Contrast Checker",
        url: "https://webaim.org/resources/contrastchecker/",
        description: "Verktøy for å sjekke fargekontrast mot WCAG",
      },
      {
        title: "Reasonable Colors",
        url: "https://reasonable.work/colors/",
        description: "Et system for å lage tilgjengelige fargepaletter",
      },
    ],
  },
  {
    id: 7,
    title: "Ikoner i Jøkul",
    excerpt: "Jøkul leveres med et komplett ikonsett basert på Material Symbols. Lær hvordan du bruker dem riktig.",
    content: (
      <>
        <p>
          Ikoner er et kraftig kommunikasjonsverktøy, men de stiller krav til konsistens,
          skalerbarhet og tilgjengelighet. Jøkul bruker <strong>Material Symbols</strong> fra
          Google som fundament, tilpasset Fremtinds visuelle identitet med spesifikke standardverdier
          for vekt, optisk størrelse og fylling.
        </p>

        <h2>Installasjon</h2>
        <OrderedList>
          <ListItem>Installer pakken: <code>{'npm install @fremtind/jokul/icon'}</code></ListItem>
          <ListItem>Importer CSS: <code>{'import "@fremtind/jokul/icon/icon.css"'}</code></ListItem>
          <ListItem>Importer komponenten: <code>{'import { Icon } from "@fremtind/jokul/icon"'}</code></ListItem>
          <ListItem>Bruk komponenten med ikonnavnet: <code>{'<Icon name="home" />'}</code></ListItem>
          <ListItem>For React Native eller SVG-eksport, se tilleggsdokumentasjonen.</ListItem>
        </OrderedList>

        <Message variant="info">
          Material Symbols er en variabel font med fire justerbare akser. Jøkul setter
          standardverdier som passer Fremtinds profil, men du kan overstyre disse per ikon.
        </Message>

        <h2>Variable font-akser</h2>
        <DescriptionList>
          <DescriptionTerm><code>wght</code> — Tykkelse</DescriptionTerm>
          <DescriptionDetail>Området 100–700. Jøkul bruker 400 som standard. Lavere verdier gir tynnere streker.</DescriptionDetail>
          <DescriptionTerm><code>opsz</code> — Optisk størrelse</DescriptionTerm>
          <DescriptionDetail>Området 20–48. Høyere verdi gir tynnere detaljer for store ikoner, lavere for bedre lesbarhet i liten størrelse.</DescriptionDetail>
          <DescriptionTerm><code>GRAD</code> — Gradering</DescriptionTerm>
          <DescriptionDetail>Området -25 til 200. Påvirker visuell vekt uten å endre ikonets fotavtrykk. Nyttig for hover-effekter.</DescriptionDetail>
          <DescriptionTerm><code>FILL</code> — Fylling</DescriptionTerm>
          <DescriptionDetail>0 (outline) eller 1 (fylt). Brukes for å kommunisere aktiv tilstand, f.eks. stjerneikon for lagret favoritt.</DescriptionDetail>
        </DescriptionList>

        <h2>Ikonvarianter i bruk</h2>
        <Flex gap="s" wrap="wrap">
          <Tag>24px — standard UI</Tag>
          <Tag>20px — kompakt/inline</Tag>
          <Tag>32px — fremhevet</Tag>
          <Tag variant="info">Outline — standardtilstand</Tag>
          <Tag variant="success">Filled — aktiv tilstand</Tag>
        </Flex>

        <h2>Dekorative vs. funksjonelle ikoner</h2>
        <p>
          Det er et kritisk skille mellom ikoner som <em>dekorerer</em> tekst og ikoner som
          <em> formidler informasjon</em> selvstendig:
        </p>
        <UnorderedList>
          <ListItem>
            <strong>Dekorativt ikon</strong> (ved siden av tekst): legg til{" "}
            <code>{'aria-hidden="true"'}</code> så skjermlesere ignorerer det.
          </ListItem>
          <ListItem>
            <strong>Funksjonelt ikon</strong> (uten tekst, f.eks. lukkknapp): bruk{" "}
            <code>{'aria-label="Lukk dialog"'}</code> på den omsluttende knappen.
          </ListItem>
          <ListItem>
            <strong>Informativt ikon</strong> (statusindikatorer): legg til visuelt skjult tekst
            med <code>jkl-sr-only</code>-klassen.
          </ListItem>
        </UnorderedList>

        <ExpandablePanel>
          <ExpandablePanel.Header>Egendefinerte ikoner utenfor Material Symbols</ExpandablePanel.Header>
          <ExpandablePanel.Content>
            <p>
              Noen ganger trenger du et ikon som ikke finnes i Material Symbols. I Jøkul kan du
              lage egne SVG-ikoner og pakke dem i en ikonkomponent. Sørg for:
            </p>
            <OrderedList>
              <ListItem>SVG-en er på et 24×24px viewport med 2px padding (20px synlig område)</ListItem>
              <ListItem><code>fill="currentColor"</code> brukes slik at fargen arves fra CSS</ListItem>
              <ListItem>Ikonets semantikk er dokumentert og godkjent av designteamet</ListItem>
              <ListItem>Ikonet testes i begge temaer og i alle relevante størrelser</ListItem>
            </OrderedList>
            <p>
              Egendefinerte ikoner bør holdes i et delt komponentbibliotek, ikke kopiert
              mellom applikasjoner, for å sikre konsistens og enkel oppdatering.
            </p>
          </ExpandablePanel.Content>
        </ExpandablePanel>
      </>
    ),
    date: "2026-03-06",
    category: "Utvikling",
    author: "Erik Dahl",
    tags: ["ikoner", "svg", "material symbols", "tilgjengelighet"],
    resources: [
      {
        title: "Material Symbols oversikt",
        url: "https://fonts.google.com/icons",
        description: "Søk og forhåndsvis alle Material Symbols-ikoner",
      },
      {
        title: "Jøkul ikondokumentasjon",
        url: "https://jokul.fremtind.no/komponenter/icon",
        description: "Bruksveiledning og API-dokumentasjon for Icon-komponenten",
      },
      {
        title: "SVG Accessibility Guide",
        url: "https://www.sitepoint.com/tips-accessible-svg/",
        description: "Hvordan lage SVG-ikoner tilgjengelige for skjermlesere",
      },
    ],
  },
  {
    id: 8,
    title: "Testing av komponenter med React Testing Library",
    excerpt: "Strategi og praksis for å teste Jøkul-komponenter og egne komposisjoner på en måte som speiler faktisk bruk.",
    content: (
      <>
        <p>
          <strong>React Testing Library (RTL)</strong> er det anbefalte testrammeverket for
          React-komponenter i Jøkul-økosystemet. Filosofien er enkel men kraftfull:{" "}
          <em>test oppførselen brukeren opplever, ikke implementasjonsdetaljene</em>. Dette gir
          tester som er robuste mot refaktorering og som faktisk verifiserer at produktet fungerer.
        </p>

        <Message variant="info">
          Jøkul-teamet bruker <strong>Vitest</strong> og RTL for alle komponenttester internt.
          Jest er et fullgodt alternativ med identisk RTL-integrasjon.
        </Message>

        <h2>Spørringsprioritet</h2>
        <p>
          RTL anbefaler en spesifikk prioritetsrekkefølge for å finne elementer, fra mest til
          minst tilgjengelighetsvennlig:
        </p>
        <DescriptionList>
          <DescriptionTerm><code>getByRole</code></DescriptionTerm>
          <DescriptionDetail>Første valg alltid. Speiler hvordan skjermlesere oppdager elementer. Eksempel: <code>{'getByRole("button", { name: "Send inn" })'}</code></DescriptionDetail>
          <DescriptionTerm><code>getByLabelText</code></DescriptionTerm>
          <DescriptionDetail>Ideell for skjemafelter. Finner input knyttet til en label. Tvinger deg til å ha labels, noe som er god tilgjengelighetspraksis.</DescriptionDetail>
          <DescriptionTerm><code>getByPlaceholderText</code></DescriptionTerm>
          <DescriptionDetail>Brukes unntaksvis. Placeholder er ikke en erstatning for label — bruk <code>getByLabelText</code> der det er mulig.</DescriptionDetail>
          <DescriptionTerm><code>getByText</code></DescriptionTerm>
          <DescriptionDetail>For ikke-interaktive elementer. Finn avsnitt, overskrifter og listeelemeneter med innholdet sitt.</DescriptionDetail>
          <DescriptionTerm><code>getByTestId</code></DescriptionTerm>
          <DescriptionDetail>Siste utvei. Brukes kun når ingen semantisk spørring er mulig. Krev begrunnelse i kodegjennomgang.</DescriptionDetail>
        </DescriptionList>

        <h2>userEvent vs fireEvent</h2>
        <p>
          Foretrekk alltid <code>userEvent</code> fremfor <code>fireEvent</code>. Forskjellen er
          at <code>userEvent</code> simulerer hele interaksjonssekvensen slik en ekte bruker ville
          utført den:
        </p>
        <pre><code>{`// Unngå — skyter kun ett enkelt DOM-event
fireEvent.click(button);

// Foretrekk — simulerer hover → focus → klikk → blur
await userEvent.click(button);

// For tekstinntasting simuler hele sekvensen
await userEvent.type(input, "Ola Nordmann");`}</code></pre>

        <h2>Oppsett med jest-axe</h2>
        <OrderedList>
          <ListItem>Installer: <code>{'npm install --save-dev jest-axe'}</code></ListItem>
          <ListItem>Utvid Jest-typene: <code>{'import "jest-axe/extend-expect"'}</code></ListItem>
          <ListItem>Legg til en axe-sjekk i hver testfil for kritiske komponenter</ListItem>
          <ListItem>Vurder å lage en gjenbrukbar <code>renderAccessible</code>-hjelpefunksjon</ListItem>
          <ListItem>Kjør axe-tester i CI slik at tilgjengelighetsregresjoner oppdages automatisk</ListItem>
        </OrderedList>

        <h2>Hva du IKKE bør teste</h2>
        <UnorderedList>
          <ListItem>Interne tilstandsvariabler — test brukersynlig oppførsel i stedet</ListItem>
          <ListItem>CSS-klassenavn — disse er implementasjonsdetaljer som kan endre seg</ListItem>
          <ListItem>Prop-typer — TypeScript håndterer dette på kompileringstidspunktet</ListItem>
          <ListItem>Selve Jøkul-komponentene — de testes allerede av Jøkul-teamet</ListItem>
        </UnorderedList>

        <ExpandablePanel>
          <ExpandablePanel.Header>Komplett testeksempel med RTL og jest-axe</ExpandablePanel.Header>
          <ExpandablePanel.Content>
            <pre><code>{`import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

describe("Kontaktskjema", () => {
  it("sender skjema og viser bekreftelse", async () => {
    const { container } = render(<Kontaktskjema />);

    await userEvent.type(
      screen.getByLabelText("Navn"),
      "Ola Nordmann"
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Send inn" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Takk for din henvendelse");
  });

  it("har ingen tilgjengelighetsfeil", async () => {
    const { container } = render(<Kontaktskjema />);
    expect(await axe(container)).toHaveNoViolations();
  });
});`}</code></pre>
          </ExpandablePanel.Content>
        </ExpandablePanel>
      </>
    ),
    date: "2026-03-05",
    category: "Utvikling",
    author: "Ingrid Berg",
    tags: ["testing", "react testing library", "jest", "vitest", "tilgjengelighet"],
    resources: [
      {
        title: "React Testing Library",
        url: "https://testing-library.com/docs/react-testing-library/intro/",
        description: "Offisiell dokumentasjon for React Testing Library",
      },
      {
        title: "Common mistakes with RTL",
        url: "https://kentcdodds.com/blog/common-mistakes-with-react-testing-library",
        description: "Kent C. Dodds om de vanligste feilene med React Testing Library",
      },
      {
        title: "jest-axe",
        url: "https://github.com/nickcolley/jest-axe",
        description: "Integrer axe-core tilgjengelighetstester i Jest",
      },
    ],
  },
  {
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
  },
];
