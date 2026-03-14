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
    description: "CardImage er en bildekomponent laget for bruk inne i Card. Den håndterer negativ margin automatisk slik at bildet bløder kant-i-kant i kortet, uavhengig av Card sin padding-innstilling. Du slipper å beregne negative marginer manuelt.",
    warnings: "CardImage må brukes som direkte barn av Card. Plasser den utenfor Card, eller nøstet i en wrapper-div, og den negative margin-beregningen slår feil.",
    relatedIds: ["card"],

    props,
    examples,
};

export default doc;
