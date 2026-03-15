import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "skeleton-text-area",
    name: "SkeletonTextArea",
    package: "@fremtind/jokul/skeleton",
    category: "Tilbakemelding",
    standalone: false,
    description: "Plassholder som matcher bredde og høyde på et TextArea-felt.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Valgfritt innhold." },
    ],
};

export default doc;
