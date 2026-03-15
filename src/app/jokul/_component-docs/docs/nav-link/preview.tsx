"use client";
import { useState, useEffect } from "react";
import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const links = ["Oversikt", "Mine forsikringer", "Skademeldinger", "Profil"];

export function NavLinkPreview() {
    const isHovered = usePreviewHovered();
    const [activeIdx, setActiveIdx] = useState(0);

    useEffect(() => {
        if (!isHovered) { setActiveIdx(0); return; }
        const id = setInterval(() => setActiveIdx(i => (i + 1) % links.length), 900);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <Flex direction="column" gap="xs">
            {links.map((label, idx) => <NavLink key={label} href="#" active={idx === activeIdx}>{label}</NavLink>)}
        </Flex>
    );
}
