import { ScreenReaderOnly } from "@fremtind/jokul/screen-reader-only";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function ScreenReaderOnlyPreview() {
    const isHovered = usePreviewHovered();
    return (
        <div style={{ padding: "var(--jkl-spacing-m)", border: "1px dashed var(--jkl-color-border-default)", borderRadius: "4px" }}>
            <ScreenReaderOnly>Denne teksten er kun synlig for skjermlesere</ScreenReaderOnly>
            <span aria-hidden style={{ color: isHovered ? "var(--jkl-color-text-link)" : "var(--jkl-color-text-subdued)", fontStyle: "italic", transition: "color 0.3s", fontSize: "0.9em" }}>
                {isHovered ? "Skjult tekst finnes her →" : "Innhold skjult visuelt"}
            </span>
        </div>
    );
}

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
    examples,
};

export default doc;
