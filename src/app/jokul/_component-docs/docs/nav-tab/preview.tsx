"use client";
import { useState, useEffect } from "react";
import { NavTab, NavTabs } from "@fremtind/jokul/tabs";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function NavTabsPreview() { return <NavTabPreview />; }

export function NavTabPreview() {
    const isHovered = usePreviewHovered();
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (!isHovered) { setActiveTab(0); return; }
        const id = setInterval(() => setActiveTab(t => (t === 0 ? 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <NavTabs aria-label="Eksempel">
            <NavTab href="#" aria-selected={activeTab === 0}>Aktiv</NavTab>
            <NavTab href="#" aria-selected={activeTab === 1}>Inaktiv</NavTab>
        </NavTabs>
    );
}
