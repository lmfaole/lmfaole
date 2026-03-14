import { Message } from "@fremtind/jokul/message";
import { TypographyIllustration } from "@/features/foundational/components/FoundationalIllustration";
import { fontSizeReference, lineHeightReference, fontWeightReference } from "./tokens";
import { typographyMixins } from "./mixins";
import type { FoundationalPost } from "../types";

const post: FoundationalPost = {
  id: 10,
  title: "Typografi i Jøkul",
  excerpt:
    "En grundig gjennomgang av Jøkuls typografisystem: Fremtind Grotesk, typografiskalaen, CSS-variabler, linjelengde og responsiv bruk.",
  tokenOverview: [
    {
      heading: "Størrelse",
      description:
        "Ti trinn fra micro til display. Bruk alltid disse tokenene fremfor hardkodede verdier for å sikre konsistent typografisk hierarki.",
      caption: "Font-size tokens — 10 trinn fra micro til display",
      columns: ["Forhåndsvisning", "Token", "Verdi", "Stil-rolle", "Bruksområde"],
      rows: fontSizeReference.map(({ token, value, role, usage }) => [
        <span
          key={`${token}-preview`}
          aria-hidden
          style={{ fontSize: `var(${token})`, lineHeight: 1, display: "block" }}
        >
          Aa
        </span>,
        <code key={`${token}-code`}>{token}</code>,
        value,
        role,
        usage,
      ]),
    },
    {
      heading: "Linjehøyde",
      description:
        "Tre nivåer som kontrollerer luft mellom tekstlinjer. Velg basert på tekstlengde og leseformål.",
      caption: "Line-height tokens — tre nivåer",
      columns: ["Token", "Verdi", "Bruksområde"],
      rows: lineHeightReference.map(({ token, value, usage }) => [
        <code key={`${token}-code`}>{token}</code>,
        value,
        usage,
      ]),
    },
    {
      heading: "Vekt",
      description:
        "To vektnivåer — normal for brødtekst, bold for overskrifter og fremheving. Bruk sparsomt for å bevare hierarki.",
      caption: "Font-weight tokens — to vektnivåer",
      columns: ["Token", "Verdi", "Bruksområde"],
      rows: fontWeightReference.map(({ token, value, usage }) => [
        <code key={`${token}-code`}>{token}</code>,
        value,
        usage,
      ]),
    },
  ],
  content: (
    <>
      <p>
        Typografi er fundamentet i enhver god brukeropplevelse. I Jøkul er typografisystemet
        nøye gjennomtenkt for å sikre lesbarhet, hierarki og konsistens på tvers av alle
        Fremtind-produkter — fra skademelding til sparekalkulator.
      </p>

      <Message variant="info">
        Jøkul bruker <strong>Fremtind Grotesk</strong> — en egenutviklet humanistisk sans-serif
        optimalisert for skjermbruk. Fonten er inkludert i Jøkuls CSS-pakke og trenger ingen
        manuell konfigurasjon.
      </Message>
    </>
  ),
  scssSection: typographyMixins,
  illustration: <TypographyIllustration />,
  relatedComponents: ["text-input", "text-area"],
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
