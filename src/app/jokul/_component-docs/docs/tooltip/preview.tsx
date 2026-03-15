"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@fremtind/jokul/tooltip";
import { Button } from "@fremtind/jokul/button";

export function TooltipPreview() {
    return (
        <Tooltip>
            <TooltipTrigger><Button variant="ghost">Mer informasjon</Button></TooltipTrigger>
            <TooltipContent>Her er tilleggsinformasjon</TooltipContent>
        </Tooltip>
    );
}
