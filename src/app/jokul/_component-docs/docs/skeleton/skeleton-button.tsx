import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "skeleton-button",
    name: "SkeletonButton",
    package: "@fremtind/jokul/skeleton",
    category: "Tilbakemelding",
    standalone: false,
    description: "Plassholder som matcher bredde og høyde på en Button.",
    preview: null as any,
    props: [
        { name: "width", type: "string", required: false, source: "custom", status: "stable", description: "Bredde på knapp-plassholderen, f.eks. '8rem'." },
        { name: "children", type: "React.ReactNode", required: false, source: "react", status: "stable", description: "Valgfritt innhold." },
    ],
};

export default doc;
