import React, { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const progressSteps = [0, 25, 50, 75, 100];

function ProgressBarPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) {
            setStep(0);
            return;
        }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % progressSteps.length), 800);
        return () => clearInterval(id);
    }, [isHovered]);
    const value = progressSteps[step];
    return (
        <ProgressBar
            aria-valuenow={value}
            title="Fremdrift"
            aria-valuetext={`${value} prosent fullført`}
        />
    );
}

const doc: ComponentDoc = {
    id: "progress-bar",
    name: "ProgressBar",
    package: "@fremtind/jokul/progress-bar",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring"],
    description: "ProgressBar viser fremgang i en prosess.",
    warnings: "Gi alltid en beskrivende title og aria-valuetext for skjermlesere.",
    preview: <ProgressBarPreview />,
    props: [
        { name: "aria-valuenow", type: "number", required: true, source: "aria", status: "stable", description: "Gjeldende fremgangsverdi." },
        { name: "aria-valuemin", type: "number", required: false, source: "aria", status: "stable", default: "0", description: "Minimumsverdi." },
        { name: "aria-valuemax", type: "number", required: false, source: "aria", status: "stable", default: "100", description: "Maksimumsverdi." },
        { name: "title", type: "string", required: false, source: "custom", status: "stable", default: '"Fremdrift"', description: "Synlig tittel over fremdriftslinjen." },
        { name: "aria-valuetext", type: "string", required: false, source: "aria", status: "stable", description: "Menneskelig lesbar verdi for skjermlesere." },
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
