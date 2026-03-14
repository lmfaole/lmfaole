import { useState, useEffect } from "react";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { Flex } from "@fremtind/jokul/flex";
import { Tooltip, TooltipTrigger, TooltipContent } from "@fremtind/jokul/tooltip";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


export const examples: ComponentExample[] = [
    {
                title: "Ikonknapper",
                description: "Vanlige ikonknapper. Legg alltid til aria-label.",
                uses: ["icon", "flex"],
                code: `<Flex gap="s" alignItems="center">
      <IconButton aria-label="Rediger"><Icon>edit</Icon></IconButton>
      <IconButton aria-label="Slett"><Icon>delete</Icon></IconButton>
      <IconButton aria-label="Lukk"><Icon>close</Icon></IconButton>
    </Flex>`,
                tags: ["accessibility"],
                preview: (
                    <Flex gap="s" alignItems="center">
                        <IconButton aria-label="Rediger"><Icon>edit</Icon></IconButton>
                        <IconButton aria-label="Slett"><Icon>delete</Icon></IconButton>
                        <IconButton aria-label="Lukk"><Icon>close</Icon></IconButton>
                    </Flex>
                ),
            },
    {
                title: "Med verktøytips",
                description: "Ikonknapp pakket inn i Tooltip for ekstra forklaring.",
                uses: ["icon", "tooltip", "flex"],
                code: `<Flex gap="s" alignItems="center">
      <Tooltip>
        <TooltipTrigger>
          <IconButton aria-label="Last ned dokument"><Icon>download</Icon></IconButton>
        </TooltipTrigger>
        <TooltipContent>Last ned dokument</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <IconButton aria-label="Del lenke"><Icon>share</Icon></IconButton>
        </TooltipTrigger>
        <TooltipContent>Del lenke</TooltipContent>
      </Tooltip>
    </Flex>`,
                preview: (
                    <Flex gap="s" alignItems="center">
                        <Tooltip>
                            <TooltipTrigger>
                                <IconButton aria-label="Last ned dokument"><Icon>download</Icon></IconButton>
                            </TooltipTrigger>
                            <TooltipContent>Last ned dokument</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger>
                                <IconButton aria-label="Del lenke"><Icon>share</Icon></IconButton>
                            </TooltipTrigger>
                            <TooltipContent>Del lenke</TooltipContent>
                        </Tooltip>
                    </Flex>
                ),
            },
    {
                title: "Handlingslinje i kort",
                description: "Ikonknapper brukt som handlinger knyttet til et element.",
                uses: ["icon", "card", "flex"],
                code: `<Flex gap="xs" alignItems="center">
      <IconButton aria-label="Rediger avtale"><Icon>edit</Icon></IconButton>
      <IconButton aria-label="Kopier avtale"><Icon>content_copy</Icon></IconButton>
      <IconButton aria-label="Slett avtale"><Icon>delete</Icon></IconButton>
    </Flex>`,
                preview: (
                    <Flex gap="xs" alignItems="center">
                        <IconButton aria-label="Rediger avtale"><Icon>edit</Icon></IconButton>
                        <IconButton aria-label="Kopier avtale"><Icon>content_copy</Icon></IconButton>
                        <IconButton aria-label="Slett avtale"><Icon>delete</Icon></IconButton>
                    </Flex>
                ),
            }
];
