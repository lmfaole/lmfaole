"use client";
import { useState } from "react";
import { RadioPanel } from "@fremtind/jokul/radio-panel";
import { FieldGroup } from "@fremtind/jokul/input-group";

export function RadioPanelPreview() {
    const [value, setValue] = useState("bil");
    return (
        <FieldGroup legend="Velg produkt">
            <RadioPanel name="rp-preview" value="bil" label="Bil" checked={value === "bil"} onChange={() => setValue("bil")} />
            <RadioPanel name="rp-preview" value="bat" label="Båt" checked={value === "bat"} onChange={() => setValue("bat")} />
        </FieldGroup>
    );
}
