import React from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "progress-bar",
    name: "ProgressBar",
    package: "@fremtind/jokul/progress-bar",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring"],
    description: "ProgressBar viser fremgang i en prosess.",
    notes: "Gi alltid en beskrivende title og aria-valuetext for skjermlesere.",
    props: [
        { name: "aria-valuenow", type: "number", required: true, source: "native", description: "Gjeldende fremgangsverdi." },
        { name: "aria-valuemin", type: "number", required: false, source: "native", default: "0", description: "Minimumsverdi." },
        { name: "aria-valuemax", type: "number", required: false, source: "native", default: "100", description: "Maksimumsverdi." },
        { name: "title", type: "string", required: false, source: "custom", default: '"Fremdrift"', description: "Synlig tittel over fremdriftslinjen." },
        { name: "aria-valuetext", type: "string", required: false, source: "native", description: "Menneskelig lesbar verdi for skjermlesere." },
    ],
    examples: [
        {
            title: "Fremdriftsvisning",
            description: "ProgressBar på 60%.",
            code: `<ProgressBar
    aria-valuenow={60}
    title="Laster opp fil"
    aria-valuetext="60 prosent lastet opp"
/>`,
            tags: ["loading"],
            preview: (
                <ProgressBar
                    aria-valuenow={60}
                    title="Laster opp fil"
                    aria-valuetext="60 prosent lastet opp"
                />
            ),
        },
        {
            title: "Steg i skjema",
            description: "Bruk ProgressBar for å vise fremdrift i flertrinnsskjema.",
            code: `<ProgressBar
    aria-valuenow={2}
    aria-valuemax={4}
    title="Steg 2 av 4"
    aria-valuetext="Steg 2 av 4: Kontaktinformasjon"
/>`,
            preview: (
                <ProgressBar
                    aria-valuenow={2}
                    aria-valuemax={4}
                    title="Steg 2 av 4"
                    aria-valuetext="Steg 2 av 4: Kontaktinformasjon"
                />
            ),
        },
    ],
};

export default doc;
