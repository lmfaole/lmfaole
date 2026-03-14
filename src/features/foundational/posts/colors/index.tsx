import { Message } from "@fremtind/jokul/message";
import { ColorIllustration } from "@/features/foundational/components/FoundationalIllustration";
import {
  primitiveColorTokens,
  backgroundTokens,
  textTokens,
  borderTokens,
} from "./tokens";
import { colorMixins } from "./mixins";
import type { FoundationalPost } from "../types";

const SWATCH: React.CSSProperties = {
  width: "28px",
  height: "28px",
  borderRadius: "4px",
  border: "1px solid var(--jkl-color-border-separator)",
  flexShrink: 0,
};

const post: FoundationalPost = {
  id: 11,
  title: "Fargesystemet i Jøkul",
  excerpt:
    "En fullstendig referanse til Jøkuls fargesystem: primitive tokens, semantiske tokens, fargeroller, lys/mørk tema og kontrastkrav.",
  tokenOverview: [
    {
      heading: "Primitive",
      description:
        "Jøkuls konkrete fargepalett — merkevarefarger med faste hex-verdier. Bruk ikke disse direkte i komponentkode; bruk de semantiske tokenene som peker til dem.",
      caption: "Primitive fargetokens",
      columns: ["Forhåndsvisning", "Token", "Navn"],
      rows: primitiveColorTokens.map(({ token, name }) => [
        <div key={`${token}-s`} style={{ ...SWATCH, background: `var(${token})` }} />,
        <code key={`${token}-c`}>{token}</code>,
        name,
      ]),
    },
    {
      heading: "Bakgrunn",
      description:
        "Semantiske tokens for bakgrunns- og overflatefarger. Bytter verdi automatisk mellom lys og mørk modus.",
      caption: "Bakgrunns- og overflatefarger",
      columns: ["Forhåndsvisning", "Token", "Bruksområde"],
      rows: backgroundTokens.map(({ token, description }) => [
        <div key={`${token}-s`} style={{ ...SWATCH, background: `var(${token})` }} />,
        <code key={`${token}-c`}>{token}</code>,
        description,
      ]),
    },
    {
      heading: "Tekst",
      description:
        "Semantiske tokens for tekstfarger. Sørger for riktig kontrast mot bakgrunnen i begge temaer.",
      caption: "Semantiske tekstfarger",
      columns: ["Forhåndsvisning", "Token", "Bruksområde"],
      rows: textTokens.map(({ token, description }) => [
        <span
          key={`${token}-p`}
          aria-hidden
          style={{
            color: `var(${token})`,
            fontWeight: token.includes("default") ? "bold" : undefined,
            background: token.includes("inverted")
              ? "var(--jkl-color-background-container-inverted)"
              : undefined,
            padding: token.includes("inverted") ? "0 4px" : undefined,
            borderRadius: token.includes("inverted") ? "2px" : undefined,
          }}
        >
          Abc
        </span>,
        <code key={`${token}-c`}>{token}</code>,
        description,
      ]),
    },
    {
      heading: "Kantlinje",
      description:
        "Semantiske tokens for streker, skillelinjer og innramminger av interaktive elementer.",
      caption: "Semantiske kantlinjefarger",
      columns: ["Forhåndsvisning", "Token", "Bruksområde"],
      rows: borderTokens.map(({ token, description }) => [
        <div
          key={`${token}-p`}
          aria-hidden
          style={{ width: "40px", height: "2px", background: `var(${token})`, borderRadius: "1px" }}
        />,
        <code key={`${token}-c`}>{token}</code>,
        description,
      ]),
    },
    {
      heading: "Feedback",
      description:
        "Overflatefarger for statusmeldinger — suksess, advarsel, feil og info. Brukes som bakgrunn i Message- og SystemMessage-komponenter.",
      caption: "Feedback-overflatefarger",
      columns: ["Forhåndsvisning", "Token", "Variant"],
      rows: [
        [<div key="s-s" style={{ ...SWATCH, background: "var(--jkl-color-background-surface-succes)" }} />, <code key="s-c">--jkl-color-background-surface-succes</code>, "success"],
        [<div key="w-s" style={{ ...SWATCH, background: "var(--jkl-color-background-surface-warning)" }} />, <code key="w-c">--jkl-color-background-surface-warning</code>, "warning"],
        [<div key="e-s" style={{ ...SWATCH, background: "var(--jkl-color-background-surface-error)" }} />, <code key="e-c">--jkl-color-background-surface-error</code>, "error"],
        [<div key="i-s" style={{ ...SWATCH, background: "var(--jkl-color-background-surface-info)" }} />, <code key="i-c">--jkl-color-background-surface-info</code>, "info"],
      ],
    },
  ],
  content: (
    <>
      <p>
        Farge er ett av de mest kraftfulle verktøyene i designsystemet. Jøkuls fargesystem er
        bygget i to lag — <strong>primitive tokens</strong> og{" "}
        <strong>semantiske tokens</strong> — for å gjøre det enkelt å bytte tema, sikre
        tilgjengelighet og holde produkter konsistente.
      </p>

      <Message variant="info">
        Bruk alltid <strong>semantiske</strong> fargevariabler i komponentkoden din — aldri de
        primitive tokenene direkte. Dette sikrer at temabytte (lys/mørk) fungerer automatisk.
      </Message>
    </>
  ),
  scssSection: colorMixins,
  illustration: <ColorIllustration />,
  relatedComponents: ["tag", "message", "system-message"],
  resources: [
    {
      title: "Jøkul Farger — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Oversikt over alle fargetokens og temaer",
    },
    {
      title: "WebAIM Contrast Checker",
      url: "https://webaim.org/resources/contrastchecker/",
      description: "Verktøy for å sjekke kontrastforhold mellom fargepar",
    },
    {
      title: "WCAG 2.1 — Contrast (Minimum) 1.4.3",
      url: "https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html",
      description: "Offisielt krav til fargekontrast for tekst",
    },
  ],
};

export default post;
