import type { ComponentDoc } from "../types";
import { PopoverTriggerPreview } from "./preview";

const doc: ComponentDoc = {
    id: "popover-trigger",
    name: "Popover.Trigger",
    package: "@fremtind/jokul/popover",
    category: "Overlegg",
    standalone: false,
    description: "Elementet som åpner og lukker popoveren. Rendrer som en <button> som standard. Aksepterer alle native HTML-attributter for det aktuelle elementet.",
    preview: <PopoverTriggerPreview />,
    props: [
        {
            name: "asChild",
            type: "boolean",
            required: false,
            default: "false",
            source: "custom",
            status: "stable",
            description: "Slår sammen trigger-props med child-elementet i stedet for å wrappe det i en <button>. Nyttig for lenker, ikoner og andre eksisterende elementer.",
        },
        {
            name: "children",
            type: "React.ReactNode",
            required: true,
            source: "react",
            status: "stable",
            description: "Innholdet i trigger-elementet.",
        },
    ],
};

export default doc;
