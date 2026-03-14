import { useState } from "react";
import { Menu, MenuItem, MenuItemCheckbox, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

const doc: ComponentDoc = {
    id: "menu",
    name: "Menu",
    package: "@fremtind/jokul/menu",
    category: "Overlegg",
    status: "stable",
    description:
        "Menu er en dropdown-meny som åpnes av et trigger-element. Den støtter vanlige valg, separatorer og avkrysningselementer.",
    preview: (
        <div style={{ display: "inline-flex", flexDirection: "column", gap: "4px", minWidth: "160px" }}>
            <Button variant="secondary" icon={<Icon>more_vert</Icon>}>Handlinger</Button>
            <ul style={{ background: "var(--jkl-color-background-default)", border: "1px solid var(--jkl-color-border-default)", borderRadius: "4px", padding: "4px 0", margin: 0, listStyle: "none" }}>
                <li style={{ padding: "10px 16px" }}>Rediger</li>
                <li style={{ padding: "10px 16px" }}>Dupliser</li>
                <li style={{ height: "1px", background: "var(--jkl-color-border-default)", margin: "4px 0" }} />
                <li style={{ padding: "10px 16px", color: "var(--jkl-color-text-negative)" }}>Slett</li>
            </ul>
        </div>
    ),

    props,
    subComponents: [
        {
            name: "MenuItem",
            description: "Et valgbart element i menyen.",
            props: [
                { name: "icon", type: "ReactNode", required: false, source: "custom", status: "stable", description: "Ikon som vises til venstre for teksten." },
                { name: "as", type: "ElementType", required: false, source: "custom", status: "stable", default: '"button"', description: "Polymorfisk prop for å endre underliggende element (f.eks. 'a' for lenker)." },
                { name: "expandable", type: "boolean", required: false, source: "custom", status: "stable", description: "Viser et ekspanderingsikon i elementet." },
                { name: "onClick", type: "React.MouseEventHandler", required: false, source: "react", status: "stable", description: "Kalles ved klikk på elementet." },
                { name: "children", type: "ReactNode", required: false, source: "react", status: "stable", description: "Tekst eller innhold i meny-elementet." },
            ],
        },
        {
            name: "MenuItemCheckbox",
            description: "Et avkrysningselement i menyen for å toggle tilstander.",
            props: [
                { name: "aria-checked", type: "boolean", required: false, source: "native", status: "stable", description: "Angir om elementet er huket av." },
                { name: "onChange", type: "(event: React.ChangeEvent, pressed: boolean) => void", required: false, source: "react", status: "stable", description: "Kalles når avkrysningsstatus endres." },
                { name: "children", type: "ReactNode", required: false, source: "react", status: "stable", description: "Tekst eller innhold i elementet." },
            ],
        },
    ],
    examples,
};

export default doc;
