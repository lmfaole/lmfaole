"use client";
import { useEffect, useRef } from "react";
import { Search } from "@fremtind/jokul/search";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function SearchPreview() {
    const isHovered = usePreviewHovered();
    const inputRef = useRef<HTMLInputElement>(null);
    const text = "bilforsikring";
    useEffect(() => {
        if (!isHovered) {
            if (inputRef.current) inputRef.current.value = "";
            return;
        }
        const input = inputRef.current;
        let i = 0;
        const id = setInterval(() => {
            if (input) input.value = text.slice(0, ++i);
            if (i >= text.length) clearInterval(id);
        }, 120);
        return () => clearInterval(id);
    }, [isHovered]);
    return (
        <Search label="Søk" name="q" ref={inputRef as React.RefObject<HTMLInputElement>}>
            <Search.Button label="Søk" />
        </Search>
    );
}
