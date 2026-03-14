import { useState, useEffect } from "react";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { CardDetailPreview } from "../card/examples";
import { FlexCardGridPreview } from "../flex/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import messageDoc from "../message";

const doc: ComponentDoc = {
    id: "tag",
    name: "Tag",
    package: "@fremtind/jokul/tag",
    category: "Visning",
    tags: ["tekst", "datavisning", "feedback"],
    description: "Tag brukes til å vise kategorier, statuser og etiketter. De er kun visuelle elementer — ikke bruk Tag som knapper eller lenker. For klikkbare filtre, bruk Chip-komponenten i stedet.",
    warnings: "Tags er dekorative og ikke interaktive. Sørg for at taggteksten gir mening uten ekstra kontekst.",
    relatedIds: [messageDoc.id],

    props,
    examples,
};

export default doc;
