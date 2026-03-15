"use client";
import { useState, useEffect } from "react";
import { Tabs, Tab, TabList, TabPanel } from "@fremtind/jokul/tabs";
import { Card } from "@fremtind/jokul/card";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TabPreview() { return <TabsPreview />; }
export function TabListPreview() { return <TabsPreview />; }
export function TabPanelPreview() { return <TabsPreview />; }

export function TabsPreview() {
    const isHovered = usePreviewHovered();
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (!isHovered) { setTabIndex(0); return; }
        const id = setInterval(() => setTabIndex(i => (i + 1) % 3), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Tabs key={tabIndex} defaultTab={tabIndex}>
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
