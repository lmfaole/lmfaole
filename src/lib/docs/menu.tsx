import React, { useState } from "react";
import { Menu, MenuItem, MenuItemCheckbox, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import type { ComponentDoc } from "./types";

function MenuBasicPreview() {
    return (
        <Menu triggerElement={<Button>Åpne meny</Button>}>
            <MenuItem>Rediger</MenuItem>
            <MenuItem>Dupliser</MenuItem>
            <MenuDivider />
            <MenuItem>Slett</MenuItem>
        </Menu>
    );
}

function MenuIconTriggerPreview() {
    return (
        <Menu triggerElement={<Button><Icon>more_vert</Icon></Button>}>
            <MenuItem>Innstillinger</MenuItem>
            <MenuItem>Profil</MenuItem>
            <MenuDivider />
            <MenuItem>Logg ut</MenuItem>
        </Menu>
    );
}

function MenuCheckboxPreview() {
    const [showGrid, setShowGrid] = useState(false);
    const [showLabels, setShowLabels] = useState(true);

    return (
        <Menu triggerElement={<Button>Visningsvalg</Button>}>
            <MenuItemCheckbox
                aria-checked={showGrid}
                onChange={(_e, pressed) => setShowGrid(pressed)}
            >
                Vis rutenett
            </MenuItemCheckbox>
            <MenuItemCheckbox
                aria-checked={showLabels}
                onChange={(_e, pressed) => setShowLabels(pressed)}
            >
                Vis etiketter
            </MenuItemCheckbox>
        </Menu>
    );
}

const doc: ComponentDoc = {
    id: "menu",
    name: "Menu",
    package: "@fremtind/jokul/menu",
    category: "Navigasjon",
    tags: ["dropdown", "meny", "navigasjon", "kontekstmeny"],
    status: "stable",
    description:
        "Menu er en dropdown-meny som åpnes av et trigger-element. Den støtter vanlige valg, separatorer og avkrysningselementer.",
    props: [
        {
            name: "triggerElement",
            type: "ReactNode",
            required: true,
            source: "custom",
            description: "Elementet som trigger menyen når det klikkes.",
        },
        {
            name: "children",
            type: "ReactNode",
            required: false,
            source: "react",
            description: "MenuItem, MenuItemCheckbox og MenuDivider elementer.",
        },
        {
            name: "initialPlacement",
            type: "string",
            required: false,
            source: "react",
            default: '"bottom-start"',
            description: "Startposisjon for menyen relativt til trigger.",
        },
        {
            name: "openOnHover",
            type: "boolean",
            required: false,
            source: "custom",
            default: "false",
            description: "Åpner menyen ved hover i stedet for klikk.",
        },
        {
            name: "keepOpenOnClickOutside",
            type: "boolean",
            required: false,
            source: "custom",
            default: "false",
            description: "Forhindrer at menyen lukkes ved klikk utenfor.",
        },
        {
            name: "onToggle",
            type: "(isOpen: boolean) => void",
            required: false,
            source: "react",
            description: "Kalles når menyen åpnes eller lukkes.",
        },
    ],
    subComponents: [
        {
            name: "MenuItem",
            description: "Et valgbart element i menyen.",
            props: [
                { name: "icon", type: "ReactNode", required: false, source: "custom", description: "Ikon som vises til venstre for teksten." },
                { name: "as", type: "ElementType", required: false, source: "custom", default: '"button"', description: "Polymorfisk prop for å endre underliggende element (f.eks. 'a' for lenker)." },
                { name: "expandable", type: "boolean", required: false, source: "custom", description: "Viser et ekspanderingsikon i elementet." },
                { name: "onClick", type: "React.MouseEventHandler", required: false, source: "react", description: "Kalles ved klikk på elementet." },
                { name: "children", type: "ReactNode", required: false, source: "react", description: "Tekst eller innhold i meny-elementet." },
            ],
        },
        {
            name: "MenuItemCheckbox",
            description: "Et avkrysningselement i menyen for å toggle tilstander.",
            props: [
                { name: "aria-checked", type: "boolean", required: false, source: "native", description: "Angir om elementet er huket av." },
                { name: "onChange", type: "(event: React.ChangeEvent, pressed: boolean) => void", required: false, source: "react", description: "Kalles når avkrysningsstatus endres." },
                { name: "children", type: "ReactNode", required: false, source: "react", description: "Tekst eller innhold i elementet." },
            ],
        },
    ],
    examples: [
        {
            title: "Grunnleggende meny",
            description: "En enkel meny med tre valg og en separator.",
            code: `import { Menu, MenuItem, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";

<Menu triggerElement={<Button>Åpne meny</Button>}>
    <MenuItem>Rediger</MenuItem>
    <MenuItem>Dupliser</MenuItem>
    <MenuDivider />
    <MenuItem>Slett</MenuItem>
</Menu>`,
            preview: <MenuBasicPreview />,
        },
        {
            title: "Med ikon-trigger",
            description: "Bruk et ikon-element som trigger for kontekstmenyer.",
            code: `import { Menu, MenuItem, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";

<Menu triggerElement={<Button><Icon>more_vert</Icon></Button>}>
    <MenuItem>Innstillinger</MenuItem>
    <MenuItem>Profil</MenuItem>
    <MenuDivider />
    <MenuItem>Logg ut</MenuItem>
</Menu>`,
            preview: <MenuIconTriggerPreview />,
        },
        {
            title: "Med avkrysning",
            description: "MenuItemCheckbox brukes til å toggle tilstander i menyen.",
            code: `import { useState } from "react";
import { Menu, MenuItemCheckbox } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";

function MenuWithCheckboxes() {
    const [showGrid, setShowGrid] = useState(false);
    const [showLabels, setShowLabels] = useState(true);

    return (
        <Menu triggerElement={<Button>Visningsvalg</Button>}>
            <MenuItemCheckbox
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
            >
                Vis rutenett
            </MenuItemCheckbox>
            <MenuItemCheckbox
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
            >
                Vis etiketter
            </MenuItemCheckbox>
        </Menu>
    );
}`,
            preview: <MenuCheckboxPreview />,
        },
    ],
};

export default doc;
