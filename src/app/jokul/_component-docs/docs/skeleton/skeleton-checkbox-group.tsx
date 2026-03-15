import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "skeleton-checkbox-group",
    name: "SkeletonCheckboxGroup",
    package: "@fremtind/jokul/skeleton",
    category: "Tilbakemelding",
    standalone: false,
    description: "Plassholder for en gruppe avkrysningsbokser.",
    preview: null as any,
    props: [
        { name: "checkboxes", type: "number", required: true, source: "custom", status: "stable", description: "Antall avkrysningsbokser som skal vises som plassholdere." },
    ],
};

export default doc;
