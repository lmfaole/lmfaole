"use client";
import { Loader } from "@fremtind/jokul/loader";
import { useState, useEffect } from "react";
import { Icon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function LoaderPreview() {
    const isHovered = usePreviewHovered();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        if (!isHovered) return;
        const id = setTimeout(() => setLoading(false), 1800);
        return () => clearTimeout(id);
    }, [isHovered]);
    return loading
        ? <Loader textDescription="Laster" />
        : <span style={{ fontSize: "2rem", color: "var(--jkl-color-text-positive)" }}><Icon>check_circle</Icon></span>;
}
