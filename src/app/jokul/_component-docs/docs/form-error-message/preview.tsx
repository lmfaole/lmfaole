"use client";

import { useEffect, useState } from "react";
import { FormErrorMessage } from "@fremtind/jokul/message";
import { usePreviewHovered } from "@/app/jokul/_component-docs/components/PreviewHoverContext";

const BASE_ERRORS = ["Fornavn mangler."];
const EXTRA_ERRORS = ["E-postadressen er ugyldig."];

export function FormErrorMessagePreview() {
    const isHovered = usePreviewHovered();
    const [errors, setErrors] = useState<string[]>(BASE_ERRORS);

    // Keep the preview visually stable (always visible), but still "alive" on hover.
    useEffect(() => {
        if (!isHovered) {
            setErrors(BASE_ERRORS);
            return;
        }

        const id = setTimeout(() => {
            setErrors([...BASE_ERRORS, ...EXTRA_ERRORS]);
        }, 700);

        return () => clearTimeout(id);
    }, [isHovered]);

    return (
        <div style={{ maxWidth: "22rem", width: "100%" }}>
            <FormErrorMessage errors={errors} isSubmitted={true} isValid={false} />
        </div>
    );
}

