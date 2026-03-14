import { UnorderedList, OrderedList, ListItem } from "@fremtind/jokul/list";
import { Message } from "@fremtind/jokul/message";
import { ExpandablePanel } from "@fremtind/jokul/expander";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { TextInput } from "@fremtind/jokul/text-input";
import { BeforeAfter } from "@/shared/components/BeforeAfter/BeforeAfter";
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

      <BeforeAfter
        label="Interaktive elementer: semantisk HTML vs. ARIA-lapp"
        before={{
          caption: "Div som knapp — ikke fokuserbar med Tab, ingen Enter/Space-aktivering",
          code: `<div onClick={handleClick} style={{ cursor: "pointer" }}>
  Meld skade
</div>`,
          preview: (
            <div style={{ cursor: "pointer", padding: "8px 16px", border: "1px solid currentColor", borderRadius: 4 }}>
              Meld skade <small style={{ opacity: 0.5 }}>(prøv å tab hit)</small>
            </div>
          ),
        }}
        after={{
          caption: "Riktig element — fokuserbar, aktiverbar med tastatur, semantisk meningsfull",
          code: `<button type="button" onClick={handleClick}>
  Meld skade
</button>`,
          preview: <button type="button">Meld skade</button>,
        }}
      />

      <BeforeAfter
        label="Feilmeldinger: knyttet til felt eller løst i luften?"
        before={{
          caption: "Feilmelding uten kobling — skjermlesere leser ikke sammenhengen",
          code: `<input type="email" />
<span style={{ color: "red" }}>
  Ugyldig e-postadresse
</span>`,
          preview: (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <input type="email" defaultValue="ikke@gyldig" style={{ padding: "6px 8px", border: "1px solid #ccc", borderRadius: 4 }} />
              <span style={{ color: "red", fontSize: "0.875rem" }}>Ugyldig e-postadresse</span>
            </div>
          ),
        }}
        after={{
          caption: "Jøkul TextInput kobler felt og feilmelding automatisk via aria-describedby",
          code: `<TextInput
  label="E-post"
  type="email"
  errorLabel="Ugyldig e-postadresse"
/>`,
          preview: (
            <TextInput
              label="E-post"
              type="email"
              defaultValue="ikke@gyldig"
              errorLabel="Ugyldig e-postadresse"
            />
          ),
        }}
      />

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

      <BeforeAfter
        label="Bilder: alt-tekst som beskriver innhold vs. dekorasjon"
        before={{
          caption: "Informativt bilde uten alt-tekst — skjermleseren leser opp filnavnet",
          code: `<img src="/charts/skadestatistikk-2024.png" />`,
        }}
        after={{
          caption: "Beskrivende alt for informativt innhold, tom streng for dekorativt",
          code: `{/* Informativt bilde */}
<img
  src="/charts/skadestatistikk-2024.png"
  alt="Søylediagram: bilskader økte 12 % fra 2023 til 2024"
/>

{/* Rent dekorativt bilde */}
<img src="/decorative/wave.svg" alt="" aria-hidden="true" />`,
        }}
      />

      <BeforeAfter
        label="Fokushåndtering i modaler"
        before={{
          caption: "Modal uten fokusstyring — tastaturbrukere kan ikke nå innholdet",
          code: `function Modal({ open, children }) {
  return open ? (
    <div className="modal">{children}</div>
  ) : null;
}`,
        }}
        after={{
          caption: "Fokus flyttes inn ved åpning og returneres ved lukking",
          code: `function Modal({ open, onClose, children }) {
  const firstFocusableRef = useRef(null);
  const triggerRef = useRef(document.activeElement);

  useEffect(() => {
    if (open) firstFocusableRef.current?.focus();
    return () => triggerRef.current?.focus();
  }, [open]);

  return open ? (
    <div role="dialog" aria-modal="true" className="modal">
      <button ref={firstFocusableRef} onClick={onClose}>
        Lukk
      </button>
      {children}
    </div>
  ) : null;
}

// Bruk heller Jøkuls Modal-komponent som håndterer alt dette`,
        }}
      />

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

      <BeforeAfter
        label="Heading-hierarki: semantikk styrer navigasjon, ikke utseende"
        before={{
          caption: "Feil heading-nivå valgt for å få riktig visuell størrelse",
          code: `{/* ❌ Bruker h4 fordi teksten skal se liten ut */}
<h4>Om forsikringen</h4>
<p>Dette er en seksjon på toppnivå på siden.</p>`,
        }}
        after={{
          caption: "Riktig semantisk nivå — stil settes med CSS, ikke elementvalg",
          code: `{/* ✅ h2 er riktig nivå — stil med klasse */}
<h2 className="jkl-heading-4">Om forsikringen</h2>
<p>Dette er en seksjon på toppnivå på siden.</p>`,
        }}
      />

      <BeforeAfter
        label="Skjult fokusindikator"
        before={{
          caption: "Fokusring fjernet globalt — brukeren vet ikke hva som er aktivt",
          code: `/* ❌ Aldri gjør dette */
* { outline: none; }
button:focus { outline: none; }`,
          preview: (
            <button
              type="button"
              style={{ outline: "none", padding: "8px 16px", border: "1px solid currentColor", borderRadius: 4, cursor: "pointer" }}
              onFocus={e => { e.currentTarget.style.outline = "none"; }}
            >
              Tab til meg — ingen ring
            </button>
          ),
        }}
        after={{
          caption: "Jøkul-komponenter har synlig fokusring. Bruk :focus-visible for egne elementer",
          code: `/* ✅ Bruk :focus-visible med Jøkul token */
button:focus-visible {
  outline: 2px solid var(--jkl-color-border-focus);
  outline-offset: 2px;
}`,
          preview: <button type="button">Tab til meg — ring vises</button>,
        }}
      />

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
