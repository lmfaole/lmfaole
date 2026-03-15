import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "expandable-panel-header",
    name: "ExpandablePanel.Header",
    package: "@fremtind/jokul/expandable-panel",
    category: "Visning",
    standalone: false,
    description: "Klikkbar header som viser/skjuler innholdet. Rendres som en knapp.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tittelinnholdet i headeren." },
        { name: "icon", type: "React.ReactNode", required: false, source: "custom", status: "stable", description: "Egendefinert ikon i stedet for standard chevron." },
    ],
};

export default doc;
