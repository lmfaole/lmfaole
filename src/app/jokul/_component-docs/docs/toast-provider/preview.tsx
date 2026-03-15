"use client";

import { useEffect, useState } from "react";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

function ToastProviderTrigger() {
    const { add } = useToast();
    const isHovered = usePreviewHovered();

    useEffect(() => {
        if (!isHovered) return;
        const id = setTimeout(() => {
            add("ToastProvider er aktiv", { variant: "info" });
        }, 500);
        return () => clearTimeout(id);
    }, [isHovered, add]);

    return (
        <Button onClick={() => add("ToastProvider er aktiv", { variant: "info" })}>
            Vis toast
        </Button>
    );
}

export function ToastProviderPreview() {
    const [placement, setPlacement] = useState<"center" | "left">("center");

    return (
        <ToastProvider placement={placement}>
            <Flex gap="s" alignItems="center">
                <Button
                    variant="ghost"
                    onClick={() => setPlacement((p) => (p === "center" ? "left" : "center"))}
                >
                    placement: {placement}
                </Button>
                <ToastProviderTrigger />
            </Flex>
        </ToastProvider>
    );
}

