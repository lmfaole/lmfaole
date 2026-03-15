"use client";
import { useState, useEffect } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";
import { Flex } from "@fremtind/jokul/flex";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";

export function RadioPanelPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("bil");
    useEffect(() => { setValue(isHovered ? "bat" : "bil"); }, [isHovered]);
    return (
        <FieldGroup legend="Velg produkt">
            <Flex gap="s">
                <RadioPanel name="rp-preview" value="bil" label="Bil" checked={value === "bil"} onChange={() => setValue("bil")} />
                <RadioPanel name="rp-preview" value="bat" label="Båt" checked={value === "bat"} onChange={() => setValue("bat")} />
            </Flex>
        </FieldGroup>
    );
}
