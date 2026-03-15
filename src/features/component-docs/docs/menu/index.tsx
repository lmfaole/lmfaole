import { useState, useEffect } from "react";
import { Menu, MenuItem, MenuItemCheckbox, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function MenuPreview() {
    const isHovered = usePreviewHovered();
    const [open, setOpen] = useState(false);
    useEffect(() => { setOpen(isHovered); }, [isHovered]);
    return (
        <Menu
            isOpen={open}
            onToggle={setOpen}
            triggerElement={<Button variant="secondary" icon={<Icon>more_vert</Icon>}>Handlinger</Button>}
        >
            <MenuItem>Rediger</MenuItem>
            <MenuItem>Dupliser</MenuItem>
            <MenuDivider />
            <MenuItem>Slett</MenuItem>
        </Menu>
    );
}

const doc: ComponentDoc = {
    id: "menu",
    name: "Menu",
    package: "@fremtind/jokul/menu",
    category: "Overlegg",
    status: "stable",
    description:
        "Menu er en dropdown-meny som åpnes av et trigger-element. Den støtter vanlige valg, separatorer og avkrysningselementer.",
    preview: <MenuPreview />,

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
