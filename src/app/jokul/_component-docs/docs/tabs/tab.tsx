import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "tab",
    name: "Tab",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    standalone: false,
    description: "En enkelt fane-knapp.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold i fanen." },
    ],
};

export default doc;
