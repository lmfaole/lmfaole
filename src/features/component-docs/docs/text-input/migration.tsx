import { useState, useEffect } from "react";
import { TextInput } from "@fremtind/jokul/text-input";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

export const migrations: ComponentExample[] = [
    {
                title: "Handlingsknappen i tekstfeltet sendes som element",
                description: "action-propen er utfaset. Bruk actionButton med et React-element — typisk en Button eller IconButton — i stedet.",
                uses: ["button"],
                migration: {
                    deprecates: [{ name: "action", kind: "prop" }],
                    replacedBy: [{ name: "actionButton", kind: "prop" }],
                    before: `<TextInput
        label="Søk"
        action={{ icon: "search", label: "Søk", onClick: handleSearch }}
    />`,

                },
                code: `import { Button } from "@fremtind/jokul/button";

    <TextInput
        label="Søk"
        actionButton={
            <Button variant="secondary" onClick={handleSearch}>
                Søk
            </Button>
        }
    />`,
            }
];
