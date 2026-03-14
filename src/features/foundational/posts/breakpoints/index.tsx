import { Message } from "@fremtind/jokul/message";
import { BreakpointsIllustration } from "@/features/foundational/components/FoundationalIllustration";
import { breakpointTokens, breakpointRanges } from "./tokens";
import { breakpointMixins } from "./mixins";
import type { FoundationalPost } from "../types";

const post: FoundationalPost = {
  id: 14,
  title: "Breakpoints og responsivt design i Jøkul",
  excerpt:
    "En referanse til Jøkuls fire breakpoints, navngitte skjermstørrelser og SCSS-mixin-er for responsiv layout — fra mobil til ekstra bred desktop.",
  tokenOverview: [
    {
      heading: "Breakpoints",
      description:
        "Jøkul definerer tre SCSS-variabler som deler skjermbredden inn i fire navngitte soner. Disse er ikke CSS custom properties — de finnes kun i SCSS og brukes via breakpoint-mixin-ene.",
      caption: "Jøkuls tre breakpoint-variabler",
      columns: ["SCSS-variabel", "Verdi", "Gjelder fra", "Typiske enheter"],
      rows: breakpointTokens.map(({ variable, value, range, devices }) => [
        <code key={`${variable}-var`}>{variable}</code>,
        <strong key={`${variable}-val`}>{value}</strong>,
        range,
        devices,
      ]),
    },
    {
      heading: "Soner",
      description:
        "De tre variablene gir fire navngitte soner. Preferér de navngitte mixin-ene (small-device, from-medium-device osv.) fremfor direkte bruk av variablene.",
      caption: "De fire skjermsonene og tilhørende mixin-er",
      columns: ["Sone", "Fra", "Til", "Mixin", "Bruksområde"],
      rows: breakpointRanges.map(({ name, min, max, mixin, usage }) => [
        <strong key={`${name}-n`}>{name}</strong>,
        min,
        max,
        <code key={`${name}-m`}>{mixin}</code>,
        usage,
      ]),
    },
  ],
  content: (
    <>
      <p>
        Responsive design i Jøkul følger mobile-first-prinsippet: skriv basisstiler for mobil,
        og bruk breakpoint-mixin-ene til å legge til endringer for større skjermer. Det gjør
        koden enklere å lese og sørger for at mobilversjonen alltid er grunnlaget.
      </p>

      <Message variant="info">
        Breakpoint-variablene er <strong>kun tilgjengelige i SCSS</strong>, ikke som CSS custom
        properties. Bruk alltid de navngitte mixin-ene{" "}
        (<code>from-medium-device</code>, <code>from-large-device</code> osv.) i stedet for å
        referere direkte til <code>$breakpoint--medium</code> o.l.
      </Message>
    </>
  ),
  scssSection: breakpointMixins,
  illustration: <BreakpointsIllustration />,
  relatedComponents: [],
  resources: [
    {
      title: "Jøkul — _screens.scss",
      url: "https://github.com/fremtind/jokul/blob/main/packages/core/src/jkl/_screens.scss",
      description: "Kildekoden for alle breakpoint-mixin-er i Jøkul",
    },
    {
      title: "MDN: Using media queries",
      url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries",
      description: "Grundig introduksjon til media queries i CSS",
    },
    {
      title: "Mobile First — Luke Wroblewski",
      url: "https://www.lukew.com/ff/entry.asp?933",
      description: "Det originale blogginnlegget som introduserte mobile-first-prinsippet",
    },
  ],
};

export default post;
