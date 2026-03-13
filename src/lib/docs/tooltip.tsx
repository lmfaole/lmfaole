import React, { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, PopupTip } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/components/PreviewHoverContext";
import type { ComponentDoc } from "./types";

const TOOLTIP_TEXTS = [
    "Klikk for å lagre endringene",
    "Endringer lagres automatisk hvert 5. minutt",
    "Du kan også bruke Ctrl+S for å lagre",
];

function TooltipPreview() {
    const isHovered = usePreviewHovered();
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (!isHovered) { setStep(0); return; }
        setStep(1);
        const id = setInterval(() => setStep(s => (s + 1) % 3), 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    return (
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div style={{ background: "var(--jkl-color-background-inverted)", color: "var(--jkl-color-text-on-inverted)", borderRadius: "4px", padding: "6px 12px", fontSize: "0.875em", whiteSpace: "nowrap" }}>
                {TOOLTIP_TEXTS[step]}
            </div>
            <Button variant="primary">Lagre</Button>
        </div>
    );
}

const doc: ComponentDoc = {
    id: "tooltip",
    name: "Tooltip",
    package: "@fremtind/jokul/tooltip",
    category: "Visning",
    tags: ["overlay", "interaktiv", "tilgjengelighet", "feedback"],
    description: "Tooltip og PopupTip viser tilleggsinformasjon ved hover eller klikk.",
    warnings: [
    "Ikke legg Tooltip på ikke-interaktive elementer — det er ikke tilgjengelig for tastaturbrukere.",
    "Tooltip må aldri inneholde kritisk informasjon som ikke finnes andre steder på siden.",
],
    preview: <TooltipPreview />,
    props: [
        { name: "placement", type: '"top" | "top-start" | "top-end" | "left" | "right"', required: false, source: "custom", status: "stable", default: '"top"', description: "Posisjon for tooltip." },
        { name: "triggerOn", type: '"hover" | "click"', required: false, source: "custom", status: "stable", default: '"hover"', description: "Utløsende hendelse." },
        { name: "delay", type: "number", required: false, source: "custom", status: "stable", description: "Forsinkelse i ms før visning." },
    ],
    examples: [
        {
            title: "Tooltip på knapp",
            description: "Tooltip med TooltipTrigger og TooltipContent.",
            uses: ["button"],
            tags: ["accessibility"],
            code: `<Tooltip>
  <TooltipTrigger>
    <Button variant="secondary">Mer info</Button>
  </TooltipTrigger>
  <TooltipContent>Dette er en forklarende tekst om knappens funksjon.</TooltipContent>
</Tooltip>`,
            preview: (
                <Tooltip>
                    <TooltipTrigger>
                        <Button variant="secondary">Mer info</Button>
                    </TooltipTrigger>
                    <TooltipContent>Dette er en forklarende tekst om knappens funksjon.</TooltipContent>
                </Tooltip>
            ),
        },
        {
            title: "PopupTip",
            description: "PopupTip er en frittstående spørsmålsknapp med tooltip.",
            code: `<Flex gap="s" alignItems="center">
  <span>Forsikringssum</span>
  <PopupTip content="Forsikringssummen er det maksimale beløpet du kan få utbetalt ved en skade." />
</Flex>`,
            preview: (
                <Flex gap="s" alignItems="center">
                    <span>Forsikringssum</span>
                    <PopupTip content="Forsikringssummen er det maksimale beløpet du kan få utbetalt ved en skade." />
                </Flex>
            ),
        },
    ],
};

export default doc;
