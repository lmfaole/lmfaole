import type { ScssMixin } from "../types";

export const breakpointMixins: ScssMixin[] = [
  {
    name: "small-device",
    description:
      "CSS som kun gjelder for små skjermer (0–679px). Bruk for mobiltilpasninger og forenklede layouter.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.sidebar {
    display: block;

    @include jkl.small-device {
        display: none;
    }
}`,
  },
  {
    name: "medium-device",
    description:
      "CSS som kun gjelder for mellomstore skjermer (680–1199px). Bruk for nettbrett-tilpasninger.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.grid {
    grid-template-columns: 1fr;

    @include jkl.medium-device {
        grid-template-columns: repeat(2, 1fr);
    }
}`,
  },
  {
    name: "from-medium-device",
    description:
      "CSS som gjelder fra 680px og oppover (medium + large + xl). Den vanligste breakpoint-mixinen i Jøkul — brukes til å progressivt forbedre layouten.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.card-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--jkl-spacing-m);

    @include jkl.from-medium-device {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--jkl-spacing-l);
    }
}`,
  },
  {
    name: "large-device",
    description:
      "CSS som kun gjelder for store skjermer (1200–1599px). Bruk når du trenger eksakt kontroll over desktop-versjonen uten å påvirke xl.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.page-layout {
    @include jkl.large-device {
        grid-template-columns: 280px 1fr;
    }
}`,
  },
  {
    name: "from-large-device",
    description:
      "CSS som gjelder fra 1200px og oppover (large + xl). Ideell for desktop-spesifikke layouts som skal gjelde på alle store skjermer.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.page-layout {
    @include jkl.from-large-device {
        grid-template-columns: 280px 1fr 240px;
        max-width: 1440px;
        margin-inline: auto;
    }
}`,
  },
  {
    name: "xl-device",
    description:
      "CSS som gjelder fra 1600px og oppover. Bruk sparsomt — vurder heller en maks-bredde-begrensning i stedet for en ny layout-tier.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.content-area {
    max-width: 1440px;

    @include jkl.xl-device {
        max-width: 1920px;
    }
}`,
  },
  {
    name: "screen-from",
    description:
      "Generisk min-width media query. Bruk de navngitte mixin-ene (from-medium-device osv.) når mulig — reserver screen-from for spesielle tilfeller.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.component {
    @include jkl.screen-from(900px) {
        display: flex;
    }
}`,
  },
  {
    name: "screen-to",
    description:
      "Generisk max-width media query (eksklusiv — maks er $max - 1px). Bruk small-device der det passer.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.banner {
    @include jkl.screen-to(400px) {
        font-size: var(--jkl-font-size-3);
    }
}`,
  },
  {
    name: "screen-between",
    description:
      "Generisk min/max media query. Maksverdien er eksklusiv ($max - 1px). Bruk kun når et navngitt breakpoint ikke dekker behovet.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.tooltip {
    @include jkl.screen-between(400px, 680px) {
        position: static;
    }
}`,
  },
];
