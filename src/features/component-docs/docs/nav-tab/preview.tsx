"use client";
import { NavTab, NavTabs } from "@fremtind/jokul/tabs";

export function NavTabPreview() {
    return (
        <NavTabs aria-label="Eksempel">
            <NavTab href="#" aria-selected>Aktiv</NavTab>
            <NavTab href="#">Inaktiv</NavTab>
        </NavTabs>
    );
}
