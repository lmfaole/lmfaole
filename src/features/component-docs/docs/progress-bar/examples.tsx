import { useState, useEffect } from "react";
import { ProgressBar } from "@fremtind/jokul/progress-bar";
import { usePreviewHovered } from "@/features/component-docs/components/PreviewHoverContext";
import type { ComponentExample } from "../types";


const progressSteps = [0, 25, 50, 75, 100];


export const examples: ComponentExample[] = [
    {
                title: "Fremdriftsvisning",
                description: "ProgressBar på 60%.",
                code: `<ProgressBar
        aria-valuenow={60}
        title="Laster opp fil"
        aria-valuetext="60 prosent lastet opp"
    />`,
                tags: ["loading"],
                preview: (
                    <ProgressBar
                        aria-valuenow={60}
                        title="Laster opp fil"
                        aria-valuetext="60 prosent lastet opp"
                    />
                ),
            },
    {
                title: "Steg i skjema",
                description: "Bruk ProgressBar for å vise fremdrift i flertrinnsskjema.",
                code: `<ProgressBar
        aria-valuenow={2}
        aria-valuemax={4}
        title="Steg 2 av 4"
        aria-valuetext="Steg 2 av 4: Kontaktinformasjon"
    />`,
                preview: (
                    <ProgressBar
                        aria-valuenow={2}
                        aria-valuemax={4}
                        title="Steg 2 av 4"
                        aria-valuetext="Steg 2 av 4: Kontaktinformasjon"
                    />
                ),
            }
];
