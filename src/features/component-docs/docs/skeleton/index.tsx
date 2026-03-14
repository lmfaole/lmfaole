import { useState, useEffect, useCallback } from "react";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import {
    SkeletonAnimation,
    SkeletonElement,
    SkeletonInput,
    SkeletonButton,
    SkeletonTextArea,
    SkeletonCheckboxGroup,
    SkeletonRadioButtonGroup,
} from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { CardBasicPreview } from "../card/examples";
import { TableBasicPreview } from "../table/examples";
import { DescriptionListContactPreview } from "../description-list/examples";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

function SkeletonPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);
    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 2), 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    if (step === 1) {
        return (
            <div style={{ maxWidth: "320px" }}>
                <Flex direction="column" gap="m">
                    <p style={{ margin: 0, fontWeight: "bold" }}>Bilforsikring kasko</p>
                    <p style={{ margin: 0 }}>Månedspremie: 542 kr</p>
                    <Button variant="secondary" style={{ width: "8rem" }}>Se detaljer</Button>
                </Flex>
            </div>
        );
    }
    return (
        <SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "320px" }}>
            <Flex direction="column" gap="m">
                <SkeletonInput />
                <SkeletonInput />
                <SkeletonButton width="8rem" />
            </Flex>
        </SkeletonAnimation>
    );
}

const doc: ComponentDoc = {
    id: "skeleton",
    name: "Skeleton",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    status: "stable",
    description:
        "Skeleton-komponenter bygger opp et innholdsskjelett som matcher layouten til det virkelige innholdet, og gir brukeren en visuell indikasjon på at innhold er på vei.",
    warnings:
        "Wrap alltid Skeleton-komponenter i SkeletonAnimation for å få shimmering-animasjon og en tilgjengelig textDescription for skjermlesere. Bruk SkeletonElement for freeform rektangel-plassholdere.",
    relatedIds: ["loader", "feedback"],
    preview: <SkeletonPreview />,

    props,
    subComponents: [
        {
            name: "SkeletonElement",
            description: "Freeform rektangulær eller sirkulær plassholder med tilpassbar størrelse. Bruk for alt som ikke har en dedikert Skeleton-variant.",
            props: [
                { name: "width", type: "number | string", required: true, source: "custom", status: "stable", description: "Bredde på plassholderen, f.eks. '100%' eller '8rem'." },
                { name: "height", type: "number | string", required: true, source: "custom", status: "stable", description: "Høyde på plassholderen." },
                { name: "shape", type: '"rect" | "circle"', required: false, source: "custom", status: "stable", default: '"rect"', description: "Form på plassholderen. Bruk circle for avatarer og ikoner." },
                { name: "style", type: "React.CSSProperties", required: false, source: "react", status: "stable", description: "Inline stilsetting." },
            ],
        },
        {
            name: "SkeletonInput",
            description: "Plassholder som matcher bredde og høyde på et TextInput-felt.",
            props: [
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonButton",
            description: "Plassholder som matcher bredde og høyde på en Button.",
            props: [
                { name: "width", type: "string", required: false, source: "custom", status: "stable", description: "Bredde på knapp-plassholderen, f.eks. '8rem'." },
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonTextArea",
            description: "Plassholder som matcher bredde og høyde på et TextArea-felt.",
            props: [
                { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonCheckboxGroup",
            description: "Plassholder for en gruppe avkrysningsbokser.",
            props: [
                { name: "checkboxes", type: "number", required: true, source: "custom", status: "stable", description: "Antall avkrysningsbokser som skal vises som plassholdere." },
            ],
        },
        {
            name: "SkeletonRadioButtonGroup",
            description: "Plassholder for en gruppe radioknapper.",
            props: [
                { name: "radioButtons", type: "number", required: true, source: "custom", status: "stable", description: "Antall radioknapper som skal vises som plassholdere." },
            ],
        },
    ],
    examples,
};

export default doc;
