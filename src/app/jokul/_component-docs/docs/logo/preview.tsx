"use client";
import { useState, useEffect } from "react";
import { Logo } from "@fremtind/jokul/logo";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function LogoPreview() {
    const isHovered = usePreviewHovered();
    const [isSymbol, setIsSymbol] = useState(false);

    useEffect(() => {
        if (!isHovered) { setIsSymbol(false); return; }
        const id = setInterval(() => setIsSymbol(s => !s), 2000);
        return () => clearInterval(id);
    }, [isHovered]);

    return <Logo isSymbol={isSymbol} animated centered={false} />;
}
