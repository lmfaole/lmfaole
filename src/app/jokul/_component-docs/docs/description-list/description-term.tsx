import type { ComponentDoc } from "../types";
import { DescriptionTermPreview } from "./preview";

const doc: ComponentDoc = {
    id: "description-term",
    name: "DescriptionTerm",
    package: "@fremtind/jokul/description-list",
    category: "Visning",
    standalone: false,
    description: "Nøkkelen (dt) i et nøkkel-verdi-par.",
    preview: <DescriptionTermPreview />,
    props: [
        { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold for termen." },
    ],
};

export default doc;
