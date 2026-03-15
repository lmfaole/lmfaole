"use client";
import {useEffect, useState} from "react";
import {NavTab, NavTabs} from "@fremtind/jokul/tabs";
import {usePreviewHovered} from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function NavTabsPreview() {
    return <NavTabPreview/>;
}

export function NavTabPreview() {
    const isHovered = usePreviewHovered();
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!isHovered) {
            setActiveTab(0);
            return;
        }
        const id = setInterval(() => setActiveTab(t => (t + 1) % 4), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <NavTabs aria-label="Eksempel">
            <NavTab href="#" aria-selected={activeTab === 0}>Bil</NavTab>
            <NavTab href="#" aria-selected={activeTab === 1}>Hus</NavTab>
            <NavTab href="#" aria-selected={activeTab === 2}>Reise</NavTab>
            <NavTab href="#" aria-selected={activeTab === 3}>Båt</NavTab>
        </NavTabs>
    );
}
