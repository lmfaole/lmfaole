import { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@fremtind/jokul/tabs";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

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
    },

    props,
    subComponents: [
        {
            name: "TabList",
            description: "Wrapper som inneholder Tab-elementene.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tab-elementer." },
            ],
        },
        {
            name: "Tab",
            description: "En enkelt fane-knapp.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Tekst eller innhold i fanen." },
            ],
        },
        {
            name: "TabPanel",
            description: "Innholdsområdet tilknyttet en fane.",
            props: [
                { name: "children", type: "React.ReactNode", required: true, source: "react", status: "stable", description: "Innholdet som vises når fanen er aktiv." },
                { name: "tabIndex", type: "number", required: false, source: "native", status: "stable", description: "Overstyrer tabIndex på panelet." },
            ],
        },
    ],
    examples,
};

export default doc;
