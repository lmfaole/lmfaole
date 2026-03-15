import type { ComponentDoc } from "../types";
import { SkeletonRadioButtonGroupPreview } from "./preview";

const doc: ComponentDoc = {
    id: "skeleton-radio-button-group",
    name: "SkeletonRadioButtonGroup",
    package: "@fremtind/jokul/skeleton",
    category: "Tilbakemelding",
    standalone: false,
    description: "Plassholder for en gruppe radioknapper.",
    preview: <SkeletonRadioButtonGroupPreview />,
    props: [
        { name: "radioButtons", type: "number", required: true, source: "custom", status: "stable", description: "Antall radioknapper som skal vises som plassholdere." },
    ],
};

export default doc;
