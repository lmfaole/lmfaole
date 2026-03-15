"use client";
import { UnorderedList, ListItem } from "@fremtind/jokul/list";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function ListPreview() {
    const isHovered = usePreviewHovered();
    const baseItems = ["Bilforsikring dekker skader", "Reiseforsikring gjelder i Norden"];
    const extraItem = "Innboforsikring inkluderer tyveri";
    return (
        <UnorderedList>
            {baseItems.map(item => <ListItem key={item}>{item}</ListItem>)}
            {isHovered && <ListItem>{extraItem}</ListItem>}
        </UnorderedList>
    );
}
