"use client";
import React from "react";
import {
    Loader,
    SkeletonAnimation,
    SkeletonElement,
    SkeletonInput,
    SkeletonButton,
    SkeletonTextArea,
    SkeletonCheckboxGroup,
    SkeletonRadioButtonGroup,
} from "@fremtind/jokul/loader";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

function SkeletonFormPreview() {
    return (
        <SkeletonAnimation textDescription="Laster skjema…" style={{ maxWidth: "24rem" }}>
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonTextArea />
        <SkeletonButton width="8rem" />
        </SkeletonAnimation>
    );
}

function SkeletonListPreview() {
    return (
        <SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "32rem" }}>
            <Flex direction="column" gap="s">
                {[1, 2, 3].map((i) => (
                    <SkeletonElement key={i} width="100%" height="4rem" />
                ))}
            </Flex>
        </SkeletonAnimation>
    );
}

const doc: ComponentDoc = {
    id: "loader",
    name: "Loader / Skeleton",
    package: "@fremtind/jokul/loader",
    category: "Tilbakemelding",
    tags: ["animasjon", "feedback", "tilstandsstyring", "skeleton", "laster"],
    status: "stable",
    description:
        "Pakken eksporterer både Loader (spinner) og Skeleton-komponenter. Loader brukes til generell lasting; Skeleton-komponentene bygger opp et innholdsskjelett som matcher layouten til det virkelige innholdet.",
    notes:
        "Wrap alltid Skeleton-komponenter i SkeletonAnimation for å få shimmering-animasjon og en tilgjengelig textDescription for skjermlesere. Bruk SkeletonElement for freeform rektangel-plassholdere.",
    relatedIds: ["button", "feedback"],
    props: [
        { name: "textDescription", type: "string", required: true, source: "custom", description: "Tilgjengelig beskrivelse for skjermlesere." },
        { name: "variant", type: '"small" | "medium" | "large"', required: false, source: "custom", default: '"medium"', description: "Størrelse på spinner-lasteren." },
        { name: "delay", type: "number", required: false, source: "custom", default: "0", description: "Forsinkelse i ms før komponenten vises. Unngår flimmer ved raske operasjoner." },
        { name: "inline", type: "boolean", required: false, source: "custom", default: "false", description: "Viser lasteren som et inline-element." },
    ],
    subComponents: [
        {
            name: "SkeletonAnimation",
            description: "Wrapper som gir shimmering-animasjon og tilgjengelighet til innholdet.",
            props: [
                { name: "textDescription", type: "string", required: true, source: "aria", description: "Tilgjengelig beskrivelse for skjermlesere mens innhold lastes." },
                { name: "children", type: "React.ReactNode", required: true, source: "react", description: "Skeleton-komponenter som skal animeres." },
                { name: "style", type: "React.CSSProperties", required: false, source: "react", description: "Inline stilsetting for wrapper-elementet." },
            ],
        },
        {
            name: "SkeletonElement",
            description: "Freeform rektangulær plassholder med tilpassbar størrelse og form.",
            props: [
                { name: "width", type: "number | string", required: true, source: "custom", description: "Bredde på plassholderen." },
                { name: "height", type: "number | string", required: true, source: "custom", description: "Høyde på plassholderen." },
                { name: "shape", type: '"rect" | "circle"', required: false, source: "custom", default: '"rect"', description: "Form på plassholderen. Bruk circle for avatarer og ikoner." },
                { name: "style", type: "React.CSSProperties", required: false, source: "react", description: "Inline stilsetting." },
            ],
        },
        {
            name: "SkeletonInput",
            description: "Plassholder som matcher bredde og høyde på et TextInput-felt.",
            props: [
                { name: "children", type: "React.ReactNode", required: false, source: "react", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonButton",
            description: "Plassholder som matcher bredde og høyde på en Button.",
            props: [
                { name: "children", type: "React.ReactNode", required: false, source: "react", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonTextArea",
            description: "Plassholder som matcher bredde og høyde på et TextArea-felt.",
            props: [
                { name: "children", type: "React.ReactNode", required: false, source: "react", description: "Valgfritt innhold." },
            ],
        },
        {
            name: "SkeletonCheckboxGroup",
            description: "Plassholder for en gruppe avkrysningsbokser.",
            props: [
                { name: "checkboxes", type: "number", required: true, source: "custom", description: "Antall avkrysningsbokser som skal vises som plassholdere." },
            ],
        },
        {
            name: "SkeletonRadioButtonGroup",
            description: "Plassholder for en gruppe radioknapper.",
            props: [
                { name: "radioButtons", type: "number", required: true, source: "custom", description: "Antall radioknapper som skal vises som plassholdere." },
            ],
        },
    ],
    examples: [
        {
            title: "Loader – størrelser",
            description: "Spinner-lasteren finnes i tre størrelser.",
            code: `<Flex gap="l" alignItems="center">
  <Loader variant="small" textDescription="Laster" />
  <Loader variant="medium" textDescription="Laster" />
  <Loader variant="large" textDescription="Laster" />
</Flex>`,
            preview: (
                <Flex gap="l" alignItems="center">
                    <Loader variant="small" textDescription="Laster" />
                    <Loader variant="medium" textDescription="Laster" />
                    <Loader variant="large" textDescription="Laster" />
                </Flex>
            ),
        },
        {
            title: "Loader – inline",
            description: "Bruk inline for å vise lasteren som en del av tekst.",
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
        {
            title: "Skeleton – skjema",
            description:
                "SkeletonAnimation wrapper gir animasjon og tilgjengelighet. SkeletonInput, SkeletonTextArea og SkeletonButton matcher vanlige skjemaelementer.",
            code: `<SkeletonAnimation textDescription="Laster skjema…" style={{ maxWidth: "24rem" }}>
  <SkeletonInput />
  <SkeletonInput />
  <SkeletonTextArea />
  <SkeletonButton />
</SkeletonAnimation>`,
            preview: <SkeletonFormPreview />,
        },
        {
            title: "Skeleton – kortliste",
            description: "SkeletonElement brukes for freeform rektangulære plassholdere.",
            code: `<SkeletonAnimation textDescription="Laster innhold…" style={{ maxWidth: "32rem" }}>
  <Flex direction="column" gap="s">
    {[1, 2, 3].map((i) => (
      <SkeletonElement key={i} width="100%" height="4rem" />
    ))}
  </Flex>
</SkeletonAnimation>`,
            preview: <SkeletonListPreview />,
        },
        {
            title: "Skeleton – valggrupper",
            description: "SkeletonCheckboxGroup og SkeletonRadioButtonGroup matcher flervalgslister.",
            code: `<SkeletonAnimation textDescription="Laster valg…">
  <Flex gap="xl">
    <SkeletonCheckboxGroup checkboxes={3} />
    <SkeletonRadioButtonGroup radioButtons={3} />
  </Flex>
</SkeletonAnimation>`,
            preview: (
                <SkeletonAnimation textDescription="Laster valg…">
                    <Flex gap="xl">
                        <SkeletonCheckboxGroup checkboxes={3} />
                        <SkeletonRadioButtonGroup radioButtons={3} />
                    </Flex>
                </SkeletonAnimation>
            ),
        },
    ],
};

export default doc;
