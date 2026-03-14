import { useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, PopupTip } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
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
            }
];
