import { useState, useEffect } from "react";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

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

    props,
    examples,
    migrations
};

export default doc;
