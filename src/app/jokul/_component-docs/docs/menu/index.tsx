import type { ComponentDoc } from "../types";
import { props } from "./props";
import { MenuPreview } from "./preview";

const doc: ComponentDoc = {
    id: "menu",
    name: "Menu",
    package: "@fremtind/jokul/menu",
    category: "Overlegg",
    status: "stable",
    description: {
        short: "Dropdown-meny som åpnes av et trigger-element.",
        long: "Menu er en dropdown-meny som åpnes av et trigger-element. Den støtter vanlige valg, separatorer og avkrysningselementer.",
    },
    preview: <MenuPreview />,
    relationships: {
        subcomponents: [
            { id: "menu-item", description: "Et valgbart element i menyen." },
            { id: "menu-item-checkbox", description: "Et avkrysningselement i menyen for å toggle tilstander." },
        ],
    },
    props,
};

export default doc;
