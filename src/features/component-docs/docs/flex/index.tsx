import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Message } from "@fremtind/jokul/message";
import { Tag } from "@fremtind/jokul/tag";
import { TextInput } from "@fremtind/jokul/text-input";
import { Card } from "@fremtind/jokul/card";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function FlexPreview() {
    const isHovered = usePreviewHovered();
    return (
        <Flex gap={isHovered ? "l" : "s"} wrap="wrap" alignItems="center" style={{ transition: "gap 0.3s" }}>
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-focus)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-info)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-success)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-warning)", borderRadius: "4px" }} />
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "flex",
    name: "Flex",
    package: "@fremtind/jokul/flex",
    category: "Layout",
    description: "Flex er den primære layout-primitiven i Jøkul. Den lar deg bygge flexbox-layouts med Jøkuls spacing-skala for gap, uten å skrive CSS. Komponenten rendres som div som standard, men kan rendres som et hvilket som helst HTML-element via as-proppen.",
    warnings: "Flex er ikke ment å erstatte alle layout-behov. For todimensjonale layouts, bruk CSS Grid.",
    relationships: {
        related: [{ id: "button", description: "Wrapper flere Button-elementer i Flex for å kontrollere mellomrom og justering i en verktøylinje eller skjemafot." }, { id: "tag", description: "Bruk Flex for å legge ut en rad med Tags med konsistent mellomrom og linjebryting." }],
    },
    preview: <FlexPreview />,

    props,
    examples,
};

export default doc;
