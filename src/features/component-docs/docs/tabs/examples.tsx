import { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@fremtind/jokul/tabs";
import { Card } from "@fremtind/jokul/card";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


function TabsWithListener() {
    const [activeTab, setActiveTab] = useState(0);
    const tabNames = ["Personlig", "Bedrift", "Landbruk"];
    return (
        <Flex direction="column" gap="s">
            <p>Aktiv fane: {tabNames[activeTab]}</p>
            <Tabs defaultTab={0} onChange={setActiveTab}>
                <TabList>
                    <Tab>Personlig</Tab>
                    <Tab>Bedrift</Tab>
                    <Tab>Landbruk</Tab>
                </TabList>
                <TabPanel><Card padding="l"><p>Forsikringer for privatpersoner.</p></Card></TabPanel>
                <TabPanel><Card padding="l"><p>Forsikringer for bedrifter.</p></Card></TabPanel>
                <TabPanel><Card padding="l"><p>Forsikringer for landbruk.</p></Card></TabPanel>
            </Tabs>
        </Flex>
    );
}


export const examples: ComponentExample[] = [
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
        <Card padding="l">
          <p>Oversiktsinnhold vises her.</p>
        </Card>
      </TabPanel>
      <TabPanel>
        <Card padding="l">
          <p>Detaljert informasjon vises her.</p>
        </Card>
      </TabPanel>
      <TabPanel>
        <Card padding="l">
          <p>Historikk vises her.</p>
        </Card>
      </TabPanel>
    </Tabs>`,
                preview: (
                    <Tabs defaultTab={0}>
                        <TabList>
                            <Tab>Oversikt</Tab>
                            <Tab>Detaljer</Tab>
                            <Tab>Historikk</Tab>
                        </TabList>
                        <TabPanel><Card padding="l"><p>Oversiktsinnhold vises her.</p></Card></TabPanel>
                        <TabPanel><Card padding="l"><p>Detaljert informasjon vises her.</p></Card></TabPanel>
                        <TabPanel><Card padding="l"><p>Historikk vises her.</p></Card></TabPanel>
                    </Tabs>
                ),
            },
    {
                title: "Med standardfane",
                description: "Tabs der en annen fane enn den første er aktiv ved innlasting.",
                code: `<Tabs defaultTab={1}>
      <TabList>
        <Tab>Aktive avtaler</Tab>
        <Tab>Utgåtte avtaler</Tab>
        <Tab>Avsluttede avtaler</Tab>
      </TabList>
      <TabPanel>
        <Card padding="l">
          <p>Dine aktive forsikringsavtaler vises her.</p>
        </Card>
      </TabPanel>
      <TabPanel>
        <Card padding="l">
          <p>Forsikringsavtaler som har gått ut vises her.</p>
        </Card>
      </TabPanel>
      <TabPanel>
        <Card padding="l">
          <p>Avsluttede forsikringsavtaler vises her.</p>
        </Card>
      </TabPanel>
    </Tabs>`,
                preview: (
                    <Tabs defaultTab={1}>
                        <TabList>
                            <Tab>Aktive avtaler</Tab>
                            <Tab>Utgåtte avtaler</Tab>
                            <Tab>Avsluttede avtaler</Tab>
                        </TabList>
                        <TabPanel><Card padding="l"><p>Dine aktive forsikringsavtaler vises her.</p></Card></TabPanel>
                        <TabPanel><Card padding="l"><p>Forsikringsavtaler som har gått ut vises her.</p></Card></TabPanel>
                        <TabPanel><Card padding="l"><p>Avsluttede forsikringsavtaler vises her.</p></Card></TabPanel>
                    </Tabs>
                ),
            },
    {
                title: "Med endringslytter",
                description: "Tabs med onChange-handler for å reagere på faneskift.",
                code: `const [activeTab, setActiveTab] = React.useState(0);
    const tabNames = ["Personlig", "Bedrift", "Landbruk"];

    <>
      <p>Aktiv fane: {tabNames[activeTab]}</p>
      <Tabs defaultTab={0} onChange={setActiveTab}>
        <TabList>
          <Tab>Personlig</Tab>
          <Tab>Bedrift</Tab>
          <Tab>Landbruk</Tab>
        </TabList>
        <TabPanel>
          <Card padding="l">
            <p>Forsikringer for privatpersoner.</p>
          </Card>
        </TabPanel>
        <TabPanel>
          <Card padding="l">
            <p>Forsikringer for bedrifter.</p>
          </Card>
        </TabPanel>
        <TabPanel>
          <Card padding="l">
            <p>Forsikringer for landbruk.</p>
          </Card>
        </TabPanel>
      </Tabs>
    </>`,
                tags: ["controlled"],
                preview: <TabsWithListener />,
            }
];
