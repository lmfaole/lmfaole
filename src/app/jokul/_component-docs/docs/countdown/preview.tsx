"use client";
import { Countdown } from "@fremtind/jokul/countdown";
import { useState, useEffect } from "react";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function CountdownPreview() {
    const isHovered = usePreviewHovered();
    const [key, setKey] = useState(0);

    useEffect(() => {
        if (isHovered) setKey(k => k + 1);
    }, [isHovered]);

    return <Countdown key={key} from={5000} isPaused={!isHovered} />;
}
