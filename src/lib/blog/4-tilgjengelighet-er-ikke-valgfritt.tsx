import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import type { BlogPost } from "./types";

const post: BlogPost = {
  id: 4,
  title: "Tilgjengelighet er ikke valgfritt",
  excerpt: "Universell utforming er et lovkrav i Norge — her er hvordan Jøkul hjelper deg å etterleve det.",
  content: (
    <>
      <p>
        Vi fikk en gang tilbakemelding fra en bruker som prøvde å melde inn en skade på mobilen
        sin med bare én fungerende hånd. Skjemaet vårt krevde at du måtte holde nede en knapp
        mens du dro i en slider. Det var ikke tilgjengelig, og det var ikke vi stolte av.
        Den tilbakemeldingen endret måten vi tenker på universell utforming for alltid.
      </p>

      <Message variant="warning">
        Manglende etterlevelse av tilgjengelighetskrav kan gi pålegg og bøter fra Uutilsynet.
        Fra 2025 gjelder European Accessibility Act også for private virksomheter i EØS.
      </Message>

      <h2>Lovkravene i klartekst</h2>
      <p>
        Mange tror tilgjengelighet er "nice to have". Det er feil. I Norge er WCAG 2.1 AA et
        lovkrav gjennom forskriften om universell utforming av IKT. Det betyr at hvis løsningen
        din ikke møter kravene, er den ulovlig — ikke bare dårlig.
      </p>
      <DescriptionList>
        <DescriptionTerm>Nivå A</DescriptionTerm>
        <DescriptionDetail>Absolutt minimum. Uten disse er løsningen ubrukelig for store brukergrupper. Bilder uten alt-tekst er et klassisk brudd.</DescriptionDetail>
        <DescriptionTerm>Nivå AA</DescriptionTerm>
        <DescriptionDetail>Lovkravet i Norge og EU. Inkluderer 4.5:1 kontrast for tekst, synlig fokusindikator og meningsfulle feilmeldinger.</DescriptionDetail>
        <DescriptionTerm>Nivå AAA</DescriptionTerm>
        <DescriptionDetail>Høyeste nivå. Ikke lovpålagt, men anbefalt for innhold til brukere med kognitive funksjonsnedsettelser.</DescriptionDetail>
      </DescriptionList>

      <h2>ARIA — kraftig når det brukes riktig, farlig når det misbrukes</h2>
      <p>
        Den vanligste feilen jeg ser er at utviklere legger til ARIA-attributter for å "fikse"
        tilgjengeligheten, når det riktige svaret er å bruke riktig HTML-element fra start.
        Et <code>&lt;div&gt;</code> med <code>role="button"</code> er nesten aldri bedre enn
        et faktisk <code>&lt;button&gt;</code>-element. Men noen ganger trengs ARIA:
      </p>
      <DescriptionList>
        <DescriptionTerm><code>role="alert"</code></DescriptionTerm>
        <DescriptionDetail>Kunngjør dynamisk innhold for skjermlesere uten at fokus flyttes. Jøkuls Message bruker dette automatisk.</DescriptionDetail>
        <DescriptionTerm><code>aria-expanded</code></DescriptionTerm>
        <DescriptionDetail>Kommuniserer om en region er kollapset eller utvidet. ExpandablePanel håndterer dette for deg.</DescriptionDetail>
        <DescriptionTerm><code>aria-describedby</code></DescriptionTerm>
        <DescriptionDetail>Kobler inputfelt til hjelpetekst og feilmeldinger. Jøkuls skjemakomponenter setter det automatisk.</DescriptionDetail>
      </DescriptionList>

      <h2>Test med ekte skjermlesere</h2>
      <p>
        Automatiske verktøy som axe finner omtrent 30–40% av tilgjengelighetsfeilene. Resten
        finner du bare ved å faktisk teste med skjermleser. Her er de du bør ha et forhold til:
      </p>
      <UnorderedList>
        <ListItem><strong>VoiceOver</strong> (macOS/iOS) — uunngåelig hvis du har Mac. Test med Safari.</ListItem>
        <ListItem><strong>NVDA</strong> (Windows, gratis) — mest brukt blant faktiske skjermleserbrukere. Test med Chrome.</ListItem>
        <ListItem><strong>TalkBack</strong> (Android) — kritisk for mobiltesting.</ListItem>
      </UnorderedList>

      <Flex gap="xs" wrap="wrap">
        <Tag variant="success">ARIA-attributter</Tag>
        <Tag variant="success">Fokushåndtering</Tag>
        <Tag variant="success">Fargekontrast AA</Tag>
        <Tag variant="info">Tastaturnavigasjon</Tag>
      </Flex>

      <h2>Det Jøkul gjør for deg — og det du må gjøre selv</h2>
      <p>
        Jøkul-komponentene er tilgjengelige isolert sett. Men tilgjengelighet er ikke noe du
        kan delegere fullt ut til et designsystem. Du er ansvarlig for sammensetningen.
      </p>

      <ExpandablePanel>
        <ExpandablePanel.Header>Ansvarsfordeling — hva må du håndtere selv?</ExpandablePanel.Header>
        <ExpandablePanel.Content>
          <OrderedList>
            <ListItem>DOM-rekkefølge skal matche visuell rekkefølge — unngå CSS order for å endre sekvens.</ListItem>
            <ListItem>Bilder og dekorative ikoner trenger <code>alt=""</code> eller <code>aria-hidden="true"</code>.</ListItem>
            <ListItem>Dynamiske oppdateringer (søkeresultater, statusmeldinger) må kunngjøres via <code>aria-live</code>.</ListItem>
            <ListItem>Fokus i modaler og dialogs — husk å fange og returnere det.</ListItem>
            <ListItem>Fjern aldri fokusindikator uten å erstatte den med et synlig alternativ.</ListItem>
          </OrderedList>
          <p>
            Legg gjerne til <strong>jest-axe</strong> i testsuiten for å fange ARIA-feil
            automatisk i CI. Det er ikke en fullstendig test, men det er bedre enn ingenting.
          </p>
        </ExpandablePanel.Content>
      </ExpandablePanel>

      <p>
        Brukeren med én fungerende hånd — hun bruker tjenestene våre fremdeles. Det vet jeg fordi
        vi fikset skjemaet. Det er verdt det.
      </p>
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
};

export default post;
