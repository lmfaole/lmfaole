import type { ScssMixin } from "../types";

export const motionMixins: ScssMixin[] = [
  {
    name: "motion",
    description:
      "Setter transition-timing-function og transition-duration i ett kall. Kombinerer en easing- og en timing-token. Sender du egenskapsnavn som ekstra argumenter settes også transition-property.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.button {
    @include jkl.motion("standard", "energetic", background-color, transform);
}

// Kun timing og easing — ingen property-begrensning
.panel {
    transition-property: all;
    @include jkl.motion("entrance", "productive");
}`,
  },
  {
    name: "prefers-reduced-motion",
    description:
      "Wrapper-mixin for @media (prefers-reduced-motion: reduce). Bruk den til å fjerne eller forenkle animasjoner for brukere som ber om redusert bevegelse.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.animated-card {
    animation: slide-in var(--jkl-motion-timing-expressive) var(--jkl-motion-easing-entrance);

    @include jkl.prefers-reduced-motion {
        animation: none;
    }
}`,
  },
];
