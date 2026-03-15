import type { ScssMixin } from "../types";

export const typographyMixins: ScssMixin[] = [
  {
    name: "text-style",
    description:
      "Setter font-size, line-height og font-weight for et navngitt typografisk stil-navn. Dette er den anbefalte måten å anvende Jøkuls typografiskala på i egne komponenter.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.my-heading {
    @include jkl.text-style("heading-2");
}

// Med override via @content
.my-bold-body {
    @include jkl.text-style("paragraph-medium") {
        font-weight: jkl.$typography-weight-bold;
    }
}`,
  },
  {
    name: "no-grow-bold",
    description:
      "Gjør tekst fet uten at elementet endrer bredde på skjermen. Nyttig for hover- og selected-tilstander der du vil unngå layout-shift.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.nav-item--active {
    @include jkl.no-grow-bold;
}`,
  },
  {
    name: "use-font-family",
    description:
      "Setter font-family med korrekte fallback-fonter for Fremtind Grotesk, Fremtind Grotesk Display, Fremtind Grotesk Mono eller Fremtind Material Symbols.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.code-snippet {
    @include jkl.use-font-family("Fremtind Grotesk Mono");
}`,
  },
];
