import type { ComponentDoc } from "../types";
import { props } from "./props";
import { migrations } from "./migration";
import { IconPreview } from "./preview";

const doc: ComponentDoc = {
    id: "icon",
    name: "Icon",
    package: "@fremtind/jokul/icon",
    category: "Visning",
    description: "Icon rendrer Material Symbols-ikoner. Gi navnet på ikonet som child-tekst.",
    warnings: "Et ikon uten ledsagende tekst må ha aria-label — ellers er det usynlig for skjermlesere.",

    preview: <IconPreview />,
    props,
    migrations,
    relationships: {
        alternatives: [{ id: "icon-button", description: "Bruk IconButton når ikonet må være interaktivt og trenger en tilgjengelig knappeetikett." }],
    }
};

export default doc;
