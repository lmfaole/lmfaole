import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CodeBlock } from "@/components/CodeBlock";
import type { BlogPost } from "../blog/types";

const post: BlogPost = {
  id: 10,
  title: "Typografi i Jøkul",
  excerpt:
    "En grundig gjennomgang av Jøkuls typografisystem: Fremtind Grotesk, typografiskalaen, CSS-variabler, linjelengde og responsiv bruk.",
  content: (
    <>
      <p>
        Typografi er fundamentet i enhver god brukeropplevelse. I Jøkul er typografisystemet
        nøye gjennomtenkt for å sikre lesbarhet, hierarki og konsistens på tvers av alle
        Fremtind-produkter — fra skademelding til sparekalkulator.
      </p>

      <Message variant="info">
        Dette er en referanseguide. Du finner alltid oppdatert dokumentasjon i{" "}
        <strong>Jøkul Storybook</strong> og i GitHub-repositoriet.
      </Message>

      <h2>Fremtind Grotesk</h2>
      <p>
        Jøkul bruker <strong>Fremtind Grotesk</strong> — en egenutviklet humanistisk sans-serif
        skreddersydd for Fremtind. Fonten er optimalisert for skjermbruk med følgende egenskaper:
      </p>
      <UnorderedList>
        <ListItem>
          <strong>Høy x-høyde</strong> — bokstavene er relativt høye sammenlignet med
          versalene, noe som gir bedre lesbarhet i små størrelser.
        </ListItem>
        <ListItem>
          <strong>Åpne apoturer</strong> — bokstaver som «a», «c» og «e» har tydelige åpninger
          som skiller dem fra hverandre og reduserer forveksling.
        </ListItem>
        <ListItem>
          <strong>OpenType-funksjoner</strong> — tabellnummer (<code>tnum</code>) for
          justering i tabeller, og stilistiske alternativer for visse tegn.
        </ListItem>
        <ListItem>
          <strong>Automatisk lasting</strong> — fonten er inkludert i Jøkuls CSS-pakke og
          trenger ingen manuell konfigurasjon.
        </ListItem>
      </UnorderedList>

      <h2>Typografiskalaen</h2>
      <p>
        Jøkul definerer en fast skala med navngitte størrelser. Bruk CSS-variablene for å holde
        egne komponenter i samsvar med systemet:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-font-size-display</code></DescriptionTerm>
        <DescriptionDetail>
          4rem (64px) — brukes sparsomt til store hero-seksjoner og splash-sider. Aldri i
          løpende tekst.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-title-large</code></DescriptionTerm>
        <DescriptionDetail>
          3rem (48px) — primær sidetittel på landingssider og kampanjesider.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-title-medium</code></DescriptionTerm>
        <DescriptionDetail>
          2.25rem (36px) — standard sidetittel i applikasjoner. Tilsvarer typisk{" "}
          <code>&lt;h1&gt;</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-title-small</code></DescriptionTerm>
        <DescriptionDetail>
          1.75rem (28px) — seksjonsoverskrift. Tilsvarer typisk <code>&lt;h2&gt;</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-heading-large</code></DescriptionTerm>
        <DescriptionDetail>
          1.375rem (22px) — underoverskrift for seksjoner. Tilsvarer typisk{" "}
          <code>&lt;h3&gt;</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-heading-medium</code></DescriptionTerm>
        <DescriptionDetail>
          1.125rem (18px) — liten overskrift for kort og paneler. Tilsvarer typisk{" "}
          <code>&lt;h4&gt;</code>.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-body</code></DescriptionTerm>
        <DescriptionDetail>
          1rem (16px) — standard brødtekst. Grunnlaget for all løpende tekst.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-small</code></DescriptionTerm>
        <DescriptionDetail>
          0.875rem (14px) — hjelpetekst, labels, metadata og sekundær informasjon.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-font-size-micro</code></DescriptionTerm>
        <DescriptionDetail>
          0.75rem (12px) — juridisk tekst, fotnoter og svært sekundær informasjon. Bruk
          med varsomhet.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Linjehøyde og bokstavavstand</h2>
      <p>
        Jøkul setter linjehøyde (<code>line-height</code>) og bokstavavstand (
        <code>letter-spacing</code>) som en del av typografitoken-systemet:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>--jkl-line-height-body</code></DescriptionTerm>
        <DescriptionDetail>
          1.5 — brukes for all løpende brødtekst. Gir pusterom mellom linjene.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-line-height-heading</code></DescriptionTerm>
        <DescriptionDetail>
          1.2 — tettere linjehøyde for overskrifter, der ord er færre og teksten kortere.
        </DescriptionDetail>

        <DescriptionTerm><code>--jkl-letter-spacing-small</code></DescriptionTerm>
        <DescriptionDetail>
          0.08em — brukes for <code>--jkl-font-size-small</code> og{" "}
          <code>--jkl-font-size-micro</code> for å kompensere for at små bokstaver lettere
          flyter sammen.
        </DescriptionDetail>
      </DescriptionList>

      <h2>CSS-variabler i praksis</h2>
      <p>Slik bruker du typografi-tokens direkte i CSS:</p>
      <CodeBlock code={`/* Eksempel: egendefinert komponent */
.min-seksjon__tittel {
  font-size: var(--jkl-font-size-title-small);
  line-height: var(--jkl-line-height-heading);
  font-weight: 700;
  margin-bottom: var(--jkl-spacing-m);
}

.min-seksjon__brødtekst {
  font-size: var(--jkl-font-size-body);
  line-height: var(--jkl-line-height-body);
  max-width: 66ch;
}`} />

      <h2>Linjelengde og lesbarhet</h2>
      <p>
        Linjelengde er en av de viktigste faktorene for lesekomfort. Forskning viser at den
        optimale linjelengden for brødtekst er <strong>45–75 tegn</strong>.
      </p>
      <UnorderedList>
        <ListItem>
          Bruk <code>ch</code>-enheter i stedet for <code>px</code>:{" "}
          <code>max-width: 66ch</code> tilsvarer omtrent 66 tegn i gjeldende font.
        </ListItem>
        <ListItem>
          For smale kolonner (sidebarer, kort, modaler) er 35–50 tegn akseptabelt.
        </ListItem>
        <ListItem>
          Unngå linjelengder over 85 tegn — øyet må bevege seg for mye mellom linjeskift.
        </ListItem>
        <ListItem>
          Unngå linjelengder under 30 tegn — øyet må bevege seg for ofte og bryter leserytmen.
        </ListItem>
      </UnorderedList>

      <h2>Responsiv typografi</h2>
      <p>
        Jøkuls skala er designet for desktopskjermer (1280px+), men fungerer godt på alle
        skjermstørrelser. For jevn skalering kan du bruke CSS <code>clamp()</code>:
      </p>
      <CodeBlock code={`/* Skalerer fra body (16px) til title-small (28px) */
font-size: clamp(
  var(--jkl-font-size-body),
  1rem + 2vw,
  var(--jkl-font-size-title-small)
);`} />
      <p>
        I de fleste applikasjoner er det tilstrekkelig å bruke faste størrelser og la layouten
        håndtere tilpasningen via responsive breakpoints.
      </p>

      <h2>Når skal du bruke hvilken størrelse?</h2>
      <DescriptionList>
        <DescriptionTerm>Display / Title Large</DescriptionTerm>
        <DescriptionDetail>
          Kampanjesider, onboarding-intro, store markedsføringsseksjoner. Maks én per side.
        </DescriptionDetail>
        <DescriptionTerm>Title Medium / Title Small</DescriptionTerm>
        <DescriptionDetail>
          Sidetitler og hovedseksjoner i applikasjoner. Bruk én Title Medium per side.
        </DescriptionDetail>
        <DescriptionTerm>Heading Large / Heading Medium</DescriptionTerm>
        <DescriptionDetail>
          Underseksjoner, kortoverskrifter, accordion-titler og skjemagrupper.
        </DescriptionDetail>
        <DescriptionTerm>Body</DescriptionTerm>
        <DescriptionDetail>
          All løpende tekst: instruksjoner, beskrivelser, innhold i modaler og drawers.
        </DescriptionDetail>
        <DescriptionTerm>Small / Micro</DescriptionTerm>
        <DescriptionDetail>
          Hjelpetekst under skjemafelt, timestamps, juridiske merknader, tags og badges.
        </DescriptionDetail>
      </DescriptionList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Font-display og CLS (Cumulative Layout Shift)</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>
            Fonter som lastes asynkront kan forårsake <strong>layout-forskyvning</strong> (CLS)
            — en viktig Core Web Vital. Jøkul håndterer dette med:
          </p>
          <DescriptionList>
            <DescriptionTerm><code>font-display: swap</code></DescriptionTerm>
            <DescriptionDetail>
              Teksten vises umiddelbart med en fallback-font, deretter byttes til Fremtind
              Grotesk. Gir rask tekstvisning, men et synlig fontbytte kan forekomme.
            </DescriptionDetail>
            <DescriptionTerm><code>size-adjust</code> og <code>ascent-override</code></DescriptionTerm>
            <DescriptionDetail>
              Jøkul konfigurerer fallback-fonten (Arial/Helvetica) til å matche Fremtind
              Grotesks metrikker så tett som mulig, noe som minimerer det visuelle hoppet.
            </DescriptionDetail>
          </DescriptionList>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <h2>Tilgjengelighet og typografi</h2>
      <p>
        WCAG 2.1 stiller krav til typografi som Jøkul hjelper deg å overholde:
      </p>
      <OrderedList>
        <ListItem>
          <strong>Tekststørrelse (1.4.4):</strong> Tekst skal kunne forstørres til 200 % uten
          tap av innhold. Unngå faste <code>px</code>-verdier på <code>font-size</code> i
          rot-elementet; bruk <code>rem</code>.
        </ListItem>
        <ListItem>
          <strong>Tekstspacing (1.4.12):</strong> Innhold skal ikke gå tapt om brukeren
          øker linjehøyde til 1,5, avstand etter avsnitt til 2em, bokstavavstand til 0,12em
          og ordavstand til 0,16em.
        </ListItem>
        <ListItem>
          <strong>Kontrast (1.4.3):</strong> Normal tekst (under 18pt) krever
          kontrastforhold på minst 4,5:1 mot bakgrunnen. Jøkuls fargetoken-system er designet
          for å overholde dette automatisk.
        </ListItem>
      </OrderedList>

      <Flex gap="xs" wrap="wrap">
        <Tag>Typografi</Tag>
        <Tag>CSS-variabler</Tag>
        <Tag>Fremtind Grotesk</Tag>
        <Tag>WCAG</Tag>
        <Tag>Responsiv</Tag>
      </Flex>
    </>
  ),
  date: "2024-01-15",
  category: "Foundational",
  type: "foundational",
  image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
  author: "Jøkul-teamet",
  tags: ["typografi", "font", "css-variabler", "responsiv", "tilgjengelighet"],
  resources: [
    {
      title: "Jøkul Typografi — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Interaktiv dokumentasjon og eksempler på alle typografistiler",
    },
    {
      title: "WCAG 2.1 — Success Criterion 1.4.4: Resize Text",
      url: "https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html",
      description: "Krav til resizing av tekst for tilgjengelighet",
    },
    {
      title: "Practical Typography — Matthew Butterick",
      url: "https://practicaltypography.com/",
      description: "Grundig online-bok om typografi for skjerm og print",
    },
  ],
};

export default post;
