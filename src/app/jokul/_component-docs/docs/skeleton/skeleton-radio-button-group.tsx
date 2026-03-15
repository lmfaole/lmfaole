import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "skeleton-radio-button-group",
    name: "SkeletonRadioButtonGroup",
    package: "@fremtind/jokul/skeleton",
    category: "Tilbakemelding",
    standalone: false,
    description: "Plassholder for en gruppe radioknapper.",
    preview: null as any,
    props: [
        { name: "radioButtons", type: "number", required: true, source: "custom", status: "stable", description: "Antall radioknapper som skal vises som plassholdere." },
    ],
};

export default doc;
