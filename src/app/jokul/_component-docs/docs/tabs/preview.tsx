"use client";
import {useEffect, useState} from "react";
import {Tab, TabList, TabPanel, Tabs} from "@fremtind/jokul/tabs";
import {Card} from "@fremtind/jokul/card";
import {usePreviewHovered} from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TabPreview() {
    return <TabsPreview/>;
}

export function TabListPreview() {
    return <TabsPreview/>;
}

export function TabPanelPreview() {
    return <TabsPreview/>;
}

export function TabsPreview() {
    const isHovered = usePreviewHovered();
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (!isHovered) {
            setTabIndex(0);
            return;
        }
        const id = setInterval(() => setTabIndex(i => (i + 1) % 4), 1200);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Tabs key={tabIndex} defaultTab={tabIndex}>
            <TabList>
                <Tab>Bil</Tab>
                <Tab>Hus</Tab>
                <Tab>Reise</Tab>
                <Tab>Båt</Tab>
            </TabList>
            <TabPanel><Card padding="l">Forsikring for din bil</Card></TabPanel>
            <TabPanel><Card padding="l">Sikre ditt hjem</Card></TabPanel>
            <TabPanel><Card padding="l">Trygghet på reisen</Card></TabPanel>
            <TabPanel><Card padding="l">Forsikring for båten din</Card></TabPanel>
        </Tabs>
    );
}
