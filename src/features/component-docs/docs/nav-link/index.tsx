import { NavLink } from "@fremtind/jokul/nav-link";
import { Flex } from "@fremtind/jokul/flex";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";

function NavLinkPreview() {
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

const doc: ComponentDoc = {
    id: "nav-link",
    name: "Nav Link",
    package: "@fremtind/jokul/nav-link",
    category: "Navigasjon",
    description: "NavLink er en navigasjonslenke med tydelig aktiv tilstand. Brukes i navigasjonsmeny og sidefelt.",
    relationships: {
        alternatives: [{ id: "link", description: "Bruk Link for innebygde hyperkoblinger i tekstinnhold fremfor sidenavigasjon." }, { id: "link-list", description: "Bruk LinkList når du presenterer en gruppert, merket samling av navigasjonslenker i en kolonne." }],
    },
    preview: <NavLinkPreview />,

    props,
    examples,
};

export default doc;
