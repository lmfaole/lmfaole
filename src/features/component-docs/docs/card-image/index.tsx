import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function CardImagePreview() {
    const isHovered = usePreviewHovered();
    return (
        <Card style={{ maxWidth: 200, overflow: "hidden" }}>
            <CardImage src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=200&fit=crop" alt="Bil på vei" />
            <div style={{ padding: "var(--jkl-spacing-s)", transition: "opacity 0.3s", opacity: isHovered ? 1 : 0.5 }}>
                <p style={{ margin: 0, fontSize: "0.9em" }}>Bilforsikring</p>
            </div>
        </Card>
    );
}

const doc: ComponentDoc = {
    id: "card-image",
    name: "Card Image",
    package: "@fremtind/jokul/card",
    category: "Visning",
    standalone: false,
    description: "CardImage er en bildekomponent laget for bruk inne i Card. Den håndterer negativ margin automatisk slik at bildet bløder kant-i-kant i kortet, uavhengig av Card sin padding-innstilling. Du slipper å beregne negative marginer manuelt.",
    warnings: "CardImage må brukes som direkte barn av Card. Plasser den utenfor Card, eller nøstet i en wrapper-div, og den negative margin-beregningen slår feil.",
    relationships: {
        alternatives: [{ id: "card", description: "Bruk Card når det ikke er behov for et herobilder og innholdet i seg selv er det primære visuelle." }],
    },

    preview: <CardImagePreview />,
    props,
    examples,
};

export default doc;
