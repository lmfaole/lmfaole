import type { ComponentDoc } from "../types";
import { props } from "./props";
import { SkeletonPreview } from "./preview";

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
    relationships: {
        alternatives: [{ id: "loader", description: "Bruk Loader som et snurreoverlegg når den nøyaktige innholdsformen ikke kan forutsies på forhånd." }],
        related: [{ id: "feedback", description: "Kombiner med Feedback-mønstre for å kommunisere ladetilstand på tvers av en hel sideseksjon." }],
    },
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
};

export default doc;
