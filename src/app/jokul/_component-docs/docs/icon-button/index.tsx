import type { ComponentDoc } from "../types";
import { props } from "./props";
import { IconButtonPreview } from "./preview";

const doc: ComponentDoc = {
    id: "icon-button",
    name: "Icon Button",
    package: "@fremtind/jokul/icon-button",
    category: "Handling",
    status: "deprecated",
    description: {
        short: "IconButton er en knapp med kun ikon.",
        long: "IconButton er en knapp med kun ikon. Krev alltid en aria-label som beskriver handlingen.",
    },
    warnings: "Ikke bruk IconButton uten aria-label.",
    relationships: {
        alternatives: [{ id: "icon", description: "Bruk Icon når symbolet er rent dekorativt og ikke trenger å være et fokuserbart interaktivt element." }],
        related: [{ id: "button", description: "Button er motparten med tekstetikett; bruk den når en synlig etikett forbedrer klarheten for handlingen." }],
    },

    preview: <IconButtonPreview />,
    props,
};

export default doc;
