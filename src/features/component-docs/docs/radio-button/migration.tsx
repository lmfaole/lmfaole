import { useState, useEffect } from "react";
import { RadioButton, RadioButtonGroup } from "@fremtind/jokul/radio-button";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";

export const migrations: ComponentExample[] = [
    {
                title: "Radioknapp-tekst sendes nå som children",
                description: "label-propen på RadioButton er utfaset. Bruk children (tekst som barn av komponenten) i stedet.",
                migration: {
                    deprecates: [{ name: "label", kind: "prop" }],
                    replacedBy: [{ name: "children", kind: "prop" }],
                    before: `<RadioButton value="basic" label="Basis" />`,

                },
                code: `<RadioButton value="basic">Basis</RadioButton>`,
                preview: (
                    <RadioButtonGroup legend="Forsikringstype" name="migration-radio">
                        <RadioButton value="basic">Basis</RadioButton>
                        <RadioButton value="plus">Pluss</RadioButton>
                    </RadioButtonGroup>
                ),
            }
];
