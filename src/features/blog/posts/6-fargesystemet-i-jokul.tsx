import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Link } from "@fremtind/jokul/link";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 6,
  title: "Fargesystemet i Jøkul",
  excerpt: "Hvordan Jøkul bruker semantiske fargetokens for å sikre konsistens og tilgjengelighet på tvers av temaer.",
  content: (
    <>
      <p>
        Tidlig i Jøkul-historien hadde vi en farge vi kalte <code>#2D6A4F</code> i syv ulike
        CSS-filer under syv ulike variabelnavn. Ingen visste at de var den samme fargen. Da vi
        én gang endret én av dem, brakk tre skjemaer på mobil. Det var da vi skjønte at vi
        ikke hadde et fargesystem — vi hadde en haug med hardkodede verdier med fargenavn.
        Det er forskjellen som alt.
      </p>

      <h2>To lag, én sannhet</h2>
      <p>
        Jøkuls fargesystem er bygget i to klart adskilte lag. Forstår du dem, forstår du
        systemet:
      </p>
      <DescriptionList>
        <DescriptionTerm>Primitive tokens</DescriptionTerm>
        <DescriptionDetail>
          Rå fargeverdier: <code>--jkl-color-granitt-20</code>, <code>--jkl-color-stein-60</code>.
          Aldri bruk disse direkte i komponenter. De er paletten — ikke reglene.
        </DescriptionDetail>
        <DescriptionTerm>Semantiske tokens</DescriptionTerm>
        <DescriptionDetail>
          Meningsfulle variabler: <code>--jkl-color-text-default</code> peker på en primitiv
          farge. I mørkt tema peker den på en annen. Komponentene bryr seg ikke om hvilken.
        </DescriptionDetail>
      </DescriptionList>

      <h2>De semantiske lagene i detalj</h2>
      <DescriptionList>
        <DescriptionTerm>Bakgrunnsfarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-background-default</code> er sidens grunnfarge. Den og fem varianter
          dekker alle nivåer av overflater — kort, modaler, sidebarer.
        </DescriptionDetail>
        <DescriptionTerm>Tekstfarger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-text-default</code>, <code>--jkl-color-text-subdued</code> og
          <code> --jkl-color-text-on-action</code>. Tre nivåer. Ikke mer, ikke mindre.
        </DescriptionDetail>
        <DescriptionTerm>Interaktive farger</DescriptionTerm>
        <DescriptionDetail>
          <code>--jkl-color-interactive-default</code> og <code>--jkl-color-interactive-hover</code>.
          Alltid 4.5:1 kontrast mot bakgrunn i begge temaer. Det er garantert i paletten.
        </DescriptionDetail>
      </DescriptionList>

      <h2>Tilstandsfarger — ikke dekorasjon</h2>
      <p>
        Disse fargene kommuniserer systemmeldinger og inndatastatus. De er ikke valgfrie estetiske
        valg. En bruker med fargeblindhet stoler på dem — alltid kombinert med ikon eller tekst:
      </p>
      <Flex gap="xs" wrap="wrap">
        <Tag variant="info">Info — nøytral blå</Tag>
        <Tag variant="success">Suksess — grønn</Tag>
        <Tag variant="warning">Advarsel — gul</Tag>
        <Tag variant="error">Feil — rød</Tag>
      </Flex>

      <Message variant="warning">
        Tilstandsfarger skal <strong>aldri</strong> brukes som dekorasjon. De har semantisk
        betydning brukere stoler på. Kombiner alltid farge med ikon eller tekst.
      </Message>

      <h2>Mørk modus er én attributt</h2>
      <p>
        For å aktivere mørk modus setter du <code>{'data-theme="dark"'}</code> på et
        foreldreelement. Ingen ekstra klasser, ingen theme-providers, ingen JavaScript-trickery.
        Alle semantiske tokens bytter automatisk:
      </p>
      <OrderedList>
        <ListItem>Bakgrunnsfarger inverteres til mørk grå</ListItem>
        <ListItem>Tekstfarger justeres for å bevare kontrastkravene</ListItem>
        <ListItem>Interaktive farger lysnes for synlighet mot mørk bakgrunn</ListItem>
        <ListItem>Fokusringer justeres for å skille seg ut</ListItem>
      </OrderedList>

      <ExpandablePanel>
        <ExpandablePanel.Header>Kontrastkrav og hvorfor vi sjekker dem i CI</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <p>WCAG 2.2 definerer disse minimumskravene:</p>
          <UnorderedList>
            <ListItem><strong>4.5:1</strong> — normal tekst (under 18pt / 14pt bold)</ListItem>
            <ListItem><strong>3:1</strong> — stor tekst og UI-komponenter</ListItem>
            <ListItem><strong>3:1</strong> — grafiske elementer som formidler informasjon</ListItem>
          </UnorderedList>
          <p>
            Vi kjører kontrastsjekker automatisk i CI med en liten script som leser token-manifestet
            og verifiserer at alle semantiske par møter AA-kravene. En gang i kvartalet, som klokkearbeid.
            Verifiser selv med{" "}
            <Link href="https://webaim.org/resources/contrastchecker/" external>WebAIM Contrast Checker</Link>.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Fargesystemet er kanskje den delen av Jøkul jeg er mest stolt av — ikke fordi det er
        fancy, men fordi det er <em>kjedelig riktig</em>. Du tenker aldri på det. Det bare fungerer.
      </p>
    </>
  ),
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
};

export default post;
