import React from "react";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "tabs",
    name: "Tabs",
    package: "@fremtind/jokul/tabs",
    category: "Navigasjon",
    description: "Tabs organiser innhold i faner der kun én fane vises om gangen.",
    notes: "Bruk Tabs for å skjule innhold, ikke for navigasjon mellom sider.",
    relatedIds: ["nav-link"],
    props: [
        { name: "defaultTab", type: "number", required: false, default: "0", description: "Initialt aktiv fane (indeks)." },
        { name: "onChange", type: "(index: number) => void", required: false, description: "Kalles ved faneskift." },
        { name: "children", type: "React.ReactNode", required: true, description: "TabList og TabPanel-elementer." },
    ],
    examples: [
        {
            title: "Grunnleggende faner",
            description: "Tre faner med innhold.",
            code: `<Tabs defaultTab={0}>
  <TabList>
    <Tab>Oversikt</Tab>
    <Tab>Detaljer</Tab>
    <Tab>Historikk</Tab>
  </TabList>
  <TabPanel>
    <p>Oversiktsinnhold vises her.</p>
  </TabPanel>
  <TabPanel>
    <p>Detaljert informasjon vises her.</p>
  </TabPanel>
  <TabPanel>
    <p>Historikk vises her.</p>
  </TabPanel>
</Tabs>`,
        },
    ],
};

export default doc;
