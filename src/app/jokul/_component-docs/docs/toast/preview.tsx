"use client";
import { useEffect, useState } from "react";
import { Flex } from "@fremtind/jokul/flex";
import { Button } from "@fremtind/jokul/button";
import { CloseIcon, InfoIcon, SuccessIcon } from "@fremtind/jokul/icon";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function ToastPreview() {
    const isHovered = usePreviewHovered();
    const [variant, setVariant] = useState<"info" | "success">("info");

    useEffect(() => {
        setVariant(isHovered ? "success" : "info");
    }, [isHovered]);

    const Icon = variant === "success" ? SuccessIcon : InfoIcon;
    const title = variant === "success" ? "Fullført" : "Info";
    const message = variant === "success" ? "Handlingen ble fullført!" : "En kort beskjed til brukeren.";

    return (
        <div
            className={`jkl-toast jkl-toast--${variant}`}
            data-animation={isHovered ? "entering" : "queued"}
        >
            <Flex alignItems="start" gap="xs">
                <Icon className="jkl-toast__icon" />
                <Flex
                    direction="column"
                    gap="xs"
                    className="jkl-toast__content"
                    aria-live="assertive"
                >
                    <p className="jkl-toast__title">{title}</p>
                    <p className="jkl-toast__message">{message}</p>
                </Flex>
                <Button
                    variant="ghost"
                    data-theme="light"
                    aria-label="Lukk varsel"
                    className="jkl-toast__dismiss-button"
                    onClick={() => {}}
                    icon={<CloseIcon />}
                />
            </Flex>
        </div>
    );
}
