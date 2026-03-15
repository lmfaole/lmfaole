import type { ComponentDoc } from "../types";
import { props } from "./props";
import { TabsPreview } from "./preview";

const doc: ComponentDoc = {
    id: "tabs",
    name: "Tabs",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    description: "Tabs organiser innhold i faner der kun én fane vises om gangen.",
    warnings: "Bruk Tabs for å skjule innhold innenfor samme side — ikke for navigasjon mellom sider.",
    relationships: {
        alternatives: [{ id: "nav-tab", description: "Bruk NavTab når navigasjon er sideruting fremfor bytte av innholdspaneler på siden." }],
        related: [{ id: "nav-link", description: "NavLink gir individuelle navigasjonslenker som Tabs kan supplere med innholdspanelbytte." }],
        subcomponents: [
            { id: "tab-list", description: "Wrapper som inneholder Tab-elementene." },
            { id: "tab", description: "En enkelt fane-knapp." },
            { id: "tab-panel", description: "Innholdsområdet tilknyttet en fane." },
        ],
    },

    preview: <TabsPreview />,
    props,
};

export default doc;
