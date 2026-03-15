"use client";
import { ToastProvider, useToast } from "@fremtind/jokul/toast";
import { Button } from "@fremtind/jokul/button";

export function ToastTrigger() {
    const { add } = useToast();
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
