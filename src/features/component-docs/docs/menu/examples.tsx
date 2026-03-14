import { useState } from "react";
import { Menu, MenuItem, MenuItemCheckbox, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import type { ComponentExample } from "../types";


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


export const examples: ComponentExample[] = [
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
            }
];
