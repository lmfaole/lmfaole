"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TooltipPreview() {
    const isHovered = usePreviewHovered();

    return (
        <Tooltip key={String(isHovered)} initialOpen={isHovered}>
            <TooltipTrigger><Button variant="ghost">Mer informasjon</Button></TooltipTrigger>
            <TooltipContent>Her er tilleggsinformasjon</TooltipContent>
        </Tooltip>
    );
}
