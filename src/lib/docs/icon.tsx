import React from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "icon",
    name: "Icon",
    package: "@fremtind/jokul/icon",
    category: "Visning",
    tags: ["ikon", "media"],
    description: "Icon rendrer Material Symbols-ikoner. Gi navnet på ikonet som child-tekst.",
    notes: "Bruk alltid aria-label eller ledsagende tekst hvis ikonet er eneste indikasjon på en handling.",
    props: [
        { name: "children", type: "string", required: true, description: 'Material Symbol-navn, f.eks. "arrow_forward".' },
        { name: "bold", type: "boolean", required: false, description: "Tykkere strekbredde." },
        { name: "filled", type: "boolean", required: false, description: "Fylt variant av ikonet." },
        { name: "as", type: '"div" | "span"', required: false, default: '"span"', description: "HTML-element ikonet rendres som." },
    ],
    examples: [
        {
            title: "Vanlige ikoner",
            description: "Eksempler på ikoner fra Material Symbols-biblioteket.",
            code: `<Flex gap="m" alignItems="center">
  <Icon>home</Icon>
  <Icon>settings</Icon>
  <Icon>arrow_forward</Icon>
  <Icon>check_circle</Icon>
  <Icon>warning</Icon>
</Flex>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <Icon>home</Icon>
                    <Icon>settings</Icon>
                    <Icon>arrow_forward</Icon>
                    <Icon>check_circle</Icon>
                    <Icon>warning</Icon>
                </Flex>
            ),
        },
        {
            title: "Fylt og fet variant",
            description: "Bruk filled for fylt versjon og bold for tykkere strekbredde.",
            code: `<Flex gap="m" alignItems="center">
  <Icon>favorite</Icon>
  <Icon filled>favorite</Icon>
  <Icon bold>favorite</Icon>
</Flex>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <Icon>favorite</Icon>
                    <Icon filled>favorite</Icon>
                    <Icon bold>favorite</Icon>
                </Flex>
            ),
        },
    ],
};

export default doc;
