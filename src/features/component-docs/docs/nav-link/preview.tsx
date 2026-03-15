"use client";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function NavLinkPreview() {
    const isHovered = usePreviewHovered();
    const links = ["Oversikt", "Mine forsikringer", "Skademeldinger", "Profil"];
    const [activeIdx, setActiveIdx] = useState(0);
    useEffect(() => {
        if (!isHovered) { setActiveIdx(0); return; }
        let i = 0;
        const id = setInterval(() => { i = (i + 1) % links.length; setActiveIdx(i); }, 600);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Flex direction="column" gap="xs">
            {links.map((label, idx) => <NavLink key={label} href="#" active={idx === activeIdx}>{label}</NavLink>)}
        </Flex>
    );
}
