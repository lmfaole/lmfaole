"use client";
import { Tabs, Tab, TabList, TabPanel } from "@fremtind/jokul/tabs";
import { Card } from "@fremtind/jokul/card";

export function TabPreview() { return <TabsPreview />; }
export function TabListPreview() { return <TabsPreview />; }
export function TabPanelPreview() { return <TabsPreview />; }

export function TabsPreview() {
    return (
        <Tabs>
            <TabList>
                <Tab>Oversikt</Tab>
                <Tab>Detaljer</Tab>
                <Tab>Historikk</Tab>
            </TabList>
            <TabPanel><Card padding="l">Oversiktsinnhold</Card></TabPanel>
            <TabPanel><Card padding="l">Detaljert informasjon</Card></TabPanel>
            <TabPanel><Card padding="l">Historiske data</Card></TabPanel>
        </Tabs>
    );
}
