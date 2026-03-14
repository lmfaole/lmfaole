import { Message } from "@fremtind/jokul/message";
import { SpacingIllustration } from "@/features/foundational/components/FoundationalIllustration";
import { spacingTokens, unitTokens } from "./tokens";
import { spacingMixins } from "./mixins";
import type { FoundationalPost } from "../types";

const post: FoundationalPost = {
  id: 12,
  title: "Spacing og layout i Jøkul",
  excerpt: "Komplett referanse til Jøkuls spacing-skala og CSS-variabler.",
  tokenOverview: [
    {
      heading: "Spacing-skala",
      description:
        "Navngitte semantiske tokens basert på et 8-punkts grid. Bruk disse i komponenter og layouter for konsistent visuell rytme.",
      caption: "Spacing-skalaen — alle tilgjengelige tokens",
      columns: ["Forhåndsvisning", "Token", "Verdi", "Bruksområde"],
      rows: spacingTokens.map(({ name, token, px, usage }) => [
        <div
          key={`${name}-bar`}
          aria-hidden
          style={{
            height: "12px",
            width: `var(${token})`,
            minWidth: "4px",
            background: "var(--jkl-color-background-action)",
            borderRadius: "2px",
          }}
        />,
        <code key={`${name}-token`}>{token}</code>,
        px,
        usage,
      ]),
    },
    {
      heading: "Unit-skala",
      description:
        "Primitive størrelsesenheter som skalerer responsivt med --jkl-unit-base (0.5rem / 8px på desktop). Brukes internt i Jøkul-komponenter og for presist layout-arbeid.",
      caption: "Unit-tokens — grunnleggende størrelsesenheter",
      columns: ["Forhåndsvisning", "Token", "Multiplier", "px", "rem"],
      rows: unitTokens.map(({ token, multiplier, px, rem }) => [
        <div
          key={`${token}-bar`}
          aria-hidden
          style={{
            height: "8px",
            width: px === "0px" ? "2px" : `var(${token})`,
            maxWidth: "100%",
            background: "var(--jkl-color-background-action)",
            borderRadius: "2px",
            opacity: px === "0px" ? 0.2 : 1,
          }}
        />,
        <code key={`${token}-name`}>{token}</code>,
        multiplier,
        px,
        rem,
      ]),
    },
  ],
  content: (
    <>
      <p>
        Konsistent spacing er det som gjør et grensesnitt rolig og lesbart. Jøkul definerer en
        navngitt spacing-skala basert på et 8-punkts grid, eksponert som CSS-variabler.
      </p>

      <Message variant="info">
        Bruk alltid Jøkuls spacing-variabler i stedet for hardkodede pixelverdier. Dette gjør
        det enklere å skalere og justere layouten globalt.
      </Message>
    </>
  ),
  scssSection: spacingMixins,
  illustration: <SpacingIllustration />,
  relatedComponents: [],
  resources: [
    {
      title: "Jøkul Spacing — Storybook",
      url: "https://jokul.fremtind.no/",
      description: "Interaktiv oversikt over alle spacing-tokens",
    },
    {
      title: "The 8-Point Grid System",
      url: "https://spec.fm/specifics/8-pt-grid",
      description: "Introduksjon til 8-punkts grid-systemet som Jøkul bygger på",
    },
  ],
};

export default post;
