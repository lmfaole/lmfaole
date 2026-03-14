import { useState, useEffect, useRef } from "react";
import { Feedback } from "@fremtind/jokul/feedback";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

const SMILEY_OPTIONS = [
    { label: "Svært misfornøyd", value: "1" },
    { label: "Misfornøyd", value: "2" },
    { label: "Nøytral", value: "3" },
    { label: "Fornøyd", value: "4" },
    { label: "Svært fornøyd", value: "5" },
];

const RADIO_OPTIONS = [
    { label: "Ja", value: "yes" },
    { label: "Nei", value: "no" },
    { label: "Vet ikke", value: "unknown" },
];

export function FeedbackSmileyPreview() {
    const isHovered = usePreviewHovered();
    const ref = useRef<HTMLDivElement>(null);
    const [step, setStep] = useState(-1);

    useEffect(() => {
        if (!isHovered) {
            // deselect by clicking current selection again, or just remount via key
            setStep(-1);
            return;
        }
        setStep(0);
        let i = 0;
        const id = setInterval(() => {
            i = (i + 1) % SMILEY_OPTIONS.length;
            setStep(i);
        }, 900);
        return () => clearInterval(id);
    }, [isHovered]);

    // Imperatively click the radio input for the current step
    useEffect(() => {
        if (step < 0 || !ref.current) return;
        const radios = ref.current.querySelectorAll<HTMLInputElement>('input[type="radio"]');
        radios[step]?.click();
    }, [step]);

    return (
        <div ref={ref}>
            <Feedback
                type="smiley"
                label="Hvordan var opplevelsen din?"
                options={SMILEY_OPTIONS}
                onSubmit={() => {}}
            />
        </div>
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

export const examples: ComponentExample[] = [
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
            }
];
