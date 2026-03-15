"use client";
import { useEffect } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ToastTrigger() {
    const { add } = useToast();
    const isHovered = usePreviewHovered();

    useEffect(() => {
        if (!isHovered) return;
        const id = setTimeout(() => {
            add("Handlingen ble fullført!", { variant: "success" });
        }, 500);
        return () => clearTimeout(id);
    }, [isHovered, add]);

    return (
        <Button onClick={() => add("Handlingen ble fullført!", { variant: "success" })}>
            Vis toast
        </Button>
    );
}

export function ToastPreview() {
    return (
        <ToastProvider>
            <ToastTrigger />
        </ToastProvider>
    );
}
