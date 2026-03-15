import type { ComponentDoc } from "../types";

const doc: ComponentDoc = {
    id: "description-detail",
    name: "DescriptionDetail",
    package: "@fremtind/jokul/description-list",
    category: "Visning",
    standalone: false,
    description: "Verdien (dd) i et nøkkel-verdi-par.",
    preview: null as any,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold for detaljen." },
    ],
};

export default doc;
