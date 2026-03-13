import React from "react";
import { Loader } from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring"],
    description: "Loader viser at noe laster i bakgrunnen. Alltid gi textDescription for skjermlesere.",
    notes: "Bruk Loader for hele side- og seksjonslasting. For knapper med innebygd laster, bruk Button sin loader-prop.",
    relatedIds: ["button"],
    props: [
        { name: "textDescription", type: "string", required: true, description: "Tilgjengelig beskrivelse for skjermlesere." },
        { name: "variant", type: '"small" | "medium" | "large"', required: false, default: '"medium"', description: "Størrelse på lasteren." },
        { name: "delay", type: "number", required: false, description: "Forsinkelse i millisekunder før lasteren vises." },
        { name: "inline", type: "boolean", required: false, description: "Viser lasteren inline." },
    ],
    examples: [
        {
            title: "Størrelser",
            description: "Loader i tre størrelser.",
            code: `<Flex gap="l" alignItems="center">
  <Loader variant="small" textDescription="Laster" />
  <Loader variant="medium" textDescription="Laster" />
  <Loader variant="large" textDescription="Laster" />
</Flex>`,
            tags: ["loading"],
            preview: (
                <Flex gap="l" alignItems="center">
                    <Loader variant="small" textDescription="Laster" />
                    <Loader variant="medium" textDescription="Laster" />
                    <Loader variant="large" textDescription="Laster" />
                </Flex>
            ),
        },
        {
            title: "Inline-laster",
            description: "Bruk inline for å vise lasteren som en del av tekst eller andre inline-elementer.",
            code: `<Flex gap="s" alignItems="center">
  <Loader variant="small" inline textDescription="Henter data" />
  <span>Henter forsikringsinformasjon…</span>
</Flex>`,
            preview: (
                <Flex gap="s" alignItems="center">
                    <Loader variant="small" inline textDescription="Henter data" />
                    <span>Henter forsikringsinformasjon…</span>
                </Flex>
            ),
        },
    ],
};

export default doc;
