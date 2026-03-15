"use client";
import { useState, useEffect } from "react";
import { Menu, MenuItem, MenuDivider } from "@fremtind/jokul/menu";
import { Button } from "@fremtind/jokul/button";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function MenuPreview() {
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
