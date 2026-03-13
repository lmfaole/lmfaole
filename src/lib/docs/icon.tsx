import React, { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const ICON_NAMES = ["home", "person", "check_circle", "warning", "download", "arrow_forward", "settings", "favorite", "search", "shield"];

function IconPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % ICON_NAMES.length), 1000);
        return () => clearInterval(id);
    }, [isHovered]);

    const visibleIcons = ICON_NAMES.slice(step, step + 5).concat(ICON_NAMES.slice(0, Math.max(0, step + 5 - ICON_NAMES.length)));
    return (
        <Flex gap="m" wrap="wrap" alignItems="center">
            {visibleIcons.map((name) => <Icon key={name}>{name}</Icon>)}
        </Flex>
    );
}

const doc: ComponentDoc = {
    id: "icon",
    name: "Icon",
    package: "@fremtind/jokul/icon",
    category: "Visning",
    tags: ["ikon", "media"],
    description: "Icon rendrer Material Symbols-ikoner. Gi navnet på ikonet som child-tekst.",
    warnings: "Et ikon uten ledsagende tekst må ha aria-label — ellers er det usynlig for skjermlesere.",
    preview: <IconPreview />,
    props: [
        { name: "children", type: "string", required: true, source: "react", status: "stable", description: 'Material Symbol-navn, f.eks. "arrow_forward".' },
        { name: "bold", type: "boolean", required: false, source: "react", status: "stable", description: "Tykkere strekbredde." },
        { name: "filled", type: "boolean", required: false, source: "custom", status: "stable", description: "Fylt variant av ikonet." },
        { name: "as", type: '"div" | "span"', required: false, source: "custom", status: "stable", default: '"span"', description: "HTML-element ikonet rendres som." },
        { name: "variant", type: '"small" | "medium" | "inherit"', required: false, source: "custom", status: "deprecated", statusDescription: "Størrelsen settes nå automatisk etter fontstørrelse. Fjern denne propen.", description: "Størrelsesvarianten til ikonet." },
    ],
    examples: [
        {
            title: "Vanlige ikoner",
            description: "Eksempler på ikoner fra Material Symbols-biblioteket.",
            code: `<Flex gap="m" alignItems="center">
  <Icon>home</Icon>
  <Icon>settings</Icon>
  <Icon>arrow_forward</Icon>
  <Icon>check_circle</Icon>
  <Icon>warning</Icon>
</Flex>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <Icon>home</Icon>
                    <Icon>settings</Icon>
                    <Icon>arrow_forward</Icon>
                    <Icon>check_circle</Icon>
                    <Icon>warning</Icon>
                </Flex>
            ),
        },
        {
            title: "Fylt og fet variant",
            description: "Bruk filled for fylt versjon og bold for tykkere strekbredde.",
            code: `<Flex gap="m" alignItems="center">
  <Icon>favorite</Icon>
  <Icon filled>favorite</Icon>
  <Icon bold>favorite</Icon>
</Flex>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <Icon>favorite</Icon>
                    <Icon filled>favorite</Icon>
                    <Icon bold>favorite</Icon>
                </Flex>
            ),
        },
        {
            title: "Ikonstørrelse arves nå fra omgivelsene",
            description: "variant-propen er utfaset. Størrelsen settes nå automatisk fra omgivelsenes fontstørrelse. Fjern variant og kontroller størrelsen med CSS font-size på et omsluttende element om nødvendig.",
            migrationBefore: `<Icon variant="small">home</Icon>
<Icon variant="medium">home</Icon>`,
            code: `<Icon>home</Icon>

// Trenger du en spesifikk størrelse, styr med CSS:
<span style={{ fontSize: "1.5rem" }}>
    <Icon>home</Icon>
</span>`,
            preview: (
                <Flex gap="m" alignItems="center">
                    <span style={{ fontSize: "1rem" }}><Icon>home</Icon></span>
                    <span style={{ fontSize: "1.5rem" }}><Icon>home</Icon></span>
                    <span style={{ fontSize: "2rem" }}><Icon>home</Icon></span>
                </Flex>
            ),
        },
    ],
};

export default doc;
