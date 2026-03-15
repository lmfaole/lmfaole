"use client";
import { Logo } from "@fremtind/jokul/logo";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function LogoPreview() {
    const isHovered = usePreviewHovered();
    return <Logo style={{ transition: "opacity 0.3s", opacity: isHovered ? 1 : 0.6 }} />;
}
