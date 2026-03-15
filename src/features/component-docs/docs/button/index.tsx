import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";

function ButtonPreview() {
    const hovered = usePreviewHovered();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (hovered) {
            setLoading(true);
            const t = setTimeout(() => setLoading(false), 1500);
            return () => clearTimeout(t);
        }
    }, [hovered]);
    return loading
        ? <Button loader={{ showLoader: true, textDescription: "Laster" }}>Send inn</Button>
        : <Button>Send inn</Button>;
}

const doc: ComponentDoc = {
    id: "button",
    name: "Button",
    package: "@fremtind/jokul/button",
    category: "Handling",
    description: "Button brukes til å utløse handlinger. Knapper er det primære interaksjonselementet og skal alltid kommunisere hva som skjer når brukeren trykker på dem. Velg variant basert på handlingens prioritet — bruk én primary-knapp per kontekst og reserver ghost for lavprioriterte handlinger.",
    warnings: "Ikke bruk Button til navigasjon — bruk Link eller NavLink i stedet.",
    relationships: {
        related: [{ id: "text-input", description: "Plasser Button ved siden av TextInput for å sende inn et skjema eller utløse en søkehandling." }, { id: "toggle-switch", description: "Bruk ToggleSwitch i stedet for Button når handlingen er en vedvarende binær innstilling fremfor en engangshendelse." }, { id: "icon-button", description: "IconButton er en kompakt variant av Button som brukes når et merket ikon alene er nok til å formidle handlingen." }, { id: "icon", description: "Legg til Icon inne i Button for å forsterke handlingen med et visuelt symbol ved siden av etiketten." }],
    },

    preview: <ButtonPreview />,
    props,
    migrations
};

export default doc;
