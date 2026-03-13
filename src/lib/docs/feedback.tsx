import React from "react";
import { Feedback } from "@fremtind/jokul/feedback";
import type { ComponentDoc } from "./types";

const SMILEY_OPTIONS = [
    { label: "Veldig dårlig", value: 1 },
    { label: "Dårlig", value: 2 },
    { label: "Nøytral", value: 3 },
    { label: "Bra", value: 4 },
    { label: "Veldig bra", value: 5 },
];

const RADIO_OPTIONS = [
    { label: "Ja", value: "yes" },
    { label: "Delvis", value: "partial" },
    { label: "Nei", value: "no" },
];

function FeedbackSmileyPreview() {
    return (
        <Feedback
            type="smiley"
            label="Hvordan var opplevelsen din?"
            options={SMILEY_OPTIONS}
            onSubmit={() => {}}
        />
    );
}

function FeedbackRadioPreview() {
    return (
        <Feedback
            type="radio"
            label="Fant du det du lette etter?"
            options={RADIO_OPTIONS}
            onSubmit={() => {}}
        />
    );
}

function FeedbackFollowUpPreview() {
    return (
        <Feedback
            type="smiley"
            label="Hvordan var opplevelsen din?"
            options={SMILEY_OPTIONS}
            addOnQuestion={{ label: "Hva kan vi gjøre bedre?" }}
            onSubmit={() => {}}
        />
    );
}

const doc: ComponentDoc = {
    id: "feedback",
    name: "Feedback",
    package: "@fremtind/jokul/feedback",
    category: "Skjema",
    tags: ["tilbakemelding", "vurdering", "smiley", "brukeropplevelse", "skjema"],
    status: "stable",
    description:
        "Feedback er en komponent for å samle inn tilbakemeldinger fra brukere. Den støtter smileys og radioknapper, og kan utvides med et oppfølgingsspørsmål.",
    props: [
        {
            name: "type",
            type: '"smiley" | "radio"',
            required: true,
            source: "custom",
            status: "stable",
            description: "Velger mellom smiley-vurdering og radioknapper.",
        },
        {
            name: "label",
            type: "string",
            required: true,
            source: "custom",
            status: "stable",
            description: "Spørsmålet som stilles til brukeren.",
        },
        {
            name: "options",
            type: "Array<{ label: string; value: string | number }>",
            required: true,
            source: "custom",
            status: "stable",
            description: "Alternativer brukeren kan velge. For smiley brukes value: number (1–5).",
        },
        {
            name: "onSubmit",
            type: "({ feedbackValue, intentionalSubmit, message? }: FeedbackSubmitEvent) => void",
            required: true,
            source: "react",
            status: "stable",
            description: "Kalles når brukeren sender inn tilbakemeldingen.",
        },
        {
            name: "addOnQuestion",
            type: "{ label: string }",
            required: false,
            source: "custom",
            status: "stable",
            description: "Oppfølgingsspørsmål med tekstfelt som vises etter valg.",
        },
    ],
    examples: [
        {
            title: "Smileys",
            description: "Fem smiley-ikoner for å vurdere opplevelsen.",
            code: `import { Feedback } from "@fremtind/jokul/feedback";

const SMILEY_OPTIONS = [
    { label: "Veldig dårlig", value: 1 },
    { label: "Dårlig", value: 2 },
    { label: "Nøytral", value: 3 },
    { label: "Bra", value: 4 },
    { label: "Veldig bra", value: 5 },
];

<Feedback
    type="smiley"
    label="Hvordan var opplevelsen din?"
    options={SMILEY_OPTIONS}
    onSubmit={({ feedbackValue, intentionalSubmit, message }) => {
        console.log("Tilbakemelding:", feedbackValue, intentionalSubmit, message);
    }}
/>`,
            preview: <FeedbackSmileyPreview />,
        },
        {
            title: "Radio-knapper",
            description: "Radioknapper for ja/nei-spørsmål.",
            code: `import { Feedback } from "@fremtind/jokul/feedback";

const RADIO_OPTIONS = [
    { label: "Ja", value: "yes" },
    { label: "Delvis", value: "partial" },
    { label: "Nei", value: "no" },
];

<Feedback
    type="radio"
    label="Fant du det du lette etter?"
    options={RADIO_OPTIONS}
    onSubmit={({ feedbackValue }) => {
        console.log("Svar:", feedbackValue);
    }}
/>`,
            preview: <FeedbackRadioPreview />,
        },
        {
            title: "Med oppfølgingsspørsmål",
            description: "addOnQuestion viser et tekstfelt etter at brukeren har gjort et valg.",
            code: `import { Feedback } from "@fremtind/jokul/feedback";

<Feedback
    type="smiley"
    label="Hvordan var opplevelsen din?"
    options={SMILEY_OPTIONS}
    addOnQuestion={{ label: "Hva kan vi gjøre bedre?" }}
    onSubmit={({ feedbackValue, message }) => {
        console.log("Vurdering:", feedbackValue, "Melding:", message);
    }}
/>`,
            preview: <FeedbackFollowUpPreview />,
        },
    ],
};

export default doc;
