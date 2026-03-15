"use client";
import { useEffect, useState } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

function ToastPreviewInner() {
    const isHovered = usePreviewHovered();
    const [variant, setVariant] = useState<"info" | "success">("info");
    const [toastKey, setToastKey] = useState<string | null>(null);
    const { add, close } = useToast();

    useEffect(() => {
        setVariant(isHovered ? "success" : "info");
    }, [isHovered]);

    const title = variant === "success" ? "Fullført" : "Info";
    const message = variant === "success" ? "Handlingen ble fullført!" : "En kort beskjed til brukeren.";

    useEffect(() => {
        // Keep a single toast in the preview and swap it when hover changes.
        if (toastKey) {
            close(toastKey);
        }

        const nextKey = add({ title, content: message }, { variant, timeout: "off" });
        setToastKey(nextKey);

        return () => close(nextKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [variant]);

    return null;
}

export function ToastPreview() {
    return (
        <ToastProvider placement="center">
            <ToastPreviewInner />
        </ToastProvider>
    );
}
