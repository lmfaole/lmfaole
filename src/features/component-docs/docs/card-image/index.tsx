import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

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

    props,
    examples,
};

export default doc;
