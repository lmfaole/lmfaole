"use client";
import { useState, useEffect } from "react";
import { InputGroup } from "@fremtind/jokul/input-group";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

export function InputGroupPreview() {
    const isHovered = usePreviewHovered();
    const [value, setValue] = useState("");
    const [error, setError] = useState("");
    useEffect(() => {
        if (isHovered) { setValue(""); setError(""); }
    }, [isHovered]);
    return (
        <InputGroup
            label="Registreringsnummer"
            helpLabel="Skriv inn bilens registreringsnummer"
            errorLabel={error || undefined}
            render={inputProps => (
                <TextInput
                    {...inputProps}
                    label="Registreringsnummer"
                    labelProps={{ srOnly: true }}
                    value={value}
                    onChange={e => {
                        setValue(e.target.value);
                        setError(e.target.value.length > 0 && e.target.value.length < 2 ? "Må være minst 2 tegn" : "");
                    }}
                />
            )}
        />
    );
}
