import React from "react";
import { Chip } from "@fremtind/jokul/chip";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "chip",
    name: "Chip",
    package: "@fremtind/jokul/chip",
    category: "Skjema",
    tags: ["interaktiv", "filter", "tag", "skjema"],
    description: "Chip brukes for interaktive filtre og tagger som brukeren kan velge og velge bort.",
    notes: "Bruk filter-varianten for flervalgsfiltre, input-varianten for tags brukeren kan fjerne.",
    relatedIds: ["tag"],
    props: [
        { name: "children", type: "React.ReactNode", required: true, description: "Chip-teksten." },
        { name: "variant", type: '"input" | "filter"', required: true, description: "Visuell variant og funksjon." },
        { name: "selected", type: "boolean", required: false, description: "Valgt tilstand, kun for filter-variant." },
        { name: "onClick", type: "React.ButtonHTMLAttributes<HTMLButtonElement>['onClick']", required: false, description: "Klikk-handler." },
    ],
    examples: [
        {
            title: "Filter-chips",
            description: "Bruk filter-chips for å la brukeren velge kategorier.",
            code: `<Flex gap="xs" wrap="wrap">
  <Chip variant="filter" selected>Bil</Chip>
  <Chip variant="filter">Båt</Chip>
  <Chip variant="filter">Hjem</Chip>
  <Chip variant="filter" selected>Reise</Chip>
</Flex>`,
            preview: (
                <Flex gap="xs" wrap="wrap">
                    <Chip variant="filter" selected>Bil</Chip>
                    <Chip variant="filter">Båt</Chip>
                    <Chip variant="filter">Hjem</Chip>
                    <Chip variant="filter" selected>Reise</Chip>
                </Flex>
            ),
        },
        {
            title: "Input-chips",
            description: "Bruk input-chips for tags som brukeren kan fjerne.",
            code: `<Flex gap="xs" wrap="wrap">
  <Chip variant="input">React</Chip>
  <Chip variant="input">TypeScript</Chip>
  <Chip variant="input">Next.js</Chip>
</Flex>`,
            preview: (
                <Flex gap="xs" wrap="wrap">
                    <Chip variant="input">React</Chip>
                    <Chip variant="input">TypeScript</Chip>
                    <Chip variant="input">Next.js</Chip>
                </Flex>
            ),
        },
    ],
};

export default doc;
