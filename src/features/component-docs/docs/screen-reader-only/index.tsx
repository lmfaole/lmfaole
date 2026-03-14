import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "screen-reader-only",
    name: "Screen Reader Only",
    package: "@fremtind/jokul/screen-reader-only",
    category: "Layout",
    tags: ["tilgjengelighet", "a11y", "skjermleser", "visuelt-skjult", "skip-link"],
    status: "stable",
    description:
        "ScreenReaderOnly skjuler innhold visuelt mens det forblir tilgjengelig for skjermlesere og annen hjelpemiddelteknologi. Bruk det til å gi ekstra kontekst for ikonknapper, skip-links og annet innhold som er meningsløst uten visuelle ledetråder.",
    warnings:
        "Med showOnFocus blir innholdet synlig når det fokuseres, som er det klassiske mønsteret for en skip-link. Bruk aldri ScreenReaderOnly til å skjule funksjonelt innhold — kun til tilleggsinformasjon.",
    preview: (
        <div style={{ padding: "var(--jkl-spacing-m)", border: "1px dashed var(--jkl-color-border-default)", borderRadius: "4px", color: "var(--jkl-color-text-subdued)", fontStyle: "italic" }}>
            <ScreenReaderOnly>Denne teksten er kun synlig for skjermlesere</ScreenReaderOnly>
            <span aria-hidden>Innhold skjult visuelt, synlig for skjermlesere</span>
        </div>
    ),

    props,
    examples,
};

export default doc;
