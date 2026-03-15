"use client";
import { useState, useEffect } from "react";
import { Tag } from "@fremtind/jokul/tag";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function TagPreview() {
    const isHovered = usePreviewHovered();
    const [count, setCount] = useState(1);
    const tags = ["Bil", "Båt", "Hjem"];
    useEffect(() => {
        setCount(1);
        if (!isHovered) return;
        let c = 1;
        const id = setInterval(() => {
            c = Math.min(c + 1, tags.length);
            setCount(c);
            if (c >= tags.length) clearInterval(id);
        }, 400);
        return () => clearInterval(id);
    }, [isHovered]);
    return <Flex gap="xs" alignItems="center">{tags.slice(0, count).map(t => <Tag key={t}>{t}</Tag>)}</Flex>;
}
