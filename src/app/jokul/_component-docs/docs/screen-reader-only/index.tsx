import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ScreenReaderOnlyPreview } from "./preview";

const doc: ComponentDoc = {
    id: "screen-reader-only",
    name: "Screen Reader Only",
    package: "@fremtind/jokul/screen-reader-only",
    category: "Layout",
    status: "stable",
    description:
        "ScreenReaderOnly skjuler innhold visuelt mens det forblir tilgjengelig for skjermlesere og annen hjelpemiddelteknologi. Bruk det til å gi ekstra kontekst for ikonknapper, skip-links og annet innhold som er meningsløst uten visuelle ledetråder.",
    warnings:
        "Med showOnFocus blir innholdet synlig når det fokuseres, som er det klassiske mønsteret for en skip-link. Bruk aldri ScreenReaderOnly til å skjule funksjonelt innhold — kun til tilleggsinformasjon.",
    preview: <ScreenReaderOnlyPreview />,

    props,
};

export default doc;
