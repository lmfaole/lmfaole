import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardImage } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Tag } from "@fremtind/jokul/tag";
import { DescriptionList, DescriptionTerm, DescriptionDetail } from "@fremtind/jokul/description-list";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { CardPreview } from "./examples";

const doc: ComponentDoc = {
    id: "card",
    name: "Card",
    package: "@fremtind/jokul/card",
    category: "Visning",
    description: "Card er en overflate-komponent som grupperer relatert innhold i et visuelt avgrenset område. Den gir bakgrunn, ramme og padding via padding-proppen. Card gjør ikke antagelser om innhold — det er opp til deg å strukturere innholdet med Flex, overskrifter og andre komponenter.",
    warnings: "Ikke legg interaktive elementer (knapper, lenker) inne i et clickable Card — det skaper nested interactives som er ugyldige i HTML og problematiske for skjermlesere.",
    siblingIds: ["card-image"],
    relatedIds: ["flex"],
    preview: <CardPreview />,

    props,
    examples,
};

export default doc;
