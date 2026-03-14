import type { ScssMixin } from "../types";

export const spacingMixins: ScssMixin[] = [
  {
    name: "spacing",
    description:
      "Setter margin basert på Jøkuls spacing-skala. Du kan angi ett, to eller tre steg adskilt med '/' for responsiv spacing (liten / medium / stor skjerm). Valgfri $position-parameter begrenser marginen til én side.",
    example: `@use "@fremtind/jokul/styles/core/jkl" as jkl;

.section {
    // 40px på mobil, 64px fra medium skjerm og opp
    @include jkl.spacing("40/64");
}

.card + .card {
    // Kun margin-top, tre steg
    @include jkl.spacing("16/24/40", "top");
}`,
  },
];

