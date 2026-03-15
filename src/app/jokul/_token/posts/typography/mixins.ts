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
    name: "declare-font-variables",
    description:
      "Deklarer egne font-variabler (font-size/line-height/font-weight) basert på Jøkuls tokens. Passer når du vil gjenbruke samme nivå i flere selectors uten å kopiere var(--jkl-...).",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

:root {
    @include jkl.declare-font-variables("my-component-title", "heading-3");
}

.my-component__title {
    @include jkl.use-font-variables("my-component-title");
}`,
  },
  {
    name: "use-font-variables",
    description:
      "Bruk font-variabler du har laget med declare-font-variables. Setter font-size, line-height og font-weight fra CSS-variabler.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.my-component__subtitle {
    @include jkl.use-font-variables("my-component-title");
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
