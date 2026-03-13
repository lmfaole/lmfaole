import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger, PopupTip } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import type { ComponentDoc } from "./types";

const doc: ComponentDoc = {
    id: "tooltip",
    name: "Tooltip",
    package: "@fremtind/jokul/tooltip",
    category: "Visning",
    tags: ["overlay", "interaktiv", "tilgjengelighet", "feedback"],
    description: "Tooltip og PopupTip viser tilleggsinformasjon ved hover eller klikk.",
    notes: [
    "Tooltip skal kun inneholde utfyllende informasjon — aldri kritisk innhold som ikke finnes andre steder.",
    "Ikke bruk Tooltip på ikke-interaktive elementer, da de ikke er tilgjengelige for tastaturbrukere.",
],
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
