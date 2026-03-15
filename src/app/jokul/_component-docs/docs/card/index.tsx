import type { ComponentDoc } from "../types";
import { props } from "./props";
import { CardPreview } from "./preview";

const doc: ComponentDoc = {
    id: "card",
    name: "Card",
    package: "@fremtind/jokul/card",
    category: "Visning",
    description: {
        short: "Overflate-komponent som grupperer relatert innhold i et visuelt avgrenset område.",
        long: "Card er en overflate-komponent som grupperer relatert innhold i et visuelt avgrenset område. Den gir bakgrunn, ramme og padding via padding-proppen. Card gjør ikke antagelser om innhold — det er opp til deg å strukturere innholdet med Flex, overskrifter og andre komponenter.",
    },
    warnings: "Ikke legg interaktive elementer (knapper, lenker) inne i et clickable Card — det skaper nested interactives som er ugyldige i HTML og problematiske for skjermlesere.",
    relationships: {
        subcomponents: [{ id: "card-image", description: "Legg til CardImage øverst i kortet for et fremtredende herobilde." }],
        related: [{ id: "flex", description: "Wrapper Card-elementer i Flex for å kontrollere mellomrom og justering i et kortgitter." }],
    },
    preview: <CardPreview />,

    props,
};

export default doc;
