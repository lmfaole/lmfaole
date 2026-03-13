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
    notes: "Ikke legg viktig informasjon kun i en tooltip.",
    props: [
        { name: "placement", type: '"top" | "top-start" | "top-end" | "left" | "right"', required: false, default: '"top"', description: "Posisjon for tooltip." },
        { name: "triggerOn", type: '"hover" | "click"', required: false, default: '"hover"', description: "Utløsende hendelse." },
        { name: "delay", type: "number", required: false, description: "Forsinkelse i ms før visning." },
    ],
    examples: [
        {
            title: "Tooltip på knapp",
            description: "Tooltip med TooltipTrigger og TooltipContent.",
            code: `<Tooltip>
  <TooltipTrigger>
    <Button variant="secondary">Mer info</Button>
  </TooltipTrigger>
  <TooltipContent>Dette er en forklarende tekst om knappens funksjon.</TooltipContent>
</Tooltip>`,
            tags: ["accessibility"],
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
