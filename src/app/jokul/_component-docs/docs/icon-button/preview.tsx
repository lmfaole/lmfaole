"use client";
import { IconButton } from "@fremtind/jokul/icon-button";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function IconButtonPreview() {
    const isHovered = usePreviewHovered();
    return <IconButton aria-label={isHovered ? "Lukk" : "Søk"}><Icon>{isHovered ? "close" : "search"}</Icon></IconButton>;
}
