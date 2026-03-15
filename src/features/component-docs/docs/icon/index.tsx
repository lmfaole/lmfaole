import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentDoc } from "../types";
import { props } from "./props";
import { examples } from "./examples";
import { migrations } from "./migration";

function IconPreview() {
    const isHovered = usePreviewHovered();
    const icons = ["star", "check_circle", "favorite", "arrow_forward"];
    const [active, setActive] = useState(0);
    useEffect(() => {
        if (!isHovered) { setActive(0); return; }
        let i = 0;
        const id = setInterval(() => { i = (i + 1) % icons.length; setActive(i); }, 400);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Flex gap="m" alignItems="center">
            {icons.map((name, idx) => (
                <Icon key={name} style={{ transition: "transform 0.2s, color 0.2s", transform: active === idx ? "scale(1.5)" : "scale(1)", color: active === idx ? "var(--jkl-color-text-link)" : undefined }}>{name}</Icon>
            ))}
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "icon",
    name: "Icon",
    package: "@fremtind/jokul/icon",
    category: "Visning",
    description: "Icon rendrer Material Symbols-ikoner. Gi navnet på ikonet som child-tekst.",
    warnings: "Et ikon uten ledsagende tekst må ha aria-label — ellers er det usynlig for skjermlesere.",

    preview: <IconPreview />,
    props,
    examples,
    migrations,
    relationships: {
        alternatives: [{ id: "icon-button", description: "Bruk IconButton når ikonet må være interaktivt og trenger en tilgjengelig knappeetikett." }],
    }
};

export default doc;
