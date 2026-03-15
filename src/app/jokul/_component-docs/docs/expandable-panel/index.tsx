import type { ComponentDoc } from "../types";
import { props } from "./props";
import { ExpandablePanelPreview } from "./preview";

const doc: ComponentDoc = {
    id: "expandable-panel",
    name: "Expandable Panel",
    package: "@fremtind/jokul/expander",
    category: "Visning",
    description: "ExpandablePanel er et utviddbart panel med header og innhold.",

    relationships: {
        alternatives: [{ id: "expander", description: "Bruk Expander for en lettere, innebygd utvid/skjul uten den innrammede panelbeholderen." }],
        subcomponents: [
            { id: "expandable-panel-header", description: "Klikkbar header som viser/skjuler innholdet." },
            { id: "expandable-panel-content", description: "Innholdsområdet som vises og skjules." },
        ],
    },

    preview: <ExpandablePanelPreview />,
    props,
};

export default doc;
