import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { Message } from "@fremtind/jokul/message";
import { Tag } from "@fremtind/jokul/tag";
import { TextInput } from "@fremtind/jokul/text-input";
import { Card } from "@fremtind/jokul/card";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "flex",
    name: "Flex",
    package: "@fremtind/jokul/flex",
    category: "Layout",
    description: "Flex er den primære layout-primitiven i Jøkul. Den lar deg bygge flexbox-layouts med Jøkuls spacing-skala for gap, uten å skrive CSS. Komponenten rendres som div som standard, men kan rendres som et hvilket som helst HTML-element via as-proppen.",
    warnings: "Flex er ikke ment å erstatte alle layout-behov. For todimensjonale layouts, bruk CSS Grid.",
    relatedIds: ["button", "tag"],
    preview: (
        <Flex gap="s" wrap="wrap" alignItems="center">
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-focus)", borderRadius: "4px" }} />
            <div style={{ width: 80, height: 48, background: "var(--jkl-color-background-info)", borderRadius: "4px" }} />
            <div style={{ width: 64, height: 48, background: "var(--jkl-color-background-success)", borderRadius: "4px" }} />
            <div style={{ width: 48, height: 48, background: "var(--jkl-color-background-warning)", borderRadius: "4px" }} />
        </Flex>
    ),

    props,
    examples,
};

export default doc;
